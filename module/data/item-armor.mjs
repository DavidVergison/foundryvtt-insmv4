import InsMvItem from "./item-item.mjs";

export default class InsMvArmor extends InsMvItem {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.armor = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 9 });
    schema.minStrength = new fields.StringField({ blank: true });

    return schema;
  }

  
  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const roll = this.roll;

    this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
}
