import type { KnipConfig } from 'knip' with { 'resolution-mode': 'import' };

export default {
  rules: {},
  workspaces: {
    '.': {
      entry: [
        'src/index.ts',
        'tests/**/*.test.ts',

        // Every plugin also has its own entry point (`import createGlobals from 'eslint-no-restricted/globals'`)
        'src/globals.ts',
        'src/properties.ts',
        'src/syntax.ts',
      ],
    },
  },
} satisfies KnipConfig;
