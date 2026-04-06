# Devise MCP
### The Enterprise Control Plane for AI Tool Connections

---

## What It Is

Devise MCP is a security and governance platform that sits between AI clients (Cursor, Claude Code, ChatGPT, VS Code, Copilot) and the tools they connect to (GitHub, Slack, AWS, PostgreSQL, Notion, Linear). Every AI tool call in your organization flows through Devise MCP — authenticated, authorized, inspected, and logged — before it reaches any real system.

It is the missing infrastructure layer that makes AI agents enterprise-ready.

---

## The Problem

Every enterprise developer today uses AI tools. Those tools use MCP (Model Context Protocol) to connect to real systems — databases, code repos, ticketing systems, cloud infrastructure. There are 18,000+ public MCP servers available. Your employees are connecting to them right now, from their laptops, using personal API keys, with zero visibility from IT or security.

This means:

- **No identity enforcement.** Connections bypass Okta, Entra, and every IAM policy you have.
- **No visibility.** You cannot see which employee connected to which MCP server, when, and what data was returned.
- **No threat detection.** MCP-specific attacks — tool poisoning, prompt injection via tool responses, command injection, tool shadowing — are invisible to generic LLM guardrails.
- **No access control.** A junior contractor has the same MCP access as a principal engineer unless you manually intervene.
- **No audit trail.** When a security incident happens, you have no logs to investigate.

10% of public MCP servers contain malicious behavior. The remaining 90% are exploitable. Enterprise teams face a binary choice: block AI adoption entirely, or accept unmanaged risk at scale.

Devise MCP eliminates that choice.

---

## The Solution

Devise MCP is a transparent proxy gateway deployed in your cloud (VPC) or managed SaaS. Every MCP call routes through it. To developers, nothing changes — they use the same IDE, the same AI client, the same workflows. To security and IT, everything is now visible, controlled, and governed.

**Five capabilities delivered out of the box:**

1. **Secure Gateway** — TLS-terminating reverse proxy for all MCP traffic. Validates JWT tokens issued post-SSO. Routes to approved MCP servers only. Sub-10ms latency overhead.

2. **Threat Detection** — Real-time multi-tier detection engine built for MCP-specific attack vectors: tool poisoning, tool shadowing, command injection, prompt injection via tool responses, PII exfiltration, rug-pull servers, and fake MCP impersonation. Not generic LLM guardrails — purpose-built detectors.

3. **Identity & Access** — Native Okta and Entra integration. SSO, SCIM, conditional access, and ABAC (Attribute-Based Access Control) policies apply to every MCP connection the same way they apply to Slack or GitHub. User leaves? Access revoked in seconds across all AI tools.

4. **Private Registry** — A centralized, security-scanned catalog of approved MCP servers for your organization. IT controls the catalog. Developers get one-click install. Every new server submission is auto-scanned for vulnerabilities, excessive permission scopes, and known malicious patterns before approval.

5. **Full Observability** — Complete audit trail of every AI tool call across your organization. Raw request/response logging. User activity dashboards. Security violation alerts. Exportable to Datadog, Splunk, Elastic, or any OpenTelemetry-compatible stack.

---

## Product Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI CLIENTS                                  │
│   Cursor  │  Claude Code  │  VS Code  │  ChatGPT  │  300+ others    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ MCP JSON-RPC over TLS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DEVISE MCP GATEWAY                             │
│    TLS termination · JWT auth · SSO validation · Request routing    │
└────┬──────────────┬───────────────┬───────────────┬─────────────────┘
     │              │               │               │
     ▼              ▼               ▼               ▼
┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────────┐
│ Threat  │  │  Policy  │  │   Identity  │  │ Observability│
│ Detect  │  │  Engine  │  │   (ABAC)    │  │  + Audit Log │
│ (async) │  │  (OPA)   │  │ Okta/Entra  │  │  (OTEL/S3)   │
└─────────┘  └──────────┘  └─────────────┘  └──────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MCP SERVERS / TOOLS                           │
│  GitHub │ Slack │ AWS │ PostgreSQL │ Notion │ 18,000+ others        │
└─────────────────────────────────────────────────────────────────────┘
```

**Infrastructure stack:**

- **Gateway:** Node.js (Fastify) on AWS ECS Fargate, multi-AZ, behind ALB
- **Threat detection:** Python (FastAPI) microservice, async via SQS
- **Policy engine:** Open Policy Agent (OPA) sidecar, Rego policies
- **Auth:** JWT + Okta/Entra OIDC, SCIM provisioning, ElastiCache Redis for session cache
- **Data:** RDS PostgreSQL (tenant-isolated schemas), S3 for audit logs
- **Secrets:** AWS Secrets Manager, per-tenant KMS encryption
- **Observability:** OpenTelemetry → Datadog / CloudWatch / Splunk
- **Deployment:** Self-hosted Helm chart (EKS) or Terraform (ECS), or managed SaaS

---

## Who It's For

**Security Teams**
They need to say yes to AI adoption without accepting unknown risk. Devise MCP gives them real-time threat detection built for MCP attack vectors, complete audit trails for GRC and incident response, human-in-the-loop approval for new MCP server additions, and attribute-based access control across the entire AI tool surface. They can finally treat AI like any other enterprise application.

**IT Teams**
They need AI to work within the identity stack they already manage. Devise MCP plugs into Okta or Entra natively — SSO, SCIM, conditional access, device compliance, all applied to MCP the same way they apply to every other SaaS tool. Provision access automatically on hire. Revoke it on departure. Manage it from one dashboard. No new tools to learn.

**Engineering Teams**
They need to build fast without waiting on security reviews. Devise MCP gives them a catalog of pre-approved, pre-configured MCP servers with one-click install. No JSON editing. No API key management. No waiting weeks for security sign-off. They use their existing IDE and AI client — the only difference is authentication goes through company SSO instead of personal API keys.

---

## Features

### Gateway
- Transparent MCP proxy (JSON-RPC 2.0 over SSE and Streamable HTTP)
- TLS termination with certificate management
- JWT validation with JWKS endpoint support
- Sub-10ms p99 latency overhead on hot path
- Circuit breakers on all upstream MCP connections
- Fail-open degraded mode with full logging for P0 incidents
- Multi-region deployment support

### Threat Detection
- Tool poisoning detection (tool metadata claiming false capabilities)
- Tool shadowing detection (legitimate tool name, malicious endpoint)
- Prompt injection via tool response detection
- Command injection pattern detection in shell-adjacent tools
- PII detection in responses (SSNs, credit cards, API keys, credentials)
- Rug-pull server detection (servers that change behavior post-approval)
- Fake MCP impersonation detection
- Risk scoring per tool call (0–100)
- Human-in-the-loop alert queue for high-risk calls

### Identity & Access
- Okta and Microsoft Entra native integration
- SAML and OIDC support for any IdP
- SCIM 2.0 for automated user/group provisioning
- Attribute-Based Access Control (ABAC): scope by user, group, device, location, client, session
- Per-tool and per-resource permission scoping
- Conditional access policies (device compliance, network location)
- Automatic offboarding — revoke all MCP access instantly
- Personal API key elimination — all auth through corporate identity

### Private Registry
- Centralized catalog of approved MCP servers for the organization
- Automatic static and dynamic security scanning on submission
- CVE tracking for registered servers
- Permission scope analysis (flag overly broad scopes)
- Version pinning and rollback support
- One-click install to any MCP client
- Internal API → MCP conversion (OpenAPI spec import)
- Request workflow for employees to request new servers

### Observability
- Full request/response audit logging (S3 + queryable)
- Real-time dashboard: tool calls, user activity, violations, adoption
- OpenTelemetry export (Datadog, Splunk, Elastic, Honeycomb, CloudWatch)
- Security violation alerting (PagerDuty, Slack, email)
- Compliance reports (SOC 2, HIPAA, GDPR ready)
- Anomaly detection on usage patterns
- Per-user and per-team usage breakdowns

### Platform
- No-code MCP builder (remix existing tools into custom MCP servers)
- Subagent support (scoped agent execution with observability)
- Local MCP server support with same governance as remote
- CLI tooling for local-to-production workflow
- Terraform and Helm deployment packages
- Self-hosted in your VPC or managed SaaS
- Zero data egress in self-hosted mode

---

## Build Roadmap

### Phase 1 — MVP (Weeks 1–8)
**Goal:** Paying customers. Prove the gateway works.

- [ ] Fastify gateway on ECS, multi-AZ
- [ ] JWT + Okta OIDC authentication
- [ ] Simple RBAC: Okta group → MCP server access list
- [ ] Request/response logging to S3
- [ ] Admin dashboard (user management, access rules, log viewer)
- [ ] Support top 20 MCP servers (GitHub, Slack, Linear, Notion, PostgreSQL, AWS)
- [ ] One-click install config generation for Cursor, Claude Code, VS Code
- [ ] Onboarding flow: connect IdP → invite team → install → done

**Stack:** ECS Fargate, ALB, RDS Postgres, ElastiCache Redis, S3, CloudWatch

**Success metric:** 3 paying enterprise teams, <10ms gateway latency p99

---

### Phase 2 — Core Product (Weeks 9–20)
**Goal:** Make the security story real. Land security buyers.

- [ ] Threat detection engine (Python/FastAPI, async via SQS)
  - Tool poisoning detector
  - PII response scanner
  - Prompt injection via tool response
  - Command injection patterns
  - Risk scoring (0–100 per call)
- [ ] OPA policy engine integration (Rego-based custom policies)
- [ ] ABAC authorization (user, device, client, server, session attributes)
- [ ] SCIM 2.0 provisioning (Okta and Entra)
- [ ] Private registry with static scan on submission
- [ ] Human-in-the-loop approval queue for new servers
- [ ] OpenTelemetry export (Datadog and Splunk first)
- [ ] Security violation alerting
- [ ] Entra (Azure AD) integration

**Success metric:** SOC 2 Type II audit started, 10+ enterprise customers

---

### Phase 3 — Enterprise Platform (Weeks 21–36)
**Goal:** Become the standard. Expand platform surface.

- [ ] Self-hosted Helm chart (EKS) + Terraform (ECS) packages
- [ ] No-code MCP builder (OpenAPI → MCP transpiler)
- [ ] Subagent orchestration with scoped execution
- [ ] Local MCP server support with full governance
- [ ] Multi-region gateway deployment
- [ ] Compliance reporting templates (SOC 2, HIPAA, GDPR)
- [ ] Enterprise SSO (any SAML/OIDC provider)
- [ ] Advanced anomaly detection (ML-based usage patterns)
- [ ] Dedicated RDS instances for high-value tenants
- [ ] SLA-backed uptime (99.95%)

**Success metric:** 50+ enterprise customers, $3M ARR

---

## Pricing

| Tier | Price | Limits | Target |
|------|-------|--------|--------|
| **Free** | $0 | 1 user, 3 MCP servers, community catalog | Individual devs, evaluation |
| **Startup** | $29/user/month | 50 MCP servers, threat detection, Okta SSO | Startups, small teams |
| **Business** | $79/user/month | Unlimited servers, ABAC, SCIM, audit logs | Mid-market, 50–500 employees |
| **Enterprise** | Custom | Self-hosting, SLA, dedicated support, compliance reports | 500+ employees, regulated industries |

**Additional revenue levers:**
- Usage-based overage on audit log storage beyond retention tier
- Professional services for custom MCP server builds
- Compliance report generation add-on (HIPAA, FedRAMP)

---

## Go-To-Market

**ICP (Ideal Customer Profile):**
- 50–5000 employee company
- Engineering-forward (uses Cursor, Claude Code, Copilot heavily)
- Has a dedicated security or IT team
- In a regulated or security-conscious industry (fintech, health, enterprise SaaS)
- Currently experiencing "MCP sprawl" — devs connecting to tools without governance

**Sales motion:**
1. Bottom-up: devs discover Devise MCP through the free tier or registry catalog. Install is 10 minutes. They bring it to IT/security.
2. Top-down: security team or CISO finds the product after an AI security audit or MCP incident. Evaluate → POC → enterprise deal.

**Primary channels:**
- Developer community (Cursor Discord, Claude Code forums, GitHub)
- Security community (CISO forums, RSA, Black Hat)
- Content marketing (MCP security threat research, attack vector writeups)
- Partnerships with AI client vendors (co-market with Cursor, VS Code extension)

**Competitive positioning:**
- vs. generic API gateways (Kong, Apigee): they don't understand MCP protocol or AI-specific attack vectors
- vs. doing nothing: your security team cannot audit what they cannot see
- vs. building in-house: months of work, no threat intelligence, no ongoing maintenance
- vs. Runlayer: Devise MCP ships faster, self-hosts cleaner, and focuses on threat detection depth as primary differentiator

---

## Moats

1. **Threat intelligence database.** Every MCP server scan, every detected attack, every risk pattern — accumulated across all customers. The more customers, the smarter the detection. This compounds over time and cannot be replicated by a new entrant.

2. **The registry catalog.** 18,000+ vetted MCP servers with scan results, risk scores, and usage data. Developers come for the catalog, stay for the governance. Switching cost increases with every server the team uses through Devise MCP.

3. **Identity integration depth.** Okta and Entra integrations done right are hard and take time. Enterprises on these platforms will not switch to a competitor that requires rebuilding their provisioning workflows.

4. **Compliance artifacts.** Every audit trail, every compliance report, every policy configuration a customer builds on Devise MCP is locked in. Nobody migrates their compliance history.

---

## Key Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gateway latency hurts developer productivity | Critical — devs will route around it | Target <10ms p99; async all non-blocking checks; circuit breakers |
| Gateway downtime kills AI access org-wide | Critical — SLA breach | Multi-AZ ECS; fail-open degraded mode; 99.95% SLA |
| MCP protocol changes break compatibility | High | Stay on MCP spec working groups; version-pinned server catalog |
| Anthropic / OpenAI builds this natively | Medium | Move faster; own the multi-client, multi-server problem they won't |
| Customer data in audit logs creates liability | High | Zero data egress self-hosted mode; field-level encryption; retention controls |
| Developer resistance to adding auth friction | Medium | One-click install; SSO replaces manual API keys (net-zero friction) |

---

## Technical Decisions That Matter

**Why Fastify over Express:** 2x throughput on identical hardware. Latency on the hot path is existential.

**Why ECS over EKS for MVP:** Faster to operate, lower overhead, sufficient for early scale. Migrate to EKS when self-hosted Helm chart ships in Phase 3.

**Why OPA for policies:** Enterprises want to bring their own compliance rules. Rego gives them that without custom code. It's also auditable — security teams can read the policies.

**Why async threat detection:** Synchronous detection adds latency. Only hard-block rules run synchronously (and are cached aggressively). Everything else is fire-and-forget to SQS.

**Why tenant-isolated Postgres schemas:** Cost-efficient at MVP scale, compliant for most customers. Dedicated RDS instances available for high-value enterprise tenants as a paid upgrade.

**Why AWS-first:** Enterprise procurement is faster on AWS. PrivateLink support means Devise MCP can run in customer VPCs with no data leaving their network. Azure and GCP support added in Phase 3.

**Why Secrets Manager over Vault:** Lower operational overhead at startup scale. Migration path to Vault exists if self-hosted customers require it.

---

## Definition of Success

**3 months:** Gateway is live. 5 paying teams. Zero latency complaints. Okta integration works.

**6 months:** Threat detection catches real attacks. 20 customers. Security teams are the champion buyers, not just devs.

**12 months:** Self-hosted ships. SOC 2 Type II certified. 50 customers. $1M ARR. Recognized as the category-defining product for MCP governance.

**3 years:** The default way enterprises connect AI agents to their stack. Every company with >100 engineers has heard of Devise MCP.

---

## Name and Brand

**Name:** Devise MCP

**Meaning:** Vault (secured, trusted storage) + vortex (dynamic flow, connection). The secure channel through which everything flows.

**Tagline:** *The secure layer between your AI and your stack.*

**Domain targets:** devise mcp.com / devise mcp.io / devise mcp.ai

**Positioning statement:** Devise MCP is the enterprise control plane for AI tool connections — giving security teams visibility and control, IT teams identity enforcement, and engineering teams one-click access to every approved tool, without slowing anyone down.

---

*Built for the era where AI agents have production access to everything.*
