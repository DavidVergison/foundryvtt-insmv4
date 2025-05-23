/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/insmv/templates/actor/parts/actor-items.hbs',
    'systems/insmv/templates/actor/parts/actor-powers.hbs',
    'systems/insmv/templates/actor/parts/actor-wounds.hbs',
    'systems/insmv/templates/actor/parts/actor-identity.hbs',
    'systems/insmv/templates/actor/parts/actor-attributes.hbs',
    'systems/insmv/templates/actor/parts/actor-skills.hbs',
  ]);
};
