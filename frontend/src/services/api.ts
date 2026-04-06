/**
 * Devise Dashboard — API service layer
 * 
 * Backend URL is configured via VITE_API_URL environment variable.
 * Defaults to http://localhost:3002/api for local development.
 * 
 * Set VITE_API_URL in your .env file for custom backends:
 *   VITE_API_URL=http://your-api-domain.com/api
 */

export interface DetectionEvent {
  event_id: string;
  user_id: string;
  user_email: string;
  department: string;
  device_id: string;
  tool_name: string;
  domain: string;
  category: string;
  vendor: string;
  risk_level: "low" | "medium" | "high";
  source: string;
  process_name: string;
  process_path: string;
  is_approved: boolean;
  is_blocked: boolean;
  timestamp: string;
  connection_frequency?: number;
  high_frequency?: boolean;
  bytes_read?: number;
  bytes_write?: number;
  sensitivity_score?: number;
  sensitivity_flag?: string;
}

export interface HeartbeatEvent {
  org_id: string;
  device_id: string;
  hostname: string;
  agent_version: string;
  queue_depth: number;
  last_detection_time: string | null;
  os_version: string;
  restart_detected: boolean;
  timestamp: string;
  status: "online" | "offline";
}

export interface StatsResponse {
  totalDetections: number;
  uniqueTools: number;
  highRiskCount: number;
  unapprovedCount: number;
  onlineDevices: number;
  totalDevices: number;
  activeAlerts: number;
}

export interface AlertItem {
  id: string;
  type: "high_risk" | "unapproved" | "tamper" | "agent_gap" | "high_frequency";
  title: string;
  description: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

export interface AnalyticsResponse {
  byTool: { name: string; count: number }[];
  byCategory: { name: string; value: number }[];
  overTime: { time: string; count: number }[];
  topProcesses: { name: string; count: number }[];
}

export interface SubscriptionItem {
  id: string;
  tool_name: string;
  vendor: string;
  seats: number;
  seats_used: number;
  cost_monthly: number;
  currency: string;
  status: "active" | "zombie" | "cancelled" | "trial";
  renewal_date: string | null;
  created_at: string;
}

export interface SpendOverview {
  totalMonthlySpend: number;
  monthlyBudget: number;
  budgetRemaining: number;
  zombieLicenses: number;
  zombieCost: number;
}

export interface TeamResponse {
  members: {
    id: string;
    full_name: string;
    email: string;
    department: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
  }[];
  invites: {
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    expires_at: string;
  }[];
}

export interface OrgSettings {
  id: string;
  org_id: string;
  monthly_budget: number;
  alert_threshold: number;
  auto_block: boolean;
  allowed_categories: string[];
  blocked_domains: string[];
  notification_email: boolean;
  notification_slack: boolean;
  slack_webhook_url: string | null;
}

export interface UserProfile {
  id: string;
  org_id: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  avatar_url: string | null;
  org_name: string;
  org_slug: string;
  created_at?: string;
  last_active?: string;
  dark_mode?: boolean;
  notification_prefs?: {
    high_risk_alerts: boolean;
    daily_summary: boolean;
    block_notifications: boolean;
  };
}

export interface FirewallRule {
  id: string;
  tool_name: string;
  domain: string;
  status: "allowed" | "blocked";
  updated_at: string;
  updated_by: string;
  block_count: number;
}

export interface BlockEvent {
  id: string;
  event_id: string;
  tool_name: string;
  domain: string;
  user_id: string;
  device_id: string;
  timestamp: string;
  block_reason: string | null;
  policy_matched: string | null;
  org_id: string;
}

export interface FirewallStats {
  blockedToday: number;
  blockEventsThisWeek: number;
  policyViolations: number;
  complianceScore: number;
}

export type SensitivityFlag =
  | "SOURCE_CODE"
  | "FILE_UPLOAD"
  | "LARGE_PASTE"
  | "FINANCIAL_KEYWORDS"
  | "CREDENTIALS_PATTERN";

export interface SensitivityEvent {
  id: string;
  event_id: string;
  tool_name: string;
  domain: string;
  user_id: string;
  device_id: string;
  timestamp: string;
  sensitivity_flag: SensitivityFlag;
  sensitivity_score: number;
  window_title: string | null;
  paste_size_chars: number | null;
  file_name: string | null;
  org_id: string;
  reviewed: boolean;
}

export interface EmployeeRiskScore {
  id: string;
  user_email: string;
  risk_score: number;
  high_risk_events: number;
  medium_risk_events: number;
  last_incident: string;
  top_sensitivity_type: string;
  updated_at: string;
}

export interface DataRiskStats {
  highRiskToday: number;
  employeesWithRisk: number;
  mostCommonType: string;
  orgRiskScore: number;
}

export interface EventsResponse {
  total: number;
  events: DetectionEvent[];
}

// Backend URL - configured via environment variable
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Demo mode flag - set to false to use real backend
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

// Store org_id and user_id for API requests
let _orgId: string | null = null;
let _userId: string | null = null;

export function setOrgId(orgId: string | null) { _orgId = orgId; }
export function setUserId(userId: string | null) { _userId = userId; }

// Get current auth info
export function getOrgId() { return _orgId; }
export function getUserId() { return _userId; }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(_orgId ? { "X-Org-Id": _orgId } : {}),
    ...(_userId ? { "X-User-Id": _userId } : {}),
  };
  
  // Add auth token if present
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers,
      ...options,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
  } catch (error) {
    // If backend unavailable and demo mode enabled, return mock data
    if (DEMO_MODE) {
      console.log(`[Demo Mode] Serving mock data for: ${path}`);
      return getMockData(path) as T;
    }
    throw error;
  }
}

// Mock data fallback
function getMockData(path: string): unknown {
  const mockResponses: Record<string, unknown> = {
    "/events": {
      total: 5,
      events: [
        { event_id: "1", user_id: "u1", user_email: "john@company.com", department: "Engineering", device_id: "d1", tool_name: "ChatGPT", domain: "chatgpt.com", category: "AI Assistant", vendor: "OpenAI", risk_level: "medium", source: "network", process_name: "chrome.exe", process_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", is_approved: true, is_blocked: false, timestamp: new Date().toISOString() },
        { event_id: "2", user_id: "u2", user_email: "jane@company.com", department: "Marketing", device_id: "d2", tool_name: "Midjourney", domain: "midjourney.com", category: "AI Image", vendor: "Midjourney", risk_level: "high", source: "network", process_name: "chrome.exe", process_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", is_approved: false, is_blocked: false, timestamp: new Date().toISOString() },
        { event_id: "3", user_id: "u3", user_email: "bob@company.com", department: "Sales", device_id: "d3", tool_name: "Claude", domain: "claude.ai", category: "AI Assistant", vendor: "Anthropic", risk_level: "low", source: "network", process_name: "msedge.exe", process_path: "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe", is_approved: true, is_blocked: false, timestamp: new Date().toISOString() },
        { event_id: "4", user_id: "u4", user_email: "alice@company.com", department: "HR", device_id: "d4", tool_name: "GitHub Copilot", domain: "github.com", category: "Developer Tool", vendor: "GitHub", risk_level: "low", source: "network", process_name: "code.exe", process_path: "C:\\Users\\yashm\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", is_approved: true, is_blocked: false, timestamp: new Date().toISOString() },
        { event_id: "5", user_id: "u5", user_email: "mike@company.com", department: "Finance", device_id: "d5", tool_name: "Perplexity", domain: "perplexity.ai", category: "AI Assistant", vendor: "Perplexity", risk_level: "medium", source: "network", process_name: "chrome.exe", process_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", is_approved: true, is_blocked: false, timestamp: new Date().toISOString() },
      ]
    },
    "/stats": { totalDetections: 156, uniqueTools: 12, highRiskCount: 23, unapprovedCount: 18, onlineDevices: 4, totalDevices: 5, activeAlerts: 3 },
    "/alerts": [
      { id: "a1", type: "high_risk", title: "High Risk Tool Detected", description: "Unapproved AI tool accessed", timestamp: new Date().toISOString(), severity: "high" },
      { id: "a2", type: "unapproved", title: "Unapproved Tool Usage", description: "User accessed tool not in approved list", timestamp: new Date().toISOString(), severity: "medium" },
      { id: "a3", type: "high_frequency", title: "High Frequency Access", description: "Excessive usage detected", timestamp: new Date().toISOString(), severity: "low" },
    ],
    "/analytics": {
      byTool: [
        { name: "ChatGPT", count: 45 },
        { name: "Claude", count: 32 },
        { name: "Midjourney", count: 28 },
        { name: "GitHub Copilot", count: 21 },
        { name: "Perplexity", count: 15 },
      ],
      byCategory: [
        { name: "AI Assistant", value: 92 },
        { name: "AI Image", value: 28 },
        { name: "Developer Tool", value: 21 },
        { name: "Search Engine", value: 15 },
      ],
      overTime: [
        { time: "2024-01", count: 12 },
        { time: "2024-02", count: 18 },
        { time: "2024-03", count: 25 },
      ],
      topProcesses: [
        { name: "chrome.exe", count: 89 },
        { name: "msedge.exe", count: 45 },
        { name: "code.exe", count: 22 },
      ]
    },
    "/subscriptions": [
      { id: "s1", tool_name: "ChatGPT Plus", vendor: "OpenAI", seats: 10, seats_used: 8, cost_monthly: 240, currency: "USD", status: "active", renewal_date: "2024-04-15", created_at: "2024-01-01" },
      { id: "s2", tool_name: "GitHub Copilot", vendor: "GitHub", seats: 5, seats_used: 4, cost_monthly: 100, currency: "USD", status: "active", renewal_date: "2024-04-01", created_at: "2024-01-15" },
      { id: "s3", tool_name: "Midjourney", vendor: "Midjourney", seats: 3, seats_used: 3, cost_monthly: 60, currency: "USD", status: "active", renewal_date: "2024-03-20", created_at: "2024-01-20" },
    ],
    "/spend": { totalMonthlySpend: 400, monthlyBudget: 500, budgetRemaining: 100, zombieLicenses: 2, zombieCost: 40 },
    "/team": {
      members: [
        { id: "m1", full_name: "John Doe", email: "john@company.com", department: "Engineering", role: "admin", avatar_url: null, created_at: "2024-01-01" },
        { id: "m2", full_name: "Jane Smith", email: "jane@company.com", department: "Marketing", role: "member", avatar_url: null, created_at: "2024-01-15" },
        { id: "m3", full_name: "Bob Wilson", email: "bob@company.com", department: "Sales", role: "member", avatar_url: null, created_at: "2024-02-01" },
        { id: "m4", full_name: "Alice Brown", email: "alice@company.com", department: "HR", role: "viewer", avatar_url: null, created_at: "2024-02-15" },
      ],
      invites: []
    },
    "/settings": { id: "settings1", org_id: "org_demo", monthly_budget: 500, alert_threshold: 70, auto_block: false, allowed_categories: ["AI Assistant", "Developer Tool"], blocked_domains: [], notification_email: true, notification_slack: false, slack_webhook_url: null },
    "/me": { id: "user1", org_id: "org_demo", full_name: "Demo User", email: "demo@company.com", department: "Engineering", role: "admin", avatar_url: null, org_name: "Demo Organization", org_slug: "demo-org", dark_mode: true },
    "/firewall/rules": [],
    "/firewall/events": [],
    "/firewall/stats": { blockedToday: 0, blockEventsThisWeek: 0, policyViolations: 0, complianceScore: 100 },
    "/sensitivity/events": [],
    "/sensitivity/risk-scores": [],
    "/sensitivity/stats": { highRiskToday: 0, employeesWithRisk: 0, mostCommonType: "None", orgRiskScore: 0 },
    "/heartbeats": [
      { org_id: "org_demo", device_id: "device-1", hostname: "DESKTOP-ABC123", agent_version: "1.0.0", queue_depth: 0, last_detection_time: new Date().toISOString(), os_version: "Windows 11", restart_detected: false, timestamp: new Date().toISOString(), status: "online" }
    ]
  };

  // Find matching mock response
  for (const [key, value] of Object.entries(mockResponses)) {
    if (path.startsWith(key)) return value;
  }
  return {};
}

// Stub — not needed for local backend
export function setApiToken(_token: string | null) {}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
export const fetchEvents = async (
  category?: string,
  riskLevel?: string,
  limit = 200,
  _offset = 0
): Promise<EventsResponse> => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category && category !== "all") params.set("category", category);
  if (riskLevel && riskLevel !== "all") params.set("risk_level", riskLevel);
  return apiFetch<EventsResponse>(`/events?${params}`);
};

export const fetchHeartbeats = async (): Promise<HeartbeatEvent[]> =>
  apiFetch<HeartbeatEvent[]>("/heartbeats");

export const fetchStats = async (): Promise<StatsResponse> =>
  apiFetch<StatsResponse>("/stats");

export const fetchAlerts = async (): Promise<AlertItem[]> =>
  apiFetch<AlertItem[]>("/alerts");

export const fetchAnalytics = async (): Promise<AnalyticsResponse> =>
  apiFetch<AnalyticsResponse>("/analytics");

export const fetchSubscriptions = async (): Promise<SubscriptionItem[]> =>
  apiFetch<SubscriptionItem[]>("/subscriptions");

export const fetchSpendOverview = async (): Promise<SpendOverview> =>
  apiFetch<SpendOverview>("/spend");

export const fetchTeam = async (): Promise<TeamResponse> =>
  apiFetch<TeamResponse>("/team");

export const fetchSettings = async (): Promise<OrgSettings> =>
  apiFetch<OrgSettings>("/settings");

export const fetchMe = async (): Promise<UserProfile> =>
  apiFetch<UserProfile>("/me");

export const getUserDetectionCount = async (email: string): Promise<number> => {
  const data = await apiFetch<{ count: number }>(`/user-detection-count?email=${encodeURIComponent(email)}`);
  return data.count;
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export const updateMe = async (data: Partial<UserProfile>): Promise<{ status: string }> =>
  apiFetch("/me", { method: "PUT", body: JSON.stringify(data) });

export const updateLastActive = async (): Promise<void> => {
  await apiFetch("/last-active", { method: "POST" });
};

export const dismissAlert = async (alertId: string): Promise<{ status: string; id: string }> =>
  apiFetch(`/alerts/${encodeURIComponent(alertId)}/dismiss`, { method: "POST" });

export const resolveAlert = async (alertId: string): Promise<{ status: string; id: string }> =>
  apiFetch(`/alerts/${encodeURIComponent(alertId)}/resolve`, { method: "POST" });

export const inviteTeamMember = async (email: string, role = "member"): Promise<{ status: string; email: string }> =>
  apiFetch("/team/invite", { method: "POST", body: JSON.stringify({ email, role }) });

export const updateSettings = async (settings: Partial<OrgSettings>): Promise<{ status: string }> =>
  apiFetch("/settings", { method: "PUT", body: JSON.stringify(settings) });

// ---------------------------------------------------------------------------
// Firewall
// ---------------------------------------------------------------------------
export const fetchFirewallRules = async (): Promise<FirewallRule[]> =>
  apiFetch<FirewallRule[]>("/firewall/rules");

export const updateFirewallRule = async (
  rule: Omit<FirewallRule, "id" | "block_count" | "updated_at" | "updated_by">
): Promise<{ status: string }> =>
  apiFetch("/firewall/rules", { method: "PUT", body: JSON.stringify(rule) });

export const deleteFirewallRule = async (toolName: string): Promise<void> =>
  apiFetch(`/firewall/rules/${encodeURIComponent(toolName)}`, { method: "DELETE" });

export const fetchBlockEvents = async (_limit = 100): Promise<BlockEvent[]> =>
  apiFetch<BlockEvent[]>("/firewall/events");

export const fetchFirewallStats = async (): Promise<FirewallStats> =>
  apiFetch<FirewallStats>("/firewall/stats");

export const syncFirewallRulesFromEvents = async (): Promise<void> => {
  await apiFetch("/firewall/sync", { method: "POST" });
};

// ---------------------------------------------------------------------------
// Sensitivity / Data Risk
// ---------------------------------------------------------------------------
export const fetchSensitivityEvents = async (
  flag?: SensitivityFlag,
  _limitN = 100
): Promise<SensitivityEvent[]> => {
  const params = flag ? `?flag=${flag}` : "";
  return apiFetch<SensitivityEvent[]>(`/sensitivity/events${params}`);
};

export const fetchEmployeeRiskScores = async (): Promise<EmployeeRiskScore[]> =>
  apiFetch<EmployeeRiskScore[]>("/sensitivity/risk-scores");

export const fetchDataRiskStats = async (): Promise<DataRiskStats> =>
  apiFetch<DataRiskStats>("/sensitivity/stats");

export const markSensitivityEventReviewed = async (eventDocId: string): Promise<void> => {
  await apiFetch(`/sensitivity/events/${encodeURIComponent(eventDocId)}/review`, { method: "PATCH" });
};

export const subscribeToHighRiskEvents = (
  _orgId: string,
  callback: (events: SensitivityEvent[]) => void
): (() => void) => {
  // Poll every 10 seconds as a real-time substitute
  const poll = async () => {
    try {
      const events = await fetchSensitivityEvents();
      callback(events.filter((e) => e.sensitivity_score >= 60).slice(0, 20));
    } catch (_) {}
  };
  poll();
  const interval = setInterval(poll, 10000);
  return () => clearInterval(interval);
};

export const rebuildEmployeeRiskScores = async (): Promise<void> => {
  await apiFetch("/sensitivity/rebuild-scores", { method: "POST" });
};
