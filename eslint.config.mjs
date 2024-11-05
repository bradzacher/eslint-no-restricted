// @ts-check

import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import prettier from 'eslint-config-prettier';
import jsonc from 'eslint-plugin-jsonc';
import markdown from 'eslint-plugin-markdown';
import n from 'eslint-plugin-n';
import packageJson from 'eslint-plugin-package-json/configs/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import * as regexp from 'eslint-plugin-regexp';
import yml from 'eslint-plugin-yml';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'coverage*',
      'dist',
      'node_modules',
      'pnpm-lock.yaml',
      '**/*.snap',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  comments.recommended,

  {
    extends: [
      js.configs.recommended,
      n.configs['flat/recommended'],
      perfectionist.configs['recommended-natural'],
      regexp.configs['flat/recommended'],
      ...tseslint.configs.strictTypeChecked,
    ],
    files: ['**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        project: [
          'tsconfig.build.json',
          'tsconfig.tools.json',
          'tsconfig.test.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
    name: 'local/typescript',
    rules: {
      '@eslint-community/eslint-comments/disable-enable-pair': [
        'error',
        { allowWholeFile: true },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'all' }],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: true },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowBoolean: true, allowNullish: true, allowNumber: true },
      ],
      'logical-assignment-operators': [
        'error',
        'always',
        { enforceForIfStatements: true },
      ],
      'n/no-unsupported-features/node-builtins': [
        'error',
        { allowExperimental: true },
      ],
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'operator-assignment': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [],
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      // need namespaces to export types from CJS files
      '@typescript-eslint/no-namespace': 'off',
      'n/no-missing-import': 'off',
      'perfectionist/sort-switch-case': 'off',
    },
  },

  {
    extends: [...markdown.configs.recommended],
    files: ['**/*.md'],
    name: 'local/markdown',
  },
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.md/*.ts', '**/*.md/*.js'],
    name: 'local/markdown-typescript',
  },

  packageJson,
  {
    extends: [...jsonc.configs['flat/recommended-with-json']],
    files: ['**/*.{json,jsonc,json5}'],
    name: 'local/json',
  },
  {
    files: ['**/*.jsonc', '.vscode/settings.json', 'tsconfig*.json'],
    name: 'local/jsonc',
    rules: {
      'jsonc/comma-dangle': 'off',
      'jsonc/no-comments': 'off',
      'jsonc/sort-keys': 'error',
    },
  },

  {
    extends: [
      ...yml.configs['flat/recommended'],
      ...yml.configs['flat/prettier'],
    ],
    files: ['**/*.{yml,yaml}'],
    name: 'local/yaml',
    rules: {
      'yml/file-extension': ['error', { extension: 'yml' }],
      'yml/sort-keys': [
        'error',
        {
          order: { type: 'asc' },
          pathPattern: '^.*$',
        },
      ],
      'yml/sort-sequence-values': [
        'error',
        {
          order: { type: 'asc' },
          pathPattern: '^.*$',
        },
      ],
    },
  },

  prettier,
);
