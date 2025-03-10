import InsMvItemBase from "./base-item.mjs";

export default class InsMvPower extends InsMvItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.level = new fields.StringField({ required: true, nullable: false });

    return schema;
  }
}