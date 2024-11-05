import globals = require('./globals.js');
import properties = require('./properties.js');
import syntax = require('./syntax.js');

const exprt: {
  createGlobals: globals.CreateFn;
  createProperties: properties.CreateFn;
  createSyntax: syntax.CreateFn;
} = {
  createGlobals: globals,
  createProperties: properties,
  createSyntax: syntax,
};
export = exprt;
