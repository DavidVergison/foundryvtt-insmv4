/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/ins-mv/templates/actor/parts/actor-items.hbs',
    'systems/ins-mv/templates/actor/parts/actor-powers.hbs',
    'systems/ins-mv/templates/actor/parts/actor-wounds.hbs',
    'systems/ins-mv/templates/actor/parts/actor-effects.hbs',
    'systems/ins-mv/templates/actor/parts/actor-identity.hbs',
    'systems/ins-mv/templates/actor/parts/actor-attributes.hbs',
    'systems/ins-mv/templates/actor/parts/actor-skills.hbs',
    // Item partials
    'systems/ins-mv/templates/item/parts/item-effects.hbs',
  ]);
};
