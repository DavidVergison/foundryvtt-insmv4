/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class InsMvActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['ins-mv', 'sheet', 'actor'],
      edition: false,
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/insmv/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  constructor(object = {}, options = {}) {
    super(object, options);
    this.edition = false
  }

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array.
    let context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.INS_MV
    context.config = CONFIG.INS_MV;
    context.desc = CONFIG.INS_MV_DESC;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      context = this._prepareItems(context);
      context = this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      context = this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );
    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
    return context
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const powers = [];

    let armor = 0
    let shield = 0

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      const validTypes = ['item', 'armor', 'weapon', 'shield'];
      const validPowers = ['power'];
      if (validTypes.includes(i.type)) {
        gear.push(i);
        if (i.system.equipped) {
          if (i.type == "armor") {      
            armor+=i.system.armor
          }
          if (i.type == "shield") {        
            shield+=i.system.armor
          }
        }
      }
      // Append to powers.
      else if (validPowers.includes(i.type)) {
        powers.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.powers = powers;
    context.armor = armor
    context.shield = shield
    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });
    html.on('click', '.toggle-equipped', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      await item.update({ "system.equipped": !item.system.equipped });
      this.render(); // Rafraîchir la feuille
    });

    html.on('click', '.wound', (ev) => {
      ev.preventDefault();
  
      const type = ev.currentTarget.dataset.type; 
      const key = ev.currentTarget.dataset.key; 
  
      if (this.document.system.wounds[type]) {
        this.document.system.wounds[type][key] = (this.document.system.wounds[type][key] + 1) % 3;
        this.actor.update({
          [`system.wounds.${type}.${key}`]: this.document.system.wounds[type][key] // Utilisation correcte des crochets
        });
      }

    
      this.render();
  });

    html.find(".toggle-edit").click(ev => {
      this.options.edition = !this.options.edition;
      this.render(); // Rafraîchir la feuille
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));
    html.on('contextmenu', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();

    const actorRollData = this.object.system.getRollData()
    let faith = actorRollData["Foi"]

    const element = event.currentTarget;
    const roll = element.dataset.roll;    
    let marginBonus = null
    let marginBonusName = null
    let modifier = 0

    if (roll) {

      console.log("*****************")
      let r = {}
      if(event.type == "contextmenu" && roll.charAt(0) != "i") {
        r = new game.insmv.RelativeTestRoll()
      } else {
        r = new game.insmv.AbsoluteTestRoll()
      }
      console.log(roll)
      console.log(actorRollData)
      switch (roll.charAt(0)) {
        case "s":
        case "t":
          r.createFromActorSkill(
            this.actor, actorRollData, roll.substring(2)
          )
          r.prompt()
          break
        case "c":
          r.createFromActorCarac(
            this.actor, actorRollData, roll.substring(2)
          )
          r.prompt()
          break
        case "i":        
          const itemId = element.closest('.item').dataset.itemId;
          const item = this.actor.items.get(itemId);
          const [skill, spe] = roll.substring(2).split("/")
          const skillScore = actorRollData[skill] || 0
          const speScore = actorRollData[spe] || 0
          const  talent = speScore > skillScore ? spe : skill
          console.log({
            skill, spe, talent
          })
          r.createFromActorItem(
            this.actor, actorRollData, talent, item
          )
          r.prompt()
          break
        case "p":
          const powerId = element.closest('.item').dataset.itemId;
          const power = this.actor.items.get(powerId) || 0;
          console.log(power)
          r.createFromActorPower(
            this.actor, actorRollData, power
          )
          r.prompt()
          break

      }
      console.log("*****************")

/*



      // jet de caracteristique
      let score = 0
      let att = roll.substring(2)

      if (roll.startsWith("i:")){        
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if(event.type == "contextmenu" && item.type != "power") { return }

        const weaponType = ['weapon', 'shield'];
        if (weaponType.includes(item.type)){
          const [skillName, speName] = att.split('/');
          score = actorRollData[skillName] || 0
          att = skillName
          if(speName in actorRollData){            
            score = actorRollData[speName]
            att = speName
          }
          modifier = item.system.precision
          marginBonus = item.system.power
          marginBonusName = "puissance"

        } else if (item.type == "armor"){
          score = actorRollData["Défense"] || 0
          att = "Défense"
          marginBonus = item.system.armor
          marginBonusName = "protection"
          console.log("ici")
        } 
      } else {
        score = actorRollData[att] || 0
        console.log("la")
      }

      if(event.type == "contextmenu") {
        const relRoll = new game.insmv.RelativeTestRoll()
        relRoll.prompt({      
          faith,
          name: this.actor.name,
          testedAttribute: att,
          score,
        })
  
      } else {
        const absRoll = new game.insmv.AbsoluteTestRoll()
        absRoll.prompt({      
          faith,
          name: this.actor.name,
          testedAttribute: att,
          score,
          marginBonus, // item bonus
          marginBonusName, //item name
          modifier //ex : weapon precision
        })
      }
*/
    }
  }
}
