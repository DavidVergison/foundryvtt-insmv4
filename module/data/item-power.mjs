import InsMvItemBase from "./base-item.mjs";

export default class InsMvPower extends InsMvItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.level = new fields.StringField({ required: true, nullable: false });
    schema.type = new fields.StringField({ required: false, nullable: true });
    schema.activation = new fields.StringField({ required: false, nullable: true });
    schema.cost = new fields.StringField({ required: false, nullable: true });
    schema.quality = new fields.StringField({ required: false, nullable: true });

    return schema;
  }
}
