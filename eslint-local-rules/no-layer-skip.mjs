// Enforces the layering in docs/architecture.md:
//
//   View          ← may import components
//   Component     ← may import other components, types, utils;
//                   feature components (src/components/<feature>/) may also
//                   import their feature's store.
//   Base*.vue     ← may NOT import stores or composables — they are design-
//                   system primitives, dumb by contract.
//   Store         ← may import composables, types, utils
//   Composable    ← may NOT import components or stores
//   Utility       ← may NOT import anything Vue-aware
//
// Today this rule enforces the two most failure-prone edges:
//
//   1. `src/components/Base*.vue` may not import `@/stores/*` or
//      `@/composables/use*`.
//   2. `src/composables/**` may not import `@/components/*` or `@/stores/*`.
//
// Extend here when a new layering invariant earns a name.

import path from 'node:path'

function toPosix(p) {
  return p.replaceAll('\\', '/')
}

function importPath(node) {
  return typeof node.source.value === 'string' ? node.source.value : ''
}

const STORE_RE = /^[@~]\/stores\//
const COMPOSABLE_RE = /^[@~]\/composables\//
const COMPONENT_RE = /^[@~]\/components\//

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce architectural layering between Base components, feature components, stores, and composables.',
    },
    messages: {
      baseFromStore:
        'Base component "{{ file }}" must not import a store ("{{ source }}"). Base* components are dumb design-system primitives — lift state up to the feature component.',
      baseFromComposable:
        'Base component "{{ file }}" must not import a feature composable ("{{ source }}"). Base* components must stay framework-only.',
      composableFromComponent:
        'Composable "{{ file }}" must not import a component ("{{ source }}"). Composables sit below the component layer.',
      composableFromStore:
        'Composable "{{ file }}" must not import a store ("{{ source }}"). Stores consume composables, not the other way around.',
    },
    schema: [],
  },
  create(context) {
    const filename = toPosix(context.filename)
    const basename = path.basename(filename)

    const isBaseComponent =
      filename.includes('/src/components/') && /^Base[A-Z]/.test(basename)
    const isComposable = filename.includes('/src/composables/')

    if (!isBaseComponent && !isComposable) {
      return {}
    }

    return {
      ImportDeclaration(node) {
        const source = importPath(node)
        if (!source) return

        if (isBaseComponent && STORE_RE.test(source)) {
          context.report({
            node,
            messageId: 'baseFromStore',
            data: { file: basename, source },
          })
          return
        }
        if (isBaseComponent && COMPOSABLE_RE.test(source)) {
          context.report({
            node,
            messageId: 'baseFromComposable',
            data: { file: basename, source },
          })
          return
        }
        if (isComposable && COMPONENT_RE.test(source)) {
          context.report({
            node,
            messageId: 'composableFromComponent',
            data: { file: basename, source },
          })
          return
        }
        if (isComposable && STORE_RE.test(source)) {
          context.report({
            node,
            messageId: 'composableFromStore',
            data: { file: basename, source },
          })
        }
      },
    }
  },
}
