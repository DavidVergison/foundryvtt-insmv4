import { INS_MV } from "../helpers/config.mjs";
import InsMvDataModel from "./base-model.mjs";

export default class InsMvActorBase extends InsMvDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 })
    });
    schema.power = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 5 })
    });
    schema.biography = new fields.StringField({ required: true, blank: true });

    schema.boss = new fields.StringField({ blank: true });
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max:3 });
    
    const wound = { ...requiredInteger, initial: 0, min: 0, max:2 }
    schema.wounds = new fields.SchemaField({
      lightWounds: new fields.SchemaField({
        l1: new fields.NumberField({ ...wound }),
        l2: new fields.NumberField({ ...wound }),
        l3: new fields.NumberField({ ...wound }),
        l4: new fields.NumberField({ ...wound }),
        l5: new fields.NumberField({ ...wound }),
        l6: new fields.NumberField({ ...wound }),
      }),
      seriousWounds: new fields.SchemaField({
        s1: new fields.NumberField({ ...wound }),
        s2: new fields.NumberField({ ...wound }),
        s3: new fields.NumberField({ ...wound }),
        s4: new fields.NumberField({ ...wound }),
        s5: new fields.NumberField({ ...wound }),
      }),
      fatalWounds: new fields.SchemaField({
        f1: new fields.NumberField({ ...wound }),
        f2: new fields.NumberField({ ...wound }),
        f3: new fields.NumberField({ ...wound }),
      }),
      death: new fields.SchemaField({
        d1: new fields.NumberField({ ...wound }),
        d2: new fields.NumberField({ ...wound }),
      })
    })

    const requiredCaracteristic = { required: true, nullable: false };

    schema.caracteristics = new fields.SchemaField({})
    for (const carac in INS_MV.sheetDictionary.Caracteristiques) {
      schema.caracteristics.fields[carac] = new fields.StringField({ ...requiredCaracteristic })
    }

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
}