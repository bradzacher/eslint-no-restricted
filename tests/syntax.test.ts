import createNoRestrictedSyntaxRules from '../src/syntax';
import { expectPluginName } from './utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, expectTypeOf, it } from 'vitest';

describe('index', () => {
  function createPlugin() {
    return createNoRestrictedSyntaxRules(
      {
        message: 'errors on identifiers named foo',
        name: 'test1',
        selector: 'Identifier[name = "foo"]',
      },
      {
        defaultLevel: 'warn',
        message: 'errors on the string "bar"',
        name: 'test2',
        selector: [
          'Literal[value = "bar"]',
          'TemplateLiteral[quasis.length = 1] > TemplateElement[value.cooked = "bar"]',
        ],
      },
      {
        defaultLevel: 'off',
        message: 'this message has a placeholder ->{{placeholder}}<-',
        messageData: (node: TSESTree.Literal, sourceCode) => {
          return {
            placeholder: sourceCode.getText(node.parent),
          };
        },
        name: 'test3',
        selector: ['Literal[value = 1]'],
      },
    );
  }

  it('generates a flat config', () => {
    const plugin = createPlugin();

    expect(plugin.configs).toEqual({
      recommended: {
        name: 'no-restricted-syntax/recommended',
        plugins: {
          'no-restricted-syntax': plugin,
        },
        rules: {
          'no-restricted-syntax/test1': 'error',
          'no-restricted-syntax/test2': 'warn',
        },
      },
    });
  });

  it('creates working rules', () => {
    const plugin = createPlugin();

    const code = `
      const foo = 1;

      const a = 'bar';
      const b = "bar";
      const c = \`bar\`;

      const bar = 'not matched';
    `;

    const linter = new Linter({ configType: 'flat' });
    const result = linter.verify(code, [
      plugin.configs.recommended,
      {
        rules: {
          'no-restricted-syntax/test3': 'error',
        },
      },
    ]);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "column": 13,
          "endColumn": 16,
          "endLine": 2,
          "line": 2,
          "message": "errors on identifiers named foo",
          "messageId": "report",
          "ruleId": "no-restricted-syntax/test1",
          "severity": 2,
        },
        {
          "column": 19,
          "endColumn": 20,
          "endLine": 2,
          "line": 2,
          "message": "this message has a placeholder ->foo = 1<-",
          "messageId": "report",
          "ruleId": "no-restricted-syntax/test3",
          "severity": 2,
        },
        {
          "column": 17,
          "endColumn": 22,
          "endLine": 4,
          "line": 4,
          "message": "errors on the string "bar"",
          "messageId": "report",
          "ruleId": "no-restricted-syntax/test2",
          "severity": 1,
        },
        {
          "column": 17,
          "endColumn": 22,
          "endLine": 5,
          "line": 5,
          "message": "errors on the string "bar"",
          "messageId": "report",
          "ruleId": "no-restricted-syntax/test2",
          "severity": 1,
        },
        {
          "column": 17,
          "endColumn": 22,
          "endLine": 6,
          "line": 6,
          "message": "errors on the string "bar"",
          "messageId": "report",
          "ruleId": "no-restricted-syntax/test2",
          "severity": 1,
        },
      ]
    `);
  });

  it('creates a custom-named plugin', () => {
    const plugin = createNoRestrictedSyntaxRules('no-internal-syntax', {
      message: 'errors on identifiers named foo',
      name: 'test-internal',
      selector: 'Identifier[name = "foo"]',
    });

    expectPluginName(plugin, 'no-internal-syntax');
  });

  it('has proper types', () => {
    const unnamedPlugin = createNoRestrictedSyntaxRules(
      {
        message: 'message',
        name: 'name-1',
        selector: 'selector',
      },
      {
        message: 'message',
        name: 'name-2',
        selector: 'selector',
      },
    );

    const namedPlugin = createNoRestrictedSyntaxRules(
      'custom-plugin',
      {
        message: 'message',
        name: 'name-3',
        selector: 'selector',
      },
      {
        message: 'message',
        name: 'name-4',
        selector: 'selector',
      },
    );

    expectTypeOf(unnamedPlugin.rules).toMatchTypeOf<
      Record<'name-1' | 'name-2', TSESLint.LooseRuleDefinition>
    >();

    expectTypeOf(namedPlugin.rules).toMatchTypeOf<
      Record<'name-3' | 'name-4', TSESLint.LooseRuleDefinition>
    >();
  });
});
