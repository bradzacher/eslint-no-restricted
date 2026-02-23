import createNoRestrictedPropertiesRules from '../src/properties';
import { expectPluginName } from './utils';
import type { TSESLint } from '@typescript-eslint/utils';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, expectTypeOf, it } from 'vitest';

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
        messageData: (node, sourceCode) => {
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
        name: 'no-restricted-properties/recommended',
        plugins: {
          'no-restricted-properties': plugin,
        },
        rules: {
          'no-restricted-properties/test1': 'error',
          'no-restricted-properties/test2': 'error',
          'no-restricted-properties/test3': 'warn',
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
      const { property } = restricted;
    `;

    const linter = new Linter({ configType: 'flat' });
    const result = linter.verify(code, [
      plugin.configs.recommended,
      {
        rules: {
          'no-restricted-properties/test4': 'error',
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
          "ruleId": "no-restricted-properties/test1",
          "severity": 2,
        },
        {
          "column": 7,
          "endColumn": 14,
          "endLine": 3,
          "line": 3,
          "message": "errors on the properties "foo.bar" and "foo.bam"",
          "messageId": "report",
          "ruleId": "no-restricted-properties/test3",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 14,
          "endLine": 5,
          "line": 5,
          "message": "errors on the properties "foo.bar" and "foo.bam"",
          "messageId": "report",
          "ruleId": "no-restricted-properties/test3",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 16,
          "endLine": 6,
          "line": 6,
          "message": "errors on property "bind"",
          "messageId": "report",
          "ruleId": "no-restricted-properties/test2",
          "severity": 2,
        },
        {
          "column": 7,
          "endColumn": 26,
          "endLine": 7,
          "line": 7,
          "message": "this message has a placeholder ->restricted.property<-",
          "messageId": "report",
          "ruleId": "no-restricted-properties/test4",
          "severity": 2,
        },
        {
          "column": 13,
          "endColumn": 25,
          "endLine": 8,
          "line": 8,
          "message": "this message has a placeholder ->{ property }<-",
          "messageId": "report",
          "ruleId": "no-restricted-properties/test4",
          "severity": 2,
        },
      ]
    `);
  });

  it('creates a custom-named plugin', () => {
    const plugin = createNoRestrictedPropertiesRules('no-internal-properties', {
      message: 'errors on name "internalGlobal.property"',
      name: 'no-internal-property',
      property: {
        object: 'internalGlobal',
        property: 'property',
      },
    });

    expectPluginName(plugin, 'no-internal-properties');
  });

  it('has proper types', () => {
    const unnamedPlugin = createNoRestrictedPropertiesRules(
      {
        message: 'message',
        name: 'name-1',
        property: {
          object: 'object',
          property: 'property',
        },
      },
      {
        message: 'message',
        name: 'name-2',
        property: {
          object: 'object',
          property: 'property',
        },
      },
    );

    const namedPlugin = createNoRestrictedPropertiesRules(
      'custom-plugin',
      {
        message: 'message',
        name: 'name-3',
        property: {
          object: 'object',
          property: 'property',
        },
      },
      {
        message: 'message',
        name: 'name-4',
        property: {
          object: 'object',
          property: 'property',
        },
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
