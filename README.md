# eslint-no-restricted

An eslint utility for quickly and easily creating no-restricted-syntax rules.

This utility is a more powerful alternative to the core rules [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax), [`no-restricted-globals`](https://eslint.org/docs/latest/rules/no-restricted-globals), and [`no-restricted-properties`](https://eslint.org/docs/latest/rules/no-restricted-properties).

There are two major features you get with this utility over the core rules:

(1) This utility creates one rule per selector/global/property, rather than having one rule for everything.
Having multiple rules is useful for many reasons! It allows you to:

- Configure each selector/global/property with a different severity
- Easily enable or disable specific selector/global/property on specific files/folders
- Ensure that one disable comment does not suppress multiple selector/global/property

(2) This utility allows you to create messages with placeholders.
This is powerful because it allows you to provide more targeted, less generic messages to provide a better and more understandable DevX.

## Installation

```sh
npm i eslint-no-restricted
```

## Example Usage

For brevity following example shows usage of the `no-restricted-syntax` utility - but the same API is available for the `globals` and `properties` variants too.

```ts
// eslint.config.mjs

import createNoRestrictedSyntax from 'eslint-no-restricted/syntax';

const noRestrictedSyntax = createNoRestrictedSyntax(
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
