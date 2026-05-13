# Deployment Guide

Production deployment options for QingClaws — from single-machine dev setups to multi-tenant enterprise deployments.

---

## Deployment Options Overview

| Method | Best For | Database | Complexity |
|--------|----------|----------|------------|
| [CLI (Local)](#1-cli-local) | Development, personal use | SQLite | Low |
| [Docker Compose](#2-docker-compose) | Small teams, staging | PostgreSQL | Medium |
| [Windows Installer](#3-windows-installer) | Windows users, offline | SQLite | Low |
| [macOS Installer](#4-macos-installer) | macOS users | SQLite | Low |
| [VPS / Cloud Server](#5-vps--cloud-server) | Production, always-on | PostgreSQL | Medium |
| [Multi-Instance HA](#6-multi-instance-ha) | Enterprise, high availability | PostgreSQL | High |

---

## 1. CLI (Local)

Simplest option — run directly on your machine.

### Install & Run

```bash
# Install globally
npm install -g qingclaws

# Start gateway
qingclaws gateway
```

### Configuration

```bash
# Set environment variables
export QINGCLAWS_GATEWAY_PORT=18789
export QINGCLAWS_GATEWAY_PASSWORD=your-password
export OPENAI_API_KEY=sk-...

# Start with options
qingclaws gateway --port 18789 --bind loopback --auth password
```

### CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `--port <n>` | 18789 | Gateway port |
| `--bind <mode>` | loopback | `loopback` / `lan` / `tailnet` / `auto` |
| `--auth <mode>` | token | `none` / `token` / `password` / `trusted-proxy` |
| `--token <t>` | — | WebSocket auth token |
| `--password <p>` | — | Password auth |
| `--dev` | false | Development mode |
| `--verbose` | false | Verbose logging |
| `--allow-unconfigured` | false | Skip config validation |

### Data Location

```
~/.qingclaws/
├── config.toml          # Gateway configuration
├── workspace/           # File storage
├── sessions/            # Chat sessions
└── tenants/             # Tenant data (multi-tenant mode)
```

---

## 2. Docker Compose

Recommended for production — includes PostgreSQL for multi-tenant support.

### Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

### Setup

```bash
# Clone repository
git clone https://github.com/hashSTACS-Global/EnClaws.git
cd QingClaws

# Create environment file
cp .env.example .env
```

### Configure .env

```bash
# === Database ===
QINGCLAWS_DB_URL=postgresql://qingclaws:qingclaws_secret@qingclaws-db:5432/qingclaws

# === Authentication ===
QINGCLAWS_JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
QINGCLAWS_GATEWAY_TOKEN=your-gateway-access-token

# === Gateway ===
QINGCLAWS_GATEWAY_PORT=18789
QINGCLAWS_GATEWAY_BIND=lan

# === LLM Providers ===
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# === Channels (optional) ===
TELEGRAM_BOT_TOKEN=...
DISCORD_BOT_TOKEN=...
```

### Launch

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f gateway

# Run database migrations
docker-compose exec cli node --import tsx src/db/migrate.ts

# Check migration status
docker-compose exec cli node --import tsx src/db/migrate.ts --status
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| `qingclaws-db` | 5432 | PostgreSQL 16 Alpine |
| `gateway` | 18789, 18790 | QingClaws Gateway |
| `cli` | — | CLI tools (shared network with gateway) |

### Volumes

| Volume | Purpose |
|--------|---------|
| `qingclaws-pgdata` | PostgreSQL persistent storage |
| `./data/qingclaws` | Gateway state directory |

### Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run any new migrations
docker-compose exec cli node --import tsx src/db/migrate.ts
```

---

## 3. Windows Installer

Zero-dependency installer for Windows users.

### Build the Installer

```powershell
# From the project root
.\installer\build-installer.ps1

# Options
.\installer\build-installer.ps1 `
  -NodeVersion 22.16.0 `
  -Registry https://registry.npmmirror.com `
  -InnoSetupPath "C:\Program Files (x86)\Inno Setup 6\iscc.exe"
```

### What It Includes

- Portable Node.js runtime (no system Node required)
- Pre-built QingClaws application
- Feishu skills pack (bundled from `feishu-skills` repo)
- Auto-start configuration

### Install & Run

1. Run `QingClaws-Setup-x.x.x.exe` (no admin rights needed)
2. Search "QingClaws" in Start menu
3. Gateway starts at `http://localhost:18789`

### Data Location

```
%LOCALAPPDATA%\QingClaws\
├── node\                # Bundled Node.js
├── app\                 # Application files
├── skills-pack\         # Feishu skills
└── data\                # Runtime data
```

---

## 4. macOS Installer

Self-contained DMG package for macOS.

### Build the DMG

```bash
# Build for current architecture
./scripts/build-mac-installer.sh

# Build for specific architecture
BUILD_ARCHS=arm64 ./scripts/build-mac-installer.sh

# Environment variables
NODE_VERSION=22.16.0      # Node.js version to bundle
SKIP_BUILD=1              # Skip pnpm build (if dist/ exists)
SKIP_DMG=1                # Build .app only (no DMG)
```

### Install

1. Open `QingClaws-x.x.x.dmg`
2. Drag QingClaws to Applications
3. Launch from Applications or Spotlight

### What It Includes

- Bundled Node.js runtime
- Code-signed .app bundle
- CFBundleIdentifier for macOS security
- Auto-launch on login (optional)

---

## 5. VPS / Cloud Server

For always-on production deployments on Linux servers.

### Prerequisites

- Ubuntu 22.04+ / Debian 12+ / RHEL 9+
- Node.js >= 22.12.0
- PostgreSQL 16+ (for multi-tenant)

### Install

```bash
# Install via one-liner
curl -fsSL --proto '=https' --tlsv1.2 \
  https://raw.githubusercontent.com/hashSTACS-Global/EnClaws/main/install.sh | bash

# Or build from source
git clone https://github.com/hashSTACS-Global/EnClaws.git
cd QingClaws
pnpm install && pnpm build && pnpm ui:build
```

### PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install postgresql-16

# Create database and user
sudo -u postgres psql <<SQL
CREATE USER qingclaws WITH PASSWORD 'your-secure-password';
CREATE DATABASE qingclaws OWNER qingclaws;
SQL

# Set connection string
export QINGCLAWS_DB_URL=postgresql://qingclaws:your-secure-password@localhost:5432/qingclaws

# Run migrations
pnpm db:migrate
```

### systemd Service

Create `/etc/systemd/system/qingclaws.service`:

```ini
[Unit]
Description=QingClaws AI Assistant Gateway
After=network.target postgresql.service

[Service]
Type=simple
User=qingclaws
Group=qingclaws
WorkingDirectory=/opt/qingclaws
EnvironmentFile=/opt/qingclaws/.env
ExecStart=/usr/bin/node qingclaws.mjs gateway --bind lan --auth password
Restart=on-failure
RestartSec=5

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/qingclaws/data

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable qingclaws
sudo systemctl start qingclaws

# Check status
sudo systemctl status qingclaws
sudo journalctl -u qingclaws -f
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name qingclaws.example.com;

    ssl_certificate     /etc/letsencrypt/live/qingclaws.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qingclaws.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

When using a reverse proxy, configure trusted-proxy auth:

```bash
export QINGCLAWS_GATEWAY_AUTH=trusted-proxy
```

### Firewall

```bash
# Allow gateway port (if not using reverse proxy)
sudo ufw allow 18789/tcp

# Or restrict to specific IPs
sudo ufw allow from 10.0.0.0/8 to any port 18789
```

---

## 6. Multi-Instance HA

Enterprise high-availability deployment with load balancing.

### Architecture

```
                    ┌──────────────┐
                    │   Load       │
                    │   Balancer   │
                    │   (Nginx)    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴─────┐ ┌───┴─────┐
        │ Gateway 1 │ │ Gateway 2│ │ Gateway 3│
        │ (active)  │ │ (active) │ │ (active) │
        └─────┬─────┘ └───┬─────┘ └───┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────┴───────┐
                    │ PostgreSQL   │
                    │ (primary +   │
                    │  replicas)   │
                    └──────────────┘
```

### Load Balancer Configuration

```nginx
upstream qingclaws_backend {
    # WebSocket sticky sessions (required)
    ip_hash;

    server gateway1.internal:18789;
    server gateway2.internal:18789;
    server gateway3.internal:18789;
}

server {
    listen 443 ssl http2;
    server_name qingclaws.example.com;

    location / {
        proxy_pass http://qingclaws_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

### Considerations

- **Sticky sessions** required for WebSocket connections (use `ip_hash` or cookie-based)
- **Shared PostgreSQL** — all instances connect to the same database
- **Shared file system** — use NFS or object storage for tenant workspaces
- **Cron coordination** — only one instance should run cron jobs (use leader election or dedicated cron worker)
- **Channel connections** — each channel bot connects from one instance only

---

## Environment Variables Reference

### Core

| Variable | Default | Description |
|----------|---------|-------------|
| `QINGCLAWS_GATEWAY_PORT` | `18789` | Gateway port |
| `QINGCLAWS_GATEWAY_BIND` | `loopback` | Bind mode: `loopback` / `lan` / `tailnet` / `auto` |
| `QINGCLAWS_GATEWAY_PASSWORD` | — | Authentication password |
| `QINGCLAWS_STATE_DIR` | `~/.qingclaws` | State directory path |
| `QINGCLAWS_HOME` | `~` | Home directory |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `QINGCLAWS_DB_URL` | `sqlite://...` | Full connection URL |
| `QINGCLAWS_DB_HOST` | `localhost` | PostgreSQL host |
| `QINGCLAWS_DB_PORT` | `5432` | PostgreSQL port |
| `QINGCLAWS_DB_NAME` | `qingclaws` | Database name |
| `QINGCLAWS_DB_USER` | `qingclaws` | Database user |
| `QINGCLAWS_DB_PASSWORD` | — | Database password |
| `QINGCLAWS_DB_SSL` | `false` | Enable SSL |
| `QINGCLAWS_DB_POOL_MAX` | `20` | Connection pool size |

### Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `QINGCLAWS_JWT_SECRET` | — | JWT signing secret (required for multi-tenant) |
| `QINGCLAWS_JWT_ACCESS_EXPIRES` | `30m` | Access token TTL |
| `QINGCLAWS_JWT_REFRESH_EXPIRES` | `7d` | Refresh token TTL |
| `QINGCLAWS_CONTROL_UI_DISABLE_DEVICE_AUTH` | `false` | Disable device auth in UI |
| `QINGCLAWS_CONTROL_UI_ALLOWED_ORIGINS` | — | CORS origins for Control UI |

### LLM Providers

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_API_KEYS` | Multiple keys (comma-separated) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `DEEPSEEK_API_KEY` | DeepSeek API key |

### Channels

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `SLACK_BOT_TOKEN` | Slack bot token |
| `SLACK_APP_TOKEN` | Slack app-level token |
| `MATTERMOST_BOT_TOKEN` | Mattermost bot token |
| `ZALO_BOT_TOKEN` | Zalo bot token |

### Skill Packs

| Variable | Default | Description |
|----------|---------|-------------|
| `SKILL_PACK_AUTO_INSTALL` | `false` | Auto-install skill packs |
| `SKILL_PACK_LOCAL_DIR` | — | Local skill pack directory |
| `SKILL_PACK_GIT_URL` | — | Git URL for skill pack |

---

## Database Operations

### Migrations

```bash
# Run pending migrations
pnpm db:migrate

# Check migration status
pnpm db:migrate:status

# Or run directly
node --import tsx src/db/migrate.ts
node --import tsx src/db/migrate.ts --status
```

### Database Selection Logic

QingClaws automatically detects the database type:

1. `QINGCLAWS_DB_URL` starts with `postgresql://` or `postgres://` → **PostgreSQL**
2. `QINGCLAWS_DB_URL` starts with `sqlite://` → **SQLite**
3. `QINGCLAWS_DB_HOST` is set (no URL) → **PostgreSQL**
4. Nothing set → **SQLite** (default, stored in state dir)

### Backup

```bash
# PostgreSQL backup
pg_dump -U qingclaws -h localhost qingclaws > backup.sql

# PostgreSQL restore
psql -U qingclaws -h localhost qingclaws < backup.sql

# SQLite backup (just copy the file)
cp ~/.qingclaws/data.db ~/.qingclaws/data.db.backup
```

---

## Security Checklist

- [ ] Set a strong `QINGCLAWS_JWT_SECRET` (32+ characters)
- [ ] Set `QINGCLAWS_GATEWAY_PASSWORD` for production
- [ ] Use `--bind loopback` unless LAN access is needed
- [ ] Enable TLS via reverse proxy (Nginx/Caddy) for public access
- [ ] Restrict PostgreSQL access to gateway instances only
- [ ] Rotate API keys periodically
- [ ] Monitor audit logs for suspicious activity
- [ ] Run as non-root user (the Docker image uses `node` user)
- [ ] Keep Node.js and dependencies updated

---

## Troubleshooting

### Gateway won't start

```bash
# Check port availability
lsof -i :18789

# Check logs
qingclaws gateway --verbose

# Validate config
qingclaws gateway --allow-unconfigured
```

### Database connection fails

```bash
# Test PostgreSQL connection
psql -U qingclaws -h localhost -d qingclaws -c "SELECT 1"

# Check migration status
pnpm db:migrate:status

# Re-run migrations
pnpm db:migrate
```

### Channel not connecting

```bash
# Check gateway status
qingclaws gateway status

# Check channel health via RPC
qingclaws gateway call tenant.channels.list
```
