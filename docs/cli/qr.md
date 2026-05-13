---
summary: "CLI reference for `qingclaws qr` (generate iOS pairing QR + setup code)"
read_when:
  - You want to pair the iOS app with a gateway quickly
  - You need setup-code output for remote/manual sharing
title: "qr"
---

# `qingclaws qr`

Generate an iOS pairing QR and setup code from your current Gateway configuration.

## Usage

```bash
qingclaws qr
qingclaws qr --setup-code-only
qingclaws qr --json
qingclaws qr --remote
qingclaws qr --url wss://gateway.example/ws --token '<token>'
```

## Options

- `--remote`: use `gateway.remote.url` plus remote token/password from config
- `--url <url>`: override gateway URL used in payload
- `--public-url <url>`: override public URL used in payload
- `--token <token>`: override gateway token for payload
- `--password <password>`: override gateway password for payload
- `--setup-code-only`: print only setup code
- `--no-ascii`: skip ASCII QR rendering
- `--json`: emit JSON (`setupCode`, `gatewayUrl`, `auth`, `urlSource`)

## Notes

- `--token` and `--password` are mutually exclusive.
- After scanning, approve device pairing with:
  - `qingclaws devices list`
  - `qingclaws devices approve <requestId>`
