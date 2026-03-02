import type { Plugin, RuleBase, RuleCreateFunction } from './shared.js';
import { createPlugin } from './shared.js';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export interface RuleConfig<TName extends string>
  extends RuleBase<TSESTree.Identifier | TSESTree.JSXIdentifier, TName> {
  /**
   * The global name to match
   *
   * You may pass multiple globals with an array for convenience rather than
   * trying to merge multiple globals into one, or declaring the same message
   * multiple times with different globals.
   */
  globalName: Array<string> | string;
}

function createRule<TName extends string>(
  config: RuleConfig<TName>,
): RuleCreateFunction {
  return function create(context) {
    const globalNames = Array.isArray(config.globalName)
      ? config.globalName
      : [config.globalName];
    const sourceCode = context.sourceCode;

    function reportReference(reference: TSESLint.Scope.Reference) {
      context.report({
        data:
          config.messageData == null
            ? {}
            : config.messageData(reference.identifier, sourceCode),
        messageId: 'report',
        node: reference.identifier,
      });
    }

    return {
      Program(node) {
        const scope = sourceCode.getScope(node);

        // Report variables declared elsewhere (ex: variables defined as "global" by eslint)
        scope.variables.forEach(variable => {
          if (!variable.defs.length && globalNames.includes(variable.name)) {
            variable.references.forEach(reportReference);
          }
        });

        // Report variables not declared at all
        scope.through.forEach(reference => {
          if (globalNames.includes(reference.identifier.name)) {
            reportReference(reference);
          }
        });
      },
    };
  };
}

export function createGlobals<TRules extends string>(
  name: string,
  ...rules: Array<RuleConfig<TRules>>
): Plugin<TRules>;

export function createGlobals<TRules extends string>(
  ...rules: Array<RuleConfig<TRules>>
): Plugin<TRules>;

export function createGlobals<TRules extends string>(
  nameOrRule: RuleConfig<TRules> | string,
  ...rules: Array<RuleConfig<TRules>>
): Plugin<TRules> {
  return typeof nameOrRule === 'string'
    ? createPlugin(nameOrRule, rules, createRule)
    : createPlugin('no-restricted-globals', [nameOrRule, ...rules], createRule);
}

export default createGlobals;

export type { Plugin };
