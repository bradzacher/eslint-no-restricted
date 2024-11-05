import type { KnipConfig } from 'knip' with { 'resolution-mode': 'import' };

export default {
  rules: {},
  workspaces: {
    '.': {
      entry: ['src/index.ts', 'tests/**/*.test.ts'],
    },
  },
} satisfies KnipConfig;
