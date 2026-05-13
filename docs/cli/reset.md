---
summary: "CLI reference for `qingclaws reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `qingclaws reset`

Reset local config/state (keeps the CLI installed).

```bash
qingclaws reset
qingclaws reset --dry-run
qingclaws reset --scope config+creds+sessions --yes --non-interactive
```
