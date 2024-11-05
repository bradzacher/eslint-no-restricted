import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { ESLintUtils } from '@typescript-eslint/utils';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

type WithLoc = { loc: TSESTree.SourceLocation };
type RuleConfig<T extends WithLoc> = {
  /**
   * The level to use for the rule in the generated "recommended" config
   * @default 'error'
   */
  defaultLevel?: 'error' | 'off' | 'warn';
  /**
   * A URL for more information
   */
  docUrl?: string;
  /**
   * The message to display when reporting the error. You may define
   * placeholders in the message and use `messageData` to fill in the data for
   * the report.
   * {@link https://eslint.org/docs/latest/extend/custom-rules#using-message-placeholders}
   */
  message: string;
  /**
   * An optional function that can be used to generate message placeholders
   * {@link https://eslint.org/docs/latest/extend/custom-rules#using-message-placeholders}
   */
  messageData?: (
    node: T,
    sourceCode: TSESLint.SourceCode,
  ) => Record<string, number | string>;
  /**
   * The name of the rule -- must be a kebab-cased-name
   */
  name: string;
  /**
   * The ESQuery selector to match
   * {@link https://eslint.org/docs/latest/extend/selectors}
   *
   * You may pass multiple selectors with an array for convenience rather than
   * trying to merge multiple selectors into one, or declaring the same message
   * multiple times with slightly different selectors.
   */
  selector: Array<string> | string;
};
type Rules<T extends WithLoc> = ReadonlyArray<RuleConfig<T>>;

function createRule<T extends WithLoc>(
  config: RuleConfig<T>,
): TSESLint.LooseRuleDefinition {
  if (
    config.message.includes('{{') &&
    config.message.includes('}}') &&
    !config.messageData
  ) {
    throw new Error(
      `Rule '${config.name}' defined a message with a {{placeholder}} but did not provide a \`messageData\` function.\nYou must provide a \`messageData\` function.`,
    );
  }

  return ESLintUtils.RuleCreator.withoutDocs({
    create(context) {
      const selectors = Array.isArray(config.selector)
        ? config.selector
        : [config.selector];
      const sourceCode = context.sourceCode;

      return Object.fromEntries(
        selectors.map(selector => [
          selector,
          (node: T) => {
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
    },
    defaultOptions: [],
    meta: {
      docs: {
        description: config.message,
        url: config.docUrl,
      },
      messages: {
        report: config.message,
      },
      schema: [],
      type: 'problem',
    },
  });
}

type NoRestrictedSyntaxPlugin = Readonly<{
  configs: Readonly<{
    recommended: TSESLint.FlatConfig.Config;
  }>;
  meta: NonNullable<TSESLint.FlatConfig.Plugin['meta']>;
  rules: NonNullable<TSESLint.FlatConfig.Plugin['rules']>;
}>;
export function createNoRestrictedSyntaxRules<T extends WithLoc>(
  ...rules: Rules<T>
): NoRestrictedSyntaxPlugin {
  // note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const version: string = require('../package.json').version;

  const pluginPrefix = 'no-restricted-syntax';
  const plugin = {
    configs: {
      recommended: {
        name: 'no-restricted-syntax/recommended',
        plugins: {
          // assigned below to maintain plugin referential equality
        },
        rules: Object.fromEntries(
          rules
            .filter(config => config.defaultLevel !== 'off')
            .map(config => [
              `${pluginPrefix}/${config.name}`,
              config.defaultLevel ?? 'error',
            ]),
        ),
      },
    },
    meta: {
      name: 'no-restricted-syntax',
      version,
    },
    rules: Object.fromEntries(
      rules.map(config => [config.name, createRule(config)]),
    ),
  };
  plugin.configs.recommended.plugins = {
    [pluginPrefix]: plugin,
  };

  return plugin;
}
