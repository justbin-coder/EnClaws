#!/usr/bin/env bash
# scripts/check-brand-residue.sh
# QINGCLAWS-CUSTOM: brand — CI gate: fail if old brand strings remain in user-visible files.
# Called by test/branding/no-brand-residue.test.ts and pnpm check (optionally).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Whitelist: files allowed to contain upstream brand strings
WHITELIST_PATTERN="LICENSE|NOTICE|THIRD_PARTY_NOTICES\.md|docs/upstream-divergence\.md|src/branding/brand\.config\.ts|src/branding/replacement-rules\.json|scripts/brand-codemod\.mjs|scripts/check-brand-residue\.sh|CHANGELOG\.md"

# Patterns to search for in user-visible layer
PATTERNS=(
  '\bOpenClaw\b'
  '\bopenclaw\b'
  '\bOPENCLAW\b'
  '\bEnClaws\b'
  '\benclaws\b'
  '\bENCLAWS\b'
  '\bhashSTACS\b'
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  if command -v rg &>/dev/null; then
    hits=$(rg --no-heading --line-number "$pattern" \
      --glob '*.ts' --glob '*.tsx' --glob '*.js' --glob '*.mjs' \
      --glob '*.json' --glob '*.md' --glob '*.sh' --glob '*.yaml' \
      --glob '*.yml' --glob '*.css' --glob '*.html' \
      --ignore-file .gitignore \
      . 2>/dev/null \
      | grep -Ev "$WHITELIST_PATTERN" || true)
  else
    hits=$(grep -rn --include='*.ts' --include='*.tsx' --include='*.js' \
      --include='*.mjs' --include='*.json' --include='*.md' --include='*.sh' \
      --include='*.yaml' --include='*.yml' --include='*.css' --include='*.html' \
      -E "$pattern" . 2>/dev/null \
      | grep -Ev "$WHITELIST_PATTERN" || true)
  fi
  if [[ -n "$hits" ]]; then
    echo "❌ Brand residue found for pattern '$pattern':"
    echo "$hits"
    FOUND=$((FOUND + 1))
  fi
done

if [[ $FOUND -gt 0 ]]; then
  echo ""
  echo "❌ $FOUND pattern(s) with residue. Fix before merge."
  exit 1
fi

echo "✅ No brand residue found."
exit 0
