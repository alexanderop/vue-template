import type { Rule } from 'eslint'

function countLogicalOperators(node: Rule.Node): number {
  if (node.type === 'LogicalExpression') {
    return 1 + countLogicalOperators(node.left as Rule.Node) + countLogicalOperators(node.right as Rule.Node)
  }
  return 0
}

const rule: Rule.RuleModule = {
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
    function check(node: Rule.Node) {
      const testNode = (node as unknown as { test?: Rule.Node }).test
      if (!testNode) return

      // Skip if the test is already a simple identifier (already extracted)
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

export default rule
