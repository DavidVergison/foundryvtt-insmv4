import { InsMvDie } from './ins-mv-system-die.mjs';
import { INS_MV } from '../helpers/config.mjs';

export class AbstractInsTestRoll extends foundry.dice.Roll {
    async evaluate(options = {}) {
        this._evaluated = true;
        
        const roll = await this._rollDice(); // d666
        const { actorName, testedAttribute } = this.data;

        const specialResults = {
          "111": "systems/ins-mv/static/assets/111.webp",
          "666": "systems/ins-mv/static/assets/666.webp"
        };
        
        if (specialResults[roll.results]) {
          this.renderData = {
            actorName,
            testedAttribute,
            picture: specialResults[roll.results],
            template: "systems/ins-mv/module/dices/templates/roll-result-spe.hbs"
          };
        } else {
          this.renderData = this._prepareRenderData(roll, this.data);
          this.renderData.template = "systems/ins-mv/module/dices/templates/roll-result.hbs";
        }
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
      const content = await renderTemplate(
        this.renderData.template,
        this.renderData);
      return content
    }
/*
    async toMessage(messageData={}, {rollMode, create=true}={}) {
      if ( rollMode === "roll" ) rollMode = undefined;
      rollMode ||= game.settings.get("core", "rollMode");
  
      // Perform the roll, if it has not yet been rolled
      if ( !this._evaluated ) await this.evaluate({allowInteractive: rollMode !== CONST.DICE_ROLL_MODES.BLIND});
  
      // Prepare chat data
      messageData = foundry.utils.mergeObject({
        user: game.user.id,
        content: String(this.total),
        sound: CONFIG.sounds.dice,
        blind: true
      }, messageData);
      messageData.rolls = [this];
  
      console.log("messageData",messageData)

      // Either create the message or just return the chat data
      const cls = getDocumentClass("ChatMessage");
      const msg = new cls(messageData);
  
      // Either create or return the data
      if ( create ) return cls.create(msg.toObject(), { rollMode });
      else {
        msg.applyRollMode(rollMode);
        return msg.toObject();
      }
    }
*/
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