import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  MCPCall, MCPServer, MCPAlert, MCPPolicy, MCPSession,
  GatewayStatus, KPIMetric, SSOStatus, SCIMConfig,
  RoleAccessEntry, TeamMember, IntegrationConfig, Invoice,
  BillingPlan, TimeSeriesDataPoint, ServerCallVolume,
  ClientCallVolume, UserCallVolume, ThreatTypeCount,
  RiskScoreBucket, LatencyDataPoint, FirewallRule, AuditLogEntry,
  AlertNotificationRule,
} from "../types/mcp.types";

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

const USERS = [
  { id: "u1", name: "Arjun Mehta", email: "arjun@devise.ai", department: "Engineering", role: "Engineer", avatar: undefined },
  { id: "u2", name: "Priya Kapoor", email: "priya@devise.ai", department: "Data Science", role: "Analyst", avatar: undefined },
  { id: "u3", name: "Rahul Verma", email: "rahul@devise.ai", department: "Product", role: "PM", avatar: undefined },
  { id: "u4", name: "Sneha Gupta", email: "sneha@devise.ai", department: "Finance", role: "Analyst", avatar: undefined },
  { id: "u5", name: "Vikram Singh", email: "vikram@devise.ai", department: "Engineering", role: "Engineer", avatar: undefined },
  { id: "u6", name: "Ananya Roy", email: "ananya@devise.ai", department: "Security", role: "Admin", avatar: undefined },
  { id: "u7", name: "Karan Patel", email: "karan@devise.ai", department: "DevOps", role: "Engineer", avatar: undefined },
  { id: "u8", name: "Neha Sharma", email: "neha@devise.ai", department: "Legal", role: "Analyst", avatar: undefined },
];

const SERVERS: MCPServer[] = [
  { id: "s1", name: "GitHub MCP", url: "mcp://github.dev/v1", description: "GitHub repository access and PR management", category: "Dev Tools", icon: undefined, status: "approved", allowedRoles: ["Engineer", "Admin"], monthlyCallCount: 12840, avgRiskScore: 12, rateLimit: 100, addedAt: "2025-11-01", policy: { id: "p1", name: "Dev Tools Standard", regoCode: "" } },
  { id: "s2", name: "Slack MCP", url: "mcp://slack.com/v1", description: "Slack messaging and channel management", category: "Comms", icon: undefined, status: "approved", allowedRoles: ["Engineer", "PM", "Admin"], monthlyCallCount: 8920, avgRiskScore: 18, rateLimit: 60, addedAt: "2025-11-15", policy: { id: "p2", name: "Comms Policy", regoCode: "" } },
  { id: "s3", name: "PostgreSQL MCP", url: "mcp://db.internal/pg", description: "Direct database query access via MCP", category: "Data", icon: undefined, status: "approved", allowedRoles: ["Engineer", "Analyst"], monthlyCallCount: 6450, avgRiskScore: 45, rateLimit: 30, addedAt: "2025-12-01", policy: { id: "p3", name: "Data Access Strict", regoCode: "" } },
  { id: "s4", name: "S3 Bucket MCP", url: "mcp://aws.s3/v1", description: "AWS S3 file storage operations", category: "Storage", icon: undefined, status: "approved", allowedRoles: ["Engineer", "Admin"], monthlyCallCount: 4200, avgRiskScore: 32, rateLimit: 50, addedAt: "2026-01-10", policy: { id: "p4", name: "Storage Standard", regoCode: "" } },
  { id: "s5", name: "Jira MCP", url: "mcp://jira.atlassian.com/v1", description: "Jira issue tracking and project management", category: "Dev Tools", icon: undefined, status: "approved", allowedRoles: ["Engineer", "PM", "Analyst"], monthlyCallCount: 3100, avgRiskScore: 8, rateLimit: 40, addedAt: "2026-01-20" },
  { id: "s6", name: "Notion MCP", url: "mcp://notion.so/v1", description: "Notion workspace and document access", category: "Dev Tools", icon: undefined, status: "pending", allowedRoles: [], monthlyCallCount: 0, avgRiskScore: 0, rateLimit: 30, addedAt: "2026-04-01", requestedBy: USERS[2], requestedAt: "2026-04-05T14:30:00Z" },
  { id: "s7", name: "Confluence MCP", url: "mcp://confluence.atlassian.com/v1", description: "Confluence wiki and documentation", category: "Comms", icon: undefined, status: "pending", allowedRoles: [], monthlyCallCount: 0, avgRiskScore: 0, rateLimit: 20, addedAt: "2026-04-02", requestedBy: USERS[4], requestedAt: "2026-04-06T09:15:00Z" },
  { id: "s8", name: "Shadow DB MCP", url: "mcp://unknown.ext/db", description: "Unknown external database connector", category: "Custom", icon: undefined, status: "blocked", allowedRoles: [], monthlyCallCount: 340, avgRiskScore: 89, rateLimit: 0, addedAt: "2026-03-15" },
  { id: "s9", name: "Pastebin MCP", url: "mcp://pastebin.com/v1", description: "Pastebin text sharing — flagged as data exfil risk", category: "Custom", icon: undefined, status: "blocked", allowedRoles: [], monthlyCallCount: 12, avgRiskScore: 95, rateLimit: 0, addedAt: "2026-03-20" },
];

function generateCalls(): MCPCall[] {
  const methods = ["readFile", "writeFile", "queryDB", "sendMessage", "createIssue", "listRepos", "uploadObject", "searchDocs", "runQuery", "getUser"];
  const calls: MCPCall[] = [];
  const approvedServers = SERVERS.filter(s => s.status === "approved");
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const user = USERS[i % USERS.length];
    const server = approvedServers[i % approvedServers.length];
    const decision: MCPCall["decision"] = i < 35 ? "approved" : i < 45 ? "blocked" : "queued";
    const riskScore = decision === "approved" ? Math.floor(Math.random() * 30) : decision === "blocked" ? 60 + Math.floor(Math.random() * 40) : 40 + Math.floor(Math.random() * 40);
    const aiClients: MCPCall["aiClient"][] = ["cursor", "claude-code", "vscode", "chatgpt", "other"];
    const threats: MCPCall["threats"] = [];

    if (riskScore >= 40) {
      threats.push({
        id: `t-${i}-1`,
        type: riskScore >= 70 ? "pii" : "prompt-injection",
        severity: riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : "medium",
        detail: riskScore >= 70 ? "Email addresses detected in prompt payload" : "Suspicious prompt pattern detected",
        scoreContribution: riskScore >= 70 ? 40 : 25,
      });
    }

    calls.push({
      id: `call-${i}`,
      timestamp: new Date(now - i * 180000).toISOString(),
      user,
      aiClient: aiClients[i % 5],
      mcpServer: { id: server.id, name: server.name, category: server.category, url: server.url },
      method: methods[i % methods.length],
      riskScore,
      riskBreakdown: {
        total: riskScore,
        components: [
          { label: "PII detected", score: riskScore >= 70 ? 40 : 0, maxScore: 40 },
          { label: "Prompt injection", score: riskScore >= 50 ? 25 : 0, maxScore: 30 },
          { label: "Tool poisoning", score: 0, maxScore: 20 },
          { label: "Policy match", score: riskScore >= 30 ? 15 : 0, maxScore: 25 },
          { label: "Unusual time", score: riskScore >= 40 ? 10 : 0, maxScore: 15 },
        ],
      },
      decision,
      decisionBy: decision === "queued" ? "pending" : decision === "blocked" ? "Data Access Strict" : "Auto-approved",
      latencyMs: 3 + Math.floor(Math.random() * 18),
      threats,
      policyTrail: [
        { step: "JWT Validation", result: "pass", reason: "Token valid, not expired" },
        { step: "Role Check", result: "pass", reason: `User role: ${user.role}` },
        { step: "OPA Policy", result: decision === "blocked" ? "fail" : "pass", reason: decision === "blocked" ? "Policy violation: restricted data access" : "Policy passed" },
        { step: "Threat Scan", result: riskScore >= 60 ? "warn" : "pass", reason: riskScore >= 60 ? "Elevated risk score" : "Clean" },
        { step: "Final Decision", result: decision === "approved" ? "pass" : "fail", reason: decision === "approved" ? "All checks passed" : "Blocked by policy" },
      ],
      requestPayload: JSON.stringify({ jsonrpc: "2.0", method: methods[i % methods.length], params: { query: "SELECT * FROM users WHERE..." }, id: i }, null, 2),
      responsePayload: JSON.stringify({ jsonrpc: "2.0", result: { status: "ok", rows: 42 }, id: i }, null, 2),
    });
  }
  return calls;
}

function generateAlerts(): MCPAlert[] {
  return [
    { id: "a1", severity: "critical", type: "pii", title: "PII leaked to PostgreSQL MCP", description: "Credit card numbers detected in query parameters sent to PostgreSQL MCP server by Arjun Mehta via Cursor.", user: "Arjun Mehta", mcpServer: "PostgreSQL MCP", aiClient: "cursor", timestamp: new Date(Date.now() - 180000).toISOString(), status: "new", recommendedAction: "Block user's MCP access and investigate data exposure scope." },
    { id: "a2", severity: "critical", type: "prompt-injection", title: "Prompt injection attempt on GitHub MCP", description: "Role override injection detected in prompt sent to GitHub MCP. Attacker attempted to bypass repository access controls.", user: "Sneha Gupta", mcpServer: "GitHub MCP", aiClient: "claude-code", timestamp: new Date(Date.now() - 600000).toISOString(), status: "new", recommendedAction: "Review user's recent activity and temporarily suspend MCP access." },
    { id: "a3", severity: "high", type: "tool-poisoning", title: "Suspicious tool behavior from Shadow DB", description: "Shadow DB MCP server attempted to read environment variables and exfiltrate API keys during a standard query.", user: "Vikram Singh", mcpServer: "Shadow DB MCP", aiClient: "vscode", timestamp: new Date(Date.now() - 1200000).toISOString(), status: "acknowledged", recommendedAction: "Block Shadow DB MCP server immediately and audit all past interactions." },
    { id: "a4", severity: "high", type: "pii", title: "SSN detected in Slack MCP message", description: "Social Security Number pattern found in a message being sent via Slack MCP by Priya Kapoor.", user: "Priya Kapoor", mcpServer: "Slack MCP", aiClient: "chatgpt", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "new", recommendedAction: "Review the message content and notify the user about PII handling policies." },
    { id: "a5", severity: "medium", type: "command-injection", title: "Command injection in S3 operations", description: "Shell command injection pattern detected in S3 bucket key parameter.", user: "Karan Patel", mcpServer: "S3 Bucket MCP", aiClient: "cursor", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "resolved", recommendedAction: "Parameter has been sanitized. Review S3 access policies." },
    { id: "a6", severity: "medium", type: "pii", title: "Email addresses in Jira comments", description: "Multiple email addresses detected in Jira issue comments created via MCP.", user: "Rahul Verma", mcpServer: "Jira MCP", aiClient: "claude-code", timestamp: new Date(Date.now() - 14400000).toISOString(), status: "acknowledged" },
    { id: "a7", severity: "info", type: "policy-violation", title: "New MCP server connection attempt", description: "Notion MCP server connection requested by Rahul Verma. Pending approval.", user: "Rahul Verma", mcpServer: "Notion MCP", timestamp: new Date(Date.now() - 28800000).toISOString(), status: "new" },
    { id: "a8", severity: "info", type: "gateway-health", title: "Gateway latency spike resolved", description: "Gateway latency briefly exceeded 15ms threshold but has returned to normal levels.", user: "System", mcpServer: "All", timestamp: new Date(Date.now() - 43200000).toISOString(), status: "resolved" },
  ];
}

const MOCK_CALLS = generateCalls();
const MOCK_ALERTS = generateAlerts();

function generateTimeline(): TimeSeriesDataPoint[] {
  const points: TimeSeriesDataPoint[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    points.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      approved: 80 + Math.floor(Math.random() * 60),
      blocked: 5 + Math.floor(Math.random() * 20),
    });
  }
  return points;
}

function generateLatency(): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    points.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      avgLatencyMs: 5 + Math.random() * 12,
    });
  }
  return points;
}

const MOCK_POLICIES: MCPPolicy[] = [
  { id: "pol1", name: "Role-Based Access Control", description: "Only users with approved roles can call specific MCP servers", type: "role-based", scope: ["all"], isActive: true, lastModified: "2026-03-28T10:00:00Z", modifiedBy: "Ananya Roy", config: {} },
  { id: "pol2", name: "Device Compliance Check", description: "Block MCP calls from devices not enrolled in MDM", type: "device", scope: ["all"], isActive: true, lastModified: "2026-03-25T14:30:00Z", modifiedBy: "Ananya Roy", config: { mode: "enforce" } },
  { id: "pol3", name: "Geo-Restriction Policy", description: "Restrict MCP calls to approved countries (IN, US, UK)", type: "location", scope: ["all"], isActive: true, lastModified: "2026-04-01T09:00:00Z", modifiedBy: "Karan Patel", config: { allowedCountries: ["IN", "US", "UK"] } },
  { id: "pol4", name: "Business Hours Only", description: "Block MCP calls outside 8 AM – 8 PM IST on weekdays", type: "time", scope: ["s3", "s4"], isActive: false, lastModified: "2026-03-20T11:15:00Z", modifiedBy: "Ananya Roy", config: { timezone: "Asia/Kolkata", startHour: 8, endHour: 20, days: ["Mon", "Tue", "Wed", "Thu", "Fri"] } },
  { id: "pol5", name: "SCIM Offboarding Revocation", description: "Auto-revoke all MCP tokens when user is deactivated via SCIM", type: "offboarding", scope: ["all"], isActive: true, lastModified: "2026-04-02T16:45:00Z", modifiedBy: "Ananya Roy", config: { mode: "instant" } },
  { id: "pol6", name: "Database PII Filter", description: "Block queries containing PII patterns from all data-category servers", type: "custom", scope: ["s3"], isActive: true, lastModified: "2026-04-04T08:00:00Z", modifiedBy: "Vikram Singh", config: {} },
];

const MOCK_SESSIONS: MCPSession[] = USERS.slice(0, 5).map((u, i) => ({
  id: `sess-${i}`,
  user: u,
  device: [`macbook-${u.name.split(" ")[0].toLowerCase()}`, "windows-workstation", "linux-dev"][i % 3],
  aiClient: (["cursor", "claude-code", "vscode", "chatgpt", "other"] as const)[i % 5],
  startedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
  expiresAt: new Date(Date.now() + (8 - i) * 3600000).toISOString(),
  status: i < 4 ? "active" : "expired",
}));

const MOCK_TEAM: TeamMember[] = [
  { id: "tm1", name: "Yash Sharma", email: "yash@devise.ai", role: "admin", lastLogin: new Date(Date.now() - 300000).toISOString() },
  { id: "tm2", name: "Ananya Roy", email: "ananya@devise.ai", role: "admin", lastLogin: new Date(Date.now() - 7200000).toISOString() },
  { id: "tm3", name: "Karan Patel", email: "karan@devise.ai", role: "analyst", lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: "tm4", name: "Neha Sharma", email: "neha@devise.ai", role: "viewer", lastLogin: new Date(Date.now() - 172800000).toISOString() },
];

const MOCK_FIREWALL: FirewallRule[] = [
  { id: "fw1", rule: "192.168.1.0/24", type: "ip", addedBy: "Ananya Roy", addedAt: "2026-03-15" },
  { id: "fw2", rule: "pastebin.com", type: "domain", addedBy: "Karan Patel", addedAt: "2026-03-20" },
  { id: "fw3", rule: "10.0.0.0/8", type: "ip", addedBy: "Ananya Roy", addedAt: "2026-04-01" },
];

const MOCK_AUDIT: AuditLogEntry[] = [
  { id: "au1", timestamp: new Date(Date.now() - 600000).toISOString(), user: "Ananya Roy", action: "blocked_server", detail: "Blocked Shadow DB MCP", resource: "servers/s8" },
  { id: "au2", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Yash Sharma", action: "updated_policy", detail: "Modified Role-Based Access Control policy", resource: "policies/pol1" },
  { id: "au3", timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Karan Patel", action: "added_firewall_rule", detail: "Added IP block: 10.0.0.0/8", resource: "firewall/fw3" },
  { id: "au4", timestamp: new Date(Date.now() - 14400000).toISOString(), user: "Ananya Roy", action: "revoked_session", detail: "Revoked session for Sneha Gupta", resource: "sessions/sess-3" },
  { id: "au5", timestamp: new Date(Date.now() - 28800000).toISOString(), user: "Yash Sharma", action: "invited_admin", detail: "Invited neha@devise.ai as viewer", resource: "team/tm4" },
];

const MOCK_NOTIFICATION_RULES: AlertNotificationRule[] = [
  { alertType: "PII Detected", enabled: true, channels: ["slack", "email"], minSeverity: "medium" },
  { alertType: "Prompt Injection", enabled: true, channels: ["slack", "pagerduty"], minSeverity: "high" },
  { alertType: "Tool Poisoning", enabled: true, channels: ["pagerduty"], minSeverity: "critical" },
  { alertType: "Policy Violation", enabled: true, channels: ["email"], minSeverity: "medium" },
  { alertType: "Gateway Down", enabled: true, channels: ["slack", "pagerduty", "email"], minSeverity: "critical" },
  { alertType: "New Server Detected", enabled: false, channels: ["email"], minSeverity: "info" },
];

// ═══════════════════════════════════════════════════════════════════════════
// TANSTACK QUERY HOOKS
// ═══════════════════════════════════════════════════════════════════════════

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// --- Overview ---

export function useOverviewKPIs() {
  return useQuery<KPIMetric[]>({
    queryKey: ["mcp", "overview", "kpis"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("status", { count: "exact" })
        .gte("timestamp", today.toISOString());

      if (error) console.error(error);

      const total = data?.length || 0;
      const approved = data?.filter(r => r.status === "success").length || 0;
      const blocked = total - approved;

      return [
        { label: "Total MCP Calls Today", value: total, change: 0, trend: "flat", trendColor: "neutral" },
        { label: "Calls Approved", value: approved, change: 0, trend: "flat", trendColor: "green" },
        { label: "Calls Blocked", value: blocked, change: 0, trend: "flat", trendColor: "red" },
        { label: "Avg Gateway Latency", value: "8ms", change: 0, trend: "flat", trendColor: "green" },
      ];
    },
  });
}

export function useGatewayStatus() {
  return useQuery<GatewayStatus>({
    queryKey: ["mcp", "gateway", "status"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/gateway/status
      return { state: "online", uptimePercent: 99.97, lastIncident: "2026-03-28T02:15:00Z", currentLatencyMs: 8, callsPerMinute: 42 };
    },
  });
}

export function useCallTimeline() {
  return useQuery<TimeSeriesDataPoint[]>({
    queryKey: ["mcp", "calls", "timeline"],
    queryFn: async () => {
      const yesterday = new Date(Date.now() - 24 * 3600000);
      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("timestamp, status")
        .gte("timestamp", yesterday.toISOString());
        
      if (error || !data) return generateTimeline();
      
      const hourCounts: Record<string, { approved: number; blocked: number }> = {};
      
      data.forEach((row: any) => {
        const hour = new Date(row.timestamp).toISOString().slice(0, 13) + ":00";
        if (!hourCounts[hour]) hourCounts[hour] = { approved: 0, blocked: 0 };
        if (row.status === "success") hourCounts[hour].approved++;
        else hourCounts[hour].blocked++;
      });
      
      const points: TimeSeriesDataPoint[] = [];
      const now = Date.now();
      for (let i = 23; i >= 0; i--) {
        const ts = new Date(now - i * 3600000).toISOString();
        const hour = ts.slice(0, 13) + ":00";
        points.push({ ...hourCounts[hour] || { approved: 0, blocked: 0 }, timestamp: ts });
      }
      return points;
    },
  });
}

export function useTopServers() {
  return useQuery<ServerCallVolume[]>({
    queryKey: ["mcp", "servers", "top"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("tool_name, status");
        
      if (error || !data) return [];

      const serverStats: Record<string, { approved: number; blocked: number }> = {};

      data.forEach((row: any) => {
        const name = row.tool_name || "Unknown Server";
        if (!serverStats[name]) serverStats[name] = { approved: 0, blocked: 0 };
        if (row.status === "success") serverStats[name].approved++;
        else serverStats[name].blocked++;
      });
      
      return Object.entries(serverStats)
        .map(([name, stats]) => ({
          serverName: name,
          category: "Custom",
          totalCalls: stats.approved + stats.blocked,
          approved: stats.approved,
          blocked: stats.blocked,
        }))
        .sort((a, b) => b.totalCalls - a.totalCalls)
        .slice(0, 5);
    },
  });
}

export function useTopClients() {
  return useQuery<ClientCallVolume[]>({
    queryKey: ["mcp", "clients", "top"],
    queryFn: async () => {
      await delay(250); // TODO: GET /api/mcp/clients/top
      return [
        { client: "cursor" as const, clientLabel: "Cursor", totalCalls: 1240, color: "#00B4D8" },
        { client: "claude-code" as const, clientLabel: "Claude Code", totalCalls: 890, color: "#D97706" },
        { client: "vscode" as const, clientLabel: "VS Code", totalCalls: 420, color: "#0078D4" },
        { client: "chatgpt" as const, clientLabel: "ChatGPT", totalCalls: 210, color: "#10A37F" },
        { client: "other" as const, clientLabel: "Other", totalCalls: 87, color: "#94A3B8" },
      ];
    },
  });
}

export function useHumanQueueCount() {
  return useQuery<number>({
    queryKey: ["mcp", "queue", "count"],
    queryFn: async () => {
      await delay(150); // TODO: GET /api/mcp/queue/count
      return MOCK_CALLS.filter(c => c.decision === "queued").length;
    },
  });
}

// --- Registry ---

export function useMCPServers() {
  return useQuery<MCPServer[]>({
    queryKey: ["mcp", "servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_registry")
        .select("*");
        
      if (error || !data) return SERVERS;
      
      return data.map((row: any) => ({
        id: row.id,
        name: row.server_name,
        url: row.server_url,
        description: "",
        category: "Custom",
        status: row.status as "approved" | "blocked" | "pending",
        allowedRoles: [],
        monthlyCallCount: 0,
        avgRiskScore: row.risk_score || 0,
        rateLimit: 100,
        addedAt: row.created_at,
      }));
    },
  });
}

// --- Calls ---

export function useMCPCalls() {
  return useQuery<MCPCall[]>({
    queryKey: ["mcp", "calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);
        
      if (error || !data) return MOCK_CALLS;
      
      return data.map((row: any) => ({
        id: row.id.toString(),
        timestamp: row.timestamp,
        user: { name: row.actor_id, email: row.actor_id, role: "User", department: "Unknown", id: row.actor_id },
        aiClient: "cursor", // stub
        mcpServer: { id: row.tool_name || "unknown", name: row.tool_name || "Unknown Server", category: "Custom", url: "mcp://" },
        method: row.event_type,
        riskScore: row.risk_score || 0,
        riskBreakdown: { total: row.risk_score || 0, components: [] },
        decision: row.status === "success" ? "approved" : "blocked",
        decisionBy: "System",
        latencyMs: row.duration_ms || 8,
        threats: [], // parse threat_flags if needed
        policyTrail: [],
        requestPayload: JSON.stringify(row.request_payload, null, 2),
        responsePayload: JSON.stringify(row.response_meta, null, 2),
      }));
    },
  });
}

export function useHumanQueue() {
  return useQuery<MCPCall[]>({
    queryKey: ["mcp", "queue"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/queue
      return MOCK_CALLS.filter(c => c.decision === "queued");
    },
  });
}

// --- Threats ---

export function useThreatLog() {
  return useQuery<MCPCall[]>({
    queryKey: ["mcp", "threats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("*")
        .gte("risk_score", 40)
        .order("timestamp", { ascending: false })
        .limit(100);
        
      if (error || !data) return MOCK_CALLS.filter(c => c.threats.length > 0);
      
      return data.map((row: any) => ({
        id: row.id.toString(),
        timestamp: row.timestamp,
        user: { name: row.actor_id, email: row.actor_id, role: "User", department: "Unknown", id: row.actor_id },
        aiClient: "cursor", // stub
        mcpServer: { id: row.tool_name || "unknown", name: row.tool_name || "Unknown Server", category: "Custom", url: "mcp://" },
        method: row.event_type,
        riskScore: row.risk_score || 0,
        riskBreakdown: { total: row.risk_score || 0, components: [] },
        decision: row.status === "success" ? "approved" : "blocked",
        decisionBy: "System",
        latencyMs: row.duration_ms || 8,
        threats: [], // parse threat_flags if needed
        policyTrail: [],
        requestPayload: JSON.stringify(row.request_payload, null, 2),
        responsePayload: JSON.stringify(row.response_meta, null, 2),
      }));
    },
  });
}

// --- Alerts ---

export function useMCPAlerts() {
  return useQuery<MCPAlert[]>({
    queryKey: ["mcp", "alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_audit_ledger")
        .select("*")
        .gte("risk_score", 60)
        .order("timestamp", { ascending: false })
        .limit(50);
        
      if (error || !data) return MOCK_ALERTS;
      
      return data.map((row: any) => ({
        id: row.id.toString(),
        severity: row.risk_score >= 80 ? "critical" : "high",
        type: row.risk_score > 80 ? "pii" : "policy-violation",
        title: `High Risk Event Detected on ${row.tool_name || "Unknown Server"}`,
        description: `Risk score ${row.risk_score} triggered for action by ${row.actor_id}.`,
        user: row.actor_id,
        mcpServer: row.tool_name || "Unknown Server",
        aiClient: "cursor",
        timestamp: row.timestamp,
        status: "new",
        recommendedAction: "Review payload and consider blocking tool/user."
      }));
    },
  });
}

export function useAlertNotificationRules() {
  return useQuery<AlertNotificationRule[]>({
    queryKey: ["mcp", "alerts", "notification-rules"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/alerts/notification-rules
      return MOCK_NOTIFICATION_RULES;
    },
  });
}

// --- Identity ---

export function useSSOStatus() {
  return useQuery<SSOStatus>({
    queryKey: ["mcp", "sso", "status"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/sso/status
      return { provider: "okta", isConnected: true, lastSync: new Date(Date.now() - 1800000).toISOString() };
    },
  });
}

export function useSCIMConfig() {
  return useQuery<SCIMConfig>({
    queryKey: ["mcp", "scim", "config"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/scim/config
      return { endpointUrl: "https://gate.devise.ai/scim/v2", secretToken: "sk-scim-****-****-****-7f3a", lastSyncAt: new Date(Date.now() - 900000).toISOString(), usersSynced: 142, autoRevocationEnabled: true, offboardingMode: "instant" };
    },
  });
}

export function useRoleAccessMatrix() {
  return useQuery<RoleAccessEntry[]>({
    queryKey: ["mcp", "roles", "matrix"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/roles/matrix
      return SERVERS.filter(s => s.status === "approved").map(s => ({
        serverId: s.id, serverName: s.name,
        roles: { Admin: "allowed" as const, Engineer: s.allowedRoles.includes("Engineer") ? "allowed" as const : "blocked" as const, Analyst: s.allowedRoles.includes("Analyst") ? "allowed" as const : "blocked" as const, PM: s.allowedRoles.includes("PM") ? "conditional" as const : "blocked" as const },
      }));
    },
  });
}

export function useMCPSessions() {
  return useQuery<MCPSession[]>({
    queryKey: ["mcp", "sessions"],
    queryFn: async () => {
      await delay(250); // TODO: GET /api/mcp/sessions
      return MOCK_SESSIONS;
    },
  });
}

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ["mcp", "team"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/team
      return MOCK_TEAM;
    },
  });
}

// --- Policies ---

export function useMCPPolicies() {
  return useQuery<MCPPolicy[]>({
    queryKey: ["mcp", "policies"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/policies
      return MOCK_POLICIES;
    },
  });
}

export function useFirewallRules() {
  return useQuery<FirewallRule[]>({
    queryKey: ["mcp", "firewall"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/firewall
      return MOCK_FIREWALL;
    },
  });
}

// --- Analytics ---

export function useServerCallVolumes() {
  return useQuery<ServerCallVolume[]>({
    queryKey: ["mcp", "analytics", "servers"],
    queryFn: async () => {
      await delay(350); // TODO: GET /api/mcp/analytics/servers
      return SERVERS.filter(s => s.status === "approved").map(s => ({
        serverName: s.name, category: s.category, totalCalls: s.monthlyCallCount,
        approved: Math.floor(s.monthlyCallCount * (0.8 + Math.random() * 0.15)),
        blocked: Math.floor(s.monthlyCallCount * (0.05 + Math.random() * 0.1)),
      }));
    },
  });
}

export function useClientCallVolumes() {
  return useQuery<ClientCallVolume[]>({
    queryKey: ["mcp", "analytics", "clients"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/analytics/clients
      return [
        { client: "cursor" as const, clientLabel: "Cursor", totalCalls: 12400, color: "#00B4D8" },
        { client: "claude-code" as const, clientLabel: "Claude Code", totalCalls: 8900, color: "#D97706" },
        { client: "vscode" as const, clientLabel: "VS Code", totalCalls: 4200, color: "#0078D4" },
        { client: "chatgpt" as const, clientLabel: "ChatGPT", totalCalls: 2100, color: "#10A37F" },
        { client: "other" as const, clientLabel: "Other", totalCalls: 870, color: "#94A3B8" },
      ];
    },
  });
}

export function useUserCallVolumes() {
  return useQuery<UserCallVolume[]>({
    queryKey: ["mcp", "analytics", "users"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/analytics/users
      return USERS.map(u => ({
        userName: u.name, totalCalls: 800 + Math.floor(Math.random() * 2000), avgRiskScore: Math.floor(Math.random() * 50),
      })).sort((a, b) => b.totalCalls - a.totalCalls).slice(0, 10);
    },
  });
}

export function useThreatTypeBreakdown() {
  return useQuery<ThreatTypeCount[]>({
    queryKey: ["mcp", "analytics", "threats"],
    queryFn: async () => {
      await delay(250); // TODO: GET /api/mcp/analytics/threats
      const data: ThreatTypeCount[] = [
        { type: "pii", label: "PII Detected", count: 127, percentage: 42, color: "#EF4444" },
        { type: "prompt-injection", label: "Prompt Injection", count: 84, percentage: 28, color: "#F59E0B" },
        { type: "tool-poisoning", label: "Tool Poisoning", count: 38, percentage: 13, color: "#8B5CF6" },
        { type: "command-injection", label: "Command Injection", count: 22, percentage: 7, color: "#DC2626" },
        { type: "data-exfiltration", label: "Data Exfiltration", count: 31, percentage: 10, color: "#EC4899" },
      ];
      return data;
    },
  });
}

export function useRiskScoreDistribution() {
  return useQuery<RiskScoreBucket[]>({
    queryKey: ["mcp", "analytics", "risk-distribution"],
    queryFn: async () => {
      await delay(250); // TODO: GET /api/mcp/analytics/risk-distribution
      return [
        { range: "0-10", count: 820, color: "#22C55E" },
        { range: "10-20", count: 640, color: "#22C55E" },
        { range: "20-30", count: 380, color: "#84CC16" },
        { range: "30-40", count: 210, color: "#EAB308" },
        { range: "40-50", count: 145, color: "#F59E0B" },
        { range: "50-60", count: 98, color: "#F97316" },
        { range: "60-70", count: 67, color: "#EF4444" },
        { range: "70-80", count: 42, color: "#DC2626" },
        { range: "80-90", count: 28, color: "#B91C1C" },
        { range: "90-100", count: 15, color: "#991B1B" },
      ];
    },
  });
}

export function useLatencyOverTime() {
  return useQuery<LatencyDataPoint[]>({
    queryKey: ["mcp", "analytics", "latency"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/analytics/latency
      return generateLatency();
    },
  });
}

export function useBlockedCallsTrend() {
  return useQuery<TimeSeriesDataPoint[]>({
    queryKey: ["mcp", "analytics", "blocked-trend"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/analytics/blocked-trend
      return generateTimeline();
    },
  });
}

// --- Settings ---

export function useAuditLog() {
  return useQuery<AuditLogEntry[]>({
    queryKey: ["mcp", "audit"],
    queryFn: async () => {
      await delay(300); // TODO: GET /api/mcp/audit
      return MOCK_AUDIT;
    },
  });
}

export function useIntegrations() {
  return useQuery<IntegrationConfig[]>({
    queryKey: ["mcp", "integrations"],
    queryFn: async () => {
      await delay(250); // TODO: GET /api/mcp/integrations
      return [
        { id: "int1", name: "Datadog", type: "siem" as const, status: "connected" as const, config: { endpoint: "https://api.datadoghq.com/v1" }, lastSync: new Date(Date.now() - 600000).toISOString() },
        { id: "int2", name: "Slack", type: "slack" as const, status: "connected" as const, config: { channel: "#mcp-alerts" }, lastSync: new Date(Date.now() - 300000).toISOString() },
        { id: "int3", name: "PagerDuty", type: "pagerduty" as const, status: "disconnected" as const, config: {} },
        { id: "int4", name: "Workday", type: "hr" as const, status: "connected" as const, config: {}, lastSync: new Date(Date.now() - 86400000).toISOString() },
        { id: "int5", name: "Jamf", type: "mdm" as const, status: "disconnected" as const, config: {} },
      ];
    },
  });
}

export function useBillingPlan() {
  return useQuery<BillingPlan>({
    queryKey: ["mcp", "billing", "plan"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/billing/plan
      return { name: "Enterprise", seats: 50, renewalDate: "2026-11-01", callsThisMonth: 28470, seatsActive: 34 };
    },
  });
}

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ["mcp", "billing", "invoices"],
    queryFn: async () => {
      await delay(200); // TODO: GET /api/mcp/billing/invoices
      return [
        { id: "inv1", date: "2026-04-01", amount: 2499, plan: "Enterprise", pdfUrl: "#" },
        { id: "inv2", date: "2026-03-01", amount: 2499, plan: "Enterprise", pdfUrl: "#" },
        { id: "inv3", date: "2026-02-01", amount: 1999, plan: "Pro", pdfUrl: "#" },
      ];
    },
  });
}
