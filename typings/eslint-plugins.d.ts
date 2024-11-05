declare module 'eslint-plugin-markdown' {
  import type { configs } from 'typescript-eslint';
  declare const d: {
    configs: {
      recommended: typeof configs.recommended;
    };
  };
  export default d;
}
declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
  import type { configs } from 'typescript-eslint';
  declare const d: {
    recommended: typeof configs.base;
  };
  export default d;
}
declare module 'eslint-config-prettier' {
  import type { configs } from 'typescript-eslint';
  declare const d: typeof configs.base;
  export default d;
}
