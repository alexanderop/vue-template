// Closes the loop on `no-try-statement` + the `tryCatch` Result pattern.
//
// `tryCatch(promise)` returns `Promise<Result<T>>` (`{ data, error }`). The
// whole point is the caller checks `error` — discarding the return value
// silently swallows failures, which is exactly what banning `try/catch` was
// supposed to prevent.
//
// This rule flags two shapes where the Result is discarded:
//
//   1. `await tryCatch(x)` used as a bare expression statement.
//        (vs. `const { data, error } = await tryCatch(x)`)
//   2. `tryCatch(x)` (no await) used as a bare expression statement.
//        (vs. `tryCatch(x).then(({ error }) => …)`)

function isTryCatchCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'tryCatch'
  )
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow discarding the return of tryCatch(); the Result<T> must be consumed.',
    },
    messages: {
      uncheckedResult:
        'tryCatch() result is discarded. Destructure { data, error } or chain .then(...) so the error is checked.',
    },
    schema: [],
  },
  create(context) {
    function reportBareTryCatch(callExpr) {
      const parent = callExpr.parent
      if (!parent) return
      // Allowed: assigned, destructured, returned, awaited-then-used, chained.
      if (parent.type === 'ExpressionStatement') {
        context.report({ node: callExpr, messageId: 'uncheckedResult' })
        return
      }
      if (
        parent.type === 'AwaitExpression' &&
        parent.parent?.type === 'ExpressionStatement'
      ) {
        context.report({ node: callExpr, messageId: 'uncheckedResult' })
      }
    }

    return {
      CallExpression(node) {
        if (isTryCatchCall(node)) reportBareTryCatch(node)
      },
    }
  },
}
