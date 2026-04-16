# Devise-CAD: Complete Running & Testing Guide

## 📋 System Architecture Overview

Devise-CAD is a **4-tier AI governance platform** with interconnected components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                                 │
│                    (React Vite Dashboard)                            │
│                      localhost:5173                                  │
└────────────────┬────────────────────────┬──────────────────────────┘
                 │                        │
            Auth0 JWT              Supabase Client
                 │                        │
┌────────────────▼────────────────────────▼──────────────────────────┐
│                    DESKTOP AGENT (Python)                           │
│           Monitors: DNS, Processes, Registry, Firewall             │
│                 Sends Events via MCP Gateway                        │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ Auth0 JWT + JSON-RPC
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              MCP GATEWAY (Fastify, localhost:3001)                   │
│  ├─ Rate Limiting (100 req/min)                                     │
│  ├─ Auth0 JWT Verification (JWKS)                                   │
│  ├─ ToolGuard: Payload inspection (blocks malicious JSON-RPC)       │
│  └─ Blockchain-based Audit Ledger (append-only)                     │
└──────────────────────┬────────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    Supabase      FastAPI       Auth0
   PostgreSQL    (localhost     JWT/OIDC
                  :8000)
```

---

## 🚀 Quick Start (All-in-One)

### Prerequisites
- **Node.js 18+** (for frontend + MCP gateway)
- **Python 3.10+** (for backend + agent)
- **Supabase Project** (with tables + RLS enabled)
- **Auth0 Application** (with JWT keys configured)
- **.env files** configured in all 3 services

### Start Everything at Once

**Option 1: Using root start script**
```powershell
# Run this from the root directory
npm start
```

This runs 4 processes in parallel:
- Frontend (npm run dev)
- MCP Gateway (npx tsx server.ts)
- Backend API (uvicorn)
- Desktop Agent (python main.py)

**Option 2: Using batch file (Windows)**
```cmd
start.bat
```

**Option 3: Manual (one terminal per component)**

Terminal 1 - Frontend:
```powershell
cd frontend
npm install  # If first time
npm run dev
```

Terminal 2 - MCP Gateway:
```powershell
cd mcp-gateway
npm install  # If first time
npx tsx server.ts
```

Terminal 3 - Backend API:
```powershell
pip install -r requirements.txt  # If first time
python -m uvicorn api.index:app --reload --port 8000
```

Terminal 4 - Desktop Agent:
```powershell
cd devise-agent/devise-eye
pip install -r requirements.txt  # If first time
python main.py
```

---

## 📍 Component Breakdown & URLs

| Component | Port | Start Command | Purpose |
|-----------|------|---------------|---------|
| **Frontend** | 5173 | `cd frontend && npm run dev` | React dashboard UI, auth, real-time data |
| **MCP Gateway** | 3001 | `cd mcp-gateway && npx tsx server.ts` | Auth0 JWT verification, rate limiting, audit logging |
| **Backend API** | 8000 | `python -m uvicorn api.index:app --reload` | Vercel serverless entry point (forwards to FastAPI) |
| **Agent** | N/A | `cd devise-agent/devise-eye && python main.py` | DNS/process detector, event reporter |

### Testing Each Component

#### **Frontend (React)**
```powershell
cd frontend

# Development with HMR
npm run dev

# Run tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Access:** http://localhost:5173  
**Expected:** Login page redirects to Auth0 → Dashboard with empty data (until agent runs)

---

#### **MCP Gateway (Fastify)**
```powershell
cd mcp-gateway

# Install dependencies
npm install

# Run with TypeScript (requires tsx)
npx tsx server.ts

# Test the gateway with curl
# 1. Get an Auth0 token (or use test token from test-gateway.js)
# 2. Send JSON-RPC:
curl -X POST http://localhost:3001/rpc \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"test","params":{}}'
```

**What it does:**
1. Validates Auth0 JWT tokens via JWKS endpoint
2. Rate-limits requests (100/min per user)
3. Inspects JSON-RPC payloads for malicious code (blocks "rm -rf", "system(", etc.)
4. Appends immutable hash-chain audit entries to `mcp_audit_ledger` table
5. Routes legitimate requests to Supabase

**Test file:** `mcp-gateway/test-gateway.js`
```powershell
node test-gateway.js
```

---

#### **Backend API (FastAPI)**
```powershell
# Install Python dependencies
pip install -r requirements.txt

# Run with Uvicorn
python -m uvicorn api.index:app --reload --port 8000

# Run specific tests
python -m pytest tests/ -v
```

**What it serves:**
- ASGI bridge to FastAPI application
- Endpoints for Supabase real-time data sync
- Health check at `/health`

**Access:** http://localhost:8000/docs (auto-generated Swagger UI)

---

#### **Desktop Agent (Python)**
```powershell
cd devise-agent/devise-eye

# Install dependencies
pip install -r requirements.txt

# Run the main agent
python main.py

# Run tests
python persistent_test.py    # Simulates a long-lived connection
python trigger_test.py       # Triggers detection events
python generate_traffic.py   # Generates fake DNS events
python generate_traffic_fast.py
```

**What it monitors:**
- DNS queries (system or DoH via Cloudflare)
- Running processes (all user processes)
- Windows Registry (AI tool installations)
- Firewall rules
- File events (tampering)

**Output:** Sends detection events to MCP Gateway → Supabase → Frontend (real-time WebSocket)

**Config file:** `devise-agent/devise-eye/config.py`

---

## 🧪 End-to-End Testing Workflow

### **Test 1: Frontend → Dashboard Loads**
```
1. Start frontend: npm run dev (port 5173)
2. Open browser: http://localhost:5173
3. Expected: Auth0 login redirect OR dashboard with empty data
4. If Auth0 redirect fails: Check VITE_AUTH0_* vars in frontend/.env
```

### **Test 2: MCP Gateway Auth Works**
```powershell
# Terminal at root
cd mcp-gateway

# Run test script
node test_out.txt  # Pre-generated output from test-gateway.js

# Or manually:
node test-gateway.js
```

**Expected output:**
```
[TEST 1] Sending Safe Payload...
Response: {"status":"success","proxied":true}

[TEST 2] Sending Malicious Payload (rm -rf)...
Response: {"error":"ToolGuard Access Denied"}
```

### **Test 3: Agent → Backend → Supabase**
```powershell
# Terminal 1: Start agent
cd devise-agent/devise-eye
python main.py

# Terminal 2: Trigger a detection event
cd devise-agent/devise-eye
python persistent_test.py

# Terminal 3: Watch the database
# In another browser tab, open Supabase dashboard
# Supabase → Tables → detection_events
# You should see new rows appearing in real-time
```

**What happens:**
1. Agent monitors DNS and processes every 30 seconds
2. `persistent_test.py` connects to ChatGPT (triggers detection)
3. Agent builds event JSON with: process, domain, timestamp, risk
4. Agent reports via MCP Gateway (with Auth0 token)
5. MCP Gateway validates + appends to audit ledger
6. Event stored in Supabase `detection_events` table
7. Frontend subscribes to table → real-time update via WebSocket

### **Test 4: Real-Time Data Flow (Complete Loop)**
```
1. Start all 4 components (npm start or start.bat)
2. Open browser: http://localhost:5173
3. In another terminal, trigger agent tests:
   cd devise-agent/devise-eye
   python persistent_test.py
4. Watch the dashboard update in real-time:
   - Live Feed tab shows new detection event
   - Analytics tab updates domain/process counts
   - Alerts tab flags suspicious activity (if configured)
```

### **Test 5: Rate Limiting**
```powershell
# From mcp-gateway directory
node -e "
const http = require('http');
const token = 'Bearer test-token';

for (let i = 0; i < 110; i++) {
  const req = http.request('http://localhost:3001/rpc', {
    method: 'POST',
    headers: { 'Authorization': token }
  });
  req.on('response', r => console.log('Req', i, '→', r.statusCode));
  req.end();
}
"
```

**Expected:** First 100 succeed (200), next 10 blocked (429 Too Many Requests)

---

## ✅ Cross-Checking Everything

### **Component Health Checklist**

#### 1. **Frontend Health**
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:5173 loads
- [ ] Auth0 redirect works (or demo mode shows data)
- [ ] Dashboard renders without console errors
- [ ] `npm run lint` passes (ESLint)
- [ ] `npm test` passes (Vitest)

```powershell
cd frontend
npm run lint  # Check for code issues
npm test      # Run test suite
```

#### 2. **MCP Gateway Health**
- [ ] `npx tsx server.ts` starts without errors
- [ ] http://localhost:3001/health responds
- [ ] `node test-gateway.js` completes successfully
- [ ] Auth0 JWT validation works
- [ ] Rate limiter correctly blocks after 100 req/min
- [ ] Malicious payloads are blocked by ToolGuard

```powershell
cd mcp-gateway

# Check if server is running
curl http://localhost:3001/health

# Run test suite
node test-gateway.js

# Check dependencies
npm list
```

#### 3. **Backend API Health**
- [ ] `python -m uvicorn api.index:app --reload` starts without errors
- [ ] http://localhost:8000/docs loads (Swagger UI)
- [ ] Health endpoint responds: `curl http://localhost:8000/health`
- [ ] Can connect to Supabase (check logs for connection errors)
- [ ] Vercel deployment works (via `/api/index.py`)

```powershell
# Check Swagger docs
# Open: http://localhost:8000/docs

# Check if FastAPI app is working
python -c "
import sys; sys.path.insert(0, '.')
from api.index import app
print('FastAPI app imported successfully')
"
```

#### 4. **Desktop Agent Health**
- [ ] `python main.py` starts without errors in 2-3 seconds
- [ ] Agent prints: "DeviseAgent initialized"
- [ ] Config loads successfully (check for warnings)
- [ ] Can reach Supabase (check connection logs)
- [ ] DNS resolver initialized (system or DoH)
- [ ] Process detector is scanning

```powershell
cd devise-agent/devise-eye

# Run with verbose logging (check main.py for logging config)
python main.py

# Run in another terminal to trigger events
python persistent_test.py  # Should see detection event in agent logs
```

#### 5. **Database (Supabase)**
- [ ] Tables exist: `detection_events`, `heartbeats`, `firewall_rules`, `mcp_audit_ledger`
- [ ] RLS is enabled on all tables
- [ ] Service role key has full access
- [ ] Anon key is restricted (for frontend)
- [ ] Realtime subscriptions enabled

```powershell
# Check Supabase tables
# Open Supabase dashboard → Editor → Tables
# Verify: detection_events, heartbeats, firewall_rules, mcp_audit_ledger

# Check RLS policies
# Supabase → Authentication → Policies
# Should see policies for org_id isolation
```

#### 6. **Auth0**
- [ ] Application exists in Auth0 dashboard
- [ ] Localhost callback URLs configured:
  - `http://localhost:8081` (Frontend)
  - `http://localhost:5173` (Vite frontend)
  - Others as needed
- [ ] JWT keys available via JWKS endpoint: `https://{AUTH0_DOMAIN}/.well-known/jwks.json`
- [ ] Service role key configured in MCP Gateway

```powershell
# Test Auth0 connectivity
# From mcp-gateway directory:
curl https://dev-s60cj2o8lvkdxrcp.us.auth0.com/.well-known/jwks.json | jq .
```

---

## 🔍 Debugging & Logs

### **Where to Check Logs**

**Frontend Console:**
- Press F12 in browser
- Check Console, Network, Application tabs
- Look for CORS errors, auth failures, WebSocket errors

**MCP Gateway:**
- Terminal output shows Fastify logs
- Check for "ToolGuard" blocks, rate limit hits
- Look for JWT validation errors

**Backend API:**
- Terminal output shows Uvicorn logs
- Check for database connection errors
- FastAPI logs all requests/responses

**Desktop Agent:**
- Terminal output shows detection events
- Check config loading (yellow warnings)
- Look for connection errors to Supabase
- `persistent_test.py` output shows detection

**Supabase:**
- Go to SQL Editor → Run `SELECT * FROM detection_events LIMIT 10`
- Check `mcp_audit_ledger` for hash chain integrity
- Monitor table size in Settings → Database

### **Common Issues & Fixes**

| Issue | Cause | Fix |
|-------|-------|-----|
| Frontend shows login loop | Auth0 callback URL not set | Add http://localhost:5173 to Auth0 Allowed URLs |
| MCP Gateway won't start | Port 3001 in use | `lsof -i :3001` to find process, kill it |
| Agent can't reach Supabase | Invalid URL or key in .env | Check SUPABASE_URL and SUPABASE_KEY in `.env` |
| Events not appearing in dashboard | Agent not reporting | Run `python persistent_test.py` to trigger events |
| Rate limit errors | Too many requests from same user | Wait 60 seconds or check rate limiter config |
| JWT validation fails | Auth0 token expired or invalid | Get new token, check JWKS endpoint connectivity |

---

## 📊 Verification Checklist (Final)

Run this checklist to ensure everything is working end-to-end:

```powershell
# 1. Check all services start
npm start
# Expected: 4 processes start with no fatal errors

# 2. Check frontend
curl http://localhost:5173 | head -20
# Expected: HTML response with Vite bundle

# 3. Check MCP Gateway
curl http://localhost:3001/health
# Expected: Some response (check logs for 401 if no auth)

# 4. Check Backend API
curl http://localhost:8000/docs
# Expected: Swagger UI HTML

# 5. Check Supabase connectivity
curl https://kapxcpomhmbaoxujwync.supabase.co/rest/v1/detection_events?limit=1 \
  -H "apikey: YOUR_SUPABASE_ANON_KEY"
# Expected: JSON array or 401 (if RLS denies, that's ok)

# 6. Trigger agent detection
cd devise-agent/devise-eye
python persistent_test.py
# Expected: Agent logs detection event

# 7. Check event in Supabase
# Go to Supabase Dashboard → detection_events table
# Should see new row with detected domain/process

# 8. Check frontend real-time
# Open http://localhost:5173 in browser
# Go to "Live Feed" tab
# Should see detection event appear within 2 seconds
```

---

## 🎯 Summary

**To run Devise-CAD:**
1. Set up 3 `.env` files (Auth0, Supabase credentials)
2. Run `npm start` from root (or `start.bat` on Windows)
3. Access dashboard at http://localhost:5173
4. Trigger agent with `python persistent_test.py`
5. Watch events flow through: Agent → Gateway → Supabase → Dashboard

**To verify everything works:**
1. All 4 components start without errors
2. Frontend loads and shows auth UI
3. MCP Gateway validates requests
4. Agent sends detection events
5. Events appear in Supabase in real-time
6. Dashboard updates with live data

**Key files:**
- Root start: `start.bat` or `npm start`
- Frontend: `frontend/package.json` → `npm run dev`
- Gateway: `mcp-gateway/server.ts` → `npx tsx server.ts`
- API: `api/index.py` → `python -m uvicorn api.index:app`
- Agent: `devise-agent/devise-eye/main.py` → `python main.py`
- Tests: `persistent_test.py`, `trigger_test.py`, `generate_traffic.py`
