export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow try/catch statements; use tryCatch() utility instead',
    },
    messages: {
      noTryStatement: 'No try/catch. Use tryCatch() utility for explicit error handling.',
    },
    schema: [],
  },
  create(context) {
    return {
      TryStatement(node) {
        context.report({ node, messageId: 'noTryStatement' })
      },
    }
  },
}
