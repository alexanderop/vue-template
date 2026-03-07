export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow TypeScript enums; use const objects with `as const` instead',
    },
    messages: {
      noEnum: 'Use a const object with `as const` instead of an enum.',
    },
    schema: [],
  },
  create(context) {
    return {
      TSEnumDeclaration(node) {
        context.report({ node, messageId: 'noEnum' })
      },
    }
  },
}
