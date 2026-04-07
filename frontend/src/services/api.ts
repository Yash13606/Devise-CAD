/**
 * Devise Dashboard — API service layer (Supabase Direct)
 *
 * Queries Supabase PostgREST directly.
 * All function signatures are unchanged — hooks/components need no edits.
 */

import { supabase } from "@/lib/supabase";

// ─── Interfaces ─────────────────────────────────────────────────────────────

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
  user_email?: string;
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

// ─── No-ops for legacy call sites ──────────────────────────────────────────
export function setOrgId(_orgId: string | null) {}
export function setUserId(_userId: string | null) {}
export function getOrgId() { return null; }
export function getUserId() { return null; }
export function setApiToken(_token: string | null) {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a raw Supabase detection_events row → DetectionEvent */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(row: any): DetectionEvent {
  return {
    event_id: row.id ?? "",
    user_id: row.user_id ?? "",
    user_email: row.user_id ?? "",
    department: "Unknown",
    device_id: row.device_id ?? "",
    tool_name: row.tool_name ?? "",
    domain: row.domain ?? "",
    category: row.category ?? "Unknown",
    vendor: row.vendor ?? "",
    risk_level: (row.risk_level as "low" | "medium" | "high") ?? "low",
    source: "agent",
    process_name: row.process_name ?? "",
    process_path: row.process_path ?? "",
    is_approved: row.is_approved ?? false,
    is_blocked: row.is_blocked ?? false,
    timestamp: row.timestamp ?? new Date().toISOString(),
    connection_frequency: row.connection_frequency ?? undefined,
    high_frequency: row.high_frequency ?? undefined,
    bytes_read: row.bytes_read ?? undefined,
    bytes_write: row.bytes_write ?? undefined,
    sensitivity_score: row.sensitivity_score ?? undefined,
    sensitivity_flag: row.sensitivity_flag ?? undefined,
  };
}

/** Map a raw heartbeats row → HeartbeatEvent */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHeartbeat(row: any): HeartbeatEvent {
  return {
    org_id: row.org_id ?? "",
    device_id: row.device_id ?? "",
    hostname: row.device_id ?? "unknown-host",
    agent_version: row.agent_version ?? "1.0.0",
    queue_depth: 0,
    last_detection_time: null,
    os_version: row.os_version ?? "",
    restart_detected: false,
    timestamp: row.last_seen ?? new Date().toISOString(),
    status: (row.status as "online" | "offline") ?? "online",
    user_email: row.user_email ?? "",
  };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export const fetchEvents = async (
  category?: string,
  riskLevel?: string,
  limit = 200,
): Promise<EventsResponse> => {
  let query = supabase
    .from("detection_events")
    .select("*", { count: "exact" })
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (category && category !== "all") query = query.eq("category", category);
  if (riskLevel && riskLevel !== "all") query = query.eq("risk_level", riskLevel);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    total: count ?? 0,
    events: (data ?? []).map(mapEvent),
  };
};

export const fetchHeartbeats = async (): Promise<HeartbeatEvent[]> => {
  const { data, error } = await supabase
    .from("heartbeats")
    .select("*")
    .order("last_seen", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapHeartbeat);
};

export const fetchStats = async (): Promise<StatsResponse> => {
  const [eventsRes, heartbeatsRes] = await Promise.all([
    supabase.from("detection_events").select("id, risk_level, is_approved, tool_name, is_blocked", { count: "exact" }),
    supabase.from("heartbeats").select("device_id, status"),
  ]);

  const events = eventsRes.data ?? [];
  const heartbeats = heartbeatsRes.data ?? [];

  const uniqueTools = new Set(events.map((e: any) => e.tool_name)).size;
  const highRiskCount = events.filter((e: any) => e.risk_level === "high").length;
  const unapprovedCount = events.filter((e: any) => !e.is_approved).length;
  const onlineDevices = heartbeats.filter((h: any) => h.status === "active" || h.status === "online").length;
  const activeAlerts = events.filter((e: any) => e.risk_level === "high" || e.is_blocked).length;

  return {
    totalDetections: eventsRes.count ?? events.length,
    uniqueTools,
    highRiskCount,
    unapprovedCount,
    onlineDevices: onlineDevices || heartbeats.length,
    totalDevices: heartbeats.length,
    activeAlerts,
  };
};

export const fetchAlerts = async (): Promise<AlertItem[]> => {
  const { data, error } = await supabase
    .from("detection_events")
    .select("id, tool_name, domain, risk_level, timestamp, is_blocked, high_frequency")
    .or("risk_level.eq.high,is_blocked.eq.true,high_frequency.eq.true")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any): AlertItem => {
    const isBlocked = row.is_blocked;
    const isHighFreq = row.high_frequency;
    const type = isBlocked ? "unapproved" : isHighFreq ? "high_frequency" : "high_risk";
    return {
      id: row.id,
      type,
      title: isBlocked
        ? `Blocked: ${row.tool_name}`
        : isHighFreq
        ? `High Frequency: ${row.tool_name}`
        : `High Risk: ${row.tool_name}`,
      description: `${row.tool_name} detected on ${row.domain ?? "unknown domain"}`,
      timestamp: row.timestamp ?? new Date().toISOString(),
      severity: row.risk_level ?? "medium",
    };
  });
};

export const fetchAnalytics = async (): Promise<AnalyticsResponse> => {
  const { data, error } = await supabase
    .from("detection_events")
    .select("tool_name, category, timestamp, process_name")
    .order("timestamp", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  const events = data ?? [];

  // By tool
  const toolCounts: Record<string, number> = {};
  events.forEach((e: any) => {
    toolCounts[e.tool_name] = (toolCounts[e.tool_name] ?? 0) + 1;
  });
  const byTool = Object.entries(toolCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By category
  const catCounts: Record<string, number> = {};
  events.forEach((e: any) => {
    const cat = e.category || "Unknown";
    catCounts[cat] = (catCounts[cat] ?? 0) + 1;
  });
  const byCategory = Object.entries(catCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Over time (last 24h by hour)
  const hourCounts: Record<string, number> = {};
  events.forEach((e: any) => {
    if (!e.timestamp) return;
    const hour = new Date(e.timestamp).toISOString().slice(0, 13) + ":00";
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  });
  const overTime = Object.entries(hourCounts)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-24);

  // Top processes
  const procCounts: Record<string, number> = {};
  events.forEach((e: any) => {
    const proc = e.process_name || "unknown";
    procCounts[proc] = (procCounts[proc] ?? 0) + 1;
  });
  const topProcesses = Object.entries(procCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { byTool, byCategory, overTime, topProcesses };
};

// ─── Firewall ────────────────────────────────────────────────────────────────

export const fetchFirewallRules = async (): Promise<FirewallRule[]> => {
  const { data, error } = await supabase
    .from("firewall_rules")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any): FirewallRule => ({
    id: row.id,
    tool_name: row.tool_name ?? "",
    domain: row.domain ?? "",
    status: row.action === "block" ? "blocked" : "allowed",
    updated_at: row.updated_at ?? "",
    updated_by: "system",
    block_count: 0,
  }));
};

export const updateFirewallRule = async (
  rule: Omit<FirewallRule, "id" | "block_count" | "updated_at" | "updated_by">
): Promise<{ status: string }> => {
  const { error } = await supabase
    .from("firewall_rules")
    .upsert({
      domain: rule.domain,
      tool_name: rule.tool_name,
      action: rule.status === "blocked" ? "block" : "allow",
      updated_at: new Date().toISOString(),
    }, { onConflict: "domain" });
  if (error) throw new Error(error.message);
  return { status: "ok" };
};

export const deleteFirewallRule = async (toolName: string): Promise<void> => {
  const { error } = await supabase
    .from("firewall_rules")
    .delete()
    .eq("tool_name", toolName);
  if (error) throw new Error(error.message);
};

export const fetchBlockEvents = async (_limit = 100): Promise<BlockEvent[]> => {
  const { data, error } = await supabase
    .from("detection_events")
    .select("id, tool_name, domain, user_id, device_id, timestamp, block_reason, policy_matched, org_id")
    .eq("is_blocked", true)
    .order("timestamp", { ascending: false })
    .limit(_limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any): BlockEvent => ({
    id: row.id,
    event_id: row.id,
    tool_name: row.tool_name,
    domain: row.domain ?? "",
    user_id: row.user_id ?? "",
    device_id: row.device_id ?? "",
    timestamp: row.timestamp ?? "",
    block_reason: row.block_reason ?? null,
    policy_matched: row.policy_matched ?? null,
    org_id: row.org_id ?? "",
  }));
};

export const fetchFirewallStats = async (): Promise<FirewallStats> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [todayRes, weekRes, rulesRes] = await Promise.all([
    supabase.from("detection_events").select("id", { count: "exact" }).eq("is_blocked", true).gte("timestamp", today.toISOString()),
    supabase.from("detection_events").select("id", { count: "exact" }).eq("is_blocked", true).gte("timestamp", weekAgo.toISOString()),
    supabase.from("firewall_rules").select("id", { count: "exact" }),
  ]);

  const blockedToday = todayRes.count ?? 0;
  const blockEventsThisWeek = weekRes.count ?? 0;
  const policyViolations = rulesRes.count ?? 0;
  const complianceScore = Math.max(0, 100 - blockedToday * 5);

  return { blockedToday, blockEventsThisWeek, policyViolations, complianceScore };
};

export const syncFirewallRulesFromEvents = async (): Promise<void> => {};

// ─── Stubs for missing tables (return safe empty defaults) ──────────────────

export const fetchSubscriptions = async (): Promise<SubscriptionItem[]> => [];

export const fetchSpendOverview = async (): Promise<SpendOverview> => ({
  totalMonthlySpend: 0,
  monthlyBudget: 0,
  budgetRemaining: 0,
  zombieLicenses: 0,
  zombieCost: 0,
});

export const fetchTeam = async (): Promise<TeamResponse> => ({
  members: [],
  invites: [],
});

export const fetchSettings = async (): Promise<OrgSettings> => ({
  id: "default",
  org_id: "default",
  monthly_budget: 10000,
  alert_threshold: 80,
  auto_block: false,
  allowed_categories: [],
  blocked_domains: [],
  notification_email: true,
  notification_slack: false,
  slack_webhook_url: null,
});

export const fetchMe = async (): Promise<UserProfile> => ({
  id: "local",
  org_id: "default",
  full_name: "Admin User",
  email: "",
  department: "Engineering",
  role: "admin",
  avatar_url: null,
  org_name: "My Organization",
  org_slug: "my-org",
});

export const getUserDetectionCount = async (_email: string): Promise<number> => 0;

export const fetchSensitivityEvents = async (): Promise<SensitivityEvent[]> => {
  // Use detection_events rows that have sensitivity data
  const { data, error } = await supabase
    .from("detection_events")
    .select("id, tool_name, domain, user_id, device_id, timestamp, sensitivity_flag, sensitivity_score, window_title, paste_size_chars, file_name, org_id, reviewed")
    .not("sensitivity_flag", "is", null)
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error) return [];

  return (data ?? []).map((row: any): SensitivityEvent => ({
    id: row.id,
    event_id: row.id,
    tool_name: row.tool_name ?? "",
    domain: row.domain ?? "",
    user_id: row.user_id ?? "",
    device_id: row.device_id ?? "",
    timestamp: row.timestamp ?? "",
    sensitivity_flag: row.sensitivity_flag as SensitivityFlag,
    sensitivity_score: row.sensitivity_score ?? 0,
    window_title: row.window_title ?? null,
    paste_size_chars: row.paste_size_chars ?? null,
    file_name: row.file_name ?? null,
    org_id: row.org_id ?? "",
    reviewed: row.reviewed ?? false,
  }));
};

export const fetchEmployeeRiskScores = async (): Promise<EmployeeRiskScore[]> => [];

export const fetchDataRiskStats = async (): Promise<DataRiskStats> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("detection_events")
    .select("id", { count: "exact" })
    .eq("risk_level", "high")
    .gte("timestamp", today.toISOString());

  return {
    highRiskToday: count ?? 0,
    employeesWithRisk: 0,
    mostCommonType: "—",
    orgRiskScore: 0,
  };
};

export const markSensitivityEventReviewed = async (eventId: string): Promise<void> => {
  const { error } = await supabase
    .from("detection_events")
    .update({ reviewed: true })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
};

export const subscribeToHighRiskEvents = (
  _orgId: string,
  callback: (events: SensitivityEvent[]) => void
): (() => void) => {
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

export const rebuildEmployeeRiskScores = async (): Promise<void> => {};

// ─── Mutations (stubs for missing tables) ──────────────────────────────────

export const updateMe = async (_data: Partial<UserProfile>): Promise<{ status: string }> =>
  ({ status: "ok" });

export const updateLastActive = async (): Promise<void> => {};

export const dismissAlert = async (alertId: string): Promise<{ status: string; id: string }> =>
  ({ status: "ok", id: alertId });

export const resolveAlert = async (alertId: string): Promise<{ status: string; id: string }> =>
  ({ status: "ok", id: alertId });

export const inviteTeamMember = async (_email: string, _role = "member"): Promise<{ status: string; email: string }> =>
  ({ status: "ok", email: _email });

export const updateSettings = async (_settings: Partial<OrgSettings>): Promise<{ status: string }> =>
  ({ status: "ok" });
