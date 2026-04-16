import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Download, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMCPCalls, useHumanQueue } from "../hooks/useMCPData";
import type { MCPCall } from "../types/mcp.types";
import { AI_CLIENT_LABELS, AI_CLIENT_COLORS, SEVERITY_COLORS } from "../types/mcp.types";

// ─── Decision Badge ──────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: MCPCall["decision"] }) {
  const map = {
    approved: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle2, label: "Approved" },
    blocked: { bg: "#FEF2F2", color: "#DC2626", icon: XCircle, label: "Blocked" },
    queued: { bg: "#FFF7ED", color: "#F59E0B", icon: Clock, label: "Queued" },
  };
  const { bg, color, icon: Icon, label } = map[decision];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: bg, color }}>
      <Icon size={11} /> {label}
    </span>
  );
}

// ─── Risk Badge ──────────────────────────────────────────────────────────────

function RiskBadge({ score }: { score: number }) {
  const color = score < 30 ? "#16A34A" : score < 60 ? "#F59E0B" : score < 80 ? "#EF4444" : "#DC2626";
  const bg = score < 30 ? "#F0FDF4" : score < 60 ? "#FFFBEB" : score < 80 ? "#FEF2F2" : "#FEE2E2";
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums" style={{ backgroundColor: bg, color }}>
      {score}
    </span>
  );
}

// ─── Call Detail Sheet ───────────────────────────────────────────────────────

function CallDetailSheet({ call, open, onClose }: { call: MCPCall | null; open: boolean; onClose: () => void }) {
  const [rawOpen, setRawOpen] = useState(false);
  if (!call) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[560px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-base">Call Detail</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 mt-4">
          {/* Summary */}
          <Card className="p-4 border-0 bg-[#FAFBFC]">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#94A3B8] text-xs">Timestamp</span><p className="mt-0.5 text-xs font-medium">{new Date(call.timestamp).toLocaleString()}</p></div>
              <div><span className="text-[#94A3B8] text-xs">User</span><p className="mt-0.5 text-xs font-medium">{call.user.name}</p></div>
              <div><span className="text-[#94A3B8] text-xs">AI Client</span><p className="mt-0.5 text-xs font-medium">{AI_CLIENT_LABELS[call.aiClient]}</p></div>
              <div><span className="text-[#94A3B8] text-xs">MCP Server</span><p className="mt-0.5 text-xs font-medium">{call.mcpServer.name}</p></div>
              <div><span className="text-[#94A3B8] text-xs">Method</span><p className="mt-0.5 text-xs font-mono">{call.method}</p></div>
              <div><span className="text-[#94A3B8] text-xs">Decision</span><p className="mt-1"><DecisionBadge decision={call.decision} /></p></div>
              <div><span className="text-[#94A3B8] text-xs">Decision By</span><p className="mt-0.5 text-xs font-medium">{call.decisionBy}</p></div>
              <div><span className="text-[#94A3B8] text-xs">Latency</span><p className="mt-0.5 text-xs font-medium">{call.latencyMs}ms</p></div>
            </div>
          </Card>

          {/* Risk Score Breakdown */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Risk Score</span>
              <RiskBadge score={call.riskScore} />
            </div>
            <div className="flex flex-col gap-2">
              {call.riskBreakdown.components.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs w-28 truncate" style={{ color: "#6B7280" }}>{c.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.maxScore > 0 ? (c.score / c.maxScore) * 100 : 0}%`, backgroundColor: c.score > 0 ? "#EF4444" : "#E5E7EB" }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: c.score > 0 ? "#EF4444" : "#94A3B8" }}>+{c.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Decision Trail */}
          <div>
            <span className="font-semibold text-sm block mb-3" style={{ color: "#1A1A2E" }}>Policy Decision Trail</span>
            <div className="flex flex-col gap-1.5">
              {call.policyTrail.map((step, i) => {
                const icon = step.result === "pass" ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> : step.result === "warn" ? <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" /> : <XCircle size={14} className="text-red-500 flex-shrink-0" />;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ backgroundColor: step.result === "fail" ? "#FEF2F2" : "transparent" }}>
                    {icon}
                    <span className="font-medium" style={{ color: "#1A1A2E" }}>{step.step}</span>
                    <span className="ml-auto" style={{ color: "#94A3B8" }}>{step.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw Payload */}
          <div>
            <button onClick={() => setRawOpen(!rawOpen)} className="flex items-center gap-1 text-sm font-semibold mb-2" style={{ color: "#1A1A2E" }}>
              {rawOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Raw Payload
            </button>
            {rawOpen && (
              <div className="flex flex-col gap-2">
                <div><span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Request</span><pre className="mt-1 p-3 rounded-lg bg-[#1A1A2E] text-green-300 text-xs overflow-x-auto" style={{ fontSize: 11 }}>{call.requestPayload}</pre></div>
                <div><span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Response</span><pre className="mt-1 p-3 rounded-lg bg-[#1A1A2E] text-blue-300 text-xs overflow-x-auto" style={{ fontSize: 11 }}>{call.responsePayload}</pre></div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Human Queue Card ────────────────────────────────────────────────────────

function QueueCard({ call }: { call: MCPCall }) {
  const waitMinutes = Math.floor((Date.now() - new Date(call.timestamp).getTime()) / 60000);
  const topThreat = call.threats[0];

  return (
    <Card className="p-4 border-0 shadow-soft flex flex-col gap-3 hover:shadow-heavy transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, backgroundColor: call.riskScore >= 80 ? "#FEE2E2" : "#FFF7ED" }}>
            <span className="font-bold text-sm" style={{ color: call.riskScore >= 80 ? "#DC2626" : "#F59E0B" }}>{call.riskScore}</span>
          </div>
          <div>
            <span className="font-semibold text-sm block" style={{ color: "#1A1A2E" }}>{call.user.name}</span>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{AI_CLIENT_LABELS[call.aiClient]} → {call.mcpServer.name}</span>
          </div>
        </div>
        <span className="text-xs" style={{ color: "#94A3B8" }}>Waiting {waitMinutes}m</span>
      </div>
      <div className="text-xs font-mono p-2 rounded-md bg-[#FAFBFC] truncate" style={{ color: "#6B7280" }}>
        {call.method}()
      </div>
      {topThreat && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={12} style={{ color: SEVERITY_COLORS[topThreat.severity] }} />
          <span className="text-xs" style={{ color: SEVERITY_COLORS[topThreat.severity] }}>{topThreat.detail}</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-8 text-xs" style={{ backgroundColor: "#16A34A" }}>
          <CheckCircle2 size={12} className="mr-1" /> Approve
        </Button>
        <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs">
          <XCircle size={12} className="mr-1" /> Reject
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CALLS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPCallsPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "queue" ? "queue" : "all";
  const { data: calls } = useMCPCalls();
  const { data: queue } = useHumanQueue();
  const [selectedCall, setSelectedCall] = useState<MCPCall | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = (calls ?? []).filter(c => {
    const matchSearch = c.user.name.toLowerCase().includes(search.toLowerCase()) || c.mcpServer.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.decision === statusFilter;
    return matchSearch && matchStatus;
  });

  const queueCount = queue?.length ?? 0;
  const oldestWait = queue && queue.length > 0 ? Math.floor((Date.now() - new Date(queue[queue.length - 1].timestamp).getTime()) / 60000) : 0;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Calls Log</h1>
        <p className="text-sm" style={{ color: "#94A3B8" }}>All MCP calls with risk scoring and human review queue</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="all">All Calls</TabsTrigger>
          <TabsTrigger value="queue" className="gap-1.5">
            Human Queue
            {queueCount > 0 && (
              <span className="flex items-center justify-center rounded-full text-white text-[10px] font-bold ml-1" style={{ minWidth: 18, height: 18, padding: "0 5px", backgroundColor: "#FF5C1A" }}>
                {queueCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Calls Tab */}
        <TabsContent value="all">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
              <Input placeholder="Search user or server…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="ml-auto text-xs gap-1">
              <Download size={13} /> Export CSV
            </Button>
          </div>

          {/* Table */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>AI Client</TableHead>
                  <TableHead>MCP Server</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 30).map(c => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-[#FAFBFC]" onClick={() => setSelectedCall(c)}>
                    <TableCell className="text-xs tabular-nums" style={{ color: "#6B7280" }}>{new Date(c.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] text-white" style={{ backgroundColor: "#FF5C1A" }}>{c.user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                        <span className="text-xs font-medium">{c.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium" style={{ color: AI_CLIENT_COLORS[c.aiClient] }}>{AI_CLIENT_LABELS[c.aiClient]}</span>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{c.mcpServer.name}</TableCell>
                    <TableCell className="text-xs font-mono" style={{ color: "#6B7280" }}>{c.method}</TableCell>
                    <TableCell className="text-center"><RiskBadge score={c.riskScore} /></TableCell>
                    <TableCell><DecisionBadge decision={c.decision} /></TableCell>
                    <TableCell className="text-right text-xs tabular-nums" style={{ color: c.latencyMs > 15 ? "#DC2626" : "#16A34A" }}>{c.latencyMs}ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Human Queue Tab */}
        <TabsContent value="queue">
          {queueCount > 0 && (
            <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-2" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <Clock size={16} style={{ color: "#F59E0B" }} />
              <span className="text-sm font-medium" style={{ color: "#92400E" }}>
                {queueCount} calls awaiting review — oldest waiting {oldestWait}m
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {(queue ?? []).map(c => <QueueCard key={c.id} call={c} />)}
          </div>
          {queueCount === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "#16A34A" }} />
              <p className="font-semibold" style={{ color: "#1A1A2E" }}>Queue is clear!</p>
              <p className="text-sm" style={{ color: "#94A3B8" }}>No calls waiting for review</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CallDetailSheet call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
