<script setup lang="ts">
defineExpose({})

interface Feature {
  name: string
  description: string
  icon: string
  wide?: boolean
  badges?: string[]
}

interface FeatureCategory {
  title: string
  id: string
  features: Feature[]
}

const categories: FeatureCategory[] = [
  {
    title: 'Core Stack',
    id: 'core',
    features: [
      {
        name: 'Vue 3.5',
        description:
          'Composition API, reactivity system, and single-file components with the latest Vue features.',
        icon: '\u{1F48E}',
        wide: true,
      },
      {
        name: 'TypeScript 5.9',
        description:
          'Full type safety across components, stores, and router with strict mode enabled.',
        icon: '\u{1F4D0}',
      },
      {
        name: 'Vite 7',
        description: 'Lightning-fast HMR and optimized builds with native ES modules.',
        icon: '\u26A1',
      },
      {
        name: 'Vue Router 5',
        description: 'File-based routing with type-safe navigation and lazy-loaded views.',
        icon: '\u{1F9ED}',
      },
      {
        name: 'Pinia 3',
        description: 'Intuitive, type-safe state management with devtools integration.',
        icon: '\u{1F34D}',
      },
      {
        name: 'Tailwind CSS 4',
        description: 'Utility-first styling with semantic design tokens and zero-config setup.',
        icon: '\u{1F3A8}',
      },
      {
        name: 'VueUse',
        description:
          'Collection of essential Vue composables — useFetch, useStorage, useDebounce, and 200+ utilities.',
        icon: '\u{1F9F0}',
      },
    ],
  },
  {
    title: 'Developer Experience',
    id: 'dx',
    features: [
      {
        name: 'ESLint 10',
        description:
          'Comprehensive linting with 5 custom local rules for code quality, color tokens, and architecture.',
        icon: '\u{1F50D}',
        wide: true,
        badges: [
          'no-hardcoded-colors',
          'composable-must-use-vue',
          'extract-condition-variable',
          'repository-trycatch',
          'no-let-in-describe',
        ],
      },
      {
        name: 'Oxlint + Oxfmt',
        description: 'Rust-powered linting and formatting for blazing-fast feedback loops.',
        icon: '\u{1F9EA}',
      },
      {
        name: 'Vue DevTools',
        description: 'In-browser debugging with component inspector, Pinia viewer, and routing.',
        icon: '\u{1F6E0}\uFE0F',
      },
      {
        name: 'EditorConfig',
        description: 'Consistent coding styles across editors and IDEs out of the box.',
        icon: '\u2699\uFE0F',
      },
    ],
  },
  {
    title: 'Testing',
    id: 'testing',
    features: [
      {
        name: 'Vitest',
        description:
          'Unit testing with Vite-native speed, coverage reporting, and snapshot support.',
        icon: '\u{1F9EA}',
      },
      {
        name: 'Playwright',
        description: 'End-to-end testing across Chromium, Firefox, and WebKit browsers.',
        icon: '\u{1F3AD}',
      },
      {
        name: '@vue/test-utils',
        description:
          'Component testing utilities for mounting, interacting, and asserting Vue components.',
        icon: '\u{1F527}',
      },
    ],
  },
  {
    title: 'Code Quality',
    id: 'quality',
    features: [
      {
        name: 'Knip',
        description: 'Detect unused files, dependencies, and exports to keep the codebase lean.',
        icon: '\u2702\uFE0F',
      },
      {
        name: 'lint-staged + git-hooks',
        description: 'Auto-lint and format only staged files on every commit.',
        icon: '\u{1F3A3}',
      },
      {
        name: 'Feature Boundaries',
        description: 'Import restriction rules to enforce clean architecture and module isolation.',
        icon: '\u{1F9F1}',
      },
      {
        name: 'Unicorn Plugin',
        description: 'Modern JavaScript best practices with opinionated rules for cleaner code.',
        icon: '\u{1F984}',
      },
    ],
  },
  {
    title: 'PWA',
    id: 'pwa',
    features: [
      {
        name: 'Service Worker',
        description: 'Precaching and runtime caching strategies powered by Workbox.',
        icon: '\u{1F4E1}',
      },
      {
        name: 'Installable',
        description: 'Add-to-homescreen with a web app manifest and themed splash screen.',
        icon: '\u{1F4F2}',
      },
      {
        name: 'Offline Support',
        description: 'Core app shell cached for instant loads even without a network connection.',
        icon: '\u{1F4E4}',
      },
      {
        name: 'Smart Caching',
        description: 'Stale-while-revalidate for APIs, cache-first for static assets.',
        icon: '\u{1F9E0}',
      },
    ],
  },
  {
    title: 'CI/CD',
    id: 'cicd',
    features: [
      {
        name: 'GitHub Actions',
        description:
          'Full pipeline with lint, type-check, unit tests, and E2E tests on every push and PR.',
        icon: '\u{1F680}',
        wide: true,
      },
      {
        name: 'Auto-fix on PRs',
        description: 'Automatic ESLint and formatting fixes committed back to pull requests.',
        icon: '\u{1F916}',
      },
      {
        name: 'Semantic PR Titles',
        description: 'Enforce conventional commit prefixes on PR titles for clean changelogs.',
        icon: '\u{1F3F7}\uFE0F',
      },
    ],
  },
]

const steps = [
  {
    label: 'Clone the template',
    command: 'git clone https://github.com/your-org/vue-template.git',
  },
  { label: 'Install dependencies', command: 'pnpm install' },
  { label: 'Start developing', command: 'pnpm dev' },
]
</script>

<template>
  <!-- Nav -->
  <nav class="fixed top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-xl">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <span class="font-mono text-sm font-medium text-heading">vue-template</span>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-muted transition-colors hover:text-heading"
      >
        GitHub
      </a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="flex min-h-screen items-center pt-20">
    <div class="mx-auto max-w-4xl px-6 text-center">
      <span
        class="mb-6 inline-block rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-xs text-primary"
      >
        v1.0 — Production-ready starter
      </span>
      <h1 class="mb-6 text-5xl leading-tight font-bold tracking-tight text-heading sm:text-7xl">
        Start building,
        <br />
        <span class="text-primary">not configuring.</span>
      </h1>
      <p class="mx-auto mb-10 max-w-2xl text-lg text-body">
        A Vue 3 starter template with TypeScript, Vite, Tailwind CSS, testing, linting, PWA, and
        CI/CD — all pre-configured so you can ship faster.
      </p>
      <div class="mb-16 flex items-center justify-center gap-4">
        <a
          href="#getting-started"
          class="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          Get Started
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-heading transition-colors hover:border-border-hover hover:bg-surface"
        >
          View Source
        </a>
      </div>
      <div class="mx-auto max-w-xl rounded-xl border border-border bg-surface p-1">
        <div class="flex items-center gap-2 px-4 py-2.5">
          <span class="size-3 rounded-full bg-surface-overlay" />
          <span class="size-3 rounded-full bg-surface-overlay" />
          <span class="size-3 rounded-full bg-surface-overlay" />
        </div>
        <div class="rounded-lg bg-bg px-5 py-4 text-left font-mono text-sm text-body">
          <span class="text-muted">$</span>
          <span class="ml-2 text-heading">npx degit your-org/vue-template my-app</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="py-24">
    <div class="mx-auto max-w-6xl px-6">
      <h2 class="mb-4 text-center text-3xl font-bold text-heading">Everything you need</h2>
      <p class="mx-auto mb-16 max-w-xl text-center text-body">
        A carefully curated stack with opinionated defaults. Every tool earns its place.
      </p>
      <div v-for="category in categories" :key="category.id" class="mb-16 last:mb-0">
        <h3 class="mb-6 font-mono text-xs font-medium tracking-widest text-muted uppercase">
          {{ category.title }}
        </h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="feature in category.features"
            :key="feature.name"
            class="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-border-hover hover:bg-surface-raised"
            :class="{ 'lg:col-span-2': feature.wide }"
          >
            <div
              class="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary-dim text-lg"
            >
              {{ feature.icon }}
            </div>
            <h4 class="mb-2 font-semibold text-heading">{{ feature.name }}</h4>
            <p class="text-sm leading-relaxed text-body">{{ feature.description }}</p>
            <div v-if="feature.badges" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="badge in feature.badges"
                :key="badge"
                class="rounded-md border border-border bg-bg px-2 py-1 font-mono text-xs text-muted"
              >
                {{ badge }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- Getting Started -->
  <section id="getting-started" class="border-t border-border py-24">
    <div class="mx-auto max-w-3xl px-6">
      <h2 class="mb-4 text-center text-3xl font-bold text-heading">Get started in seconds</h2>
      <p class="mx-auto mb-12 max-w-lg text-center text-body">
        Three commands. That's all it takes.
      </p>
      <div class="space-y-6">
        <div v-for="(step, index) in steps" :key="step.label" class="flex gap-5">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-dim font-mono text-sm font-semibold text-primary"
          >
            {{ index + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="mb-2 text-sm font-medium text-heading">{{ step.label }}</p>
            <div
              class="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-body"
            >
              <span class="text-muted">$ </span>
              <span class="text-heading">{{ step.command }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-border py-12">
    <div class="mx-auto max-w-6xl px-6 text-center">
      <p class="text-sm text-muted">
        Built with Vue, TypeScript, and Tailwind CSS.
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-body transition-colors hover:text-heading"
        >
          View on GitHub
        </a>
      </p>
    </div>
  </footer>
</template>
