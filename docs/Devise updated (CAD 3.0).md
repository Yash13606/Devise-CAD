# DEVISE
## The Complete Enterprise AI Governance Platform

> *See every tool. Control every connection. Govern every risk. Control every rupee.*

---

## Table of Contents

1. [The One-Paragraph Vision](#1-the-one-paragraph-vision)
2. [The Problem — Ground Reality](#2-the-problem--ground-reality)
3. [The Solution — What Devise Does](#3-the-solution--what-devise-does)
4. [The Two Layers Explained](#4-the-two-layers-explained)
5. [Complete Architecture](#5-complete-architecture)
6. [How It Works — End to End](#6-how-it-works--end-to-end)
7. [Product Components](#7-product-components)
8. [Detection Flow — Layer 1 (OS Agent)](#8-detection-flow--layer-1-os-agent)
9. [Enforcement Flow — Layer 2 (MCP Gateway)](#9-enforcement-flow--layer-2-mcp-gateway)
10. [Dashboard — What the Admin Sees](#10-dashboard--what-the-admin-sees)
11. [The Competitive Landscape](#11-the-competitive-landscape)
12. [Why Devise Wins](#12-why-devise-wins)
13. [Market Size and Validation](#13-market-size-and-validation)
14. [Business Model](#14-business-model)
15. [Go-To-Market Strategy](#15-go-to-market-strategy)
16. [Ideal Customer Profile](#16-ideal-customer-profile)
17. [Technical Stack](#17-technical-stack)
18. [Roadmap](#18-roadmap)
19. [Moats and Defensibility](#19-moats-and-defensibility)
20. [Risks and Mitigations](#20-risks-and-mitigations)
21. [What Success Looks Like](#21-what-success-looks-like)

---

## 1. The One-Paragraph Vision

Devise is the enterprise AI governance platform that gives companies complete visibility and control over every AI tool their employees use — from a junior developer running a Python script that calls the OpenAI API, to a product manager using ChatGPT in Chrome, to an agentic AI system using MCP to connect to your company's GitHub, Slack, and Postgres databases. Two lightweight agents — a browser extension and a desktop app — monitor OS-level network activity and report every AI tool interaction to a central dashboard. A built-in MCP gateway sits between AI clients and the tools they connect to, enforcing identity, access control, and real-time threat detection. Employees keep working. IT finally sees everything. Security finally controls everything. Leadership finally has the data to understand what AI is actually costing and delivering.

---

## 2. The Problem — Ground Reality

### The Shadow AI Crisis

The enterprise AI problem is not that AI is being used. It is that AI is being used everywhere, by everyone, with no visibility, no control, and no accountability.

**The data is brutal:**
- 71% of office workers admit to using AI tools without IT approval
- 57% of employees using free-tier AI tools input sensitive company data — customer records, source code, legal documents, financial models
- Shadow AI incidents now account for 20% of all data breaches, with a cost premium of $670,000 over standard breaches
- The average organization has 269 unmanaged AI tools per 1,000 employees
- Enterprise AI spend rose 108% in 2025, averaging $1.2M per organization — 78% of IT leaders report unexpected charges from tools they did not sanction
- 10% of public MCP servers contain malicious behavior. The remaining 90% are technically exploitable

### Three Distinct Problems in One

**Problem 1 — The Visibility Gap**

IT and security have zero visibility. A CISO cannot answer: Which AI tools are our employees actually using? Who accessed what data through which model? Did anyone run a Python script calling the Anthropic API on customer data last Tuesday? Are we paying for 200 Copilot seats while only 40 are active?

The browser extension category partially solves browser-based AI usage. It misses everything else. GitHub Copilot in VS Code never opens a browser tab. Python scripts calling `api.openai.com` never go through a browser. Slack AI, Office Copilot, Cursor IDE — all invisible.

**Problem 2 — The Enforcement Gap**

Even organizations that detect AI usage have no enforcement layer. They can see that an employee connected to ChatGPT. They cannot stop a sensitive prompt from being submitted. They cannot enforce that only senior engineers can use tools with `high` risk ratings. They cannot automatically revoke AI tool access when an employee is offboarded.

**Problem 3 — The Agentic Layer Explosion**

MCP (Model Context Protocol) is now the universal standard for connecting AI agents to real enterprise systems — GitHub, Slack, Postgres, Notion, Linear, AWS, and 18,000+ others. Every major AI vendor supports it. Developers are connecting AI agents to production systems using personal API keys, bypassing every IAM policy the company has. This is not a future risk. It is happening right now, on every engineering team, at every company above 50 people.

The governance tools built for browsing ChatGPT are completely blind to the agentic layer. A Cursor agent that reads your entire codebase, opens GitHub issues, and posts to Slack — none of that shows up in a browser monitoring tool.

---

## 3. The Solution — What Devise Does

Devise solves all three problems with a single unified platform built on two layers:

**Layer 1 — Observation (Devise Eye)**
A lightweight OS-level desktop agent and browser extension that monitors every AI tool interaction across the entire device — browser tabs, IDE plugins, desktop apps, Python scripts, API calls — and reports structured telemetry to the dashboard. No content capture. Metadata only: which tool, which process, which user, when, how often.

**Layer 2 — Enforcement (Devise Gate)**
A transparent MCP gateway proxy that sits between AI clients (Cursor, Claude Code, VS Code, ChatGPT) and the MCP servers they connect to (GitHub, Slack, AWS, databases). Every AI agent call flows through the gateway — authenticated against company SSO, authorized against access policies, inspected for threats, and logged for audit.

Together: an organization can see every AI interaction at the OS level AND enforce security policy at the agentic connection level. No other product in the market does both.

---

## 4. The Two Layers Explained

### Layer 1 — Devise Eye (Observe Everything)

Devise Eye is a Python-compiled binary installed on every managed employee device via MDM. It runs silently as a background service. Every 30 seconds it:

- Enumerates all ESTABLISHED OS-level network connections using psutil
- Performs reverse DNS resolution on remote IPs to identify hostnames
- Matches hostnames against a bundled registry of 3,500+ AI tool domains
- Captures the process name and path responsible for each connection (`Code.exe`, `python3`, `slack.exe`)
- Resolves the logged-in user identity via MDM config or OS fallback
- Deduplicates events within 5-minute session windows
- Builds a structured DetectionEvent and POSTs it to the Devise backend
- Buffers events locally in SQLite when offline and flushes on reconnect

It also ships with a Chrome MV3 browser extension as a companion that catches browser-specific AI tool interactions with richer context (page title, session duration, tab switching).

**What it uniquely catches that nothing else does:**
- GitHub Copilot completions in VS Code → process: `Code.exe`
- Python scripts calling OpenAI/Anthropic API directly → process: `python3.exe`
- Slack AI → process: `slack.exe`
- Microsoft Copilot inside Word/PowerPoint → process: `WINWORD.exe`
- Cursor IDE → process: `cursor.exe`
- Any script or tool making HTTPS calls to AI API domains

### Layer 2 — Devise Gate (Control the Agentic Layer)

Devise Gate is a transparent MCP proxy gateway deployed in the organization's cloud (VPC) or as managed SaaS. Every MCP connection from AI clients routes through it with zero friction to the developer — same tools, same IDE, same workflows. The only change is authentication goes through company SSO instead of personal API keys.

**What it does on every MCP call:**
- Validates JWT tokens issued post-SSO (Okta, Entra, any OIDC provider)
- Checks the request against access policies (role, device, location, session)
- Runs real-time threat detection (tool poisoning, prompt injection, PII exfiltration, command injection)
- Routes to approved MCP servers only
- Logs the full interaction to the audit trail
- Blocks or allows in under 10ms on the hot path

---

## 5. Complete Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          EMPLOYEE DEVICES                                    ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  DEVISE EYE (Desktop Agent — Python Binary)                         │     ║
║  │                                                                     │     ║
║  │   APScheduler (30s)                                                 │     ║
║  │        │                                                            │     ║
║  │   psutil.net_connections()  ─────────────────────────────────────  │     ║
║  │        │                   All ESTABLISHED connections              │     ║
║  │   DNS Resolver (DoH)                                               │     ║
║  │        │                   IP → hostname                           │     ║
║  │   Registry Matcher                                                  │     ║
║  │        │                   hostname → AI tool metadata             │     ║
║  │   Process Resolver                                                  │     ║
║  │        │                   PID → Code.exe / python3 / slack        │     ║
║  │   Identity Resolver                                                 │     ║
║  │        │                   MDM config → user email + department    │     ║
║  │   Deduplicator (5min TTL)                                          │     ║
║  │        │                                                            │     ║
║  │   Event Builder → DetectionEvent JSON                              │     ║
║  │        │                                                            │     ║
║  │   Reporter ──── HTTPS POST ──────────────────────────────────────► │     ║
║  │        │                                                            │     ║
║  │   SQLite Buffer (offline queue, 10,000 events)                     │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  ┌─────────────────────────────┐                                            ║
║  │  DEVISE CHROME EXTENSION    │  Browser AI usage → richer context        ║
║  │  (MV3, webNavigation API)   │  (page title, session duration)           ║
║  └─────────────────────────────┘                                            ║
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────┐       ║
║  │  AI CLIENTS  (Cursor · Claude Code · VS Code · ChatGPT · Copilot)│       ║
║  └──────────────────┬─────────────────────────────────────────────┘        ║
║                     │ MCP JSON-RPC over TLS                                 ║
╚═════════════════════╪════════════════════════════════════════════════════════╝
                      │
                      ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                       DEVISE GATE (MCP GATEWAY)                              ║
║                                                                              ║
║  TLS Termination → JWT Validation → SSO Auth → Policy Engine                ║
║                                                                              ║
║  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  ║
║  │    Threat    │  │  Access Policy │  │   Identity   │  │   Audit Log  │  ║
║  │  Detection   │  │  Engine (OPA)  │  │  Okta/Entra  │  │  + Alerts    │  ║
║  │              │  │                │  │              │  │              │  ║
║  │ Tool poison  │  │ Role-based     │  │ SSO + SCIM   │  │ Full request │  ║
║  │ Prompt inject│  │ Device check   │  │ Auto-offboard│  │ trail export │  ║
║  │ PII detect   │  │ Location check │  │ ABAC         │  │ OpenTelemetry│  ║
║  │ Command inject│ │ Session scope  │  │ Conditional  │  │ Datadog/     │  ║
║  └──────────────┘  └────────────────┘  └──────────────┘  │ Splunk ready │  ║
║                                                           └──────────────┘  ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────┐                    ║
║  │  PRIVATE MCP REGISTRY                               │                    ║
║  │  Approved server catalog · Auto security scan       │                    ║
║  │  CVE tracking · Permission scope analysis           │                    ║
║  │  One-click install · IT controls, devs discover     │                    ║
║  └─────────────────────────────────────────────────────┘                    ║
╚═══════════════════════════════════════════════╪══════════════════════════════╝
                                               │
                      ─────────────────────────┘
                      │  Approved, verified MCP calls only
                      ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                    MCP SERVERS / CONNECTED TOOLS                             ║
║   GitHub │ Slack │ AWS Bedrock │ PostgreSQL │ Notion │ Linear │ 18,000+     ║
╚══════════════════════════════════════════════════════════════════════════════╝
                      │
                      │  All telemetry (Eye + Gate) converges
                      ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                     DEVISE BACKEND + DASHBOARD                               ║
║                                                                              ║
║  FastAPI (Railway) → Firebase Realtime DB → Devise Iris (Vercel)            ║
║                                                                              ║
║  DASHBOARD TABS:                                                             ║
║  Overview · Live Feed · Analytics · Devices · Alerts ·                      ║
║  Subscriptions · Team · Settings · MCP Registry · Threat Log                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 6. How It Works — End to End

### Scenario A — Employee Uses ChatGPT in Chrome

```
1. Employee opens chat.openai.com in Chrome
2. Devise Chrome Extension detects navigation to AI tool domain
3. Extension captures: URL, timestamp, session duration, tab context
4. Extension POSTs to Devise backend:
   source: "browser", tool: "ChatGPT", user: "alice@company.com"
5. Backend writes to Firebase → Dashboard Live Feed updates in real time
6. If tool is unapproved → Alert generated → Slack/Email webhook fires
```

### Scenario B — Developer Calls OpenAI API Directly from Python Script

```
1. Developer runs: python3 analysis.py (calls api.openai.com)
2. OS establishes TCP connection: python3.exe → 104.18.x.x:443
3. Devise Eye APScheduler fires (30s poll)
4. psutil.net_connections() captures the ESTABLISHED connection
5. DNS resolver: 104.18.x.x → api.openai.com
6. Registry match: api.openai.com → OpenAI API, category: api, risk: HIGH
7. Process resolver: PID 4821 → python3.exe, path: C:\Users\dev\scripts\
8. Identity: config.json → user_id: dev@company.com, dept: Engineering
9. Deduplicator: (OpenAI API + python3) not seen in last 5 min → report
10. Event built and POSTed to backend
11. Dashboard shows: python3.exe calling OpenAI API directly → HIGH RISK alert
12. This is the detection no browser tool can make
```

### Scenario C — AI Agent Connects to GitHub via MCP (Devise Gate)

```
1. Developer uses Cursor IDE with MCP configured
2. Cursor AI agent initiates MCP call to github-mcp-server
3. DNS resolves to Devise Gate gateway endpoint (org-configured)
4. Gateway intercepts MCP JSON-RPC request
5. JWT token extracted and validated against Okta/Entra JWKS
6. Identity confirmed: user = dev@company.com, role = engineer, device = compliant
7. Access policy checked (OPA engine):
   - github-mcp-server: approved ✓
   - scope: read-only repos ✓ (user role: engineer, not admin)
   - device compliance: passed ✓
8. Threat detection scan (async):
   - No tool poisoning patterns
   - No prompt injection in request
   - No PII detected in response
9. Request forwarded to github-mcp-server
10. Response returned to Cursor in <10ms overhead
11. Full interaction logged: user, tool call, params (sanitized), response metadata
12. Dashboard: complete agentic audit trail with risk score
```

### Scenario D — Malicious MCP Server Attempt Blocked

```
1. Developer installs unofficial "postgres-helper" MCP server from internet
2. Server is not in Devise Private Registry
3. Cursor tries to connect via MCP
4. Devise Gate intercepts: server not in approved catalog
5. Connection blocked — returns 403 with policy explanation
6. Alert generated: "Unapproved MCP server connection attempt"
7. IT admin sees alert, reviews server metadata
8. Admin rejects or approves and adds to registry
9. Developer notified of decision
```

---

## 7. Product Components

### 7.1 Devise Eye — Desktop Agent
- **Language:** Python 3.11, compiled to binary via PyInstaller
- **Install:** Single .exe (Windows) / .pkg (macOS) — MDM deployable
- **Detection:** psutil network scanning, process attribution, registry matching
- **Comms:** HTTPS POST to backend with X-Device-Key header
- **Offline:** SQLite queue, 10,000 event buffer, auto-flush on reconnect
- **Reliability:** OS service (NSSM/LaunchAgent), auto-restart, 99.9% uptime target
- **Privacy:** Zero content capture. Metadata only.

### 7.2 Devise Scan — Browser Extension
- **Type:** Chrome MV3, webNavigation API
- **Detection:** AI tool domain visits, session duration, tab context
- **Comms:** Same backend endpoint, source: "browser"
- **Future:** Firefox, Safari (V3 roadmap)

### 7.3 Devise Gate — MCP Gateway
- **Type:** Transparent MCP proxy (JSON-RPC 2.0 over SSE and Streamable HTTP)
- **Auth:** JWT + Okta/Entra OIDC, SCIM 2.0
- **Policy:** Open Policy Agent (OPA) with Rego rules — auditable, customizable
- **Threat Detection:** Tool poisoning, prompt injection, PII, command injection, rug-pull detection
- **Performance:** Sub-10ms p99 latency on hot path
- **Deployment:** Managed SaaS or self-hosted (Docker/Helm)
- **Latency budget:** Synchronous hard-blocks cached aggressively; threat detection async via queue

### 7.4 Devise Registry — Private MCP Catalog
- **Contents:** IT-approved MCP servers, scan results, risk scores, version pinning
- **Auto-scanning:** Static + dynamic security scan on every new server submission
- **CVE tracking:** Continuous monitoring of registered servers for new vulnerabilities
- **Permission analysis:** Flags overly broad OAuth/API scopes
- **Workflow:** Employee requests → IT reviews → approved with one click → auto-configured in MCP client

### 7.5 Devise Iris — Dashboard
- **Stack:** React 18 + TypeScript, Vite, TailwindCSS, shadcn-ui, Recharts
- **Backend:** FastAPI on Railway, Firebase Realtime Database
- **Auth:** Supabase GoTrue, JWT, RBAC, JWKS rotation-proof verification
- **Tabs:** Overview, Live Feed, Analytics, Devices, Alerts, Subscriptions, Team, Settings, MCP Registry, Threat Log
- **Alerts:** Slack Webhooks + Resend.com email
- **Live:** devise-iris.vercel.app

---

## 8. Detection Flow — Layer 1 (OS Agent)

```
EVERY 30 SECONDS:

psutil.net_connections(kind="inet")
        │
        ▼
Filter: status == "ESTABLISHED" only
(drop TIME_WAIT, CLOSE_WAIT, LISTEN, SYN_SENT)
        │
        ▼
For each connection → extract remote_ip, remote_port, pid
        │
        ▼
DNS Resolution (DoH primary, system DNS fallback)
remote_ip → hostname
        │
        ├──► hostname NOT resolved → skip (CDN fallback check)
        │
        ├──► hostname resolved → Registry.find_match(hostname)
        │           │
        │           ├──► NO MATCH → log miss, continue
        │           │
        │           └──► MATCH found:
        │                 tool_name, category, vendor, risk_level
        │
        ▼
ProcessResolver.resolve_with_io(pid)
→ process_name, process_path, bytes_read, bytes_write
        │
        ▼
IdentityResolver
→ user_email, department, device_id
        │
        ▼
Deduplicator.should_report(tool_name, process_name)
        │
        ├──► DUPLICATE (within 5min TTL) → skip
        │
        └──► NEW EVENT → EventBuilder.build_event()
                    │
                    ▼
             DetectionEvent {
               event_id, user_id, user_email, department,
               device_id, tool_name, domain, category,
               vendor, risk_level, source: "desktop",
               process_name, process_path, is_approved,
               timestamp, connection_frequency, high_frequency,
               bytes_read, bytes_write
             }
                    │
                    ▼
             Reporter.report_event()
                    │
                    ├──► SUCCESS → backend confirms → done
                    │
                    └──► FAILURE → SQLite queue → retry with backoff
                                   30s → 60s → 120s → 300s
```

---

## 9. Enforcement Flow — Layer 2 (MCP Gateway)

```
AI CLIENT (Cursor/Claude Code/VS Code)
        │
        │  MCP JSON-RPC request
        ▼
DEVISE GATE — TLS Termination
        │
        ▼
JWT Extraction + Validation
        │
        ├──► INVALID TOKEN → 401 Unauthorized → blocked
        │
        └──► VALID TOKEN → extract user, role, device, session
                    │
                    ▼
             OPA Policy Check (synchronous, cached)
             - Is this MCP server in approved registry?
             - Does user role have access to this server?
             - Is device compliant?
             - Is location/network permitted?
                    │
                    ├──► POLICY DENY → 403 Forbidden → alert generated
                    │
                    └──► POLICY ALLOW → proceed
                                │
                                ▼
                    Threat Detection (async queue)
                    - Tool poisoning scan
                    - Prompt injection pattern check
                    - PII detection in request/response
                    - Command injection patterns
                    - Risk score: 0-100
                                │
                                ├──► Risk ≥ 80 → human-in-loop queue
                                │    admin must approve → hold or pass
                                │
                                └──► Risk < 80 → forward to MCP server
                                                │
                                                ▼
                                     REAL MCP SERVER
                                     (GitHub, Slack, Postgres, etc.)
                                                │
                                                ▼
                                      Response returned to AI client
                                      Full interaction logged to audit trail
                                      Dashboard updated in real time
```

---

## 10. Dashboard — What the Admin Sees

### Overview Tab
- KPI cards: Total Detections, High Risk Events, Online Devices, Active Alerts
- AI Usage Trend chart (detections + policy violations over time)
- Monthly Budget vs. Actual AI Spend with breakdown
- Top Active AI Subscriptions (approved vs. unapproved split)
- Recent Detections table (last 25 events across both layers)

### Live Feed Tab
- Real-time stream of all AI tool interactions (Eye + Gate combined)
- Source badge: Browser / Desktop / MCP Agent
- Columns: Time, Tool, Category, Risk, Process, User, Approved, Source
- Filters: by source, category, risk level, user, department
- Auto-refresh every 10 seconds

### Analytics Tab
- Detections by Tool (bar chart, stacked by source)
- Risk Category breakdown (pie)
- Activity over Time (area chart)
- Top Processes making AI connections
- MCP Tool Call volume and latency trends
- Department-level AI adoption heatmap

### Devices Tab
- All managed devices: device ID, OS, agent version, last heartbeat, status
- Online/Offline/Never-reported indicators
- Queue depth per device (buffered events)
- Tamper detection status

### Alerts Tab
- High Risk Unapproved tool usage
- Tamper alerts (agent binary modified)
- Agent gaps (suspicious offline periods)
- High frequency anomalies
- MCP policy violations
- MCP threat detections (tool poisoning, PII, injection)
- Dismiss / Resolve actions with optimistic UI

### MCP Registry Tab
- Approved server catalog with scan status, risk scores, version info
- Employee server requests inbox
- One-click approve/reject with policy config
- CVE alerts for registered servers
- Permission scope warnings

### Subscriptions Tab
- Auto-discovered AI SaaS licenses
- Inferred seat usage vs. paid seats
- Monthly cost per tool
- Zombie license detection (purchased but unused)
- Budget recommendation engine

### Team Tab
- Members list with roles (owner/admin/viewer)
- AI usage summary per user
- Browser agent + Desktop agent coverage status per user
- Invite management

### Settings Tab
- Monthly AI budget with alert thresholds
- Approved tools whitelist
- Blocked domains list
- Alert delivery: Slack webhook, Email (Resend)
- MCP gateway configuration
- SSO/Identity provider connection (Okta, Entra)
- Data retention policy
- Export: audit log download

---

## 11. The Competitive Landscape

### Who Exists Today

| Competitor | What They Do | What They Miss |
|---|---|---|
| **Oximy** (YC W26) | Browser-extension AI monitoring | No desktop agent, no process attribution, no MCP layer |
| **WitnessAI** | Traffic payload analysis for agentic sessions | No OS-level process attribution, no MCP enforcement |
| **Noma Security** | AI Security Posture Management, runtime protection | Enterprise-only complexity, no spend visibility |
| **Zenity** | AI agent governance across SaaS + cloud | No desktop OS agent, no spend tracking |
| **Runlayer** ($11M Khosla) | MCP gateway + threat detection | No OS-level monitoring, browser/IDE only, no spend layer |
| **Obsidian Security** | Detects AI features in SaaS apps | Browser layer only, no process attribution |
| **Generic CASB tools** | Network proxy governance | No MCP protocol understanding, no AI-specific detection |

### Where Devise Sits on the Map

```
                        OBSERVATION
                    (sees everything)
                           ▲
                           │
         WitnessAI ────── Noma
                           │
                        DEVISE ◄──── THE TARGET POSITION
                    (observe + enforce,
                     OS + MCP, full stack)
                           │
         Runlayer ─────── Zenity
                           │
                        ENFORCEMENT
                    (controls connections)

◄──── Browser/Cloud ──────────────── OS/Desktop ────►
```

**The critical gap Devise fills:** Every competitor operates at the network, browser, or cloud layer. None of them can answer: "Which process on which employee's machine made this AI API call?" That requires OS-level monitoring. That is Devise's unmatchable foundation.

---

## 12. Why Devise Wins

### The Four Unique Advantages

**1. Process Attribution — Nobody Else Has This**
The knowledge that `Code.exe` on `LAPTOP-YASH` called `api.openai.com` at 14:32 = GitHub Copilot active in VS Code. Not just "someone on the network hit OpenAI." The process name plus domain is the fingerprint of exactly which AI tool is being used, by which application, on which device. This cannot be obtained from a network proxy or browser extension. It requires an OS-level agent.

**2. Full-Spectrum Coverage**
Every other tool covers one layer. Browser extensions miss desktop apps. Network proxies miss encrypted localhost tools. MCP gateways miss non-MCP AI calls. Devise covers all of it: browser AI, desktop app AI, IDE AI plugins, direct API calls from scripts, AND agentic MCP connections. One dashboard, all signals.

**3. Observe AND Enforce**
Oximy can tell you ChatGPT is being used. Runlayer can block an MCP call. Devise is the only platform that watches everything and enforces policy where it matters — without requiring the org to deploy two separate vendor relationships, two contracts, two onboarding processes, two dashboards.

**4. Non-Technical Employee Coverage**
MCP gateways solve the developer/engineer AI governance problem. But 60% of enterprise AI usage is non-technical employees using ChatGPT, Gemini, Grammarly, Jasper, Notion AI in their browsers. This will never go through an MCP server. Devise's browser extension and desktop agent covers this population that every MCP-first product ignores entirely.

---

## 13. Market Size and Validation

### The Numbers

- **Total AI tool spending** in enterprises: growing from $1.2M average per org in 2025, projected to reach $4M+ by 2027
- **Shadow IT market** (AI governance subset): projected $15B by 2028
- **MCP security funding** at RSAC 2026: six companies announced $392M in a single week — this market became real overnight
- **Enterprise AI governance** as a category is now mandatory for SOC 2 Type II, HIPAA, GDPR, and India DPDP Act compliance

### Why Now

Three things converged in 2025 that make this the exact right moment:
1. **MCP became universal** — OpenAI, Microsoft, Anthropic, Google, AWS all adopted it. The agentic AI layer is no longer experimental.
2. **AI breaches became real** — Data loss through AI tools went from theoretical to actual headlines, creating board-level urgency.
3. **Regulation caught up** — India DPDP Act Section 5 requires employee disclosure and data handling governance that explicitly covers AI tools.

### India-First Advantage

The Indian market is underserved by Western enterprise security vendors who build for Fortune 500 first. Indian Series A/B startups (100-500 employees) have exactly the problem Devise solves — rapidly scaling AI usage, no governance infrastructure, IT teams that lack enterprise-grade tooling budgets.

- ₹400/seat (V1) is attainable for any funded Indian startup
- Indian tech companies are among the highest per-capita AI tool adopters globally
- Compliance requirements under DPDP Act 2023 create urgency that US-focused competitors are not addressing

---

## 14. Business Model

### Pricing Tiers

| Tier | Price | What's Included | Target |
|---|---|---|---|
| **Free** | ₹0 / $0 | 1 device, browser extension only, 7-day history, community AI registry | Evaluation, freelancers |
| **Starter** | ₹400 / $5 per seat/month | Desktop agent, 30-day history, Slack alerts, 50 AI tools | Indian startups <100 employees |
| **Growth** | ₹1,200 / $15 per seat/month | + MCP gateway (up to 10 servers), threat detection, spend analytics | Series A/B startups, 100-500 employees |
| **Scale** | ₹2,500 / $30 per seat/month | + Unlimited MCP servers, ABAC, Okta/Entra SSO, SCIM, full audit export | Mid-market, 500+ employees |
| **Enterprise** | Custom | Self-hosted, SLA, compliance reports (DPDP, GDPR, SOC2), dedicated support | Large enterprise, regulated industries |

### Additional Revenue

- **Overage billing:** Audit log storage beyond retention tier
- **Compliance reports:** DPDP, GDPR, SOC 2 report generation add-on
- **Professional services:** Custom MCP server integrations, deployment support
- **MCP Registry marketplace:** Premium server listings, verified badges for MCP server vendors
- **API access:** For enterprises that want to pipe Devise data into their own SIEM

### Unit Economics Target

- CAC (India market): ₹15,000-25,000 per customer
- LTV target: ₹3,00,000+ (25+ month retention × ₹12,000+ monthly)
- LTV:CAC target: 12:1 at scale
- Payback period target: 3 months at growth pricing

---

## 15. Go-To-Market Strategy

### Phase 1 — Warm Connections (Months 1-3)

Target: First 3-5 paying customers through direct outreach to Indian startup IT heads and founders in network.

Pitch: "You have 80 people. I can tell you every AI tool they're using, which ones are high risk, and whether you're wasting money on licenses — in 10 minutes."

Deliverable: Working desktop agent + dashboard showing real detections.

Channels:
- LinkedIn direct outreach to CTOs, IT Heads at Indian Series A/B startups
- Founder communities (YC India network, Tracxn, iSPIRT)
- Twitter/X presence as "the person building AI governance for Indian startups"

### Phase 2 — Content-Led Inbound (Months 3-9)

Own the "shadow AI India" keyword space. Publish research on AI tool usage patterns in Indian enterprises. Monthly "State of Shadow AI" report using anonymized Devise data.

Target: IT security communities, CISOs, compliance officers.

Channels:
- LinkedIn articles with real data from Devise deployments
- NASSCOM, DSCI (Data Security Council of India) community engagement
- Security conference talks (c0c0n, Nullcon, ClubHack)

### Phase 3 — Enterprise Motion (Months 9-18)

The MCP gateway and Okta/Entra integrations unlock the enterprise buyer. Security and IT teams are the champion buyers — not developers.

Motion: CISO-first conversations triggered by AI security audit findings or a data incident involving an AI tool.

Channels:
- CISO forums, CXO roundtables
- Partnership with compliance consultants and IT service firms
- Integrations with Okta, Microsoft Entra (listed in their partner directories)

---

## 16. Ideal Customer Profile

### Primary ICP — Indian Tech Startup

- **Size:** 50-500 employees
- **Funding:** Series A or B (₹20Cr+ raised)
- **Industry:** SaaS, fintech, healthtech, edtech
- **Role:** IT Head, CTO, or Founder/CEO wearing security hat
- **Pain:** Employees using ChatGPT, Copilot, Cursor freely; no visibility; preparing for SOC 2 or enterprise customer audits that ask about AI governance
- **Budget signal:** Already paying for at least 3 SaaS tools (Notion, Slack, GitHub)

### Secondary ICP — Mid-Market India

- **Size:** 500-2000 employees
- **Industry:** BFSI, IT services, healthcare
- **Role:** CISO or Security Team Lead
- **Pain:** Board-level AI risk questions they cannot answer; regulator scrutiny under DPDP Act; AI incidents (data leakage through AI tools) that have already occurred
- **Budget:** ₹50L+ annual IT security spend

### Champion Persona

**The IT Head at a 200-person SaaS startup** who was just asked by a potential enterprise customer during a security questionnaire: "What is your policy on employees using AI tools with customer data?" and realized they have no answer, no visibility, and no policy. That moment of realization is the trigger event for a Devise sale.

---

## 17. Technical Stack

### Devise Eye (Desktop Agent)
| Component | Technology |
|---|---|
| Language | Python 3.11 |
| Network monitoring | psutil 5.9+ |
| DNS resolution | dnspython 2.4+ (DoH: Cloudflare/Google) |
| Scheduling | APScheduler 3.10+ |
| HTTP client | httpx 0.25+ async |
| Offline queue | SQLite (EncryptedEventQueue with SQLCipher fallback) |
| Binary packaging | PyInstaller 6.0+ |
| Credential storage | OS keyring (Keychain/Windows Credential Manager) |
| Deployment | MDM (Jamf, Intune, Kandji, GPO) |

### Devise Gate (MCP Gateway)
| Component | Technology |
|---|---|
| Gateway | Node.js (Fastify) — 2x throughput vs Express |
| Threat detection | Python FastAPI microservice, async via queue |
| Policy engine | Open Policy Agent (OPA), Rego policies |
| Auth | JWT + Okta/Entra OIDC, ElastiCache Redis sessions |
| Deployment | AWS ECS Fargate (SaaS) / Docker/Helm (self-hosted) |
| Secrets | AWS Secrets Manager, per-tenant KMS |
| Observability | OpenTelemetry → Datadog / Splunk / CloudWatch |

### Devise Iris (Dashboard)
| Component | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite |
| UI | shadcn-ui + TailwindCSS |
| Charts | Recharts |
| Data fetching | TanStack React Query v5 |
| Auth | Supabase GoTrue (JWKS rotation-proof) |
| Hosting | Vercel |

### Backend + Data
| Component | Technology |
|---|---|
| API | FastAPI (Python), hosted on Railway |
| Database | Firebase Realtime Database (live listeners) |
| Auth DB | Supabase PostgreSQL (10 tables, RLS) |
| Functions | Firebase Cloud Functions (serverless processing) |
| Alerts | Slack Webhooks + Resend.com |
| AI Registry | 3,500+ domains, JSON registry bundled in agent |

---

## 18. Roadmap

### V1 — Observe (Now Building)

**Goal:** First end-to-end detection. Agent runs → ChatGPT opened → dashboard shows detection.

- [x] Devise Iris dashboard — 8 tabs, live data, Supabase auth, deployed at devise-iris.vercel.app
- [x] 15 Python modules for desktop agent (psutil, DNS, registry, deduplication, heartbeat, queue, reporter)
- [x] AI tools registry — 70+ tools in agent, 3,500+ domains full registry
- [ ] Fix 4 critical agent blockers: config file, auth header, detection architecture, async/sync mismatch
- [ ] First working end-to-end detection (Windows → ChatGPT → dashboard)
- [ ] Chrome MV3 browser extension V1
- [ ] Package .exe and .pkg installers
- [ ] First 3 paying customers

**Milestone:** Agent running on 3 customer devices reporting real detections to dashboard.

### V2 — Enforce (Months 3-9)

**Goal:** MCP gateway live, Okta integration working, 10 paying customers.

- [ ] Devise Gate MCP proxy gateway (basic — JWT auth + approved server routing)
- [ ] Private MCP Registry in dashboard
- [ ] Okta SSO integration
- [ ] OPA policy engine (basic role-based policies)
- [ ] Threat detection V1 (tool poisoning, basic PII detection)
- [ ] ABAC access control
- [ ] Full audit log export
- [ ] Process name → human readable app mapping table
- [ ] Windows ETW (more efficient detection than psutil polling)
- [ ] Registry auto-update from backend
- [ ] Multi-user device support

**Milestone:** One enterprise customer running Devise Gate in production. First MCP threat blocked.

### V3 — Scale (Months 9-18)

**Goal:** Enterprise-grade, self-hosted option, 50+ customers, $1M ARR.

- [ ] Microsoft Entra integration (SCIM 2.0)
- [ ] Self-hosted deployment (Docker Compose + Helm chart)
- [ ] Compliance report generation (DPDP, GDPR, SOC 2 templates)
- [ ] Advanced threat detection (ML-based anomaly detection on usage patterns)
- [ ] macOS LaunchAgent support
- [ ] Linux agent (Ubuntu, RHEL)
- [ ] Firefox and Safari extensions
- [ ] Ollama and local AI model detection (process-name based)
- [ ] AES-256 encrypted SQLite buffer (SQLCipher)
- [ ] Binary tamper detection (hash verification)
- [ ] OpenTelemetry export (Datadog, Splunk, Elastic)
- [ ] Multi-region gateway deployment
- [ ] API for SIEM integration

**Milestone:** SOC 2 Type II audit started. Recognized as category-defining product in India.

---

## 19. Moats and Defensibility

### Moat 1 — The AI Tools Registry
A continuously growing, version-controlled registry of every AI tool domain, API endpoint, and MCP server with associated metadata (risk level, category, vendor, approval status). Every new tool that launches gets added. Every customer using Devise contributes signal (which tools are being adopted, at what frequency) that makes the registry smarter. After 2 years of operation, this registry is the most comprehensive AI tool intelligence database in existence and cannot be replicated from scratch by a new entrant.

### Moat 2 — Threat Intelligence Database
Every MCP call inspected, every attack pattern detected, every policy violation logged — across every customer. The threat detection system improves with every customer added. A new entrant starting from scratch in year 3 faces a threat detection engine trained on years of real enterprise MCP traffic. This compounds. It cannot be bought.

### Moat 3 — Identity Integration Depth
Okta and Entra integrations done correctly require months of engineering and certification. Enterprises on these platforms have their entire HR and access workflows built on them. An IT team that has connected Devise to Okta and configured SCIM provisioning for 500 employees is not switching to a competitor. The switching cost is rebuilding their entire access provisioning workflow.

### Moat 4 — Compliance History Lock-in
Every audit log, every policy configuration, every compliance report generated on Devise is locked in. Nobody migrates their historical audit trail. The longer a customer uses Devise, the more irreplaceable it becomes — especially for regulated industries where historical logs are a legal requirement.

### Moat 5 — Process Attribution Data
No cloud-only competitor can collect OS-level process attribution without an installed agent. And once Devise has agents deployed at an organization, the competitor must convince IT to deploy a second agent to replace it. The deployment is the moat. Getting onto the MDM is hard. Getting removed from it is even harder.

---

## 20. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Agent install friction — IT won't deploy | High | Medium | Single binary, MDM scripts ready for Jamf/Intune/GPO; offer free POC with first 10 devices manually |
| Privacy pushback — employees reject monitoring | High | Medium | Zero content capture by design; legal template for employee disclosure (DPDP Act Section 5); market as "governance, not surveillance" |
| Gateway downtime kills AI access org-wide | Critical | Low | Multi-AZ deployment; fail-open degraded mode; 99.95% SLA target; circuit breakers on all upstream connections |
| Anthropic or OpenAI builds this natively | Medium | Low | They cannot solve the cross-vendor, OS-level process attribution problem; too much privacy and legal liability for them to run an agent |
| Runlayer / WitnessAI out-executes on MCP | High | Medium | Their head start is on enterprise US market; Indian market first; OS agent is the differentiation they cannot replicate |
| MCP protocol changes break gateway | High | Low | Stay active in MCP spec working groups; version-pinned server catalog; design gateway to be protocol-version aware |
| pysqlcipher3 fails on Windows builds | Medium | High (known risk) | Graceful fallback to unencrypted SQLite already coded; fix before V2 encrypted queue |
| DNS reverse lookup fails on CDN IPs | Medium | High (known issue) | Registry subdomain matching is the primary path; CDN IP range fallback registry already built |

---

## 21. What Success Looks Like

### 3 Months
- Desktop agent running on at least 3 customer devices
- First real detection visible on dashboard
- 3 paying customers (even at ₹0 — early design partners)
- Browser extension shipped and working
- End-to-end flow: install → detection → dashboard → alert — takes under 10 minutes

### 6 Months
- 10 paying customers
- MCP gateway live (basic version — approved server routing + JWT auth)
- First threat detection fires on a real MCP call
- Monthly detection volume: 10,000+ events across all customers
- Revenue: ₹2,00,000+ MRR

### 12 Months
- 50 paying customers across India
- Okta integration live and used by at least 5 customers
- Self-hosted option available
- SOC 2 Type II audit started
- Revenue: ₹1Cr+ ARR
- Press recognition as the AI governance product for Indian enterprises

### 3 Years
- The default AI governance platform for any Indian company above 100 employees
- Full-stack: OS agent + browser extension + MCP gateway + compliance reporting
- 500+ customers, significant ARR
- International expansion: Southeast Asia, Middle East (similar regulatory environments)
- Category defined: "Devise" is synonymous with AI governance in Indian enterprise

---

## Appendix — The DetectionEvent Schema

```typescript
interface DetectionEvent {
  event_id: string                    // UUID
  user_id: string                     // OS username or MDM-injected
  user_email: string                  // From MDM config or constructed
  department: string                  // From MDM config
  device_id: string                   // UUID5(hostname)
  tool_name: string                   // "GitHub Copilot", "OpenAI API", etc.
  domain: string                      // "copilot.github.com"
  category: "chat"|"coding"|"api"|"image"|"audio"|"video"|"search"|"productivity"
  vendor: string                      // "Microsoft", "OpenAI", etc.
  risk_level: "low"|"medium"|"high"
  source: "browser"|"desktop"
  process_name: string                // "Code.exe", "python3", "slack.exe"
  process_path: string                // Full executable path
  is_approved: boolean                // From registry enterprise_flag
  timestamp: string                   // ISO 8601 UTC
  connection_frequency?: number       // Hits to domain in last 5 minutes
  high_frequency?: boolean            // Above threshold flag
  bytes_read?: number                 // Disk I/O proxy (not network)
  bytes_write?: number
}
```

---

## Appendix — The HeartbeatEvent Schema

```typescript
interface HeartbeatEvent {
  event_type: "heartbeat"
  device_id: string
  agent_version: string
  queue_depth: number                 // Buffered events pending flush
  last_detection_time: string | null  // ISO 8601 UTC
  os_version: string                  // "Windows 11", "macOS 14.2"
  restart_detected: boolean           // Crash recovery flag
  timestamp: string                   // ISO 8601 UTC
}
```

---

## Appendix — Why the Name Devise

**Devise** means to plan, to design, to figure out a way. It captures exactly what the platform does — it devises the system by which organizations can finally understand, plan, and govern their AI usage. It is short, memorable, professional, and carries no AI-washing baggage. The "D" mark in the sidebar of the dashboard becomes the recognizable brand symbol.

Secondary meaning: a legal term for transferring property. In enterprise security, governance is about ensuring that data transferred through AI tools stays within controlled boundaries. The name carries this weight without announcing it.

---

*Devise — Built for the era where every employee is an AI user and every AI agent has access to everything.*
