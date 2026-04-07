# Devise — AI Governance Platform

---

## Architecture

```
[Browser] ──→ chatgpt.com / claude.ai / qwen.ai / ...
                      │
            [Desktop Agent]  ← Python, psutil
              Detects AI tool via DNS cache + registry
                      │
                      ▼
              [Supabase DB]
        detection_events / heartbeats / firewall_rules
           Realtime WebSocket ──→ [Dashboard]
                                  localhost:8081

[MCP Gateway]  localhost:3001
  Auth0 JWT verification + audit logging
```

---

## Requirements

- Node.js 18+
- Python 3.10+
- Supabase project
- Auth0 application

---

## Install

```bash
cd frontend && npm install
pip install -r requirements.txt
```

---

## Environment Files

**`frontend/.env`**
```
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**`mcp/.env`**
```
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
```

**`devise-agent/devise-eye/.env`**
```
SUPABASE_URL=
SUPABASE_KEY=          # use service role key
```

---

## Auth0 Setup

Go to Auth0 Dashboard → Applications → your app → Settings.

Add `http://localhost:8081` to:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

---

## Supabase Tables

Run once in SQL Editor:

```sql
-- Required tables (agent writes to these)
-- detection_events  — 27 columns (see schema in /docs)
-- heartbeats        — 7 columns
-- firewall_rules    — 6 columns

-- Enable Realtime on all three tables
-- Database → Replication → toggle on
```

---

## Run

```bash
.\start.bat
```

Starts:

| Service | URL |
|---|---|
| Frontend | http://localhost:8081 |
| MCP Gateway | http://localhost:3001 |
| Desktop Agent | background |

---

## Detection Flow

```
Connection detected (psutil)
  → Phase 0: Windows DNS cache  (exact domain lookup)
  → Phase 1: Preloaded IP map   (dedicated IPs only)
  → Phase 2: Reverse DNS        (fallback)
  → Registry match → POST to Supabase → Dashboard updates
```

Registry: `devise-agent/devise-eye/data/ai_tools_registry.json` — 186+ tools

---

## Project Layout

```
devise-cad/
├── frontend/                  # React + Vite dashboard
│   ├── src/services/api.ts    # Supabase queries
│   ├── src/hooks/useDashboard.ts
│   └── .env
├── mcp/
│   ├── server.ts              # Fastify + JWT
│   └── .env
├── devise-agent/devise-eye/
│   ├── main.py                # Detection loop
│   ├── registry.py            # Tool matching
│   ├── reporter.py            # Supabase writer
│   ├── data/ai_tools_registry.json
│   └── .env
└── start.bat
```
