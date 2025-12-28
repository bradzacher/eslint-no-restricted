import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

export interface WithLoc {
  loc: TSESTree.SourceLocation;
}
export interface RuleBase<TNode, TName extends string> {
  /**
   * The level to use for the rule in the generated "recommended" config
   * @default 'error'
   */
  defaultLevel?: 'error' | 'off' | 'warn';
  /**
   * A URL for more information (shown in IDEs)
   */
  docUrl?: string;
  /**
   * The message to display when reporting the error. You may define
   * placeholders in the message and use `messageData` to fill in the data for
   * the report.
   */
  message: string;
  /**
   * An optional function that can be used to generate message placeholders
   * {@link https://eslint.org/docs/latest/extend/custom-rules#using-message-placeholders}
   */
  // NOTE -- intentionally use a method signature so we act bi-variant in the `node` argument
  messageData?(
    node: TNode,
    sourceCode: TSESLint.SourceCode,
  ): Record<string, number | string>;
  /**
   * The name of the rule -- must be a kebab-cased-name
   */
  name: TName;
}
export interface Plugin<TRules extends string> {
  configs: {
    recommended: TSESLint.FlatConfig.Config;
  };
  meta: NonNullable<TSESLint.FlatConfig.Plugin['meta']>;
  rules: Record<TRules, TSESLint.LooseRuleDefinition>;
}

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const packageVersion: string = require('../package.json').version;

export type RuleCreateFunction = TSESLint.RuleCreateFunction<'report', []>;
export function createPlugin<
  TNode,
  TRules extends string,
  TConfig extends RuleBase<TNode, TRules>,
>(
  pluginName: string,
  rules: Array<TConfig>,
  createRule: (config: TConfig) => RuleCreateFunction,
): Plugin<TRules> {
  const plugin = {
    configs: {
      recommended: {
        name: `${pluginName}/recommended`,
        plugins: {
          // assigned below to maintain plugin referential equality
        },
        rules: Object.fromEntries(
          rules
            .filter(config => config.defaultLevel !== 'off')
            .map(config => [
              `${pluginName}/${config.name}`,
              config.defaultLevel ?? 'error',
            ]),
        ),
      },
    },
    meta: {
      name: pluginName,
      version: packageVersion,
    },
    rules: Object.fromEntries(
      rules.map(config => {
        if (
          config.message.includes('{{') &&
          config.message.includes('}}') &&
          !config.messageData
        ) {
          throw new Error(
            `Rule '${config.name}' defined a message with a {{placeholder}} but did not provide a \`messageData\` function.\nYou must provide a \`messageData\` function.`,
          );
        }

        return [
          config.name,
          ESLintUtils.RuleCreator.withoutDocs({
            create: createRule(config),
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
          }),
        ];
      }),
    ),
  };
  plugin.configs.recommended.plugins = {
    [pluginName]: plugin,
  };

  return plugin as never;
}
