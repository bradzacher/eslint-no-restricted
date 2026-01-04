import globals = require('./globals.js');
import properties = require('./properties.js');
import syntax = require('./syntax.js');

interface ExportsType {
  createGlobals: globals.CreateFn;
  createProperties: properties.CreateFn;
  createSyntax: syntax.CreateFn;
}

export = {
  createGlobals: globals,
  createProperties: properties,
  createSyntax: syntax,
} satisfies ExportsType as ExportsType;
