function countLogicalOperators(node) {
  if (node.type === 'LogicalExpression') {
    return 1 + countLogicalOperators(node.left) + countLogicalOperators(node.right)
  }
  return 0
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Complex conditions with 2+ logical operators should be extracted to a named const',
    },
    messages: {
      extractCondition:
        'Complex condition with {{ count }} logical operators. Extract to a named `const` for readability.',
    },
    schema: [],
  },
  create(context) {
    function check(node) {
      const testNode = node.test
      if (!testNode) return

      if (testNode.type === 'Identifier') return

      const count = countLogicalOperators(testNode)
      if (count >= 2) {
        context.report({
          node: testNode,
          messageId: 'extractCondition',
          data: { count: String(count) },
        })
      }
    }

    return {
      IfStatement: check,
      ConditionalExpression: check,
      WhileStatement: check,
    }
  },
}
