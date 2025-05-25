import { InsMvDie } from './ins-mv-system-die.mjs';

export class AbstractInsTestRoll extends foundry.dice.Roll {
  constructor() {
    super()
    this.actorName = ""
    this.attribute = ""
    this.faith = 0
    this.score = 0
    this.precision = 0
    this.damages = 0
    this.armor = 0

    this.baseChance = {}

    this.style = "skill" // skill/carac/weapon/armor/power
    this.actionName = ""
    this.effectName = ""
  }

  _getTemplate(){

    switch(this.style){
      case "relative":
        return "systems/insmv/module/dices/templates/roll-result-relative.hbs";
        break
      case "weapon":
      case "armor":
        return "systems/insmv/module/dices/templates/roll-result-fight.hbs";
        break
      case "skill":
      case "carac":
      case "power":
      default:
        return "systems/insmv/module/dices/templates/roll-result-absolute.hbs";
    }
  }

  _createBase(actorName, attribute, faith, score){
    this.actorName = actorName
    this.attribute = attribute
    this.faith = faith
    this.score = score
  }

  createFromActorSkill(actor, actorRollData, skill){
    this.style = "skill"
    this.actionName = "Marge"
    this.effectName = ""
    const score = actorRollData[skill] || 0
    this._createBase(actor.name, skill, actorRollData["Foi"], score)
  }

  createFromActorCarac(actor, actorRollData, carac){
    this.style = "carac"
    this.actionName = "Marge"
    this.effectName = ""
    const score = actorRollData[carac] || 0
    this._createBase(actor.name, carac, actorRollData["Foi"], score)
  }

  createFromActorPower(actor, actorRollData, power){
    this.style = "power"
    this.actionName = "Marge"
    this.effectName = ""
    const score = parseInt(power.system.level) || 0
    this._createBase(actor.name, power.name, actorRollData["Foi"], score)
  }

  createFromActorItem(actor, actorRollData, skill, item){
    let talent = skill
    switch(item.type){
      case 'weapon':
      case 'shield':
        this.style = "weapon"
        this.precision = item.system.precision
        this.damages = item.system.power
        this.actionName = "Attaque"
        this.effectName = "Dégâts"
        break
      case 'armor':
        this.style = "armor"
        this.armor = item.system.armor
        talent = "Défense"
        this.actionName = "Défense"
        this.effectName = "Armure"
        break
    }
    console.log({
      skill, talent
    })
    const score = actorRollData[talent] || 0
    this._createBase(actor.name, talent, actorRollData["Foi"], score)
  }

    async evaluate(options = {}) {
        this._evaluated = true;
        
        const roll = await this._rollDice(); // d666

        this.renderData = this._prepareRenderData(roll, this.data);
        this.renderData.template = this._getTemplate()
      }
      

    static fromData(data) {
        console.log(data)
        const instance = super.fromData(data)
        instance.renderData = data.renderData
        return instance
    }

    toJSON() {
        const baseJson = super.toJSON();
        return { ...baseJson, renderData: this.renderData };
    }

    async render(options = {}) {

      if (options.isPrivate){
        return ""
      }
      
      const specialResults = {
        "111": "systems/insmv/static/assets/111.webp",
        "666": "systems/insmv/static/assets/666.webp"
      };
      console.log("this.renderData", this.renderData)
      const spe = specialResults[this.renderData.result]
      if (spe) {
        this.renderData.picture = spe
        this.renderData.template = "systems/insmv/module/dices/templates/roll-result-spe.hbs"
      }

      const content = await renderTemplate(
        this.renderData.template,
        this.renderData);
      return content
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
        return roll
    }

    _addFaithParts(successMarginParts, actorFaith, maxRepeats) {
      const faithCount = Math.min(maxRepeats - 1, 2);
      for (let i = 0; i < faithCount; i++) {
        successMarginParts.push({ name: "foi", value: actorFaith });
      }
    }

}