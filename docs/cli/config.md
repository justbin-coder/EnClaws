---
summary: "CLI reference for `qingclaws config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `qingclaws config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `qingclaws configure`).

## Examples

```bash
qingclaws config get browser.executablePath
qingclaws config set browser.executablePath "/usr/bin/google-chrome"
qingclaws config set agents.defaults.heartbeat.every "2h"
qingclaws config set agents.list[0].tools.exec.node "node-id-or-name"
qingclaws config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
qingclaws config get agents.defaults.workspace
qingclaws config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
qingclaws config get agents.list
qingclaws config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

```bash
qingclaws config set agents.defaults.heartbeat.every "0m"
qingclaws config set gateway.port 19001 --strict-json
qingclaws config set channels.whatsapp.groups '["*"]' --strict-json
```

Restart the gateway after edits.
