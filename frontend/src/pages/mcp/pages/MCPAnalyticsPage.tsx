import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useServerCallVolumes, useClientCallVolumes, useUserCallVolumes,
  useThreatTypeBreakdown, useRiskScoreDistribution, useLatencyOverTime, useBlockedCallsTrend,
} from "../hooks/useMCPData";
import type { ServerCallVolume, ClientCallVolume, RiskScoreBucket } from "../types/mcp.types";

// ─── Bar Chart Component ─────────────────────────────────────────────────────

function HorizontalBarChart({ items, maxValue, renderBar }: { items: { label: string; value: number; color: string }[]; maxValue: number; renderBar?: (item: { label: string; value: number; color: string }) => React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs w-28 truncate" style={{ color: "#6B7280" }}>{item.label}</span>
          <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, backgroundColor: item.color }} />
          </div>
          <span className="text-xs font-bold tabular-nums w-12 text-right" style={{ color: "#1A1A2E" }}>{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stacked Bar Chart for Servers ───────────────────────────────────────────

function ServerCallsChart() {
  const { data: servers } = useServerCallVolumes();
  if (!servers) return null;
  const max = Math.max(...servers.map(s => s.totalCalls), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Calls by MCP Server</span>
        <div className="flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#16A34A" }} />Approved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />Blocked</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {servers.map(s => (
          <div key={s.serverName} className="flex items-center gap-3">
            <span className="text-xs w-28 truncate" style={{ color: "#6B7280" }}>{s.serverName}</span>
            <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden flex">
              <div className="h-full" style={{ width: `${(s.approved / max) * 100}%`, backgroundColor: "#BBF7D0" }} />
              <div className="h-full" style={{ width: `${(s.blocked / max) * 100}%`, backgroundColor: "#FECACA" }} />
            </div>
            <span className="text-xs tabular-nums w-12 text-right font-medium" style={{ color: "#1A1A2E" }}>{s.totalCalls.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Client Calls Chart ──────────────────────────────────────────────────────

function ClientCallsChart() {
  const { data: clients } = useClientCallVolumes();
  if (!clients) return null;
  const max = Math.max(...clients.map(c => c.totalCalls), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Calls by AI Client</span>
      <HorizontalBarChart
        items={clients.map(c => ({ label: c.clientLabel, value: c.totalCalls, color: c.color }))}
        maxValue={max}
      />
    </Card>
  );
}

// ─── Blocked Calls Trend ─────────────────────────────────────────────────────

function BlockedTrendChart() {
  const { data: trend } = useBlockedCallsTrend();
  if (!trend) return null;
  const maxBlocked = Math.max(...trend.map(p => p.blocked), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Blocked Calls Trend</span>
      <div className="flex items-end gap-[2px]" style={{ height: 100 }}>
        {trend.map((p, i) => (
          <div key={i} className="flex-1 group relative">
            <div className="w-full rounded-t-sm" style={{ height: `${(p.blocked / maxBlocked) * 80}px`, backgroundColor: "#FECACA", minHeight: 2 }} />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {p.blocked} blocked
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: "#94A3B8" }}>
        <span>24h ago</span><span>Now</span>
      </div>
    </Card>
  );
}

// ─── User Calls Chart ────────────────────────────────────────────────────────

function UserCallsChart() {
  const { data: users } = useUserCallVolumes();
  if (!users) return null;
  const max = Math.max(...users.map(u => u.totalCalls), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Top Users by Call Volume</span>
      <HorizontalBarChart
        items={users.map(u => ({
          label: u.userName,
          value: u.totalCalls,
          color: u.avgRiskScore < 20 ? "#16A34A" : u.avgRiskScore < 40 ? "#F59E0B" : "#EF4444",
        }))}
        maxValue={max}
      />
    </Card>
  );
}

// ─── Threat Type Donut ───────────────────────────────────────────────────────

function ThreatTypeDonut() {
  const { data: threats } = useThreatTypeBreakdown();
  if (!threats) return null;
  const total = threats.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Threat Type Breakdown</span>
      <div className="flex items-center gap-6">
        {/* Simple visual */}
        <div className="relative" style={{ width: 100, height: 100 }}>
          <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
            {threats.reduce<{ elements: React.ReactNode[]; offset: number }>((acc, t) => {
              const pct = (t.count / total) * 100;
              const dash = pct * 0.88;
              acc.elements.push(
                <circle key={t.type} cx="18" cy="18" r="14" fill="none" stroke={t.color} strokeWidth="4" strokeDasharray={`${dash} ${88 - dash}`} strokeDashoffset={-acc.offset * 0.88} />
              );
              acc.offset += pct;
              return acc;
            }, { elements: [], offset: 0 }).elements}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold text-sm" style={{ color: "#1A1A2E" }}>{total}</span>
            <span style={{ fontSize: 9, color: "#94A3B8" }}>threats</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          {threats.map(t => (
            <div key={t.type} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-xs flex-1" style={{ color: "#6B7280" }}>{t.label}</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: "#1A1A2E" }}>{t.count}</span>
              <span className="text-[10px]" style={{ color: "#94A3B8" }}>({t.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Risk Score Histogram ────────────────────────────────────────────────────

function RiskHistogram() {
  const { data: buckets } = useRiskScoreDistribution();
  if (!buckets) return null;
  const max = Math.max(...buckets.map(b => b.count), 1);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Risk Score Distribution</span>
      <div className="flex items-end gap-1" style={{ height: 100 }}>
        {buckets.map(b => (
          <div key={b.range} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="w-full rounded-t-sm transition-all" style={{ height: `${(b.count / max) * 80}px`, backgroundColor: b.color, minHeight: 4 }} />
            <span className="text-[8px]" style={{ color: "#94A3B8" }}>{b.range}</span>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {b.count} calls
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Latency Over Time ───────────────────────────────────────────────────────

function LatencyChart() {
  const { data: latency } = useLatencyOverTime();
  if (!latency) return null;
  const maxLat = Math.max(...latency.map(p => p.avgLatencyMs), 20);

  return (
    <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Latency Over Time</span>
        <span className="text-[10px]" style={{ color: "#EF4444" }}>— 15ms threshold</span>
      </div>
      <div className="relative" style={{ height: 100 }}>
        {/* Threshold line */}
        <div className="absolute w-full border-t border-dashed" style={{ top: `${100 - (15 / maxLat) * 100}%`, borderColor: "#FECACA" }} />
        <div className="flex items-end gap-[2px] h-full">
          {latency.map((p, i) => {
            const h = (p.avgLatencyMs / maxLat) * 90;
            const isHigh = p.avgLatencyMs > 15;
            return (
              <div key={i} className="flex-1 group relative">
                <div className="w-full rounded-t-sm" style={{ height: `${h}px`, backgroundColor: isHigh ? "#FECACA" : "#BBF7D0", minHeight: 2 }} />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {p.avgLatencyMs.toFixed(1)}ms
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: "#94A3B8" }}>
        <span>24h ago</span><span>Now</span>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPAnalyticsPage() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Analytics</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>Deep insights into MCP usage, threats, and performance</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <ServerCallsChart />
        <ClientCallsChart />
        <BlockedTrendChart />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <UserCallsChart />
        <ThreatTypeDonut />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-4">
        <LatencyChart />
        <RiskHistogram />
      </div>

      {/* Export */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" size="sm" className="text-xs gap-1"><Download size={13} />Download Report (PDF)</Button>
        <Button size="sm" className="text-xs gap-1" style={{ backgroundColor: "#FF5C1A" }}><Download size={13} />Push to SIEM</Button>
      </div>
    </div>
  );
}
