import { TrendingUp, TrendingDown, Minus, ArrowRight, CheckCircle2, XCircle, Clock, Zap, Server, Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useOverviewKPIs, useGatewayStatus, useCallTimeline, useTopServers, useTopClients, useHumanQueueCount } from "../hooks/useMCPData";
import type { KPIMetric, GatewayStatus as GWStatus, ServerCallVolume, ClientCallVolume } from "../types/mcp.types";
import { AI_CLIENT_COLORS, CATEGORY_COLORS } from "../types/mcp.types";

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ metric }: { metric: KPIMetric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColorMap = { green: "#16A34A", red: "#DC2626", neutral: "#94A3B8" };
  const trendBgMap = { green: "#F0FDF4", red: "#FEF2F2", neutral: "#F8FAFC" };

  return (
    <Card className="p-5 flex flex-col gap-2 border-0 shadow-soft hover:shadow-heavy transition-shadow duration-200">
      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{metric.label}</span>
      <div className="flex items-end gap-3">
        <span className="font-display font-bold" style={{ fontSize: 28, color: "#1A1A2E", lineHeight: 1 }}>
          {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
        </span>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mb-1"
          style={{
            backgroundColor: trendBgMap[metric.trendColor],
            color: trendColorMap[metric.trendColor],
          }}
        >
          <TrendIcon size={12} />
          {Math.abs(metric.change)}%
        </span>
      </div>
    </Card>
  );
}

// ─── Gateway Status Card ─────────────────────────────────────────────────────

function GatewayStatusCard({ status }: { status: GWStatus }) {
  const stateColors = { online: "#16A34A", degraded: "#F59E0B", offline: "#DC2626" };

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Gateway Status</span>
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase"
          style={{
            backgroundColor: stateColors[status.state] + "15",
            color: stateColors[status.state],
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: stateColors[status.state] }} />
          {status.state}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Uptime", value: `${status.uptimePercent}%` },
          { label: "Latency", value: `${status.currentLatencyMs}ms` },
          { label: "Calls/min", value: `${status.callsPerMinute}` },
          { label: "Last incident", value: status.lastIncident ? new Date(status.lastIncident).toLocaleDateString() : "None" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
            <span className="font-semibold" style={{ fontSize: 14, color: "#1A1A2E" }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Donut Chart (simple CSS-based) ──────────────────────────────────────────

function ApprovedBlockedDonut({ approved, blocked }: { approved: number; blocked: number }) {
  const total = approved + blocked;
  const approvedPct = total > 0 ? (approved / total) * 100 : 100;

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col items-center gap-3">
      <span className="font-semibold text-sm self-start" style={{ color: "#1A1A2E" }}>Approved vs Blocked</span>
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#FEE2E2" strokeWidth="4" />
          <circle
            cx="18" cy="18" r="14" fill="none" stroke="#16A34A" strokeWidth="4"
            strokeDasharray={`${approvedPct * 0.88} ${88 - approvedPct * 0.88}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold" style={{ fontSize: 18, color: "#1A1A2E" }}>{total.toLocaleString()}</span>
          <span style={{ fontSize: 10, color: "#94A3B8" }}>total</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{approved.toLocaleString()} approved</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-200" />{blocked.toLocaleString()} blocked</span>
      </div>
    </Card>
  );
}

// ─── Call Timeline Chart (simplified bar chart) ──────────────────────────────

function CallTimelineChart() {
  const { data: timeline } = useCallTimeline();
  if (!timeline) return null;

  const maxVal = Math.max(...timeline.map(p => p.approved + p.blocked), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3 flex-1">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Calls Over Last 24h</span>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#16A34A" }} />Approved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />Blocked</span>
        </div>
      </div>
      <div className="flex items-end gap-[3px]" style={{ height: 140 }}>
        {timeline.map((p, i) => {
          const approvedH = (p.approved / maxVal) * 120;
          const blockedH = (p.blocked / maxVal) * 120;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-[1px] group relative">
              <div className="w-full rounded-t-sm" style={{ height: blockedH, backgroundColor: "#FECACA", minHeight: 2 }} />
              <div className="w-full rounded-t-sm" style={{ height: approvedH, backgroundColor: "#BBF7D0", minHeight: 2 }} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {p.approved + p.blocked} calls
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: "#94A3B8" }}>
        <span>24h ago</span><span>12h</span><span>Now</span>
      </div>
    </Card>
  );
}

// ─── Top Servers Widget ──────────────────────────────────────────────────────

function TopServersWidget() {
  const { data: servers } = useTopServers();
  if (!servers) return null;

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3 flex-1">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Top MCP Servers</span>
      <div className="flex flex-col gap-2">
        {servers.map((s) => {
          const total = s.approved + s.blocked;
          const approvedPct = total > 0 ? (s.approved / total) * 100 : 0;
          return (
            <div key={s.serverName} className="flex items-center gap-3">
              <Server size={14} style={{ color: CATEGORY_COLORS[s.category] || "#94A3B8", flexShrink: 0 }} />
              <span className="text-xs font-medium flex-1 truncate" style={{ color: "#1A1A2E" }}>{s.serverName}</span>
              <span className="text-xs tabular-nums" style={{ color: "#94A3B8", minWidth: 50, textAlign: "right" }}>{total.toLocaleString()}</span>
              <div className="w-16 h-1.5 rounded-full bg-red-100 overflow-hidden">
                <div className="h-full rounded-full bg-green-400" style={{ width: `${approvedPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Top Clients Widget ──────────────────────────────────────────────────────

function TopClientsWidget() {
  const { data: clients } = useTopClients();
  if (!clients) return null;
  const max = Math.max(...clients.map(c => c.totalCalls), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3 flex-1">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Top AI Clients</span>
      <div className="flex flex-col gap-2.5">
        {clients.map((c) => (
          <div key={c.client} className="flex items-center gap-3">
            <Monitor size={14} style={{ color: c.color, flexShrink: 0 }} />
            <span className="text-xs font-medium flex-1" style={{ color: "#1A1A2E" }}>{c.clientLabel}</span>
            <span className="text-xs tabular-nums" style={{ color: "#94A3B8", minWidth: 40, textAlign: "right" }}>{c.totalCalls.toLocaleString()}</span>
            <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: c.color + "20" }}>
              <div className="h-full rounded-full" style={{ width: `${(c.totalCalls / max) * 100}%`, backgroundColor: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Human-in-the-Loop Summary ───────────────────────────────────────────────

function HumanQueueSummary() {
  const { data: count } = useHumanQueueCount();

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3 flex-1">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Human Review Queue</span>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 48, height: 48, backgroundColor: (count ?? 0) > 0 ? "#FFF3EE" : "#F0FDF4" }}
        >
          <Clock size={22} style={{ color: (count ?? 0) > 0 ? "#FF5C1A" : "#16A34A" }} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold" style={{ fontSize: 28, color: "#1A1A2E", lineHeight: 1 }}>
            {count ?? 0}
          </span>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>calls awaiting review</span>
        </div>
        {(count ?? 0) > 0 && (
          <Badge className="ml-auto text-[10px] font-bold" style={{ backgroundColor: "#FF5C1A", color: "#fff" }}>
            Action needed
          </Badge>
        )}
      </div>
      <Link to="/mcp/calls?tab=queue">
        <Button variant="outline" size="sm" className="w-full mt-1 text-xs font-medium gap-1" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
          Review Queue <ArrowRight size={12} />
        </Button>
      </Link>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPOverviewPage() {
  const { data: kpis } = useOverviewKPIs();
  const { data: gateway } = useGatewayStatus();

  const totalApproved = kpis ? Number(kpis[1].value) : 0;
  const totalBlocked = kpis ? Number(kpis[2].value) : 0;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Row 1: KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {kpis?.map((m, i) => <KPICard key={i} metric={m} />)}
      </div>

      {/* Row 2: Timeline + Gateway + Donut */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <CallTimelineChart />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          {gateway && <GatewayStatusCard status={gateway} />}
          <ApprovedBlockedDonut approved={totalApproved} blocked={totalBlocked} />
        </div>
      </div>

      {/* Row 3: Top Servers + Top Clients + Human Queue */}
      <div className="grid grid-cols-3 gap-4">
        <TopServersWidget />
        <TopClientsWidget />
        <HumanQueueSummary />
      </div>
    </div>
  );
}
