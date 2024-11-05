import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, it } from 'vitest';

import { createNoRestrictedSyntaxRules } from '../src/index.js';

describe('index', () => {
  function createPlugin() {
    return createNoRestrictedSyntaxRules(
      {
        message: 'errors on identifiers named foo',
        name: 'test1',
        selector: 'Identifier[name = "foo"]',
      },
      {
        message: 'errors on the string "bar"',
        name: 'test2',
        selector: [
          'Literal[value = "bar"]',
          'TemplateLiteral[quasis.length = 1] > TemplateElement[value.cooked = "bar"]',
        ],
      },
      {
        message: 'this message has a placeholder ->{{placeholder}}<-',
        messageData: (node: TSESTree.Node, sourceCode) => {
          if (node.parent?.type === AST_NODE_TYPES.VariableDeclarator) {
            return {
              placeholder: sourceCode.getText(node.parent.id),
            };
          }
          return {
            placeholder: 'wtf',
          };
        },
        name: 'test3',
        selector: ['Literal[value = 1]'],
      },
    );
  }

  it('generates a flat config', () => {
    const plugin = createPlugin();

    expect(plugin.configs).toMatchObject({
      recommended: {
        name: 'no-restricted-syntax/recommended',
        plugins: {
          'no-restricted-syntax': plugin,
        },
        rules: {
          'no-restricted-syntax/test1': 'error',
          'no-restricted-syntax/test2': 'error',
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
    const result = linter.verify(code, plugin.configs.recommended);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "column": 13,
          "endColumn": 16,
          "endLine": 2,
          "line": 2,
          "message": "errors on identifiers named foo",
          "messageId": "report",
          "nodeType": null,
          "ruleId": "no-restricted-syntax/test1",
          "severity": 2,
        },
        {
          "column": 19,
          "endColumn": 20,
          "endLine": 2,
          "line": 2,
          "message": "this message has a placeholder ->foo<-",
          "messageId": "report",
          "nodeType": null,
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
          "nodeType": null,
          "ruleId": "no-restricted-syntax/test2",
          "severity": 2,
        },
        {
          "column": 17,
          "endColumn": 22,
          "endLine": 5,
          "line": 5,
          "message": "errors on the string "bar"",
          "messageId": "report",
          "nodeType": null,
          "ruleId": "no-restricted-syntax/test2",
          "severity": 2,
        },
        {
          "column": 17,
          "endColumn": 22,
          "endLine": 6,
          "line": 6,
          "message": "errors on the string "bar"",
          "messageId": "report",
          "nodeType": null,
          "ruleId": "no-restricted-syntax/test2",
          "severity": 2,
        },
      ]
    `);
  });
});
