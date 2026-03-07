import type { KnipConfig } from 'knip'

export default {
  entry: ['test/unit/**/*.{test,spec}.ts'],
  project: ['src/**/*.{ts,vue}', 'test/**/*.ts'],
  ignore: ['src/stores/counter.ts'],
  ignoreDependencies: [
    // Used transitively via eslint config
    '@eslint-community/eslint-plugin-eslint-comments',
    // Used via CLI script and vite plugin integration
    '@vite-pwa/assets-generator',
  ],
} satisfies KnipConfig
