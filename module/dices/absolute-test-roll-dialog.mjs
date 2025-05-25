import { INS_MV } from '../helpers/config.mjs';
import { INS_MV_CONVERT } from '../helpers/convert.mjs';

/**
* Class representing the roll result handling.
*/
export class AbsoluteTestRollDialog extends foundry.applications.api.DialogV2 {
  /**
   * Show dialog and wait for roll
   */
  static async show(contextValues) {

    let defaultValues = {
      modifier: 0,
      actorRisk: 0,
      bonus: 0,
      difficulties: INS_MV.DIFFICULTIES,
    }

    let dialogContext = Object.assign({}, contextValues, defaultValues);

    // Render the dialog template with the context.
    const content = await renderTemplate("systems/insmv/module/dices/templates/absolute.html", dialogContext);

    // Open the dialog and wait for user input.
    const data = await AbsoluteTestRollDialog.wait({
      window: { title: "Test Absolu" },
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
            const { modifier, score, actorRisk, difficulty, precision } = AbsoluteTestRollDialog.getValuesFromDialog($dialog);
            // Calculate chance and related scores based on the extracted values.
            const { computedScore, bonusScore, chance } = AbsoluteTestRollDialog.calculateChance({
              modifier,
              score,
              actorRisk,
              difficulty,
              precision,
            });
            return { modifier, score, actorRisk, difficulty, computedScore, bonusScore, chance };
          }
        }
      ],
      render: (event, dialog) => {
        const $dialog = $(dialog);

        // Bind change and input events to update values dynamically.
        const $difficulty = $dialog.find("#difficulty");
        const $modifier = $dialog.find("#modifier");
        const $actorRisk = $dialog.find("#actorRisk");
        const $validateRoll = $dialog.find("#validate-roll");

        $difficulty.on("change input", () => AbsoluteTestRollDialog.updateValues($dialog));
        $modifier.on("change input", () => AbsoluteTestRollDialog.updateValues($dialog));
        $actorRisk.on("change input", () => AbsoluteTestRollDialog.updateValues($dialog));
      }
    });
    console.log("DATA")
    console.log(data)
    return data
  }

  /**
   * Extracts values from the dialog's HTML.
   */
  static getValuesFromDialog(html) {
    const $score = html.find("#score");
    const $difficulty = html.find("#difficulty");
    const $modifier = html.find("#modifier");
    const $actorRisk = html.find("#actorRisk");
    const $precision = html.find("#precision");

    // Parse the modifier value; default to 0 if not a number
    const modifier = parseInt($modifier.val(), 10) || 0;

    // Convert the score using the INS_MV_CONVERT helper.
    // Use optional chaining and a default value to avoid errors if innerText is missing.
    const score = INS_MV_CONVERT.convertPlus($score[0]?.innerText || "0");

    // Parse the actorRisk value, ensuring it is between 0 and the score.
    let actorRisk = parseInt($actorRisk.val(), 10) || 0;
    actorRisk = Math.max(0, Math.min(actorRisk, score));
    $actorRisk.val(actorRisk);

    const precision = parseInt($precision.val(), 10) || 0;
    // Retrieve the difficulty bonus from the selected option in the dropdown.
    const difficulty = parseInt($difficulty.find("option:selected").data("bonus"), 10) || 0;

    return { modifier, score, actorRisk, difficulty, precision};
  }

  /**
   * Updates the chance display in the dialog based on input values.
   */
  static updateValues(html) {
    const { computedScore, bonusScore, chance } = AbsoluteTestRollDialog.calculateChance(
      AbsoluteTestRollDialog.getValuesFromDialog(html)
    );
    // Update the element that displays the chance of success.
    html.find("#chance").text(
      `Chance of success: ${chance}% (${INS_MV_CONVERT.convertToPlus(computedScore)})`
    );
  }

  /**
   * Calculates the chance of success based on provided values.
   */
  static calculateChance({ modifier, score, actorRisk, difficulty, precision}) {
    // Convert the base score using the INS_MV_CONVERT helper.
    const baseScore = INS_MV_CONVERT.convertPlus(score);

    // Compute the score based on difficulty, modifier, and actor risk.
    let computedScore = baseScore + 
      ((difficulty + modifier - actorRisk) / 2) +
      (precision / 2);
    // Clamp computedScore between -2.5 and 6.5.
    computedScore = Math.max(-2.5, Math.min(computedScore, 6.5));

    // Calculate the bonus score and clamp it between 0 and 6.5, then truncate the decimal part.
    let bonusScore = baseScore + ((difficulty + modifier) / 2);
    bonusScore = Math.trunc(Math.max(0, Math.min(bonusScore, 6.5)));

    // Find the corresponding chance from the INS_MV.TUM table.
    // If not found, return a default result.
    const result = INS_MV.TUM.find(item => item.score === computedScore) || { score: -1, chance: -1 };

    return { computedScore, bonusScore, chance: result.chance.toFixed(1) };
  }
}
