// =============================================================================
// Devise Gate — MCP Dashboard Type Definitions
// =============================================================================

// --- Enums & Literal Types ---

export type AIClient = 'cursor' | 'claude-code' | 'vscode' | 'chatgpt' | 'other';

export type MCPCallDecision = 'approved' | 'blocked' | 'queued';

export type ThreatType = 'pii' | 'prompt-injection' | 'tool-poisoning' | 'command-injection' | 'data-exfiltration';

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';

export type MCPServerStatus = 'approved' | 'pending' | 'blocked';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export type PolicyType = 'role-based' | 'device' | 'location' | 'time' | 'offboarding' | 'custom';

export type GatewayState = 'online' | 'degraded' | 'offline';

export type SessionStatus = 'active' | 'expired' | 'revoked';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export type SSOProvider = 'okta' | 'entra' | 'oidc' | 'none';

// --- Core Entities ---

export interface MCPUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: string;
}

export interface MCPServerInfo {
  id: string;
  name: string;
  category: string;
  url: string;
  icon?: string;
}

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  detail: string;
  scoreContribution: number;
  evidence?: PIIEvidence | PromptInjectionEvidence | ToolPoisoningEvidence | CommandInjectionEvidence;
}

export interface PIIEvidence {
  piiType: string; // 'email' | 'phone' | 'credit-card' | 'ssn'
  redactedPreview: string;
  locationInPayload: string;
}

export interface PromptInjectionEvidence {
  injectedInstruction: string;
  technique: string; // 'role-override' | 'jailbreak' | 'data-extraction'
}

export interface ToolPoisoningEvidence {
  maliciousBehavior: string;
  attemptedAction: string;
  serverTrustScore: number;
}

export interface CommandInjectionEvidence {
  injectedCommand: string;
  targetSystem: string;
}

export interface RiskScoreBreakdown {
  total: number;
  components: {
    label: string;
    score: number;
    maxScore: number;
  }[];
}

export interface PolicyDecisionStep {
  step: string;
  result: 'pass' | 'fail' | 'warn';
  reason: string;
}

export interface MCPCall {
  id: string;
  timestamp: string;
  user: MCPUser;
  aiClient: AIClient;
  mcpServer: MCPServerInfo;
  method: string;
  riskScore: number;
  riskBreakdown: RiskScoreBreakdown;
  decision: MCPCallDecision;
  decisionBy: string; // policy name or 'human:<username>'
  latencyMs: number;
  threats: ThreatEvent[];
  policyTrail: PolicyDecisionStep[];
  requestPayload?: string;
  responsePayload?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
  status: MCPServerStatus;
  allowedRoles: string[];
  monthlyCallCount: number;
  avgRiskScore: number;
  rateLimit: number;
  policy?: OPAPolicy;
  requestedBy?: MCPUser;
  requestedAt?: string;
  addedAt: string;
}

export interface OPAPolicy {
  id: string;
  name: string;
  regoCode: string;
  simpleRules?: PolicyRule[];
}

export interface PolicyRule {
  field: string;     // 'role' | 'device' | 'location' | 'time'
  operator: string;  // 'is' | 'is_not' | 'in' | 'not_in'
  value: string;
  connector?: 'AND' | 'OR';
}

export interface MCPAlert {
  id: string;
  severity: AlertSeverity;
  type: string;
  title: string;
  description: string;
  user: string;
  mcpServer: string;
  aiClient?: AIClient;
  device?: string;
  timestamp: string;
  status: AlertStatus;
  recommendedAction?: string;
  eventData?: Record<string, unknown>;
}

export interface MCPPolicy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  scope: string[];       // server IDs or 'all'
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
  config: Record<string, unknown>;
}

export interface MCPSession {
  id: string;
  user: MCPUser;
  device: string;
  aiClient: AIClient;
  startedAt: string;
  expiresAt: string;
  status: SessionStatus;
}

export interface GatewayStatus {
  state: GatewayState;
  uptimePercent: number;
  lastIncident: string | null;
  currentLatencyMs: number;
  callsPerMinute: number;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change: number;       // percentage change
  trend: 'up' | 'down' | 'flat';
  trendColor: 'green' | 'red' | 'neutral';
}

export interface SSOStatus {
  provider: SSOProvider;
  isConnected: boolean;
  lastSync: string | null;
  providerLogo?: string;
}

export interface SCIMConfig {
  endpointUrl: string;
  secretToken: string;
  lastSyncAt: string;
  usersSynced: number;
  autoRevocationEnabled: boolean;
  offboardingMode: 'instant' | '24hr-grace';
}

export interface RoleAccessEntry {
  serverId: string;
  serverName: string;
  roles: Record<string, 'allowed' | 'blocked' | 'conditional'>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer' | 'analyst';
  lastLogin: string;
  avatar?: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'siem' | 'slack' | 'pagerduty' | 'hr' | 'mdm';
  status: IntegrationStatus;
  config: Record<string, unknown>;
  lastSync?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  plan: string;
  pdfUrl: string;
}

export interface BillingPlan {
  name: string;
  seats: number;
  renewalDate: string;
  callsThisMonth: number;
  seatsActive: number;
}

// --- Chart Data Types ---

export interface TimeSeriesDataPoint {
  timestamp: string;
  approved: number;
  blocked: number;
}

export interface ServerCallVolume {
  serverName: string;
  category: string;
  totalCalls: number;
  approved: number;
  blocked: number;
}

export interface ClientCallVolume {
  client: AIClient;
  clientLabel: string;
  totalCalls: number;
  color: string;
}

export interface UserCallVolume {
  userName: string;
  totalCalls: number;
  avgRiskScore: number;
}

export interface ThreatTypeCount {
  type: ThreatType;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RiskScoreBucket {
  range: string;
  count: number;
  color: string;
}

export interface LatencyDataPoint {
  timestamp: string;
  avgLatencyMs: number;
}

// --- Notification Config ---

export interface AlertNotificationRule {
  alertType: string;
  enabled: boolean;
  channels: ('slack' | 'email' | 'pagerduty' | 'webhook')[];
  minSeverity: AlertSeverity;
}

// --- Audit Log ---

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
  resource: string;
}

// --- Firewall ---

export interface FirewallRule {
  id: string;
  rule: string;
  type: 'ip' | 'domain';
  addedBy: string;
  addedAt: string;
}

// --- AI Client Display Helpers ---

export const AI_CLIENT_LABELS: Record<AIClient, string> = {
  'cursor': 'Cursor',
  'claude-code': 'Claude Code',
  'vscode': 'VS Code',
  'chatgpt': 'ChatGPT',
  'other': 'Other',
};

export const AI_CLIENT_COLORS: Record<AIClient, string> = {
  'cursor': '#00B4D8',
  'claude-code': '#D97706',
  'vscode': '#0078D4',
  'chatgpt': '#10A37F',
  'other': '#94A3B8',
};

export const THREAT_TYPE_LABELS: Record<ThreatType, string> = {
  'pii': 'PII Detected',
  'prompt-injection': 'Prompt Injection',
  'tool-poisoning': 'Tool Poisoning',
  'command-injection': 'Command Injection',
  'data-exfiltration': 'Data Exfiltration',
};

export const THREAT_TYPE_COLORS: Record<ThreatType, string> = {
  'pii': '#EF4444',
  'prompt-injection': '#F59E0B',
  'tool-poisoning': '#8B5CF6',
  'command-injection': '#DC2626',
  'data-exfiltration': '#EC4899',
};

export const SEVERITY_COLORS: Record<ThreatSeverity | AlertSeverity, string> = {
  'critical': '#DC2626',
  'high': '#EF4444',
  'medium': '#F59E0B',
  'low': '#3B82F6',
  'info': '#6B7280',
};

export const SERVER_CATEGORIES = [
  'Dev Tools', 'Comms', 'Data', 'Storage', 'Custom',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'Dev Tools': '#3B82F6',
  'Comms': '#8B5CF6',
  'Data': '#10B981',
  'Storage': '#F59E0B',
  'Custom': '#94A3B8',
};
