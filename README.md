# Vue Template Starter

A personal Vue 3 starter template with TypeScript, Vite, Pinia, Vue Router, Vitest, Playwright, and ESLint pre-configured.

## Tech Stack

- [Vue 3](https://vuejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for fast builds and HMR
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vue Router](https://router.vuejs.org/) for routing
- [Vitest](https://vitest.dev/) for unit testing
- [Playwright](https://playwright.dev/) for end-to-end testing
- [ESLint](https://eslint.org/) + [OxLint](https://oxc.rs/) for linting
- [OxFmt](https://oxc.rs/) for formatting

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

## IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/).
