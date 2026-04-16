# Devise-CAD: AI Governance & Monitoring Platform

**A comprehensive, multi-tier platform for monitoring AI tool usage, managing organizational spend, tracking event logs, and enforcing AI governance policies across enterprise environments.**

![Status](https://img.shields.io/badge/Status-Beta-yellow) ![Node](https://img.shields.io/badge/Node-18+-green) ![Python](https://img.shields.io/badge/Python-3.10+-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Overview

Devise-CAD is a **4-tier AI governance platform** designed to:

- 🔍 **Monitor AI Tool Usage** - Track ChatGPT, Claude, Cursor, and other AI tools in real-time
- 📊 **Analytics & Dashboards** - Real-time analytics with live feed and event tracking
- 🛡️ **Governance Enforcement** - JSON-RPC threat detection and ToolGuard protection
- 💼 **Spend Management** - Track organizational AI tool spend and usage patterns
- 🔐 **Enterprise Security** - Auth0 JWT validation, Row-Level Security, multi-tenant support
- ⛓️ **Audit Trail** - Blockchain-style append-only audit ledger

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                                 │
│                    (React Vite Dashboard)                            │
│                      localhost:5173 / 8081                           │
└────────────────┬────────────────────────┬──────────────────────────┘
                 │                        │
            Auth0 JWT              Supabase Client
                 │                        │
┌────────────────▼────────────────────────▼──────────────────────────┐
│              FRONTEND (React 18 + Vite)                              │
│  ├─ AuthContext (Auth0 integration)                                 │
│  ├─ Dashboard (Devices, Alerts, Analytics, LiveFeed)                │
│  ├─ TanStack Query (server state management)                        │
│  └─ Real-time Subscriptions (Supabase WebSocket)                    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ Auth0 JWT + JSON-RPC
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              MCP GATEWAY (Fastify, localhost:3001)                   │
│  ├─ Auth0 JWT Verification (JWKS client)                            │
│  ├─ Rate Limiting (100 req/min per client)                          │
│  ├─ ToolGuard: Payload inspection & threat detection                │
│  ├─ Blockchain-based Audit Ledger (append-only SHA-256 chain)       │
│  └─ Error handling & validation                                     │
└──────────────────────┬────────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────────────┐
         ▼             ▼                     ▼
    Supabase      FastAPI              Auth0
   PostgreSQL    (localhost            JWT/OIDC
    + RLS          :8000)              Tokens
```

---

## 🚀 Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS + Radix UI** - Styling & accessible components
- **Auth0** - JWT-based authentication
- **TanStack Query** - Server state & data fetching
- **Supabase Client** - Real-time WebSocket subscriptions
- **React Router** - Client-side routing

### MCP Gateway (Middleware)
- **Fastify** - Fast Node.js web framework
- **TypeScript** - Type safety
- **Auth0 JWKS Client** - JWT validation
- **Rate Limiter** - Request throttling
- **ToolGuard** - Payload inspection & threat detection
- **Supabase Client** - Audit ledger storage

### Backend API
- **FastAPI** (Python) - Asynchronous web framework
- **Uvicorn** - ASGI server
- **Supabase SDK** - PostgreSQL ORM & authentication
- **Pydantic V2** - Data validation

### Desktop Agent
- **Python 3.10+** - Process & DNS monitoring
- **Windows Registry** - System monitoring
- **Firewall Monitoring** - Network policy enforcement
- **AI Tools Detection** - ChatGPT, Claude, Cursor detection

### Database & Auth
- **Supabase PostgreSQL** - Primary data store with RLS
- **Auth0** - JWT token management & OIDC

---

## 📂 Project Structure

```
Devise-CAD/
├── frontend/                    # Complete React Vite frontend (All-in-One)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Devices.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Alerts.tsx
│   │   │   ├── LiveFeed.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── landing/              # Landing pages
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   ├── AboutPage.tsx
│   │   │   │   ├── DemoPage.tsx
│   │   │   │   └── ...
│   │   │   └── mcp/                  # MCP Dashboard (Integrated)
│   │   │       ├── pages/
│   │   │       │   ├── MCPOverviewPage.tsx
│   │   │       │   ├── MCPAlertsPage.tsx
│   │   │       │   ├── MCPAnalyticsPage.tsx
│   │   │       │   ├── MCPCallsPage.tsx
│   │   │       │   ├── MCPThreatLogPage.tsx
│   │   │       │   ├── MCPSettingsPage.tsx
│   │   │       │   ├── MCPRegistryPage.tsx
│   │   │       │   ├── MCPPoliciesPage.tsx
│   │   │       │   └── MCPIdentityPage.tsx
│   │   │       ├── layout/
│   │   │       │   ├── MCPShell.tsx
│   │   │       │   ├── MCPSidebar.tsx
│   │   │       │   └── MCPTopBar.tsx
│   │   │       ├── components/
│   │   │       │   ├── analytics/, alerts/, calls/, identity/
│   │   │       │   ├── overview/, policies/, registry/, shared/
│   │   │       │   └── threats/
│   │   │       ├── hooks/
│   │   │       ├── types/
│   │   │       ├── router.tsx
│   │   │       └── index.tsx
│   │   ├── components/          # Shared components
│   │   ├── hooks/               # Shared hooks (useDashboard, use-mobile, use-toast)
│   │   ├── services/            # API service clients
│   │   ├── lib/                 # Utilities (AuthContext, Supabase, utils)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── mcp-gateway/                  # Fastify middleware gateway
│   ├── server.ts                # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── migrations/              # Supabase audit ledger SQL
│
├── api/                          # FastAPI backend entry point
│   └── index.py                 # Vercel ASGI handler
│
├── devise-agent/
│   └── devise-eye/              # Python desktop agent
│       ├── main.py              # Entry point
│       ├── detector.py          # AI tools detector
│       ├── process_resolver.py
│       ├── dns_resolver.py
│       ├── firewall_monitor.py
│       └── requirements.txt
│
├── docs/                        # Documentation
│   ├── PROJECT_DETAILS.md
│   ├── codebase_context.md
│   └── backend-overview.md
│
├── RUNNING_AND_TESTING.md       # Complete setup & test guide
├── AUDIT_REPORT.md              # Security & code quality audit
├── README.md                    # This file
├── package.json                 # Root workspace config
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables template
├── .gitignore
└── start.bat                    # Windows batch script to launch all services
```

> **📌 Note**: The **complete frontend** (including the MCP Dashboard) is **consolidated in a single `frontend/` folder**. All dashboard pages, components, hooks, and utilities are organized within `frontend/src/pages/mcp/` and integrated into the main React application.

---

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - For frontend & MCP gateway
- **Python 3.10+** - For backend API & desktop agent
- **Supabase Account** - https://supabase.com (PostgreSQL database + auth)
- **Auth0 Account** - https://auth0.com (JWT token management)
- **Git** - For version control

### Required Accounts & Services

| Service | Purpose | Link |
|---------|---------|------|
| Supabase | PostgreSQL database, RLS, real-time | https://app.supabase.com |
| Auth0 | JWT token management, OIDC | https://manage.auth0.com |
| GitHub | Code repository | https://github.com |

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/Yash13606/Devise-CAD.git
cd Devise-CAD
```

### 2. Install All Dependencies

**Option A: Automated (Recommended)**
```bash
npm run install:all
```

**Option B: Manual**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install MCP gateway dependencies
cd ../mcp-gateway
npm install

# Install backend dependencies (from root)
cd ..
pip install -r requirements.txt

# Install agent dependencies
cd devise-agent/devise-eye
pip install -r requirements.txt
```

### 3. Environment Configuration

Create `.env` files in each directory:

**`frontend/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-gateway.example.com
VITE_GATEWAY_URL=http://localhost:3001
```

**`mcp-gateway/.env`**
```env
FASTIFY_PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=https://your-gateway.example.com
JWKS_URI=https://your-domain.auth0.com/.well-known/jwks.json
```

**`api/.env`** (if using FastAPI backend)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AUTH0_DOMAIN=your-domain.auth0.com
```

### 4. Configure Supabase

1. Create required tables:
   - `audit_ledger` - Append-only audit trail
   - `devices` - Connected devices
   - `events` - Event logs
   - `organizations` - Multi-tenant support

2. Enable RLS policies:
   ```sql
   -- Example RLS policy for multi-tenant isolation
   ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY org_isolation ON public.events
     FOR ALL USING (org_id = auth.uid()::text);
   ```

3. Migration file available at: `mcp-gateway/migrations/01_mcp_audit_ledger.sql`

---

## 🚀 Running the Project

### Quick Start (All Services at Once)

**Windows:**
```bash
npm start
```

This launches all 4 services simultaneously:
- **Frontend:** http://localhost:5173 (or 8081)
- **MCP Gateway:** http://localhost:3001
- **FastAPI Backend:** http://localhost:8000
- **Desktop Agent:** Runs in background

**macOS/Linux:**
```bash
npm start
```

### Individual Services

**Frontend Only:**
```bash
cd frontend
npm run dev
# Accessible at http://localhost:5173
```

**MCP Gateway Only:**
```bash
cd mcp-gateway
npx tsx server.ts
# Accessible at http://localhost:3001
```

**Backend API Only:**
```bash
python -m uvicorn api.index:app --reload --port 8000
# Swagger docs at http://localhost:8000/docs
```

**Desktop Agent Only:**
```bash
cd devise-agent/devise-eye
python main.py
```

---

## 🧪 Testing & Verification

See [RUNNING_AND_TESTING.md](./RUNNING_AND_TESTING.md) for comprehensive testing guide including:

- ✅ Authentication flow verification
- ✅ Gateway JWT validation
- ✅ Rate limiting tests
- ✅ ToolGuard payload inspection
- ✅ Audit ledger chain verification
- ✅ Real-time subscription testing
- ✅ Multi-tenant RLS validation
- ✅ Frontend integration tests
- ✅ Full E2E workflow

---

## 📊 Dashboard Usage

Once running, navigate to `http://localhost:5173`:

1. **Login** - Sign in with Auth0
2. **Dashboard** - View real-time analytics
3. **Devices** - Monitor connected agents
4. **Alerts** - View security alerts & ToolGuard blocks
5. **Analytics** - Track AI tool usage & spend
6. **Live Feed** - Real-time event stream

---

## 🔐 Security Considerations

### Current Status ⚠️

The platform has **5 CRITICAL security issues** that must be fixed before production:

1. ⚠️ **Supabase key exposure** - Frontend uses SERVICE_ROLE_KEY instead of ANON_KEY
2. ⚠️ **CORS misconfiguration** - Accepts all origins (`*`)
3. ⚠️ **JWT verification bypass** - Promise handling bug in auth middleware
4. ⚠️ **ToolGuard trivially bypassable** - String matching only (insufficient)
5. ⚠️ **Auth0 audience mismatch** - Gateway JWT validation always fails

**See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for detailed findings and fixes.**

### Best Practices Implemented

✅ Row-Level Security (RLS) on all tables  
✅ JWT token validation via JWKS  
✅ Rate limiting (100 req/min)  
✅ Audit trail (append-only ledger)  
✅ TypeScript type safety  
✅ Environment variable validation  

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [RUNNING_AND_TESTING.md](./RUNNING_AND_TESTING.md) | Complete setup, configuration & testing guide |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Security audit, code quality findings, fix recommendations |
| [docs/PROJECT_DETAILS.md](./docs/PROJECT_DETAILS.md) | Project overview & tech stack |
| [docs/backend-overview.md](./docs/backend-overview.md) | FastAPI backend architecture |
| [docs/codebase_context.md](./docs/codebase_context.md) | Codebase context & structure |

---

## 🐛 Known Issues & Roadmap

### Phase 1: Critical Security Fixes 🔴
- [ ] Fix Supabase key exposure (use ANON_KEY in frontend)
- [ ] Fix CORS policy (restrict to allowed origins)
- [ ] Fix JWT verification promise handling
- [ ] Improve ToolGuard detection (ML-based, not string matching)
- [ ] Fix Auth0 audience configuration

### Phase 2: High-Priority Fixes 🟠
- [ ] Fix Vite dev server port configuration
- [ ] Improve error handling (ledger insert failures)
- [ ] Add Supabase connection validation

### Phase 3: Medium-Priority Improvements 🟡
- [ ] Add real-time subscription cleanup
- [ ] Add Redis-backed rate limiter
- [ ] Add TypeScript strict type safety
- [ ] Add environment variable validation on startup

### Phase 4: Testing & Documentation 🔵
- [ ] Add comprehensive test suite
- [ ] Add CI/CD pipeline
- [ ] Add Docker support
- [ ] Add Kubernetes deployment

---

## 🤝 Contributing

1. **Create a branch** - `git checkout -b feature/your-feature`
2. **Make changes** - Implement your feature
3. **Run tests** - Verify everything works
4. **Commit** - `git commit -am "Add feature description"`
5. **Push** - `git push origin feature/your-feature`
6. **Submit PR** - Create a Pull Request

---

## 📝 Development Workflow

### Setting Up for Development

```bash
# Install dev dependencies
npm run install:all

# Copy environment templates
cp .env.example frontend/.env
cp .env.example mcp-gateway/.env

# Start development servers
npm start

# In another terminal, run tests
npm run test
```

### Code Style

- **Frontend:** ESLint + Prettier (React/TypeScript)
- **MCP Gateway:** ESLint + Prettier (Fastify/TypeScript)
- **Backend:** Black formatter (Python)
- **Git:** Conventional commits (feat:, fix:, docs:, etc.)

---

## 📞 Support & Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process
taskkill /PID <PID> /F
```

**Auth0 Token Invalid**
- Verify JWKS URI is correct
- Check Auth0 Application settings
- Ensure audience matches config

**Supabase Connection Error**
- Check database URL format
- Verify API key permissions
- Test connection at https://app.supabase.com

**Frontend Can't Connect to Gateway**
- Check CORS configuration
- Verify gateway is running on port 3001
- Check network connectivity

See [RUNNING_AND_TESTING.md](./RUNNING_AND_TESTING.md#troubleshooting) for more troubleshooting tips.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**Maintainers:**
- Yash Sharma ([@Yash13606](https://github.com/Yash13606))

---

## 🔗 Links

- **GitHub Repository:** https://github.com/Yash13606/Devise-CAD
- **Supabase Documentation:** https://supabase.com/docs
- **Auth0 Documentation:** https://auth0.com/docs
- **Fastify Documentation:** https://www.fastify.io/docs
- **React Documentation:** https://react.dev
- **FastAPI Documentation:** https://fastapi.tiangolo.com

---

**Last Updated:** April 16, 2026  
**Status:** ⚠️ Beta (Security fixes required before production)
