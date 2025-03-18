import { INS_MV_CONVERT } from '../helpers/convert.mjs';
import { INS_MV } from '../helpers/config.mjs';

export class InsMv4_AbsoluteTest extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "app-insmv4-absolute",
      title: "Test simple",
      template: "systems/ins-mv/module/dices/templates/absolute.html", // Adaptez ce chemin
      width: 450,
      height:350,
      closeOnSubmit: false,
      resizable: true
    });
  }

  constructor(object = {}, options = {}) {
    super(object, options);

    this.modifier = 0
    this.difficulty = 4
    this.testedAttribute = object.testedAttribute
    this.actorData = {
      name: object.name,
      score: object.score || 2,
      faith: Math.trunc(INS_MV_CONVERT.convertPlus(object.faith)) || 0,
      risk: 0,
    }
    this.marginBonus = object.marginBonus
    this.marginBonusName = object.marginBonusName

    // computed
    this.computedScore = 0
    this.bonusScore = 0
    this.chance = 50
  }

  async getData() {
    this.calculateChance()

    const data = {
      actorScore: this.actorData.score,
      actorRisk: this.actorData.risk,
      difficulties: INS_MV.DIFFICULTIES,
      modifier: this.modifier,
      computedScore: this.computedScore,
      chance: this.chance,
    };
    console.log("InsMv4.getData", data)
    return data
  }

  _updateValues(html) {
    const $difficulty = html.find("#difficulty");
    const $modifier = html.find("#modifier");
    const $actorRisk = html.find("#actorRisk");
  
    this.modifier = parseInt($modifier.val()) || 0;
    const score = Math.trunc(INS_MV_CONVERT.convertPlus(this.actorData.score));
    let risk = parseInt($actorRisk.val()) || 0;
    risk = Math.max(0, Math.min(risk, score));
    $actorRisk.val(risk);
  
    this.actorData.risk = risk;
    this.difficulty = parseInt($difficulty.find("option:selected").data("bonus")) || 0;
    this._updateChance(html);
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    const $difficulty = html.find("#difficulty");
    const $modifier = html.find("#modifier");
    const $actorRisk = html.find("#actorRisk");
    const $validateRoll = html.find("#validate-roll");

    $difficulty.on("change input", () => this._updateValues(html));
    $modifier.on("change input", () => this._updateValues(html));
    $actorRisk.on("change input", () => this._updateValues(html));

    $validateRoll.on("click", (event) => {
      this._rollAndDisplay(event, html);
    });
  }

  calculateChance() {
    console.log("InsMv4.calculateChance", {
      actorScore: this.actorData.score, 
      diffBonus: this.difficulty, 
      modifier: this.modifier, 
      actorRisk: this.actorData.risk
    });
  
    const baseScore = INS_MV_CONVERT.convertPlus(this.actorData.score);
  
    this.computedScore = baseScore + ((this.difficulty + this.modifier - this.actorData.risk) / 2);
    this.computedScore = Math.max(-2.5, Math.min(this.computedScore, 6.5));
  
    this.bonusScore = baseScore + ((this.difficulty + this.modifier) / 2);
    this.bonusScore = Math.trunc(Math.max(0, Math.min(this.bonusScore, 6.5)));
  
    const result = INS_MV.TUM.find(item => item.score === this.computedScore) || { score: -1, chance: -1 };
  
    this.chance = result.chance;
  }

  _updateChance(html) {
    this.calculateChance();
    html.find("#chance").text(`Chance de réussite : ${this.chance.toFixed(1)}% (${INS_MV_CONVERT.convertToPlus(this.computedScore)})`);
  }

  async _rollAndDisplay(event, html) {

    const rollTest = new game.insmv.AbsoluteTestRoll(
      "", //formula
      {
        computedScore: this.computedScore,
        bonusScore: this.bonusScore,
        actorRisk: this.actorData.risk,
        actorFaith: this.actorData.faith,
        marginBonus: this.marginBonus,
        actorName: this.actorData.name,
        testedAttribute: this.testedAttribute,
        marginBonusName: this.marginBonusName,
      }, //data
      {
        rollmode: "blind",
        blind: true,
      }, //option
    )
    await rollTest.toMessage ()
  }
}
