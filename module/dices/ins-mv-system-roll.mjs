import { InsMvDie } from './ins-mv-system-die.mjs';

export class InsMvRoll extends foundry.dice.Roll {
  /**
   * Instantiate the nodes in an AST sub-tree into RollTerm instances.
   * @param {RollParseNode} ast  The root of the AST sub-tree.
   * @returns {RollTerm[]}
   */
  static instantiateAST(ast) {
    return CONFIG.Dice.parser.flattenTree(ast).map((node) => {
      if (node.class === 'InsMvDiceTerm') {
        const { formula } = node;
        const dD = InsMvDie.fromParseNode(node);
        dD.original = formula;
        return dD;
      }

      const cls = foundry.dice.terms[node.class] ?? foundry.dice.terms.RollTerm;
      return cls.fromParseNode(node);
    });
  }
}