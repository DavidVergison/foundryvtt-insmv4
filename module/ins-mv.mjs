// Import document classes.
import { InsMvActor } from './documents/actor.mjs';
import { InsMvItem } from './documents/item.mjs';
// Import sheet classes.
import { InsMvActorSheet } from './sheets/actor-sheet.mjs';
import { InsMvItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { INS_MV } from './helpers/config.mjs';
import { INS_MV_CONVERT } from './helpers/convert.mjs';
import { INS_MV_DESC } from './helpers/descriptions.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

import { InsMvDie } from './dices/ins-mv-system-die.mjs';
import { InsMvRollParser } from './dices/ins-mv-system-parser.mjs';
import { InsMvRoll } from './dices/ins-mv-system-roll.mjs';
import { AbsoluteTestRoll } from './dices/absolute-test-roll.mjs';
import { RelativeTestRoll } from './dices/relative-test-roll.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.insmv = {
    InsMvActor,
    InsMvItem,
    rollItemMacro, 
    AbsoluteTestRoll,
    RelativeTestRoll
  };

  // Add custom constants for configuration.
  CONFIG.INS_MV = INS_MV;
  CONFIG.INS_MV_CONVERT = INS_MV_CONVERT;
  CONFIG.INS_MV_DESC = INS_MV_DESC

  // Make the parser recognise and construct a MySystemDie
  CONFIG.Dice.parser = InsMvRollParser;
  CONFIG.Dice.rolls = [InsMvRoll, AbsoluteTestRoll, RelativeTestRoll];

  if (!('l' in CONFIG.Dice.terms)) {
    CONFIG.Dice.terms.l = InsMvDie;
  }

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = InsMvActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.InsMvCharacter,
    npc: models.InsMvNPC
  }
  CONFIG.Item.documentClass = InsMvItem;
  CONFIG.Item.dataModels = {
    item: models.InsMvItem,
    weapon: models.InsMvWeapon,
    armor: models.InsMvArmor,
    shield: models.InsMvShield,
    power: models.InsMvPower
  }

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('ins-mv', InsMvActorSheet, {
    makeDefault: true,
    label: 'Fiche de Personnage',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('ins-mv', InsMvItemSheet, {
    makeDefault: true,
    label: 'Fiche d\'Objet',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});
Handlebars.registerHelper('ifPositive', function(value, options) {
  if (value > 0) {
    return options.fn(this);
  }
  return options.inverse(this);
});
Handlebars.registerHelper('formatScore', function(score) {
  // Convertir la valeur en chaîne et remplacer une éventuelle virgule par un point
  let num = Number(String(score).replace(',', '.'));
  if (isNaN(num)) return score;
  
  // Si la partie décimale est exactement 0.5, on affiche la partie entière suivie de '+'
  if (num % 1 === 0.5) {
    return Math.floor(num) + '+';
  }
  
  // Sinon, si c'est un entier, on le retourne tel quel
  if (num % 1 === 0) {
    return num;
  }
  
  // Si le nombre possède une décimale autre que 0.5, on le retourne tel quel (ou on peut l'arrondir)
  return num.toString();
});
Handlebars.registerHelper("includes", function(array, value) {
  return Array.isArray(array) && array.includes(value);
});
Handlebars.registerHelper("findPrefixedValue", function(array, prefix) {
  if (!Array.isArray(array) || typeof prefix !== "string") {
      return "";
  }

  const match = array.find(item => item.startsWith(prefix + ":"));
  
  return match ? match.substring(prefix.length + 1) : "";
});
Handlebars.registerHelper("concatTitle", function(array) {
  if (!Array.isArray(array) || array.length === 0) {
      return "";
  }

  return array
      .map(item => `${item.value} (${item.name})`) // Formate chaque élément
      .join(" + "); // Assemble les éléments avec " + "
});

Handlebars.registerHelper("showArray", function(array) {
  if (!Array.isArray(array) || array.length === 0) {
      return "";
  }
  let res = array.join("<br/>")
  return new Handlebars.SafeString(res);
});

Handlebars.registerHelper("editOrView", function(editable, name, value, options) {
  const attrs = Object.keys(options.hash)
      .map(key => `${key}="${options.hash[key]}"`)
      .join(" ");

  if (editable) {
      return new Handlebars.SafeString(
          `<input type="text" name="${name}" value="${value}" ${attrs}>`
      );
  } else {
      return new Handlebars.SafeString(
          `<label ${attrs}>${value}</label>`
      );
  }
});
Handlebars.registerHelper("woundSymbol", function(value) {
  const symbols = [" ", "/", "X"];
  return new Handlebars.SafeString(symbols[value] || "?");
});

Handlebars.registerHelper("isAbility", function(value) {
  return Object.keys(CONFIG.INS_MV.sheetDictionary.Caracteristiques).includes(value);
});

Handlebars.registerHelper("localizeWithDefault", function(key, defaultValue) {
  // S'assurer que la clé est une chaîne de caractères
  const keyString = String(key);
  const translation = game.i18n.localize(keyString);
  return translation === keyString ? defaultValue : translation;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.insmv.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'ins-mv.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

Hooks.on("renderChatMessage", (chatMessage, html, data) => {
  // Applique le comportement uniquement aux messages contenant le bouton .unfold
  html.find(".unfold").on("click", function () {
    $(this).next(".detail").slideToggle(300);
  });
});