import InsMvItem from "./item-item.mjs";

export default class InsMvWeapon extends InsMvItem {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.power = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1});
    schema.precision = new fields.NumberField({ required: true, nullable: false, integer: true, initial: -1});
    schema.skill = new fields.StringField({ blank: true });
    schema.spe = new fields.StringField({ blank: true });

    return schema;
  }
}