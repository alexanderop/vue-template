#!/bin/bash
# auto-index-brain.sh — PostToolUse hook
# Regenerates docs/index.md when docs/ files are added or removed.
# Emits bare wikilinks — no LLM-generated descriptions.

# Consume hook input
cat > /dev/null

set -euo pipefail

BRAIN_DIR="${CLAUDE_PROJECT_DIR}/docs"
INDEX="${BRAIN_DIR}/index.md"

[ -d "$BRAIN_DIR" ] || exit 0
[ -f "$INDEX" ] || exit 0

# All .md files except the top-level index.md — relative paths without .md extension
disk=$(find "$BRAIN_DIR" -name "*.md" -type f \
    | sed "s|^${BRAIN_DIR}/||; s|\.md$||" \
    | grep -v '^index$' \
    | sort)

# Wikilinks in current index
indexed=$(sed -n 's/.*\[\[\([^]]*\)\]\].*/\1/p' "$INDEX" | sort)

# Exit fast if nothing changed (no new/removed files)
[ "$disk" = "$indexed" ] && exit 0

# --- Drift detected, rebuild ---

emit_files() {
    while IFS= read -r f; do
        [ -z "$f" ] && continue
        echo "- [[$f]]"
    done
}

# Top-level directories that contain at least one .md
dirs=$(echo "$disk" | awk -F/ 'NF>1 {print $1}' | sort -u)

{
    echo "# Brain"
    for section in $dirs; do
        # Match the directory's index-style file ("principles") + everything under it ("principles/*")
        files=$(echo "$disk" | awk -v s="$section" '$0 == s || index($0, s"/") == 1' || true)
        [ -z "$files" ] && continue
        # Portable capitalize (BSD sed doesn't support \U)
        header=$(printf '%s' "$section" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
        printf '\n## %s\n' "$header"
        echo "$files" | emit_files
    done

    # Standalone files: top-level, and NOT also a directory name (avoid duplicates)
    # Build an alternation regex of directory names; if no dirs, match nothing.
    if [ -n "$dirs" ]; then
        dir_regex=$(echo "$dirs" | paste -sd'|' -)
        standalone=$(echo "$disk" | grep -v '/' | grep -Ev "^(${dir_regex})$" || true)
    else
        standalone=$(echo "$disk" | grep -v '/' || true)
    fi
    if [ -n "$standalone" ]; then
        printf '\n## Other\n'
        echo "$standalone" | emit_files
    fi
    echo ""
} > "$INDEX"
