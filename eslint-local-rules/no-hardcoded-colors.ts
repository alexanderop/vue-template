import type { Rule } from 'eslint'

const HARDCODED_COLOR_PATTERN =
  /\b(?:bg|text|border|ring|outline|shadow|accent|caret|fill|stroke|decoration|divide|placeholder|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)-\d{2,3}\b/

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded Tailwind color classes; use semantic tokens instead',
    },
    messages: {
      noHardcodedColor:
        'Avoid hardcoded color "{{ color }}". Use a semantic class (e.g. bg-primary, text-muted) instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return
        const matches = node.value.match(new RegExp(HARDCODED_COLOR_PATTERN, 'g'))
        if (matches) {
          for (const color of matches) {
            context.report({ node, messageId: 'noHardcodedColor', data: { color } })
          }
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const matches = quasi.value.raw.match(new RegExp(HARDCODED_COLOR_PATTERN, 'g'))
          if (matches) {
            for (const color of matches) {
              context.report({ node, messageId: 'noHardcodedColor', data: { color } })
            }
          }
        }
      },
    }
  },
}

export default rule
