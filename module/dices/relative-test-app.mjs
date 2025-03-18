import { INS_MV_CONVERT } from '../helpers/convert.mjs';
import { INS_MV } from '../helpers/config.mjs';

export class InsMv4_RelativeTest extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "app-insmv4-relative",
      title: "Test en opposition",
      template: "systems/ins-mv/module/dices/templates/relative.html", // Adaptez ce chemin
      width: 450,
      height:350,
      closeOnSubmit: false,
      resizable: true
    });
  }

  constructor(object = {}, options = {}) {
    super(object, options);

    this.modifier = 0
    this.testedAttribute = object.testedAttribute
    this.actorData = {
      name: object.name,
      score: object.score || 2,
      faith: Math.trunc(INS_MV_CONVERT.convertPlus(object.faith)) || 0,
      risk: 0,
    }
    this.targetData = {
      score: 2,
      risk: 0,
    }

    // computed
    this.computedScore = 0
    this.chance = 50
  }

  async getData() {
    this.calculateChance()

    const data = {
      actorScore: this.actorData.score,
      targetScore: this.targetData.score,
      actorRisk: this.actorData.risk,
      targetRisk: this.targetData.risk,
      difficulties: INS_MV.DIFFICULTIES,
      modifier: this.modifier,
      computedScore: this.computedScore,
      chance: this.chance,
    };
    console.log("InsMv4.getData", data)
    return data
  }

  _updateValues(html) {
    const $modifier    = html.find("#modifier");
    const $targetScore = html.find("#targetScore");
    const $actorRisk   = html.find("#actorRisk");
    const $targetRisk  = html.find("#targetRisk");
  
    this.modifier         = parseInt($modifier.val()) || 0;
    this.targetData.score = parseInt($targetScore.val()) || 2;
    this.actorData.risk   = parseInt($actorRisk.val()) || 0;
    this.targetData.risk  = parseInt($targetRisk.val()) || 0;
  
    this._updateChance(html);
  }

  activateListeners(html) {
    super.activateListeners(html);

    const $modifier = html.find("#modifier");
    const $targetScore = html.find("#targetScore");
    const $actorRisk = html.find("#actorRisk");
    const $targetRisk = html.find("#targetRisk");
    const $validateRoll = html.find("#validate-roll");

    $modifier.on("change input", () => this._updateValues(html));
    $targetScore.on("change input", () => this._updateValues(html));
    $actorRisk.on("change input", () => this._updateValues(html));
    $targetRisk.on("change input", () => this._updateValues(html));

    $validateRoll.on("click", (event) => {
      this._rollAndDisplay(event, html);
    });
  }

  calculateChance() {
    console.log("InsMv4.calculateChance", {
      score: this.actorData.score, 
      modifier: this.modifier, 
      targetScore: this.targetData.score, 
      actorRisk: this.actorData.risk, 
      targetRisk: this.targetData.risk
    });
  
    const actorScore = INS_MV_CONVERT.convertPlus(this.actorData.score);
    const targetScore = INS_MV_CONVERT.convertPlus(this.targetData.score);
    const actorComputedScore = actorScore + ((this.modifier - this.actorData.risk) / 2);
    const targetComputedScore = targetScore - (this.targetData.risk / 2);
  
    this.computedScore = Math.max(-4.5, Math.min(actorComputedScore - targetComputedScore, 4.5));
  
    const result = INS_MV.TUM.find(item => item.vs === this.computedScore) || { score: -1, chance: -1, vs: -1 };
  
    this.chance = result.chance;
  }

  _updateChance(html) {
    this.calculateChance()
    html.find("#chance").text(`Chance de réussite : ${this.chance.toFixed(1)}% (${INS_MV_CONVERT.convertToPlus(this.computedScore)})`);
  }
  
  async _rollAndDisplay(event, html) {

    const rollTest = new game.insmv.RelativeTestRoll(
      "", //formula
      {
        computedScore: this.computedScore,
        bonusScore: this.bonusScore,
        actorRisk: this.actorData.risk,
        targetRisk: this.targetData.risk,
        actorFaith: this.actorData.faith,
        marginBonus: this.marginBonus,
        actorName: this.actorData.name,
        testedAttribute: this.testedAttribute,
        marginBonusName: this.marginBonusName,
      }, //data
      {
        rollmode: "blind" // pour le test
      }, //option
    )
    await rollTest.toMessage ({},{rollmode: "blind"})
  }
}

