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

## API

All plugins have the following shared options:

```ts
export interface RuleBase<TNode> {
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
  name: string;
}
```

Each plugin has its own additional properties which allow you to configure the constructs the rule targets (see below). Each plugin has the same create function as well:

```ts
function create(name: string, ...rules: Array<create.RuleConfig>): Plugin;
function create(...rules: Array<create.RuleConfig>): Plugin;
```

You can optionally supply a custom name for the plugin. By default it will use `no-restricted-(globals|properties|syntax)` and this should be fine for most use-cases. However in some use-cases you might like to distribute your new plugin and so you want to ensure your plugin name doesn't clash with other usages of this utility. In that case you can provide a custom `name` for the plugin to avoid clashes.

### `/globals`

```ts
export interface RuleConfig
  extends shared.RuleBase<TSESTree.Identifier | TSESTree.JSXIdentifier> {
  /**
   * The global name to match
   *
   * You may pass multiple globals with an array for convenience rather than
   * trying to merge multiple globals into one, or declaring the same message
   * multiple times with different globals.
   */
  globalName: Array<string> | string;
}
```

### `/properties`

```ts
export interface RestrictedProperty {
  /**
   * The object name to ban from `object.property`. This is optional; if it is
   * not provided then the `property` is disallowed for all objects.
   */
  object?: string;
  /**
   * The property name to ban from `object.property`.
   * If `object` is not provided then this is disallowed for all objects.
   */
  property: string;
}
export interface RuleConfig
  extends shared.RuleBase<TSESTree.MemberExpression | TSESTree.ObjectPattern> {
  /**
   * The properties name to match
   *
   * You may pass multiple properties with an array for convenience rather
   * than trying to merge multiple properties into one, or declaring the same
   * message multiple times with different properties.
   */
  property: Array<RestrictedProperty> | RestrictedProperty;
}
```

### `/syntax`

```ts
export interface RuleConfig extends shared.RuleBase<unknown> {
  /**
   * The ESQuery selector to match
   * {@link https://eslint.org/docs/latest/extend/selectors}
   *
   * You may pass multiple selectors with an array for convenience rather than
   * trying to merge multiple selectors into one, or declaring the same message
   * multiple times with slightly different selectors.
   */
  selector: Array<string> | string;
}
```

### Defining a message

You can define both static and dynamic messages for reports. Static messages are shown above and are messages that have no placeholders.

On the other hand, dynamic messages use [placeholders](https://eslint.org/docs/latest/extend/custom-rules#using-message-placeholders) in conjunction with the `messageData` function to provide the relevant placeholder data. This allows you to dynamically customize the message based on some information from the code itself which can greatly improve the DevX by providing clearer error messages.

```ts
create(
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
```

## Example Usage

For brevity following example shows usage of the `no-restricted-syntax` utility - but the same API (as described above) is available for the `globals` and `properties` variants too.

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
