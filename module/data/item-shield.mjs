import InsMvItem from "./item-item.mjs";

export default class InsMvShield extends InsMvItem {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.armor = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 9 });
    schema.power = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1});
    schema.precision = new fields.NumberField({ required: true, nullable: false, integer: true, initial: -1});
    schema.skill = new fields.StringField({ blank: true });
    schema.spe = new fields.StringField({ blank: true });

    return schema;
  }

  
  prepareDerivedData() {

  }
}
