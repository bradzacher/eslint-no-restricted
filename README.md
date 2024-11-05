# eslint-plugin-no-restricted-syntax

An eslint utility for quickly and easily creating no-restricted-syntax rules.

This utility is a more powerful alternative to the [core `no-restricted-syntax` rule](https://eslint.org/docs/latest/rules/no-restricted-syntax). There are two major features you get over the core rule:

(1) This utility creates one rule per selector, rather than one rule for all selectors.
Having multiple rules is useful for many reasons! It allows you to:

- Configure each selector with a different severity
- Easily enable or disable specific selectors on specific files/folders
- Ensure that one disable comment does not suppress multiple selectors

(2) This utility allows you to create messages with placeholders.
This is powerful because it allows you to provide more targeted, less generic messages to provide a better and more understandable DevX.

## Installation

```sh
npm i eslint-plugin-no-restricted-syntax
```

## Usage

```ts
// eslint.config.mjs

import { createNoRestrictedSyntaxRules } from 'eslint-plugin-no-restricted-syntax';

const noRestrictedSyntax = createNoRestrictedSyntaxRules(
  // define a single selector with a message
  {
    message: 'errors on identifiers named foo',
    name: 'ban-the-name-foo',
    selector: 'Identifier[name = "foo"]',
  },

  // define multiple selectors with the same message
  {
    message: 'errors on the string "bar"',
    name: 'do-not-allow-the-string-bar',
    selector: [
      'Literal[value = "bar"]',
      'TemplateLiteral[quasis.length = 1] > TemplateElement[value.cooked = "bar"]',
    ],
  },

  // define one or more selectors with a placeholder derived from the matched node
  {
    message: 'this message has a placeholder ->{{placeholder}}<-',
    messageData: (node, sourceCode) => {
      if (node.parent?.type === 'VariableDeclarator') {
        return {
          placeholder: sourceCode.getText(node.parent.id),
        };
      }
      return {
        placeholder: 'wtf',
      };
    },
    name: 'disallow-the-number-1',
    selector: 'Literal[value = 1]',
  },
);

export default [
  // turn on all of the rules using the auto-generated configuration
  noRestrictedSyntax.configs.recommended,

  // you can also manually configure the rules
  {
    files: ['**/some-glob/*.js'],
    plugins: {
      nrs: noRestrictedSyntax,
    },
    rules: {
      'nrs/disallow-the-number-1': 'off',
    },
  },
];
```
