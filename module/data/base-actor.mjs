import { INS_MV } from "../helpers/config.mjs";
import InsMvDataModel from "./base-model.mjs";
import { INS_MV_CONVERT } from "../helpers/convert.mjs";


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
    schema.rankPowers = new fields.StringField({ blank: true });
    schema.titles = new fields.StringField({ blank: true });

    schema.lightWoundsThreshold = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.seriousWoundsThreshold = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.fatalWoundsThreshold = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.deathThreshold = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

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

    const requiredCaracteristic = { required: true, nullable: false, initial: "2" };

    schema.caracteristics = new fields.SchemaField({})
    for (const carac in INS_MV.sheetDictionary.Caracteristiques) {
      schema.caracteristics.fields[carac] = new fields.StringField({ ...requiredCaracteristic })
    }


    
    return schema;
  }

  getRollData() {
    console.log("getRollData", this)
    const data = {};
    for (const carac in INS_MV.sheetDictionary.Caracteristiques) {
      data[carac] = INS_MV_CONVERT.convertPlus(this.caracteristics[carac])
    }

    for (const talent in INS_MV.sheetDictionary.Talents) {
      const attributes = INS_MV.sheetDictionary.Talents[talent];

      if (!talent in this.skills || !this.skills[talent] || attributes.includes("liste")) {
        continue;
      }

      if (attributes.includes("spe")) {
        if (!talent + '_spe' in this.spe || !this.spe[talent + '_spe']) {
          continue;
        }

        if (attributes.includes("exotique")){
          data[this.exotic[talent + '_label']] = INS_MV_CONVERT.convertPlus(this.skills[talent])
        } else{
          data[talent] = INS_MV_CONVERT.convertPlus(this.skills[talent]) 
        }
        data[this.spe[talent + '_label_spe']] = INS_MV_CONVERT.convertPlus(this.spe[talent + '_spe'])

      } else {
        data[talent] = INS_MV_CONVERT.convertPlus(this.skills[talent])
      }
    }
    console.log("getRollData", data)

    return data
  }
}