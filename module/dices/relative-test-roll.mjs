import { INS_MV } from '../helpers/config.mjs';
import { AbstractInsTestRoll } from './ins-test-roll.mjs'
import { RelativeTestRollDialog } from './relative-test-roll-dialog.mjs';
import { INS_MV_CONVERT } from '../helpers/convert.mjs';

export class RelativeTestRoll extends AbstractInsTestRoll {

  _createBase(actorName, attribute, faith, score){
    super._createBase(actorName, attribute, faith, score)

    this.baseChance = RelativeTestRollDialog.calculateChance({
      actorScore: this.score,
      actorRisk: 0, 
      targetScore: 2,  
      targetRisk: 0
    })
    this.style = "relative"
    console.log(this)
  }

    /**
     * Prepares the data needed to render the roll result.
     */
    _prepareRenderData(roll, data) {
        console.log("ON PASSE BIEN LA !!!")
        console.log(roll)
        console.log(data)

        const {
            name, attribute,
            actorScore, actorRisk,
            targetScore, targetRisk,
            actorFaith, targetFaith,
        } = data;
        console.log("data", data)

        const {result, d66, maxRepeats} = roll
        const ru = roll.margin

        const actorComputedScore = actorScore - (actorRisk / 2);
        const effectiveActorScoreDetail = `${actorScore} - risque(${actorRisk})/2`
        console.log("effectiveActorScoreDetail", effectiveActorScoreDetail)
        const targetComputedScore = targetScore - (targetRisk / 2);
        const effectiveTargetScoreDetail = `${targetScore} - risque(${targetRisk})/2`
        const computedScore = Math.max(-4.5, Math.min(actorComputedScore - targetComputedScore, 4.5));
      
        const threshold = INS_MV.TUM.find(item => item.vs === computedScore)?.threshold ?? -1;

        const success = d66 <= threshold

        let winnerMargin = 0
        let looserMargin = 0
        if (success) { //actor win
            winnerMargin = ru + actorRisk + actorFaith * (maxRepeats - 1) 
            looserMargin = ru 
        } else { // target win
            winnerMargin = ru + targetRisk + targetFaith * (maxRepeats - 1)
            looserMargin = ru 
        }

        const tplData = {
            name, attribute, //{name} fait un test de {attribute}
            actorComputedScore, effectiveActorScoreDetail, //Avec un score de X (détail)
            targetComputedScore, effectiveTargetScoreDetail, //Contre un score de X (détail)
            result, threshold, //résultat (seuil)
            success, //boolean
            winnerMargin, //Marge de réussite: xx
            looserMargin, //Marge d'échec': xx
        };
        console.log(tplData)
        return tplData
    }

    /**
       * Opens a dialog to prompt the user for roll configuration,
       * then prints the resulting roll outcome.
       */
    async prompt() {
        const dialogContext = {
          actorScore: this.score,
          chance: this.baseChance.chance,
          computedScore: this.baseChance.computedScore,
        };

        const data = await RelativeTestRollDialog.show(dialogContext)
        /*
        actorRisk
        actorScore
        chance
        computedScore
        targetRisk
        targetFaith
        targetScore
        */
        console.log("RelativeTestRollDialog", data)
        if (data) {
            // Print the roll result as a chat message.
            await this._print({
                actorScore: data.actorScore, 
                actorRisk: data.actorRisk,
                targetScore: data.targetScore, 
                targetRisk: data.targetRisk,
                targetFaith: data.targetFaith
            });
        }
    }

    /**
     * Prints the roll result as a chat message.
     */
    async _print(dialogdata) {
      let baseData = {
        name: this.actorName,
        attribute: this.attribute,
        actorFaith: this.faith,
      }

      this.data = Object.assign({}, dialogdata, baseData);
      const chatMessage = await this.toMessage({}, { create: false });
      ChatMessage.create(chatMessage);
    }
}