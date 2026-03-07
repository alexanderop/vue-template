import type { KnipConfig } from 'knip'

export default {
  entry: ['test/browser/**/*.{test,spec}.ts'],
  project: ['src/**/*.{ts,vue}', 'test/**/*.ts'],
  ignoreDependencies: [
    // Imported in CSS via @import 'tailwindcss'
    'tailwindcss',
    // Referenced in .oxlintrc.json jsPlugins, not importable code
    'eslint-plugin-unicorn',
    '@vitest/eslint-plugin',
    'eslint-plugin-playwright',
  ],
} satisfies KnipConfig
