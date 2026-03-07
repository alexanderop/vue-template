import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import pluginImportX from 'eslint-plugin-import-x'
import pluginUnicorn from 'eslint-plugin-unicorn'
import localRules from './eslint-local-rules/index'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  // ---------------------------------------------------------------------------
  // Code Complexity & Readability
  // ---------------------------------------------------------------------------
  {
    name: 'app/code-complexity',
    files: ['src/**/*.{ts,vue}'],
    rules: {
      complexity: ['warn', { max: 10 }],
      'no-nested-ternary': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use a const object with `as const` instead of an enum.',
        },
        {
          selector: 'IfStatement > IfStatement.alternate',
          message: 'No else-if. Use early returns, guard clauses, or a lookup map.',
        },
        {
          selector: 'IfStatement > :not(IfStatement).alternate',
          message:
            'No else. Use early returns, guard clauses, or a ternary for simple assignments.',
        },
        {
          selector: 'TryStatement',
          message: 'No try/catch. Use tryCatch() utility for explicit error handling.',
        },
        // Uncomment to enforce named routes:
        // {
        //   selector:
        //     'CallExpression[callee.property.name="push"] > Literal:first-child',
        //   message: 'Use named routes: router.push({ name: "routeName" })',
        // },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Feature Boundaries (import restrictions)
  // ---------------------------------------------------------------------------
  {
    name: 'app/feature-boundaries',
    files: ['src/**/*.{ts,vue}'],
    plugins: {
      'import-x': pluginImportX,
    },
    rules: {
      // Uncomment and configure zones for your project structure:
      // 'import-x/no-restricted-paths': ['error', {
      //   zones: [
      //     // Example: features cannot import from other features
      //     {
      //       target: './src/features/auth/**',
      //       from: './src/features/!(auth)/**',
      //       message: 'Auth feature cannot import from other features. Use shared modules.',
      //     },
      //     // Example: enforce unidirectional flow
      //     {
      //       target: './src/domain/**',
      //       from: './src/features/**',
      //       message: 'Domain layer cannot import from feature layer.',
      //     },
      //   ],
      // }],
    },
  },

  // ---------------------------------------------------------------------------
  // Vue Component Rules
  // ---------------------------------------------------------------------------
  {
    name: 'app/vue-components',
    files: ['**/*.vue'],
    rules: {
      // Naming
      'vue/multi-word-component-names': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/custom-event-name-casing': ['error', 'kebab-case'],

      // Dead code detection
      'vue/no-unused-properties': 'warn',
      'vue/no-unused-refs': 'warn',
      'vue/no-unused-emit-declarations': 'warn',

      // Vue 3.5+ patterns
      'vue/define-props-destructuring': 'error',
      'vue/prefer-use-template-ref': 'error',

      // Explicit APIs
      'vue/require-expose': 'warn',
      'vue/require-explicit-slots': 'warn',

      // Template limits
      'vue/max-template-depth': ['warn', { maxDepth: 8 }],
      'vue/max-props': ['warn', { maxProps: 6 }],
    },
  },

  // ---------------------------------------------------------------------------
  // Unicorn
  // ---------------------------------------------------------------------------
  {
    name: 'app/unicorn',
    files: ['**/*.{vue,ts,mts,tsx}'],
    ...pluginUnicorn.configs.recommended,
    rules: {
      ...pluginUnicorn.configs.recommended.rules,
      // Overrides off
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-useless-undefined': 'off',
      // Overrides on
      'unicorn/better-regex': 'warn',
      'unicorn/custom-error-definition': 'error',
      'unicorn/no-unused-properties': 'warn',
      'unicorn/consistent-destructuring': 'warn',
    },
  },

  // ---------------------------------------------------------------------------
  // Vitest
  // ---------------------------------------------------------------------------
  {
    ...pluginVitest.configs.recommended,
    name: 'app/vitest',
    files: ['test/unit/**/*.{test,spec}.{js,ts}'],
    rules: {
      ...pluginVitest.configs.recommended.rules,
      // Assertions
      'vitest/prefer-to-be': 'warn',
      'vitest/prefer-to-have-length': 'warn',
      'vitest/prefer-to-contain': 'warn',
      'vitest/prefer-mock-promise-shorthand': 'warn',

      // Structure
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/require-top-level-describe': 'error',
      'vitest/max-nested-describe': ['error', { max: 2 }],
      'vitest/no-conditional-in-test': 'warn',

      // Locators
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.property.name="querySelector"]',
          message: 'Prefer testing-library queries or Playwright locators over querySelector.',
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Test Helper Enforcement
  // ---------------------------------------------------------------------------
  {
    name: 'app/test-helpers',
    files: ['test/unit/**'],
    rules: {
      // Uncomment when you have a custom render wrapper:
      // 'no-restricted-imports': ['error', {
      //   paths: [
      //     {
      //       name: 'vitest-browser-vue',
      //       importNames: ['render'],
      //       message: 'Import render from @/test-utils instead.',
      //     },
      //     {
      //       name: '@vue/test-utils',
      //       importNames: ['mount', 'shallowMount'],
      //       message: 'Import mount from @/test-utils instead.',
      //     },
      //   ],
      // }],
    },
  },

  // ---------------------------------------------------------------------------
  // Playwright
  // ---------------------------------------------------------------------------
  {
    name: 'app/playwright',
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  // ---------------------------------------------------------------------------
  // Local Rules
  // ---------------------------------------------------------------------------
  {
    name: 'app/local-rules',
    files: ['src/**/*.{ts,vue}'],
    plugins: {
      local: localRules,
    },
    rules: {
      'local/no-hardcoded-colors': 'warn',
      'local/composable-must-use-vue': 'error',
      'local/no-let-in-describe': 'error',
      'local/extract-condition-variable': 'warn',
      'local/repository-trycatch': 'error',
    },
  },

  // ---------------------------------------------------------------------------
  // Oxlint Integration (must be near-last to disable overlapping rules)
  // ---------------------------------------------------------------------------
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  // ---------------------------------------------------------------------------
  // Formatting (must be last)
  // ---------------------------------------------------------------------------
  skipFormatting,
)
