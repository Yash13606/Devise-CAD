import { useState } from "react";
import { Shield, Download, AlertTriangle, ChevronDown, ChevronRight, CheckCircle2, XCircle, Eye, Ban, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThreatLog } from "../hooks/useMCPData";
import type { MCPCall } from "../types/mcp.types";
import { AI_CLIENT_LABELS, THREAT_TYPE_LABELS, THREAT_TYPE_COLORS, SEVERITY_COLORS } from "../types/mcp.types";

// ─── Threat Detail Sheet ─────────────────────────────────────────────────────

function ThreatDetailSheet({ call, open, onClose }: { call: MCPCall | null; open: boolean; onClose: () => void }) {
  const [rawOpen, setRawOpen] = useState(false);
  if (!call) return null;
  const primaryThreat = call.threats[0];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[520px] sm:w-[560px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-base">Threat Detail</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 mt-4">
          {/* Threat Summary */}
          <Card className="p-4 border-0" style={{ backgroundColor: SEVERITY_COLORS[primaryThreat?.severity ?? "low"] + "10" }}>
            <div className="flex items-center gap-3 mb-3">
              {primaryThreat && (
                <Badge className="text-xs font-bold" style={{ backgroundColor: THREAT_TYPE_COLORS[primaryThreat.type], color: "#fff" }}>
                  {THREAT_TYPE_LABELS[primaryThreat.type]}
                </Badge>
              )}
              <span className="ml-auto font-bold text-2xl" style={{ color: call.riskScore >= 80 ? "#DC2626" : call.riskScore >= 60 ? "#EF4444" : "#F59E0B" }}>
                {call.riskScore}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span style={{ color: "#94A3B8" }}>User</span><p className="font-medium">{call.user.name}</p></div>
              <div><span style={{ color: "#94A3B8" }}>AI Client</span><p className="font-medium">{AI_CLIENT_LABELS[call.aiClient]}</p></div>
              <div><span style={{ color: "#94A3B8" }}>MCP Server</span><p className="font-medium">{call.mcpServer.name}</p></div>
              <div><span style={{ color: "#94A3B8" }}>Action Taken</span>
                <p className="font-medium" style={{ color: call.decision === "blocked" ? "#DC2626" : "#F59E0B" }}>
                  {call.decision === "blocked" ? "Blocked" : "Queued for Review"}
                </p>
              </div>
            </div>
          </Card>

          {/* Threat Evidence */}
          {primaryThreat && (
            <div>
              <span className="font-semibold text-sm block mb-2" style={{ color: "#1A1A2E" }}>Threat Evidence</span>
              <Card className="p-3 border-0 bg-[#FAFBFC]">
                <p className="text-sm" style={{ color: "#1A1A2E" }}>{primaryThreat.detail}</p>
                <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                  Score contribution: <span className="font-bold text-red-500">+{primaryThreat.scoreContribution}</span>
                </p>
              </Card>
            </div>
          )}

          {/* Risk Score Breakdown */}
          <div>
            <span className="font-semibold text-sm block mb-2" style={{ color: "#1A1A2E" }}>Risk Score Breakdown</span>
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

          {/* Raw Payload */}
          <div>
            <button onClick={() => setRawOpen(!rawOpen)} className="flex items-center gap-1 text-sm font-semibold mb-2" style={{ color: "#1A1A2E" }}>
              {rawOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Raw Payload (redacted)
            </button>
            {rawOpen && call.requestPayload && (
              <pre className="p-3 rounded-lg bg-[#1A1A2E] text-green-300 text-xs overflow-x-auto" style={{ fontSize: 11 }}>
                {call.requestPayload}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1 text-xs" style={{ backgroundColor: "#16A34A" }}>
              <CheckCircle2 size={12} className="mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1 text-xs">
              <Ban size={12} className="mr-1" /> Block User
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
              <ArrowUpRight size={12} className="mr-1" /> Escalate
            </Button>
          </div>

          <Button variant="outline" size="sm" className="text-xs gap-1 w-full" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
            <Download size={12} /> Export to SIEM
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// THREAT LOG PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPThreatLogPage() {
  const { data: threats } = useThreatLog();
  const [selectedCall, setSelectedCall] = useState<MCPCall | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const filtered = (threats ?? []).filter(c => {
    const matchType = typeFilter === "all" || c.threats.some(t => t.type === typeFilter);
    const matchRisk = riskFilter === "all" || (riskFilter === "critical" && c.riskScore >= 80) || (riskFilter === "high" && c.riskScore >= 60 && c.riskScore < 80) || (riskFilter === "medium" && c.riskScore >= 30 && c.riskScore < 60) || (riskFilter === "low" && c.riskScore < 30);
    return matchType && matchRisk;
  });

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Threat Log</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>All security events detected by Devise Gate</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
          <Download size={13} /> Export to SIEM
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Threat Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pii">PII</SelectItem>
            <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
            <SelectItem value="tool-poisoning">Tool Poisoning</SelectItem>
            <SelectItem value="command-injection">Command Injection</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead>Threat Type</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead>Action Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const primaryThreat = c.threats[0];
              return (
                <TableRow key={c.id} className="cursor-pointer hover:bg-[#FAFBFC]" onClick={() => setSelectedCall(c)}>
                  <TableCell className="text-xs tabular-nums" style={{ color: "#6B7280" }}>{new Date(c.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] text-white" style={{ backgroundColor: "#FF5C1A" }}>{c.user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                      <span className="text-xs font-medium">{c.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{AI_CLIENT_LABELS[c.aiClient]}</TableCell>
                  <TableCell className="text-xs font-medium">{c.mcpServer.name}</TableCell>
                  <TableCell>
                    {primaryThreat && (
                      <Badge className="text-[10px]" style={{ backgroundColor: THREAT_TYPE_COLORS[primaryThreat.type] + "20", color: THREAT_TYPE_COLORS[primaryThreat.type] }}>
                        {THREAT_TYPE_LABELS[primaryThreat.type]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums" style={{ backgroundColor: c.riskScore >= 80 ? "#FEE2E2" : c.riskScore >= 60 ? "#FEF2F2" : "#FFFBEB", color: c.riskScore >= 80 ? "#DC2626" : c.riskScore >= 60 ? "#EF4444" : "#F59E0B" }}>
                      {c.riskScore}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: c.decision === "blocked" ? "#DC2626" : "#F59E0B" }}>
                      {c.decision === "blocked" ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                      {c.decision === "blocked" ? "Blocked" : "Queued"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <ThreatDetailSheet call={selectedCall} open={!!selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
