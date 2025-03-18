import { INS_MV } from "../helpers/config.mjs";
import InsMvActorBase from "./base-actor.mjs";

export default class InsMvNPC extends InsMvActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();


    const skills = { required: true, nullable: false};

    schema.skills = new fields.SchemaField({})
    schema.spe = new fields.SchemaField({})
    schema.exotic = new fields.SchemaField({})

    for (const talent in INS_MV.NPCsheetDictionary.Talents) {
      const attributes = INS_MV.NPCsheetDictionary.Talents[talent];
      
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
    this.xp = this.cr * this.cr * 100;
  }
}