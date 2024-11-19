import type { Plugin } from './shared';
import * as shared from './shared';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

namespace create {
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
    extends shared.RuleBase<
      TSESTree.MemberExpression | TSESTree.ObjectPattern
    > {
    /**
     * The properties name to match
     *
     * You may pass multiple properties with an array for convenience rather
     * than trying to merge multiple properties into one, or declaring the same
     * message multiple times with different properties.
     */
    property: Array<RestrictedProperty> | RestrictedProperty;
  }
  export type CreateFn = typeof create;
}

function getStaticStringValue(node: TSESTree.Node) {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      if (node.value === null) {
        if ('regex' in node) {
          return `/${node.regex.pattern}/${node.regex.flags}`;
        }
        if ('bigint' in node) {
          return node.bigint;
        }
        return 'null';
      } else {
        return String(node.value);
      }

    case AST_NODE_TYPES.TemplateLiteral:
      if (node.expressions.length === 0 && node.quasis.length === 1) {
        return node.quasis[0].value.cooked;
      }
      break;
  }

  return null;
}
function getStaticPropertyName(node: TSESTree.Node | undefined): null | string {
  if (node?.type === AST_NODE_TYPES.MemberExpression) {
    if (node.property.type === AST_NODE_TYPES.Identifier && !node.computed) {
      return node.property.name;
    }

    return getStaticStringValue(node.property);
  }

  return null;
}
function createRule(config: create.RuleConfig): shared.RuleCreateFunction {
  return function create(context) {
    const properties = Array.isArray(config.property)
      ? config.property
      : [config.property];
    const sourceCode = context.sourceCode;

    const restrictedProperties = new Map<string, Set<string>>();
    const globallyRestrictedProperties = new Set<string>();

    properties.forEach(option => {
      const objectName = option.object;
      const propertyName = option.property;

      if (objectName == null) {
        globallyRestrictedProperties.add(propertyName);
      } else {
        if (!restrictedProperties.has(objectName)) {
          restrictedProperties.set(objectName, new Set());
        }

        restrictedProperties.get(objectName)?.add(propertyName);
      }
    });

    /**
     * Checks to see whether a property access is restricted, and reports it if so.
     */
    function checkPropertyAccess(
      node: TSESTree.MemberExpression | TSESTree.ObjectPattern,
      objectName: null | string | undefined,
      propertyName: null | string | undefined,
    ) {
      if (propertyName == null) {
        return;
      }

      const matchedObject = objectName && restrictedProperties.get(objectName);
      const matchedObjectProperty =
        matchedObject && matchedObject.has(propertyName);
      const globalMatchedProperty =
        globallyRestrictedProperties.has(propertyName);

      if (matchedObjectProperty || globalMatchedProperty) {
        context.report({
          data:
            config.messageData == null
              ? {}
              : config.messageData(node, sourceCode),
          messageId: 'report',
          node,
        });
      }
    }

    return {
      MemberExpression(node) {
        checkPropertyAccess(
          node,
          node.object.type === AST_NODE_TYPES.Identifier
            ? node.object.name
            : undefined,
          getStaticPropertyName(node),
        );
      },
      ObjectPattern(node) {
        let objectName: null | string = null;

        if (node.parent.type === AST_NODE_TYPES.VariableDeclarator) {
          if (node.parent.init?.type === AST_NODE_TYPES.Identifier) {
            objectName = node.parent.init.name;
          }
        } else if (
          node.parent.type === AST_NODE_TYPES.AssignmentExpression ||
          node.parent.type === AST_NODE_TYPES.AssignmentPattern
        ) {
          if (node.parent.right.type === AST_NODE_TYPES.Identifier) {
            objectName = node.parent.right.name;
          }
        }

        node.properties.forEach(property => {
          checkPropertyAccess(
            node,
            objectName,
            getStaticPropertyName(property),
          );
        });
      },
    };
  };
}

function create(...rules: Array<create.RuleConfig>): Plugin {
  return shared.createPlugin('properties', rules, createRule);
}

export = create;
