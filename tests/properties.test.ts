import createNoRestrictedPropertiesRules from '../src/properties';
import type { TSESTree } from '@typescript-eslint/utils';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, it } from 'vitest';

describe('index', () => {
  function createPlugin() {
    return createNoRestrictedPropertiesRules(
      {
        message: 'errors on name "window.alert"',
        name: 'test1',
        property: {
          object: 'window',
          property: 'alert',
        },
      },
      {
        message: 'errors on property "bind"',
        name: 'test2',
        property: {
          property: 'bind',
        },
      },
      {
        defaultLevel: 'warn',
        message: 'errors on the properties "foo.bar" and "foo.bam"',
        name: 'test3',
        property: [
          {
            object: 'foo',
            property: 'bar',
          },
          {
            object: 'foo',
            property: 'bam',
          },
        ],
      },
      {
        defaultLevel: 'off',
        message: 'this message has a placeholder ->{{placeholder}}<-',
        messageData: (node: TSESTree.MemberExpression, sourceCode) => {
          return {
            placeholder: sourceCode.getText(node),
          };
        },
        name: 'test4',
        property: {
          object: 'restricted',
          property: 'property',
        },
      },
    );
  }

  it('generates a flat config', () => {
    const plugin = createPlugin();

    expect(plugin.configs).toEqual({
      recommended: {
        name: 'no-restricted-globals/recommended',
        plugins: {
          'no-restricted-globals': plugin,
        },
        rules: {
          'no-restricted-globals/test1': 'error',
          'no-restricted-globals/test2': 'error',
          'no-restricted-globals/test3': 'warn',
        },
      },
    });
  });

  it('creates working rules', () => {
    const plugin = createPlugin();

    const code = `
      window.alert();
      foo.bar;
      foo.baz;
      foo.bam;
      func.bind(this);
      restricted.property;
    `;

    const linter = new Linter({ configType: 'flat' });
    const result = linter.verify(code, [
      plugin.configs.recommended,
      {
        rules: {
          'no-restricted-globals/test4': 'error',
        },
      },
    ]);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "column": 7,
          "endColumn": 19,
          "endLine": 2,
          "line": 2,
          "message": "errors on name "window.alert"",
          "messageId": "report",
          "nodeType": "MemberExpression",
          "ruleId": "no-restricted-globals/test1",
          "severity": 2,
        },
        {
          "column": 7,
          "endColumn": 14,
          "endLine": 3,
          "line": 3,
          "message": "errors on the properties "foo.bar" and "foo.bam"",
          "messageId": "report",
          "nodeType": "MemberExpression",
          "ruleId": "no-restricted-globals/test3",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 14,
          "endLine": 5,
          "line": 5,
          "message": "errors on the properties "foo.bar" and "foo.bam"",
          "messageId": "report",
          "nodeType": "MemberExpression",
          "ruleId": "no-restricted-globals/test3",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 16,
          "endLine": 6,
          "line": 6,
          "message": "errors on property "bind"",
          "messageId": "report",
          "nodeType": "MemberExpression",
          "ruleId": "no-restricted-globals/test2",
          "severity": 2,
        },
        {
          "column": 7,
          "endColumn": 26,
          "endLine": 7,
          "line": 7,
          "message": "this message has a placeholder ->restricted.property<-",
          "messageId": "report",
          "nodeType": "MemberExpression",
          "ruleId": "no-restricted-globals/test4",
          "severity": 2,
        },
      ]
    `);
  });
});
