import { useState } from "react";
import { Plus, FileText, Clock, Shield, Monitor, MapPin, UserX, Zap, Edit, Trash2, Play, ToggleLeft, Search, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMCPPolicies, useFirewallRules } from "../hooks/useMCPData";
import type { MCPPolicy } from "../types/mcp.types";

// ─── Built-in Policy Type Cards ──────────────────────────────────────────────

const BUILTIN_POLICIES = [
  { icon: Shield, color: "#3B82F6", title: "Role-Based Access", desc: "Only users with approved roles can call specific MCP servers", type: "role-based" },
  { icon: Monitor, color: "#8B5CF6", title: "Device Compliance", desc: "Block MCP calls from devices not enrolled in MDM", type: "device" },
  { icon: MapPin, color: "#10B981", title: "Location Restriction", desc: "Restrict MCP calls to approved countries or IP ranges", type: "location" },
  { icon: Clock, color: "#F59E0B", title: "Time-Based Access", desc: "Block MCP calls outside business hours", type: "time" },
  { icon: UserX, color: "#EF4444", title: "Offboarding Revocation", desc: "Auto-revoke all MCP tokens when user deactivated via SCIM", type: "offboarding" },
];

// ─── Policy Test Modal ───────────────────────────────────────────────────────

function PolicyTestModal({ open, onClose, policyName }: { open: boolean; onClose: () => void; policyName: string }) {
  const [tested, setTested] = useState(false);

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setTested(false); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Test Policy: {policyName}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Label className="text-xs">Run against</Label>
            <Select defaultValue="50">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Last 10 calls</SelectItem>
                <SelectItem value="50">Last 50 calls</SelectItem>
                <SelectItem value="100">Last 100 calls</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!tested ? (
            <Button style={{ backgroundColor: "#FF5C1A" }} onClick={() => setTested(true)}>
              <Play size={14} className="mr-1" /> Run Test
            </Button>
          ) : (
            <Card className="p-4 border-0 bg-[#FAFBFC]">
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div>
                  <span className="font-bold text-lg" style={{ color: "#16A34A" }}>42</span>
                  <span className="text-[10px] block" style={{ color: "#94A3B8" }}>Would pass</span>
                </div>
                <div>
                  <span className="font-bold text-lg" style={{ color: "#DC2626" }}>8</span>
                  <span className="text-[10px] block" style={{ color: "#94A3B8" }}>Would block</span>
                </div>
                <div>
                  <span className="font-bold text-lg" style={{ color: "#6B7280" }}>0</span>
                  <span className="text-[10px] block" style={{ color: "#94A3B8" }}>Unaffected</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#6B7280" }}>8 calls would be newly blocked if this policy is applied.</p>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setTested(false); }}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── OPA Editor Modal ────────────────────────────────────────────────────────

function OPAEditorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"simple" | "advanced">("simple");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="font-display">Create Policy</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div><Label className="text-xs">Policy Name</Label><Input placeholder="My Custom Policy" className="mt-1" /></div>
          <div><Label className="text-xs">Description</Label><Input placeholder="What this policy does…" className="mt-1" /></div>

          <Tabs value={tab} onValueChange={v => setTab(v as "simple" | "advanced")}>
            <TabsList>
              <TabsTrigger value="simple">Simple Builder</TabsTrigger>
              <TabsTrigger value="advanced">Advanced (Rego)</TabsTrigger>
            </TabsList>
            <TabsContent value="simple">
              <Card className="p-4 border-0 bg-[#FAFBFC] flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select><SelectTrigger className="w-[120px]"><SelectValue placeholder="Field" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role">Role is</SelectItem>
                        <SelectItem value="device">Device is</SelectItem>
                        <SelectItem value="location">Location is</SelectItem>
                        <SelectItem value="time">Time is</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select><SelectTrigger className="w-[100px]"><SelectValue placeholder="Operator" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="is">is</SelectItem>
                        <SelectItem value="is_not">is not</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Value" className="flex-1" />
                    {i < 2 && <Badge variant="outline" className="text-[10px]">AND</Badge>}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="text-xs w-fit"><Plus size={12} className="mr-1" />Add Rule</Button>
              </Card>
            </TabsContent>
            <TabsContent value="advanced">
              <Textarea
                className="font-mono text-xs"
                rows={10}
                placeholder={'package devise.policy\n\ndefault allow = false\n\nallow {\n  input.user.role == "Engineer"\n  input.server.category == "Dev Tools"\n}'}
                style={{ backgroundColor: "#1A1A2E", color: "#A5D6A7", border: "1px solid #333" }}
              />
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline" className="text-xs gap-1"><Play size={12} />Test</Button>
          <Button style={{ backgroundColor: "#FF5C1A" }} onClick={onClose}>Save Policy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Firewall Rule Modal ─────────────────────────────────────────────────

function AddFirewallRuleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-display">Add Firewall Rule</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div><Label className="text-xs">Rule (IP or domain)</Label><Input placeholder="192.168.1.0/24 or example.com" className="mt-1" /></div>
          <div><Label className="text-xs">Type</Label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button style={{ backgroundColor: "#FF5C1A" }} onClick={onClose}>Add Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POLICIES PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPPoliciesPage() {
  const { data: policies } = useMCPPolicies();
  const { data: firewallRules } = useFirewallRules();
  const [createOpen, setCreateOpen] = useState(false);
  const [testPolicy, setTestPolicy] = useState<string | null>(null);
  const [fwOpen, setFwOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("policies");

  const typeColors: Record<string, string> = { "role-based": "#3B82F6", device: "#8B5CF6", location: "#10B981", time: "#F59E0B", offboarding: "#EF4444", custom: "#94A3B8" };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Access Policies</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>OPA-powered policy engine for MCP access control</p>
        </div>
        <Button style={{ backgroundColor: "#FF5C1A" }} onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1" /> Create Policy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="firewall">Firewall Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          {/* Built-in policy type cards */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {BUILTIN_POLICIES.map(bp => {
              const Icon = bp.icon;
              return (
                <Card key={bp.type} className="p-3 border-0 shadow-soft hover:shadow-heavy transition-shadow cursor-pointer">
                  <Icon size={18} style={{ color: bp.color }} className="mb-2" />
                  <span className="text-xs font-semibold block" style={{ color: "#1A1A2E" }}>{bp.title}</span>
                  <span className="text-[10px] block mt-0.5" style={{ color: "#94A3B8" }}>{bp.desc}</span>
                </Card>
              );
            })}
          </div>

          {/* User policies grid */}
          <div className="grid grid-cols-2 gap-4">
            {(policies ?? []).map(p => (
              <Card key={p.id} className="p-4 border-0 shadow-soft flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>{p.name}</span>
                    <Badge className="ml-2 text-[10px]" style={{ backgroundColor: (typeColors[p.type] || "#94A3B8") + "20", color: typeColors[p.type] || "#94A3B8" }}>
                      {p.type}
                    </Badge>
                  </div>
                  <Switch checked={p.isActive} />
                </div>
                <p className="text-xs" style={{ color: "#6B7280" }}>{p.description}</p>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: "#94A3B8" }}>
                  <span>Scope: {p.scope.includes("all") ? "All servers" : `${p.scope.length} servers`}</span>
                  <span>•</span>
                  <span>Modified {new Date(p.lastModified).toLocaleDateString()} by {p.modifiedBy}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1"><Edit size={11} className="mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setTestPolicy(p.name)}>
                    <Play size={11} className="mr-1" />Test
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500"><Trash2 size={11} /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="firewall">
          <div className="flex justify-end mb-3">
            <Button size="sm" style={{ backgroundColor: "#FF5C1A" }} onClick={() => setFwOpen(true)}>
              <Plus size={13} className="mr-1" /> Add Rule
            </Button>
          </div>
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(firewallRules ?? []).map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.rule}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] uppercase">{r.type}</Badge></TableCell>
                    <TableCell className="text-xs">{r.addedBy}</TableCell>
                    <TableCell className="text-xs tabular-nums">{r.addedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500"><Trash2 size={12} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <OPAEditorModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <PolicyTestModal open={!!testPolicy} onClose={() => setTestPolicy(null)} policyName={testPolicy ?? ""} />
      <AddFirewallRuleModal open={fwOpen} onClose={() => setFwOpen(false)} />
    </div>
  );
}
