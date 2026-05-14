// Catches two flavours of hardcoded color:
//   1. Tailwind palette utilities — e.g. `bg-red-500`, `text-slate-700`.
//   2. CSS literals — `#abc`, `#aabbcc`, `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)`.
// Both should go through semantic tokens (`bg-surface`, `text-heading`, …)
// defined in the Tailwind theme.

const TAILWIND_PALETTE_PATTERN =
  /\b(?:bg|text|border|ring|outline|shadow|accent|caret|fill|stroke|decoration|divide|placeholder|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)-\d{2,3}\b/g

const CSS_HEX_PATTERN = /#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})\b/gi
const CSS_FUNC_PATTERN = /\b(?:rgba?|hsla?)\s*\(/gi

function findMatches(text) {
  if (typeof text !== 'string' || text.length === 0) return []
  const out = []
  for (const m of text.matchAll(TAILWIND_PALETTE_PATTERN)) out.push(m[0])
  for (const m of text.matchAll(CSS_HEX_PATTERN)) out.push(m[0])
  for (const m of text.matchAll(CSS_FUNC_PATTERN)) out.push(m[0].replace(/\s*\($/, '()'))
  return out
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded colors: Tailwind palette utilities (bg-red-500) and CSS literals (#hex, rgb(), hsl()). Use semantic tokens instead.',
    },
    messages: {
      noHardcodedColor:
        'Avoid hardcoded color "{{ color }}". Use a semantic class (bg-surface, text-heading, …) instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return
        for (const color of findMatches(node.value)) {
          context.report({ node, messageId: 'noHardcodedColor', data: { color } })
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          for (const color of findMatches(quasi.value.raw)) {
            context.report({ node, messageId: 'noHardcodedColor', data: { color } })
          }
        }
      },
    }
  },
}
