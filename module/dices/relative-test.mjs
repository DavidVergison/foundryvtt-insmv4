import { INS_MV_CONVERT } from '../helpers/convert.mjs';
import { INS_MV } from '../helpers/config.mjs';
import { InsMvDie } from './ins-mv-system-die.mjs';

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
    this.actorData = {
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

  activateListeners(html) {
    super.activateListeners(html);
    html.find("#modifier, #targetScore, #actorRisk, #targetRisk").on("change input", () => {
      this.modifier = parseInt(html.find("#modifier").val()) || 0;
      this.targetData.score = parseInt(html.find("#targetScore").val()) || 2;
      this.actorData.risk = parseInt(html.find("#actorRisk").val()) || 0;
      this.targetData.risk = parseInt(html.find("#targetRisk").val()) || 0;
      this._updateChance(html);
    });
    html.find("#validate-roll-vs").on("click", (event) => {
      this._rollAndDisplay(event, html);
    });
  }

  calculateChance() {
    console.log("InsMv4.calculateChance",{
      score:this.actorData.score, 
      modifier:this.modifier, 
      targetScore: this.targetData.score, 
      actorRisk: this.actorData.risk, 
      targetRisk: this.targetData.risk})

    const actorComputedScore = INS_MV_CONVERT.convertPlus(this.actorData.score) + ((this.modifier - this.actorData.risk)/2)
    const targetComputedScore = INS_MV_CONVERT.convertPlus(this.targetData.score) - this.targetData.risk/2
    this.computedScore = Math.max(-4.5, Math.min(actorComputedScore - targetComputedScore, 4.5));

    let res = { score: -1,  chance: -1, vs: -1 }
    for (let i = 0; i < INS_MV.TUM.length; i++) {
      if (this.computedScore === INS_MV.TUM[i].vs) {
        res = INS_MV.TUM[i];
      }
    }
    this.chance = res.chance
  }

  _updateChance(html) {
    this.calculateChance()
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
      risk: this.actorData.risk
    })
    let roll = await this._rollDice()

    let threshold = -1;
    for (let i = 0; i < INS_MV.TUM.length; i++) {
      if (this.computedScore === INS_MV.TUM[i].vs) {
        threshold = INS_MV.TUM[i].threshold;
        break;
      }
    }
    this.sendRollMessage(
      "systems/ins-mv/module/dices/templates/roll-result.hbs",
      roll,
      threshold,
      roll.margin + this.actorData.risk + this.actorData.faith*(roll.maxRepeats-1), // success margin
      roll.margin + this.targetData.risk, // failure margin
      this.actorData.risk,
      this.targetData.risk,
      this.actorData.faith
    )
  }

  async sendRollMessage(template, roll, threshold, successMargin, failMargin, actorRisk, targetRisk, faith) {
    // Données à injecter dans le template
    const data = {
        rollResult: roll.result,
        threshold,
        success: roll.d66 <= threshold,
        successMargin,        
        successMarginParts:[
          {name: "unité", value: roll.margin},
          {name: "risque", value: actorRisk},
        ],
        failMargin,
        failMarginparts:[
          {name: "unité", value: roll.margin},
          {name: "risque", value: targetRisk},
        ]
    };

    if(roll.maxRepeats - 1 >= 2) {
        console.log("x")
        data.successMarginParts.push({name: "foi", value: faith})
    }
    if(roll.maxRepeats - 1 >= 1) {
        console.log("y")
        data.successMarginParts.push({name: "foi", value: faith})
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

