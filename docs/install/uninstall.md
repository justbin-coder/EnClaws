---
summary: "Uninstall QingClaws completely (CLI, service, state, workspace)"
read_when:
  - You want to remove QingClaws from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `qingclaws` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
qingclaws uninstall
```

Non-interactive (automation / npx):

```bash
qingclaws uninstall --all --yes --non-interactive
npx -y qingclaws uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
qingclaws gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
qingclaws gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${QINGCLAWS_STATE_DIR:-$HOME/.qingclaws}"
```

If you set `QINGCLAWS_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.qingclaws/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g qingclaws
pnpm remove -g qingclaws
bun remove -g qingclaws
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/QingClaws.app
```

Notes:

- If you used profiles (`--profile` / `QINGCLAWS_PROFILE`), repeat step 3 for each state dir (defaults are `~/.qingclaws-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `qingclaws` is missing.

### macOS (launchd)

Default label is `ai.qingclaws.gateway` (or `ai.qingclaws.<profile>`; legacy `com.qingclaws.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.qingclaws.gateway
rm -f ~/Library/LaunchAgents/ai.qingclaws.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.qingclaws.<profile>`. Remove any legacy `com.qingclaws.*` plists if present.

### Linux (systemd user unit)

Default unit name is `qingclaws-gateway.service` (or `qingclaws-gateway-<profile>.service`):

```bash
systemctl --user disable --now qingclaws-gateway.service
rm -f ~/.config/systemd/user/qingclaws-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `QingClaws Gateway` (or `QingClaws Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "QingClaws Gateway"
Remove-Item -Force "$env:USERPROFILE\.qingclaws\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.qingclaws-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://qingclaws.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g qingclaws@latest`.
Remove it with `npm rm -g qingclaws` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `qingclaws ...` / `bun run qingclaws ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
