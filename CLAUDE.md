# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is QingClaws

QingClaws is an **enterprise containerized platform for digital AI Employees**, extending QingClaws (a personal AI assistant) into a multi-tenant system with concurrent task execution, user isolation, hierarchical memory, skill sharing, and audit capabilities. Built on TypeScript/Node.js with a gateway server architecture.

### Key directories

| Directory | Purpose |
|-----------|---------|
| `src/cli/` | CLI wiring (Commander.js) |
| `src/commands/` | Agent, channel, config, cron, skill commands |
| `src/gateway/` | WebSocket/HTTP server, auth, protocol, channel mgmt |
| `src/agents/` | Agent runtime, Pi integration, tool/skill loading |
| `src/providers/` | Model provider APIs (Anthropic, OpenAI, Gemini, Qwen, etc.) |
| `src/db/` | PostgreSQL + SQLite models |
| `src/auth/` | JWT, RBAC, pairing, device management |
| `src/channels/` | Shared channel logic, transport, routing |
| `ui/src/` | Lit web components |
| `extensions/*/` | Channel plugins (pnpm workspace packages) |
| `skills/` | Pre-built AI skills |

> Build commands, code conventions, multi-agent safety rules, and extension guidelines are in `AGENTS.md`.

---

@AGENTS.md
@CLAUDE.local.md
