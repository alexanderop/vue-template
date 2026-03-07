export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow else and else-if blocks; use early returns, guard clauses, or lookups',
    },
    messages: {
      noElseIf: 'No else-if. Use early returns, guard clauses, or a lookup map.',
      noElse:
        'No else. Use early returns, guard clauses, or a ternary for simple assignments.',
    },
    schema: [],
  },
  create(context) {
    return {
      IfStatement(node) {
        if (!node.alternate) return

        if (node.alternate.type === 'IfStatement') {
          context.report({ node: node.alternate, messageId: 'noElseIf' })
        } else {
          context.report({ node: node.alternate, messageId: 'noElse' })
        }
      },
    }
  },
}
