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
    throw error;
  }
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
