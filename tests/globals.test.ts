import createNoRestrictedGlobalsRules from '../src/globals';
import { expectPluginName } from './utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { describe, expect, it } from 'vitest';

describe('index', () => {
  function createPlugin() {
    return createNoRestrictedGlobalsRules(
      {
        globalName: 'window',
        message: 'errors on name "window"',
        name: 'test1',
      },
      {
        defaultLevel: 'warn',
        globalName: ['foo', 'bar'],
        message: 'errors on the names "foo" and "bar"',
        name: 'test2',
      },
      {
        defaultLevel: 'off',
        globalName: 'globalThis',
        message: 'this message has a placeholder ->{{placeholder}}<-',
        messageData: (node: TSESTree.Identifier, sourceCode) => {
          return {
            placeholder: sourceCode.getText(node.parent),
          };
        },
        name: 'test3',
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
          'no-restricted-globals/test2': 'warn',
        },
      },
    });
  });

  it('creates working rules', () => {
    const plugin = createPlugin();

    const code = `
      window.alert();
      foo.asdf;
      bar.fdsa;
      globalThis.property;
    `;

    const linter = new Linter({ configType: 'flat' });
    const result = linter.verify(code, [
      plugin.configs.recommended,
      {
        rules: {
          'no-restricted-globals/test3': 'error',
        },
      },
    ]);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "column": 7,
          "endColumn": 13,
          "endLine": 2,
          "line": 2,
          "message": "errors on name "window"",
          "messageId": "report",
          "nodeType": "Identifier",
          "ruleId": "no-restricted-globals/test1",
          "severity": 2,
        },
        {
          "column": 7,
          "endColumn": 10,
          "endLine": 3,
          "line": 3,
          "message": "errors on the names "foo" and "bar"",
          "messageId": "report",
          "nodeType": "Identifier",
          "ruleId": "no-restricted-globals/test2",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 10,
          "endLine": 4,
          "line": 4,
          "message": "errors on the names "foo" and "bar"",
          "messageId": "report",
          "nodeType": "Identifier",
          "ruleId": "no-restricted-globals/test2",
          "severity": 1,
        },
        {
          "column": 7,
          "endColumn": 17,
          "endLine": 5,
          "line": 5,
          "message": "this message has a placeholder ->globalThis.property<-",
          "messageId": "report",
          "nodeType": "Identifier",
          "ruleId": "no-restricted-globals/test3",
          "severity": 2,
        },
      ]
    `);
  });

  it('creates a custom-named plugin', () => {
    const plugin = createNoRestrictedGlobalsRules('no-internal-globals', {
      globalName: 'testInternalGlobal',
      message: 'errors on name "testInternalGlobal"',
      name: 'no-test-internal',
    });

    expectPluginName(plugin, 'no-internal-globals');
  });
});
