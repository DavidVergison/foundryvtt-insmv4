import { INS_MV } from '../helpers/config.mjs';
import { INS_MV_CONVERT } from '../helpers/convert.mjs';

/**
* Class representing the roll result handling.
*/
export class RelativeTestRollDialog extends foundry.applications.api.DialogV2 {
  /**
   * Show dialog and wait for roll
   */
  static async show(contextValues) {

    let defaultValues = {
      actorRisk: 0,
      targetScore: 2,
      targetRisk: 0,
      targetFaith: 2,
    }

    let dialogContext = Object.assign({}, contextValues, defaultValues);

    // Render the dialog template with the context.
    const content = await renderTemplate("systems/insmv/module/dices/templates/relative.html", dialogContext);

    // Open the dialog and wait for user input.
    const data = await RelativeTestRollDialog.wait({
      window: { title: "Test en opposition" },
      classes: ["ins-form"],
      position: { width: "auto" },
      content: content,
      rejectClose: false,
      buttons: [
        {
          action: "cancel",
          label: "Annuler",
          icon: "fas fa-times",
          callback: () => false,
        },
        {
          action: "ok",
          label: "ok",
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            const $dialog = $(dialog);
            // Extract values from the dialog inputs.
            const { actorScore, actorRisk, targetScore, targetRisk, targetFaith } = RelativeTestRollDialog.getValuesFromDialog($dialog);
            // Calculate chance and related scores based on the extracted values.
            const { computedScore, chance } = RelativeTestRollDialog.calculateChance({
              actorScore, 
              actorRisk, 
              targetScore,  
              targetRisk,
              targetFaith
            });
            return { actorScore, actorRisk, targetScore,  targetRisk, targetFaith, computedScore, chance };
          }
        }
      ],
      render: (event, dialog) => {
        const $dialog = $(dialog);

        // Bind change and input events to update values dynamically.
        const $targetScore = $dialog.find("#targetScore");
        const $actorRisk = $dialog.find("#actorRisk");
        const $targetRisk = $dialog.find("#targetRisk");

        $targetScore.on("change input", () => RelativeTestRollDialog.updateValues($dialog));
        $actorRisk.on("change input", () => RelativeTestRollDialog.updateValues($dialog));
        $targetRisk.on("change input", () => RelativeTestRollDialog.updateValues($dialog));
      }
    });
    return data
  }

  /**
   * Extracts values from the dialog's HTML.
   */
  static getValuesFromDialog(html) {
    const $actorScore = html.find("#actorScore");
    const $actorRisk = html.find("#actorRisk");
    const $targetScore = html.find("#targetScore");
    const $targetRisk = html.find("#targetRisk");
    const $targetFaith = html.find("#targetFaith");

    const actorScore = INS_MV_CONVERT.convertPlus($actorScore[0]?.innerText || "0");

    let actorRisk = parseInt($actorRisk.val(), 10) || 0;
    actorRisk = Math.max(0, Math.min(actorRisk, actorScore));
    $actorRisk.val(actorRisk);

    const targetScore = INS_MV_CONVERT.convertPlus(parseInt($targetScore.val(), 10) || 0)
    const targetRisk = parseInt($targetRisk.val(), 10) || 0;
    const targetFaith = parseInt($targetFaith.val(), 10) || 0;
    return { actorScore, actorRisk, targetScore, targetRisk, targetFaith};
  }

  /**
   * Updates the chance display in the dialog based on input values.
   */
  static updateValues(html) {
    const { computedScore, bonusScore, chance } = RelativeTestRollDialog.calculateChance(
      RelativeTestRollDialog.getValuesFromDialog(html)
    );
    // Update the element that displays the chance of success.
    html.find("#chance").text(
      `Chance of success: ${chance}% (${INS_MV_CONVERT.convertToPlus(computedScore)})`
    );
  }

  /**
   * Calculates the chance of success based on provided values.
   */
  static calculateChance({ actorScore, actorRisk, targetScore,  targetRisk }) {

    const actorComputedScore = actorScore - ( actorRisk / 2);
    const targetComputedScore = targetScore - (targetRisk / 2);

    const computedScore = Math.max(-4.5, Math.min(actorComputedScore - targetComputedScore, 4.5));
  
    const result = INS_MV.TUM.find(item => item.vs === computedScore) || { score: -1, chance: -1, vs: -1 };
    return { computedScore, chance: result.chance.toFixed(1) };
  }
}
