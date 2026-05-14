---
name: brain
description: >-
  Read/write brain files (Obsidian vault at docs/). Use for any task that persists knowledge —
  reflection, planning, or direct edits. Triggers: docs/ modifications, "add to brain".
---

# Brain

Persistent memory across sessions. Obsidian vault at `docs/`.

The brain is the foundation of the entire workflow — every agent, skill, and session reads it. Low-quality or speculative content degrades everything downstream. Before adding anything, ask: "Does this genuinely improve how the system operates?" If the answer isn't a clear yes, don't write it.

## Before Writing

Read `docs/index.md` first. Then read the relevant entrypoint for your topic:

- `docs/principles.md` for principle updates

For directories without a dedicated index file yet, scan nearby files directly and edit an existing note when possible.

## Structure

```
docs/
├── index.md              <- root entry point, links to everything
├── principles.md         <- index for principles/
├── principles/           <- engineering and design principles
├── codebase/             <- project-specific knowledge and gotchas
└── plans/                <- feature plans
```

**Rules:**

- One topic per file. `docs/codebase/deploy-gotchas.md`, not a mega-file.
- Maintain existing index entrypoints: `docs/index.md`, `docs/principles.md`.
- If you introduce a new top-level category, add an index-style entrypoint for it (links only, no inlined content).
- `docs/index.md` is the root. Every brain file must be reachable from it.
- File names: lowercase, hyphenated. `worktree-gotchas.md`.

## Wikilinks

Format: `[[section/file-name]]`. Resolution order: same directory, then relative path, then vault root. Heading anchors (`[[file#heading]]`) are stripped during resolution.

## Writing Style

- Bullets over prose. No preamble.
- Plain markdown with `# Title`. No Obsidian frontmatter.
- Keep notes under ~50 lines. Split if longer.

## After Writing

Update `docs/index.md` for any files you added or removed. Also update the relevant entrypoint when applicable. Keep indexes link-only and scannable.

## Durability Test

Ask: "Would I include this in a prompt for a _different_ task?"

- **Yes** -> write to `docs/`. It's durable knowledge.
- **No, it's plan-specific** -> update the plan's docs instead.
- **No, it's a skill issue** -> update the skill file directly.
- **No, it needs follow-up work** -> file a todo.

## Maintenance

- Delete outdated or subsumed notes.
- Merge overlapping notes before adding new ones.
