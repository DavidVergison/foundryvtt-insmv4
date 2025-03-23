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
    console.log("this.actor.type", this.actor.type)
    return `systems/ins-mv/templates/actor/actor-${this.actor.type}-sheet.hbs`;
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
    const context = super.getData();

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
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
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

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      const validTypes = ['item', 'armor', 'weapon'];
      const validPowers = ['power'];
      if (validTypes.includes(i.type)) {
        gear.push(i);
      }
      // Append to powers.
      else if (validPowers.includes(i.type)) {
        powers.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.powers = powers;
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

    html.on('click', '.wound', (ev) => {
      ev.preventDefault();
  
      console.log("doc",this.document)
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
      console.log("toggle", this.options.edition)
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
    console.log("event", {event, o: this.object})
    event.preventDefault();

    let faith = this.object.system.caracteristics["Foi"]

    const element = event.currentTarget;
    const dataset = element.dataset;    
    const roll = element.dataset.roll;    
    let marginBonus = null
    let marginBonusName = null

    if (roll) {
      // jet de caracteristique
      let score = 0
      let att = roll.substring(2)

      if (roll.startsWith("c:")){        
        score = this.object.system.caracteristics[att]
      }
      if (roll.startsWith("t:")){
        score = this.object.system.skills[att]
      }
      if (roll.startsWith("s:")){
        score = this.object.system.spe[att+"_spe"]
      } 
      if (roll.startsWith("i:")){
        if(event.type == "contextmenu") { return }
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);

        if (item.type == "weapon"){
          score = this.object.system.skills[
            item.system.skill
          ]
          if (this.object.system.spe[item.system.skill+"_label_spe"] == item.system.spe){
            score = this.object.system.spe[item.system.skill+"_spe"]
          }
          marginBonus = item.system.power
          marginBonusName = "puissance"
        }
        if (item.type == "armor"){
          score = this.object.system.skills["Defense"]
          marginBonus = item.system.armor
          marginBonusName = "protection"
        } 
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
        })
      }

    }
  }
}
