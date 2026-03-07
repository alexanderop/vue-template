export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `let` declarations inside `describe` blocks in tests',
    },
    messages: {
      noLetInDescribe:
        'Avoid `let` inside describe blocks. Use `const` with a factory or assign inside beforeEach.',
    },
    schema: [],
  },
  create(context) {
    let describeDepth = 0

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'describe'
        ) {
          describeDepth++
        }
      },
      'CallExpression:exit'(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'describe'
        ) {
          describeDepth--
        }
      },
      VariableDeclaration(node) {
        if (describeDepth > 0 && node.kind === 'let') {
          context.report({ node, messageId: 'noLetInDescribe' })
        }
      },
    }
  },
}
