import path from 'node:path'

const VUE_IMPORTS = ['vue', '@vueuse/core', '@vueuse/integrations', 'vue-router', 'pinia']
const COMPOSABLE_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.tsx'])

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Composables (use*.{ts,mts,cts,tsx} files) must import from Vue or VueUse',
    },
    messages: {
      mustUseVue:
        'Composable "{{ filename }}" must import from Vue, VueUse, or another composable. Found no Vue-related imports.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename
    const ext = path.extname(filename)
    const basename = path.basename(filename, ext)

    const isComposableFile =
      /^use[A-Z]/.test(basename) && COMPOSABLE_EXTENSIONS.has(ext)
    if (!isComposableFile) {
      return {}
    }

    let hasVueImport = false

    return {
      ImportDeclaration(node) {
        const source = node.source.value
        if (
          VUE_IMPORTS.some((pkg) => source === pkg || source.startsWith(`${pkg}/`)) ||
          /\/use[A-Z]/.test(source)
        ) {
          hasVueImport = true
        }
      },
      'Program:exit'(node) {
        if (!hasVueImport) {
          context.report({
            node,
            messageId: 'mustUseVue',
            data: { filename: basename },
          })
        }
      },
    }
  },
}
