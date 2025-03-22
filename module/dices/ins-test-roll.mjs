import { InsMvDie } from './ins-mv-system-die.mjs';
import { INS_MV } from '../helpers/config.mjs';

export class AbstractInsTestRoll extends foundry.dice.Roll {
    async evaluate(options = {}) {
        this._evaluated = true;
        
        const roll = await this._rollDice(); // d666

        this.renderData = this._prepareRenderData(roll, this.data);
        console.log("computed render data", {roll, data: this.data})
        this.renderData.template = "systems/ins-mv/module/dices/templates/roll-result.hbs";
      }
      

    static fromData(data) {
        const instance = super.fromData(data)
        instance.renderData = data.renderData
        return instance
    }

    toJSON() {
        const baseJson = super.toJSON();
        return { ...baseJson, renderData: this.renderData };
    }

    async render(options = {}) {
      console.log("render this.renderData", this.renderData)

      if (options.isPrivate){
        return ""
      }
      
      const specialResults = {
        "111": "systems/ins-mv/static/assets/111.webp",
        "666": "systems/ins-mv/static/assets/666.webp"
      };

      const spe = specialResults[this.renderData.rollResult]
      console.log("render spe", spe)
      if (spe) {
        this.renderData.picture = spe
        this.renderData.template = "systems/ins-mv/module/dices/templates/roll-result-spe.hbs"
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
            console.log("roll", roll);
        return roll
    }

    _addFaithParts(successMarginParts, actorFaith, maxRepeats) {
      const faithCount = Math.min(maxRepeats - 1, 2);
      for (let i = 0; i < faithCount; i++) {
        successMarginParts.push({ name: "foi", value: actorFaith });
      }
    }

}