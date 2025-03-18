import { InsMvDie } from './ins-mv-system-die.mjs';
import { INS_MV } from '../helpers/config.mjs';
import {AbstractInsTestRoll} from './ins-test-roll.mjs'

export class RelativeTestRoll extends AbstractInsTestRoll {

    _prepareRenderData(roll, data) {
        const {
            computedScore,
            actorRisk,
            actorFaith,
            actorName,
            testedAttribute,
            targetRisk
        } = data;
    
        const threshold = INS_MV.TUM.find(item => item.vs === computedScore)?.threshold ?? -1;
        const successMargin = roll.margin + actorRisk + actorFaith * (roll.maxRepeats - 1);
        const failMargin = roll.margin + targetRisk;
    
        const successMarginParts = [
            { name: "unité", value: roll.margin },
            { name: "risque", value: actorRisk }
        ];
    
        this._addFaithParts(successMarginParts, actorFaith, roll.maxRepeats);

        return {
            rollResult: roll.result,
            actorName,
            testedAttribute: testedAttribute + " (opposition)",
            threshold,
            success: roll.d66 <= threshold,
            successMargin,
            successMarginParts,
            failMargin,
            failMarginparts: [
                { name: "unité", value: roll.margin },
                { name: "risque", value: targetRisk }
            ]
        };
    }

}