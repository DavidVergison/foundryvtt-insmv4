import { AbsoluteTestRollDialog } from './absolute-test-roll-dialog.mjs';
import { INS_MV } from '../helpers/config.mjs';
import { AbstractInsTestRoll } from './ins-test-roll.mjs'

export class AbsoluteTestRoll extends AbstractInsTestRoll {

  _createBase(actorName, attribute, faith, score){
    super._createBase(actorName, attribute, faith, score)
  }

  // détails des modificateurs au test
  _prepareEffectiveScoreDetail(score, modifier, difficulty, risk, maxRepeats, faith){
    const plus = []
    const moins = [`* prise de risque: ${risk}`]

    if (difficulty > 0) {
      plus.push(`* difficulté: ${difficulty}`);
    } else if (difficulty < 0){
      moins.push(`* difficulté: ${Math.abs(difficulty)}`);
    }

    if (modifier > 0) {
      plus.push(`* modificateur: ${modifier}`);
    } else {
      moins.push(`* modificateur: ${Math.abs(modifier)}`);
    }

    if (this.style == "weapon"){
      if (this.precision >= 0) {
        plus.push(`* précision: ${Math.abs(this.precision)}`);
      } else {
        moins.push(`* précision: ${Math.abs(this.precision)}`);
      }
    }

    const list = []
    list.push(`Score: ${score}`)
    list.push("Colonnes bonus :")
    list.push(...plus)
    list.push("Colonnes malus :")
    list.push(...moins)

    return list
  }

  // détails des modificateurs au RU du test
  _prepareActionScoreDetail(ru, bonusScore, maxRepeats, faith, risk){
    const plus = [`* prise de risque: ${risk}`]
    const moins = []

    if (bonusScore >= 0) {
      plus.push(`* score bonus: ${bonusScore}`);
    } else {
      moins.push(`* score bonus: ${bonusScore}`);
    }

    const faithCount = Math.min(maxRepeats - 1, 2);
    for (let i = 0; i < faithCount; i++) {
      plus.push(`* foi: ${faith}`);
    }

    const list = []
    list.push(`unité: ${ru}`)
    list.push(...moins)
    list.push(...plus)

    return list
  }

  
  // détails des modificateurs au RU effectif (pour les dégâts et la protection)
  _prepareEffectScoreDetail(ru, bonusScore, maxRepeats, faith, risk, effectName){
    const list = []
    if(effectName != "") {
      const plus = [`* prise de risque: ${risk}`]
      const moins = []

      if (bonusScore >= 0) {
        plus.push(`* score bonus: ${bonusScore}`);
      } else {
        moins.push(`* score bonus: ${bonusScore}`);
      }

      const faithCount = Math.min(maxRepeats - 1, 2);
      for (let i = 0; i < faithCount; i++) {
        plus.push(`* foi: ${faith}`);
      }

      if (this.style == "weapon"){
        if (this.damages >= 0) {
          plus.push(`* puissance: ${this.damages}`);
        } else {
          moins.push(`* puissance: ${this.damages}`);
        }
      }
      if (this.style == "armor"){
        if (this.damages >= 0) {
          plus.push(`* armure: ${this.armor}`);
        } else {
          moins.push(`* armure: ${this.armor}`);
        }
      }

      list.push(`unité: ${ru}`)
      list.push(...moins)
      list.push(...plus)
    }
    return list
  }

  /**
   * Prepares the data needed to render the roll result.
   */
  _prepareRenderData(roll, data) {
    console.log("ON PASSE BIEN ICI !!!")
    console.log(roll)
    console.log(data)

    const {
      name, attribute, difficulty, faith, modifier,
      risk, score, style, actionName, effectName,
    } = data

    const {result, d66, maxRepeats} = roll
    const ru = roll.margin

    let effectiveScore = score + 
      ((difficulty + modifier - risk) / 2) +
      (this.precision /2); // =0 if not weapon
    effectiveScore = Math.max(-2.5, Math.min(effectiveScore, 6.5));
    console.log("effectiveScore", effectiveScore)
    const effectiveScoreDetail = this._prepareEffectiveScoreDetail(
      score, modifier, difficulty, risk, maxRepeats, faith)

    let bonusScore = effectiveScore + (risk/2);

    // Retrieve the threshold from the INS_MV.TUM table based on the computed score.
    // If no matching score is found, default to -1.
    const threshold = INS_MV.TUM.find(item => item.score === effectiveScore)?.threshold ?? -1;

    const success = d66 <= threshold

    const action = Math.trunc(
      ru + bonusScore + risk + faith * (maxRepeats - 1) 
    )
    const actionScoreDetails = this._prepareActionScoreDetail(
      ru, bonusScore, maxRepeats, faith, risk)
    console.log("action", action)


    const effect = Math.trunc(
      ru + bonusScore + risk + faith * (maxRepeats - 1) + this.damages + this.armor // =0 if not weapon
    )
    const effectScoreDetails = this._prepareEffectScoreDetail(
      ru, bonusScore, maxRepeats, faith, risk, effectName)
    console.log("effect", effect)


    const failMargin = ru

    const tplData = {
      name, attribute, //{name} fait un test de {attribute}
      effectiveScore, effectiveScoreDetail, //Avec un score de X (détail)
      result, threshold, //résultat (seuil)
      action, actionScoreDetails, //Attaque/Defense : 12 (RU + score bonus + risk)
      effect, effectScoreDetails, //Dégâts/Armure (RU + score bonus + risk + puissance) :
      success, //boolean
      failMargin, //ru
      style, // skill/carac/power/weapon/armor
      actionName,
      effectName,
    };
    return tplData
  }

  /**
   * Opens a dialog to prompt the user for roll configuration,
   * then prints the resulting roll outcome.
   */
  async prompt() {
    this.baseChance = AbsoluteTestRollDialog.calculateChance({
      modifier: 0,
      score: this.score,
      actorRisk: 0,
      difficulty: 0,
      precision: this.precision,
    })
    console.log(this)

    // Define initial context data for the dialog.
    const dialogContext = {
      actorScore: this.score,
      chance: this.baseChance.chance,
      computedScore: this.baseChance.computedScore,
      weapon: (this.style == "weapon"),
      precision: this.precision
    };

    const data = await AbsoluteTestRollDialog.show(dialogContext)
    /*
    actorRisk: 0
    bonusScore: 3 => score calculé, sans la prise de risque
    chance: "66.6" => chance de succes
    computedScore: 3 => score calculé
    difficulty: 0 => difficulté imposée
    modifier: 2 => modificateur imposé
    score: 2 => score de base
    */

    if (data) {
      // Print the roll result as a chat message.
      await this._print({
        risk: data.actorRisk,
        modifier: data.modifier,
        difficulty: data.difficulty,
      });
    }
  }

  /**
   * Prints the roll result as a chat message.
   */
  async _print(dialogdata) {
    /*
      risk
      modifier
      difficulty
    */

    let baseData = {
      name: this.actorName,
      attribute: this.attribute,
      faith: this.faith,
      score : this.score,
      style: this.style,
      actionName: this.actionName,
      effectName: this.effectName,
    }

    this.data = Object.assign({}, dialogdata, baseData);
    const chatMessage = await this.toMessage({}, { create: false });
    ChatMessage.create(chatMessage);
  }
}


