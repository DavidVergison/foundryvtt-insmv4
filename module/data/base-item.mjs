import InsMvDataModel from "./base-model.mjs";

export default class InsMvItemBase extends InsMvDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });
    schema.equipped = new fields.BooleanField({required: true, nullable: false, initial: false})
    
    return schema;
  }

}