---
summary: "CLI reference for `qingclaws devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
title: "devices"
---

# `qingclaws devices`

Manage device pairing requests and device-scoped tokens.

## Commands

### `qingclaws devices list`

List pending pairing requests and paired devices.

```
qingclaws devices list
qingclaws devices list --json
```

### `qingclaws devices remove <deviceId>`

Remove one paired device entry.

```
qingclaws devices remove <deviceId>
qingclaws devices remove <deviceId> --json
```

### `qingclaws devices clear --yes [--pending]`

Clear paired devices in bulk.

```
qingclaws devices clear --yes
qingclaws devices clear --yes --pending
qingclaws devices clear --yes --pending --json
```

### `qingclaws devices approve [requestId] [--latest]`

Approve a pending device pairing request. If `requestId` is omitted, QingClaws
automatically approves the most recent pending request.

```
qingclaws devices approve
qingclaws devices approve <requestId>
qingclaws devices approve --latest
```

### `qingclaws devices reject <requestId>`

Reject a pending device pairing request.

```
qingclaws devices reject <requestId>
```

### `qingclaws devices rotate --device <id> --role <role> [--scope <scope...>]`

Rotate a device token for a specific role (optionally updating scopes).

```
qingclaws devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

### `qingclaws devices revoke --device <id> --role <role>`

Revoke a device token for a specific role.

```
qingclaws devices revoke --device <deviceId> --role node
```

## Common options

- `--url <url>`: Gateway WebSocket URL (defaults to `gateway.remote.url` when configured).
- `--token <token>`: Gateway token (if required).
- `--password <password>`: Gateway password (password auth).
- `--timeout <ms>`: RPC timeout.
- `--json`: JSON output (recommended for scripting).

Note: when you set `--url`, the CLI does not fall back to config or environment credentials.
Pass `--token` or `--password` explicitly. Missing explicit credentials is an error.

## Notes

- Token rotation returns a new token (sensitive). Treat it like a secret.
- These commands require `operator.pairing` (or `operator.admin`) scope.
- `devices clear` is intentionally gated by `--yes`.
- If pairing scope is unavailable on local loopback (and no explicit `--url` is passed), list/approve can use a local pairing fallback.
