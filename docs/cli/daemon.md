---
summary: "CLI reference for `qingclaws daemon` (legacy alias for gateway service management)"
read_when:
  - You still use `qingclaws daemon ...` in scripts
  - You need service lifecycle commands (install/start/stop/restart/status)
title: "daemon"
---

# `qingclaws daemon`

Legacy alias for Gateway service management commands.

`qingclaws daemon ...` maps to the same service control surface as `qingclaws gateway ...` service commands.

## Usage

```bash
qingclaws daemon status
qingclaws daemon install
qingclaws daemon start
qingclaws daemon stop
qingclaws daemon restart
qingclaws daemon uninstall
```

## Subcommands

- `status`: show service install state and probe Gateway health
- `install`: install service (`launchd`/`systemd`/`schtasks`)
- `uninstall`: remove service
- `start`: start service
- `stop`: stop service
- `restart`: restart service

## Common options

- `status`: `--url`, `--token`, `--password`, `--timeout`, `--no-probe`, `--deep`, `--json`
- `install`: `--port`, `--runtime <node|bun>`, `--token`, `--force`, `--json`
- lifecycle (`uninstall|start|stop|restart`): `--json`

## Prefer

Use [`qingclaws gateway`](/cli/gateway) for current docs and examples.
