import { AbsoluteTestRollDialog } from './absolute-test-roll-dialog.mjs';
import { INS_MV } from '../helpers/config.mjs';
import { AbstractInsTestRoll } from './ins-test-roll.mjs'
import { INS_MV_CONVERT } from '../helpers/convert.mjs';

export class AbsoluteTestRoll extends AbstractInsTestRoll {
  /**
   * Prepares the data needed to render the roll result.
   */
  _prepareRenderData(roll, data) {
    console.log("_prepareRenderData", { roll, data })
    // Destructure properties from the provided data.
    const {
      computedScore,
      bonusScore,
      actorRisk,
      faith,
      name,
      testedAttribute,
      marginBonus,
      marginBonusName
    } = data;

    // Retrieve the threshold from the INS_MV.TUM table based on the computed score.
    // If no matching score is found, default to -1.
    const threshold = INS_MV.TUM.find(item => item.score === computedScore)?.threshold ?? -1;

    // Calculate the overall success margin.
    const successMargin = Math.trunc(
      roll.margin +
      bonusScore +
      actorRisk +
      INS_MV_CONVERT.convertPlus(faith) * (roll.maxRepeats - 1) +
      (marginBonus || 0)
    )

    console.log({
      m: roll.margin,
      bonusScore,
      actorRisk,
      faith,
      r: roll.maxRepeats,
      marginBonus,
      successMargin
    })

    // Build an array detailing the components contributing to the success margin.
    const successMarginParts = [
      { name: "unité", value: roll.margin },
      { name: "score", value: computedScore },
      { name: "risque", value: actorRisk }
    ];

    // Add parts related to faith to the success margin parts.
    this._addFaithParts(successMarginParts, faith, roll.maxRepeats);

    // If a margin bonus is provided, include it.
    if (marginBonus) {
      successMarginParts.push({ name: marginBonusName, value: marginBonus });
    }

    // Return the complete render data object.
    const tplData = {
      rollResult: roll.result,
      name,
      testedAttribute,
      threshold,
      success: roll.d66 <= threshold,
      successMargin,
      successMarginParts,
      failMargin: roll.margin,
      // Changed property name to CamelCase for consistency.
      failMarginParts: [
        { name: "unité", value: roll.margin }
      ]
    };
    console.log("tplData", tplData)
    return tplData
  }

  /**
   * Opens a dialog to prompt the user for roll configuration,
   * then prints the resulting roll outcome.
   */
  async prompt(rollConfig) {
    console.log("prompt", rollConfig)
    const baseChance = AbsoluteTestRollDialog.calculateChance({
      modifier: rollConfig.modifier,
      score: rollConfig.score,
      actorRisk: 0,
      difficulty: 0
    })

    // Define initial context data for the dialog.
    const dialogContext = {
      actorScore: rollConfig.score,
      modifier: rollConfig.modifier,
      actorRisk: 0,
      bonus: 0,
      chance: baseChance.chance,
      computedScore: baseChance.computedScore,
      difficulties: INS_MV.DIFFICULTIES,
    };

    const data = await AbsoluteTestRollDialog.show(dialogContext)

    console.log(data, rollConfig);
    if (data) {
      // Print the roll result as a chat message.
      await this._print(data, rollConfig);
    }
  }

  /**
   * Prints the roll result as a chat message.
   */
  async _print(data, rollConfig) {
    console.log("_print", { data, rollConfig })
    // Destructure data.
    const { actorRisk, computedScore, bonusScore } = data;
    const { faith, name, testedAttribute, marginBonus, marginBonusName } = rollConfig;

    this.data = {
      computedScore,
      bonusScore,
      actorRisk,
      faith,
      name,
      testedAttribute,
      marginBonus,
      marginBonusName
    }
    const chatMessage = await this.toMessage({}, { create: false });
    // Create the chat message in the chat log.
    ChatMessage.create(chatMessage);
  }
}


