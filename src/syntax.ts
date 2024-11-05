import type { Plugin, WithLoc } from './shared';
import * as shared from './shared';

namespace create {
  export interface RuleConfig extends shared.RuleBase<unknown> {
    /**
     * The ESQuery selector to match
     * {@link https://eslint.org/docs/latest/extend/selectors}
     *
     * You may pass multiple selectors with an array for convenience rather than
     * trying to merge multiple selectors into one, or declaring the same message
     * multiple times with slightly different selectors.
     */
    selector: Array<string> | string;
  }
  export type CreateFn = typeof create;
}

function createRule(config: create.RuleConfig): shared.RuleCreateFunction {
  return function create(context) {
    const selectors = Array.isArray(config.selector)
      ? config.selector
      : [config.selector];
    const sourceCode = context.sourceCode;

    return Object.fromEntries(
      selectors.map(selector => [
        selector,
        (node: WithLoc) => {
          context.report({
            data:
              config.messageData == null
                ? {}
                : config.messageData(node, sourceCode),
            loc: node.loc,
            messageId: 'report',
          });
        },
      ]),
    );
  };
}

function create(...rules: Array<create.RuleConfig>): Plugin {
  return shared.createPlugin('syntax', rules, createRule);
}

export = create;
