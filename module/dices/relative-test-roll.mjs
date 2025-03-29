import { INS_MV } from '../helpers/config.mjs';
import { AbstractInsTestRoll } from './ins-test-roll.mjs'
import { RelativeTestRollDialog } from './relative-test-roll-dialog.mjs';
import { INS_MV_CONVERT } from '../helpers/convert.mjs';

export class RelativeTestRoll extends AbstractInsTestRoll {
    /**
     * Prepares the data needed to render the roll result.
     */
    _prepareRenderData(roll, data) {
        const {
            computedScore,
            actorRisk,
            actorFaith,
            name,
            testedAttribute,
            targetRisk
        } = data;

        const threshold = INS_MV.TUM.find(item => item.vs === computedScore)?.threshold ?? -1;
        const successMargin = Math.trunc(roll.margin + actorRisk + actorFaith * (roll.maxRepeats - 1))
        const failMargin = roll.margin + targetRisk;

        const successMarginParts = [
            { name: "unité", value: roll.margin },
            { name: "risque", value: actorRisk }
        ];

        this._addFaithParts(successMarginParts, actorFaith, roll.maxRepeats);

        return {
            rollResult: roll.result,
            name: name + " (opposition)",
            testedAttribute,
            threshold,
            success: roll.d66 <= threshold,
            successMargin,
            successMarginParts,
            failMargin,
            failMarginParts: [
                { name: "unité", value: roll.margin },
                { name: "risque", value: targetRisk }
            ]
        };
    }

    /**
       * Opens a dialog to prompt the user for roll configuration,
       * then prints the resulting roll outcome.
       */
    async prompt(rollConfig) {
        console.log("prompt", rollConfig)
        const baseChance = RelativeTestRollDialog.calculateChance({
            modifier: 0,
            actorScore: INS_MV_CONVERT.convertPlus(rollConfig.score), 
            actorRisk: 0, 
            targetScore: 2,  
            targetRisk: 0
        })
        console.log("prompt", {rollConfig, baseChance})

        // Define initial context data for the dialog.
        const dialogContext = {
            actorScore: INS_MV_CONVERT.convertPlus(rollConfig.score),
            modifier: 0,
            actorRisk: 0,
            targetScore: 2,
            targetRisk: 0,
            computedScore: baseChance.computedScore,
            chance: baseChance.chance,
        };

        const data = await RelativeTestRollDialog.show(dialogContext)

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
        const {actorScore, modifier, actorRisk, targetScore, targetRisk, computedScore, chance } = data;
        const { faith, name, testedAttribute } = rollConfig;

        this.data = {
            computedScore,
            actorRisk,
            actorFaith: INS_MV_CONVERT.convertPlus(faith),
            name,
            testedAttribute,
            targetRisk
        }
        const chatMessage = await this.toMessage({}, { create: false });
        // Create the chat message in the chat log.
        ChatMessage.create(chatMessage);
    }
}