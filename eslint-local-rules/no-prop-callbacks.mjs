// Vue components communicate up via `defineEmits`, not callback props.
//
// Why: callback props (`onClick: () => void`) bypass the events system,
// don't show up in DevTools, can't be `.once`-modified, and lose Vue's
// listener inheritance. Callers also can't tell which props are "data" vs
// "actions" at a glance.
//
// This rule flags any property inside a `defineProps<...>()` type argument
// that is either named `on[A-Z]...` or typed as a function type. It handles
// three shapes:
//
//   defineProps<{ onClick: () => void }>()            // inline type literal
//   defineProps<Props>()                              // interface / type alias
//   defineProps<{ a: number } & { onClick: ... }>()  // intersection
//
// Workarounds: for upward communication use `defineEmits`. For render-prop
// style, use a scoped slot.

const CALLBACK_NAME_RE = /^on[A-Z]/

function isFunctionTypeAnnotation(typeAnnotation) {
  if (!typeAnnotation) return false
  const inner = typeAnnotation.typeAnnotation ?? typeAnnotation
  if (!inner) return false
  if (inner.type === 'TSFunctionType' || inner.type === 'TSConstructorType') return true
  if (inner.type === 'TSUnionType' && Array.isArray(inner.types)) {
    return inner.types.some((t) => t?.type === 'TSFunctionType')
  }
  return false
}

function propertyName(member) {
  if (member.type !== 'TSPropertySignature') return null
  const key = member.key
  if (!key) return null
  if (key.type === 'Identifier') return key.name
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value
  return null
}

function checkMembers(context, members) {
  for (const member of members ?? []) {
    const name = propertyName(member)
    if (!name) continue
    const isFnType = isFunctionTypeAnnotation(member.typeAnnotation)
    const looksLikeCallback = CALLBACK_NAME_RE.test(name)
    if (isFnType || looksLikeCallback) {
      context.report({
        node: member,
        messageId: 'noCallbackProp',
        data: { name },
      })
    }
  }
}

// Walks a type expression (literal, intersection, union, reference) and
// checks any TSTypeLiteral members it can reach. `resolve(name)` looks the
// name up in the per-file declaration map collected during traversal.
function walkTypeNode(context, typeNode, resolve, seen = new Set()) {
  if (!typeNode) return
  if (typeNode.type === 'TSTypeLiteral') {
    checkMembers(context, typeNode.members)
    return
  }
  if (typeNode.type === 'TSIntersectionType' || typeNode.type === 'TSUnionType') {
    for (const child of typeNode.types ?? []) walkTypeNode(context, child, resolve, seen)
    return
  }
  if (typeNode.type === 'TSTypeReference') {
    const name = typeNode.typeName?.name
    if (!name || seen.has(name)) return
    seen.add(name)
    const resolved = resolve(name)
    if (resolved) walkTypeNode(context, resolved, resolve, seen)
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow callback-style props in defineProps; use defineEmits or scoped slots instead.',
    },
    messages: {
      noCallbackProp:
        'Prop "{{ name }}" looks like a callback. Use defineEmits (or a scoped slot) so the component communicates upward via events, not callback props.',
    },
    schema: [],
  },
  create(context) {
    // Collect every type/interface declaration in the file so a defineProps
    // reference like `defineProps<Props>()` can be resolved without scope-
    // manager access (oxlint plugin runtime doesn't expose ESLint's scope API).
    const declarations = new Map()
    const definePropsCalls = []

    function recordDeclaration(name, bodyOrType) {
      if (name && bodyOrType && !declarations.has(name)) {
        declarations.set(name, bodyOrType)
      }
    }

    function resolve(name) {
      return declarations.get(name) ?? null
    }

    return {
      TSInterfaceDeclaration(node) {
        // `body` is TSInterfaceBody with `body: TSPropertySignature[]` —
        // wrap it so walkTypeNode treats it as a TSTypeLiteral.
        recordDeclaration(node.id?.name, {
          type: 'TSTypeLiteral',
          members: node.body?.body ?? [],
        })
      },
      TSTypeAliasDeclaration(node) {
        recordDeclaration(node.id?.name, node.typeAnnotation)
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'defineProps'
        ) {
          definePropsCalls.push(node)
        }
      },
      'Program:exit'() {
        for (const call of definePropsCalls) {
          const typeArg =
            call.typeArguments?.params?.[0] ?? call.typeParameters?.params?.[0]
          if (typeArg) walkTypeNode(context, typeArg, resolve)
        }
      },
    }
  },
}
