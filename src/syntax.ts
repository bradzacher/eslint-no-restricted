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

// function create(name: string, ...rules: Array<create.RuleConfig>): Plugin;
// function create(...rules: Array<create.RuleConfig>): Plugin;
function create(
  nameOrRule: create.RuleConfig | string,
  ...rules: Array<create.RuleConfig>
): Plugin {
  return typeof nameOrRule === 'string'
    ? shared.createPlugin(nameOrRule, rules, createRule)
    : shared.createPlugin(
        'no-restricted-syntax',
        [nameOrRule, ...rules],
        createRule,
      );
}

export = create;
