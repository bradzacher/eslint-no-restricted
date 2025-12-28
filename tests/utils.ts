import type { Plugin } from '../src/shared';
import { expect } from 'vitest';

export function expectPluginName(plugin: Plugin<string>, name: string): void {
  expect(plugin.meta.name).toBe(name);

  expect(plugin.configs.recommended.name).toBe(`${name}/recommended`);

  expect(Object.keys(plugin.configs.recommended.plugins ?? {})).toEqual([name]);

  Object.keys(plugin.configs.recommended.rules ?? {}).forEach(ruleName => {
    expect(ruleName).toMatch(new RegExp(`^${name}/`));
  });
}
