import type {
  Plugin,
  RuleBase,
  RuleCreateFunction,
  WithLoc,
} from './shared.js';
import { createPlugin } from './shared.js';

export interface RuleConfig<TName extends string>
  extends RuleBase<unknown, TName> {
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

function createRule<TName extends string>(
  config: RuleConfig<TName>,
): RuleCreateFunction {
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

export function createSyntax<TRules extends string>(
  name: string,
  ...rules: Array<RuleConfig<TRules>>
): Plugin<TRules>;

export function createSyntax<TRules extends string>(
  ...rules: Array<RuleConfig<TRules>>
): Plugin<TRules>;

export function createSyntax<TRules extends string>(
  nameOrRule: RuleConfig<TRules> | string,
  ...rules: Array<RuleConfig<TRules>>
): Plugin<string> {
  return typeof nameOrRule === 'string'
    ? createPlugin(nameOrRule, rules, createRule)
    : createPlugin('no-restricted-syntax', [nameOrRule, ...rules], createRule);
}

export default createSyntax;

export type { Plugin };
