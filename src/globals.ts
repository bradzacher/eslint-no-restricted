import type { Plugin } from './shared';
import * as shared from './shared';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

namespace create {
  export interface RuleConfig
    extends shared.RuleBase<TSESTree.Identifier | TSESTree.JSXIdentifier> {
    /**
     * The global name to match
     *
     * You may pass multiple globals with an array for convenience rather than
     * trying to merge multiple globals into one, or declaring the same message
     * multiple times with different globals.
     */
    globalName: Array<string> | string;
  }
  export type CreateFn = typeof create;
}

function createRule(config: create.RuleConfig): shared.RuleCreateFunction {
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

function create(...rules: Array<create.RuleConfig>): Plugin {
  return shared.createPlugin('globals', rules, createRule);
}

export = create;
