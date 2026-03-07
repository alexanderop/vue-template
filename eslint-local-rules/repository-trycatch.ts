import type { Rule } from 'eslint'

const REPOSITORY_PATTERN = /get\w*Repository/

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Repository calls (get*Repository().method()) must be wrapped in tryCatch()',
    },
    messages: {
      wrapInTryCatch:
        'Repository call must be wrapped in tryCatch(). Use `const { data, error } = await tryCatch(get*Repository().method())`.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Match pattern: get*Repository().someMethod()
        const callee = node.callee
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'CallExpression' &&
          callee.object.callee.type === 'Identifier' &&
          REPOSITORY_PATTERN.test(callee.object.callee.name)
        ) {
          // Check if already wrapped in tryCatch
          const parent = node.parent
          if (
            parent?.type === 'CallExpression' &&
            parent.callee.type === 'Identifier' &&
            parent.callee.name === 'tryCatch'
          ) {
            return
          }

          // Also allow if it's the argument to an await inside tryCatch
          const grandparent = parent?.parent
          if (
            parent?.type === 'AwaitExpression' &&
            grandparent?.type === 'CallExpression' &&
            grandparent.callee.type === 'Identifier' &&
            grandparent.callee.name === 'tryCatch'
          ) {
            return
          }

          context.report({ node, messageId: 'wrapInTryCatch' })
        }
      },
    }
  },
}

export default rule
