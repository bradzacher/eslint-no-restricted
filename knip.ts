import type { KnipConfig } from 'knip' with { 'resolution-mode': 'import' };

export default {
  rules: {
    classMembers: 'off',
    duplicates: 'off',
    enumMembers: 'off',
    exports: 'off',
    nsExports: 'off',
    nsTypes: 'off',
    types: 'off',
    unresolved: 'off',
  },
  workspaces: {
    '.': {
      entry: ['src/index.ts'],
      ignoreBinaries: [],
      ignoreDependencies: [],
    },
  },
} satisfies KnipConfig;
