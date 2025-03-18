import { InsMvDie } from './ins-mv-system-die.mjs';
import { INS_MV } from '../helpers/config.mjs';
import {AbstractInsTestRoll} from './ins-test-roll.mjs'

export class AbsoluteTestRoll extends AbstractInsTestRoll {

    _prepareRenderData(roll, data) {
        const {
          computedScore,
          bonusScore,
          actorRisk,
          actorFaith,
          actorName,
          testedAttribute,
          marginBonus,
          marginBonusName
        } = data;
      
        const threshold = INS_MV.TUM.find(item => item.score === computedScore)?.threshold ?? -1;
        const successMargin = roll.margin + bonusScore + actorRisk + actorFaith * (roll.maxRepeats - 1) + (marginBonus || 0);
      
        const successMarginParts = [
            { name: "unité", value: roll.margin },
            { name: "score", value: computedScore },
            { name: "risque", value: actorRisk }
        ];
      
        this._addFaithParts(successMarginParts, actorFaith, roll.maxRepeats);
      
        if (marginBonus) {
            successMarginParts.push({ name: marginBonusName, value: marginBonus });
        }
      
        return {
            rollResult: roll.result,
            actorName,
            testedAttribute,
            threshold,
            success: roll.d66 <= threshold,
            successMargin,
            successMarginParts,
            failMargin: roll.margin,
            failMarginparts: [
                { name: "unité", value: roll.margin }
            ]
        };
    }

}