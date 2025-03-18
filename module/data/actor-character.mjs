import { INS_MV } from "../helpers/config.mjs";
import InsMvActorBase from "./base-actor.mjs";

export default class InsMvCharacter extends InsMvActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();


    const skills = { required: true, nullable: false};

    schema.skills = new fields.SchemaField({})
    schema.spe = new fields.SchemaField({})
    schema.exotic = new fields.SchemaField({})

    for (const talent in INS_MV.sheetDictionary.Talents) {
      const attributes = INS_MV.sheetDictionary.Talents[talent];
      
      schema.skills.fields[talent] = new fields.StringField({ ...skills })
      if (attributes.includes("spe")) {
        schema.spe.fields[talent+"_spe"] = new fields.StringField({ ...skills })
        schema.spe.fields[talent+"_label_spe"] = new fields.StringField({ ...skills })
      }
      if (attributes.includes("exotique")) {
        schema.exotic.fields[talent+"_label"] = new fields.StringField({ ...skills })
        schema.exotic.fields[talent+"_carac"] = new fields.StringField({ ...skills })
      }
    }
    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.INS_MV.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl =  1

    return data
  }
}