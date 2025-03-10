import { INS_MV_CONVERT } from '../helpers/convert.mjs';
import { INS_MV } from '../helpers/config.mjs';
import { InsMvDie } from './ins-mv-system-die.mjs';

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
    this.actorData = {
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

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#difficulty, #modifier, #actorRisk").on("change input", () => {
        this.modifier = parseInt(html.find("#modifier").val()) || 0;
        let risk=parseInt(html.find("#actorRisk").val()) || 0;
        let score = Math.trunc(INS_MV_CONVERT.convertPlus(this.actorData.score))
        if (risk < 0) {
            risk = 0;
            html.find("#actorRisk").val(risk);
          } else if (risk > score) {
            console.log("actorRisk",{
                risk,
                score
            })
            risk = score
            html.find("#actorRisk").val(risk);
          }
        this.actorData.risk = risk
        this.difficulty = parseInt(html.find("#difficulty option:selected").data("bonus"));
      this._updateChance(html);
    });
    html.find("#validate-roll").on("click", (event) => {
      this._rollAndDisplay(event, html);
    });
  }

  calculateChance() {
    console.log("InsMv4.calculateChance",{
        actorScore: this.actorData.score, 
        diffBonus: this.difficulty, 
        modifier: this.modifier, 
        actorRisk: this.actorData.risk})

    this.computedScore = INS_MV_CONVERT.convertPlus(this.actorData.score) + ((this.difficulty + this.modifier - this.actorData.risk) / 2);
    this.computedScore = Math.max(-2.5, Math.min(this.computedScore, 6.5));
    this.bonusScore = INS_MV_CONVERT.convertPlus(this.actorData.score) + ((this.difficulty + this.modifier) / 2);
    this.bonusScore = Math.trunc(Math.max(0, Math.min(this.bonusScore, 6.5)));

    let res = { score: -1,  chance: -1 }
    for (let i = 0; i < INS_MV.TUM.length; i++) {
      if (this.computedScore === INS_MV.TUM[i].score) {
        res = INS_MV.TUM[i];
      }
    }
    this.chance = res.chance
  }

  _updateChance(html) {
    const result = this.calculateChance();
    console.log("_updateChance", result)
    html.find("#chance").text(`Chance de réussite : ${this.chance.toFixed(1)}% (${INS_MV_CONVERT.convertToPlus(this.computedScore)})`);
  }


  async _rollDice(){
    let d666Die = new InsMvDie({
        "number": 1,
        "faces": 666,
        "modifiers": null,
        "flavor": null,
        "formula": "d666"
      });
      await d666Die.roll();
      let roll = d666Die.results.pop();
      console.log("roll", roll);
      return roll
  }

  async _rollAndDisplay(event, html) {
    console.log("_rollAndDisplay", {
        computedScore: this.computedScore,
        bonusScore: this.bonusScore,
        risk: this.actorData.risk
      })
    let roll = await this._rollDice()

    let threshold = -1;
    for (let i = 0; i < INS_MV.TUM.length; i++) {
      if (this.computedScore === INS_MV.TUM[i].score) {
        threshold = INS_MV.TUM[i].threshold;
        break;
      }
    }
    this.sendRollMessage(
        "systems/ins-mv/module/dices/templates/roll-result.hbs",
        roll,
        threshold,
        roll.margin + this.bonusScore + this.actorData.risk + this.actorData.faith*(roll.maxRepeats-1) + (this.marginBonus || 0), // success margin
        roll.margin, // failure margin
        this.bonusScore,
        this.actorData.risk,
        this.actorData.faith,
        this.marginBonus,
        this.marginBonusName
    )
  }

  async sendRollMessage(template, roll, threshold, successMargin, 
    failMargin, computedScore, actorRisk, faith, marginBonus, marginBonusName) {
    console.log("sendRollMessage",{template, roll, threshold, successMargin, failMargin, computedScore, actorRisk, faith})
    // Données à injecter dans le template
    const data = {
        rollResult: roll.result,
        threshold,
        success: roll.d66 <= threshold,
        successMargin,        
        successMarginParts:[
          {name: "unité", value: roll.margin},
          {name: "score", value: computedScore},
          {name: "risque", value: actorRisk},
        ],
        failMargin,
        failMarginparts:[
          {name: "unité", value: roll.margin},
        ]
    };

    if(roll.maxRepeats - 1 >= 2) {
        data.successMarginParts.push({name: "foi", value: faith})
    }
    if(roll.maxRepeats - 1 >= 1) {
        data.successMarginParts.push({name: "foi", value: faith})
    }

    console.log("marginBonus",marginBonus)
    console.log("marginBonusName",marginBonusName)
    if(marginBonus) {
      data.successMarginParts.push({name: marginBonusName, value: marginBonus})
    }

    // Rendu du template Handlebars
    const content = await renderTemplate(template, data);

    // Envoi du message dans le chat
    ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        content: content
    });
  }
}
