export class InsMvDie extends foundry.dice.terms.Die {
    original = '';
  
    /** @inheritdoc */
    get expression() {
      return this.original;
    }
  
    /* -------------------------------------------- */
    /*  Dice Term Methods                           */
    /* -------------------------------------------- */
  
    /**
     * Roll the DiceTerm by mapping a random uniform draw against the faces of the dice term.
     * @param {object} [options={}]                 Options which modify how a random result is produced
     * @param {boolean} [options.minimize=false]    Minimize the result, obtaining the smallest possible value.
     * @param {boolean} [options.maximize=false]    Maximize the result, obtaining the largest possible value.
     * @returns {Promise<DiceTermResult>}           The produced result
     */
    async roll({ minimize = false, maximize = false, ...options } = {}) {
      const roll = { 
        result: undefined, 
        active: true,
        d66: 0,
        margin: 0, 
      };
      // roll.result = await this._roll(options);
  
      if (minimize) {
        roll.result = 112;
      } else if (maximize) {
        roll.result = 665;
      } else if (roll.result === undefined) {

        let tensRoll = new Roll("1d6");
        await tensRoll.evaluate();
        const tens = tensRoll.total
    
        let unitsRoll = new Roll("1d6");
        await unitsRoll.evaluate();
        const units = unitsRoll.total
    
        let marginRoll = new Roll("1d6");
        await marginRoll.evaluate();
        const margin = marginRoll.total

        let res = 100*tens + 10*units + margin
        roll.result = res
        roll.d66 = 10*tens + units
        roll.margin = margin


        const digits = [tens, units, margin];
        const countMap = {};
        for (const digit of digits) {
            countMap[digit] = (countMap[digit] || 0) + 1;
        }
       roll.maxRepeats = Math.max(...Object.values(countMap));

      }
  
      this.results.push(roll);
      return roll;
    }
  
    /* -------------------------------------------- */
    /*  Factory Methods                             */
    /* -------------------------------------------- */
  
    /** @override */
    static fromParseNode(node) {
      let { number, faces } = node;
  
      if (!number) {
        number = 1;
      }
  
      if (number.class) {
        number = Roll.defaultImplementation.fromTerms(
          Roll.defaultImplementation.instantiateAST(number)
        );
      }
  
      if (faces.class) {
        faces = Roll.defaultImplementation.fromTerms(
          Roll.defaultImplementation.instantiateAST(faces)
        );
      }
  
      const modifiers = Array.from(
        (node.modifiers || '').matchAll(this.MODIFIER_REGEXP)
      ).map(([m]) => m);
  
      const cls = CONFIG.Dice.terms.l;
  
      const data = { ...node, number, faces, modifiers, class: cls.name };
  
      return this.fromData(data);
    }
  }