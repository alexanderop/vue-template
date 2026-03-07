import type { KnipConfig } from 'knip'

export default {
  entry: ['test/unit/**/*.{test,spec}.ts'],
  project: ['src/**/*.{ts,vue}', 'test/**/*.ts'],
  ignore: ['src/stores/counter.ts'],
  ignoreDependencies: [
    // Imported in CSS via @import 'tailwindcss'
    'tailwindcss',
    // Starter dependency — used across project templates
    '@vueuse/core',
    // Referenced in .oxlintrc.json jsPlugins, not importable code
    'eslint-plugin-unicorn',
    '@vitest/eslint-plugin',
    'eslint-plugin-playwright',
  ],
} satisfies KnipConfig
