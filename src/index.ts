export {
  default as createGlobals,
  type RuleConfig as RuleConfigGlobals,
} from './globals.js';

export {
  default as createProperties,
  type RuleConfig as RuleConfigProperties,
} from './properties.js';

export type { Plugin, RuleBase } from './shared.js';

export {
  default as createSyntax,
  type RuleConfig as RuleConfigSyntax,
} from './syntax.js';
