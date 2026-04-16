import { useState } from "react";
import { Bell, Settings, AlertTriangle, Shield, Zap, Eye, CheckCircle2, XCircle, ArrowUpRight, Ban, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMCPAlerts, useAlertNotificationRules } from "../hooks/useMCPData";
import type { MCPAlert, AlertSeverity } from "../types/mcp.types";
import { SEVERITY_COLORS } from "../types/mcp.types";

// ─── Severity dot ────────────────────────────────────────────────────────────

function SeverityDot({ severity }: { severity: AlertSeverity }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[severity] }} />;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Escalation Modal ────────────────────────────────────────────────────────

function EscalationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-display">Escalate Alert</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div><Label className="text-xs">Escalate to</Label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select admin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ananya">Ananya Roy</SelectItem>
                <SelectItem value="yash">Yash Sharma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Urgency</Label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Note</Label><Textarea placeholder="Add context…" className="mt-1" rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button style={{ backgroundColor: "#FF5C1A" }} onClick={onClose}>Send Escalation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Notification Config Drawer ──────────────────────────────────────────────

function NotificationConfigDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: rules } = useAlertNotificationRules();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-base">Alert Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          {(rules ?? []).map((rule, i) => (
            <Card key={i} className="p-3 border-0 bg-[#FAFBFC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#1A1A2E" }}>{rule.alertType}</span>
                <Switch checked={rule.enabled} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {rule.channels.map(ch => (
                  <Badge key={ch} variant="outline" className="text-[10px] capitalize">{ch}</Badge>
                ))}
                <span className="text-[10px] ml-auto" style={{ color: "#94A3B8" }}>Min: {rule.minSeverity}</span>
              </div>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="text-xs mt-2">Test Notification</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPAlertsPage() {
  const { data: alerts } = useMCPAlerts();
  const [selectedAlert, setSelectedAlert] = useState<MCPAlert | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const filtered = (alerts ?? []).filter(a => severityFilter === "all" || a.severity === severityFilter);

  // Alert type filter chips
  const typeChips = ["PII Detected", "Prompt Injection", "Tool Poisoning", "Policy Violation", "Gateway Down", "New Server Detected"];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Alerts</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>Security alert inbox</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setConfigOpen(true)}>
          <Settings size={13} /> Notifications
        </Button>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 flex-wrap">
        {typeChips.map(chip => (
          <Badge
            key={chip}
            variant="outline"
            className="text-xs cursor-pointer hover:bg-[#FFF3EE] hover:border-[#FF5C1A] hover:text-[#FF5C1A] transition-colors"
          >
            {chip}
          </Badge>
        ))}
      </div>

      {/* Severity tabs */}
      <Tabs value={severityFilter} onValueChange={setSeverityFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({alerts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alert list + Detail split */}
      <div className="grid grid-cols-5 gap-4" style={{ minHeight: 520 }}>
        {/* Left — Alert list */}
        <div className="col-span-2 flex flex-col gap-1 overflow-y-auto">
          {filtered.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedAlert(a)}
              className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
              style={{
                backgroundColor: selectedAlert?.id === a.id ? "#FFF3EE" : "transparent",
                borderLeft: `3px solid ${SEVERITY_COLORS[a.severity]}`,
              }}
            >
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SeverityDot severity={a.severity} />
                  <span className="text-sm font-semibold truncate" style={{ color: "#1A1A2E" }}>{a.title}</span>
                  {a.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                </div>
                <span className="text-xs truncate mt-0.5" style={{ color: "#94A3B8" }}>{a.user} • {a.mcpServer}</span>
                <span className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{timeAgo(a.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right — Alert detail */}
        <div className="col-span-3">
          {selectedAlert ? (
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4 h-full">
              <div className="flex items-center gap-2">
                <Badge className="text-xs font-bold uppercase" style={{ backgroundColor: SEVERITY_COLORS[selectedAlert.severity], color: "#fff" }}>
                  {selectedAlert.severity}
                </Badge>
                <h2 className="font-display font-bold text-base" style={{ color: "#1A1A2E" }}>{selectedAlert.title}</h2>
              </div>
              <p className="text-sm" style={{ color: "#6B7280" }}>{selectedAlert.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[#94A3B8] text-xs">User</span><p className="font-medium text-xs mt-0.5">{selectedAlert.user}</p></div>
                <div><span className="text-[#94A3B8] text-xs">MCP Server</span><p className="font-medium text-xs mt-0.5">{selectedAlert.mcpServer}</p></div>
                <div><span className="text-[#94A3B8] text-xs">Timestamp</span><p className="font-medium text-xs mt-0.5">{new Date(selectedAlert.timestamp).toLocaleString()}</p></div>
                <div><span className="text-[#94A3B8] text-xs">Status</span>
                  <p className="mt-0.5">
                    <Badge variant="outline" className="text-[10px] capitalize">{selectedAlert.status}</Badge>
                  </p>
                </div>
              </div>

              {selectedAlert.recommendedAction && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
                  <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#92400E" }}>Recommended Action</span>
                  <p className="text-xs mt-1" style={{ color: "#92400E" }}>{selectedAlert.recommendedAction}</p>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-3">
                <Button size="sm" className="flex-1 text-xs" style={{ backgroundColor: "#16A34A" }}>
                  <CheckCircle2 size={12} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 text-xs">
                  <Ban size={12} className="mr-1" /> Block
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }} onClick={() => setEscalateOpen(true)}>
                  <ArrowUpRight size={12} className="mr-1" /> Escalate
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">Dismiss</Button>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Bell size={32} className="mx-auto mb-2" style={{ color: "#94A3B8" }} />
                <p className="text-sm" style={{ color: "#94A3B8" }}>Select an alert to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <EscalationModal open={escalateOpen} onClose={() => setEscalateOpen(false)} />
      <NotificationConfigDrawer open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}
