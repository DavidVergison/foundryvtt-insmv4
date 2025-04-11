export class InsMvRollParser extends foundry.dice.RollParser {
    /**
     * Handle a dice term.
     * @param {NumericRollParseNode|ParentheticalRollParseNode|null} number  The number of dice.
     * @param {string|NumericRollParseNode|ParentheticalRollParseNode|null} faces  The number of die faces or a string
     *                                                                             denomination like "c" or "f".
     * @param {string|null} modifiers                                        The matched modifiers string.
     * @param {string|null} flavor                                           Associated flavor text.
     * @param {string} formula                                               The original matched text.
     * @returns {DiceRollParseNode}
     * @internal
     * @protected
     */
    _onDiceTerm(number, faces, modifiers, flavor, formula) {
      if (CONFIG.debug.rollParsing) {
        // eslint-disable-next-line no-console
        console.debug(
          this.constructor.formatDebug(
            'onDiceTerm',
            number,
            faces,
            modifiers,
            flavor,
            formula
          )
        );
      }
  
      const loc = formula?.indexOf('d666');
      const useNewDieType = loc !== -1;
  
      if (useNewDieType) {
        return {
          class: 'InsMvDiceTerm',
          formula: '',
          modifiers: null,
          number,
          faces,
          evaluated: false,
          options: { flavor },
        };
      }
  
      return {
        class: 'DiceTerm',
        formula,
        modifiers,
        number,
        faces,
        evaluated: false,
        options: { flavor },
      };
    }
  }