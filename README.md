# Opinionated Vue Starter

A batteries-included, opinionated Vue 3 starter template for building modern web applications. Pre-configured with TypeScript, Tailwind CSS, PWA support, and a robust developer experience out of the box.

## Tech Stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for fast builds and HMR
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vue Router](https://router.vuejs.org/) for routing
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [VueUse](https://vueuse.org/) for composable utilities
- [PWA](https://web.dev/progressive-web-apps/) support via `vite-plugin-pwa`
- [Vue DevTools](https://devtools.vuejs.org/) integration

## Code Quality

- [ESLint](https://eslint.org/) with Vue, TypeScript, Unicorn, and import plugins
- [OxLint](https://oxc.rs/) for fast supplemental linting
- [OxFmt](https://oxc.rs/) for formatting
- [Knip](https://knip.dev/) for detecting unused code and dependencies
- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) + [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit checks

## Testing

- [Vitest](https://vitest.dev/) for unit tests (with coverage via `@vitest/coverage-v8`)
- [Playwright](https://playwright.dev/) for end-to-end tests

## Getting Started

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

### Build for Production

```sh
pnpm build
```

### Run Unit Tests

```sh
pnpm test:unit
```

### Run End-to-End Tests

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
```

### Lint

```sh
pnpm lint
```

### Format

```sh
pnpm format
```

### Find Unused Code

```sh
pnpm knip
```

## IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- [pnpm](https://pnpm.io/) `10.28.2+`

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/).
