import type { Plugin, WithLoc } from './shared';
import * as shared from './shared';

namespace create {
  export interface RuleConfig<TName extends string>
    extends shared.RuleBase<unknown, TName> {
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

function createRule<TName extends string>(
  config: create.RuleConfig<TName>,
): shared.RuleCreateFunction {
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

function create<TRules extends string>(
  name: string,
  ...rules: Array<create.RuleConfig<TRules>>
): Plugin<TRules>;

function create<TRules extends string>(
  ...rules: Array<create.RuleConfig<TRules>>
): Plugin<TRules>;

function create<TRules extends string>(
  nameOrRule: create.RuleConfig<TRules> | string,
  ...rules: Array<create.RuleConfig<TRules>>
): Plugin<string> {
  return typeof nameOrRule === 'string'
    ? shared.createPlugin(nameOrRule, rules, createRule)
    : shared.createPlugin(
        'no-restricted-syntax',
        [nameOrRule, ...rules],
        createRule,
      );
}

export = create;
