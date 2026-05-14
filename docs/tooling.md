# Tooling & the check pipeline

## The stack

| Tool                                   | Used for                          | Why                                                                 |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| **pnpm**                               | Package manager + script runner   | Fast, content-addressed. Pinned via `packageManager` field.         |
| **Vite**                               | Dev server + build                | Fast HMR; first-class Vue plugin.                                   |
| **vue-tsc**                            | Typecheck (`vue-tsc --build`)     | Standard `tsc` doesn't understand `.vue` SFCs.                      |
| **oxlint**                             | Linting                           | Rust-based, ~100× faster than ESLint. Hosts our local rules.        |
| **oxfmt**                              | Formatting                        | Same family; Prettier-compatible style.                             |
| **Vitest**                             | Unit + browser tests              | Two `--project` configs: `unit` (jsdom) and `browser` (Playwright). |
| **Playwright**                         | End-to-end tests                  | Real browser; runs against the built app on CI.                     |
| **knip**                               | Dead-code / unused-deps detection | Periodic check; not in the default pipeline.                        |
| **simple-git-hooks** + **lint-staged** | Pre-commit hooks                  | Run `oxlint --fix` + `oxfmt` on staged files only.                  |

## What "done" means locally

There is no single `check` script. The minimum bar before pushing:

```
pnpm type-check    # vue-tsc --build
pnpm lint          # oxlint . --fix
pnpm test:unit     # Vitest unit project
```

For UI work, additionally:

```
pnpm test:browser  # component tests in a real browser
pnpm dev           # manual smoke test the golden path
```

For end-to-end:

```
pnpm build         # required first on CI
pnpm test:e2e
```

`pnpm format` rewrites files; `oxfmt` has no `--check` mode in this project's
setup, so formatting drift is caught by the pre-commit hook rather than CI.

## Config file map

| File                   | Owns                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| `package.json`         | Deps, scripts, `simple-git-hooks`, `lint-staged`, `pnpm.onlyBuiltDependencies`. |
| `tsconfig.json`        | Project references → `tsconfig.app.json` + `tsconfig.node.json`.                |
| `.oxlintrc.json`       | Lint rules. **Custom rules live under `eslint-local-rules/`.**                  |
| `.oxfmtrc.json`        | Format ignore patterns.                                                         |
| `vite.config.ts`       | Vite + Vue + Tailwind + PWA plugin wiring, aliases.                             |
| `vitest.config.ts`     | Two Vitest projects: `unit` (jsdom) and `browser` (Playwright).                 |
| `playwright.config.ts` | Playwright reporter + project config for `e2e/`.                                |
| `knip.config.ts`       | Knip entry points.                                                              |
| `.github/`             | CI workflows (Dependabot + checks).                                             |
| `.vscode/`             | Editor settings — recommended extensions, formatter.                            |

## The pre-commit hook

`simple-git-hooks` registers a hook from `package.json`:

```json
"simple-git-hooks": { "pre-commit": "pnpm lint-staged" },
"lint-staged": {
  "*.{ts,tsx,vue}": ["oxlint --fix"],
  "*.{ts,tsx,vue,json,md,yaml,yml,html}": ["oxfmt"]
}
```

Runs after `pnpm install` via the `postinstall` script. If the hook isn't
firing, re-run `pnpm install` to re-register it.

## The local oxlint rule plugin

`.oxlintrc.json` loads our plugin as a `jsPlugins` entry:

```json
{ "name": "local", "specifier": "./eslint-local-rules/plugin.mjs" }
```

The plugin exports the rules as `local/<rule-name>`. They're then activated
under `overrides[files=src/**/*.{ts,vue}]`. See
[patterns/local-lint-rules.md](./patterns/local-lint-rules.md) for what each
one enforces.
