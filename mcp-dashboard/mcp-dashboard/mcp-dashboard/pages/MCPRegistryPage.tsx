import { useState } from "react";
import { Plus, Server, Search, MoreHorizontal, CheckCircle2, XCircle, Eye, Edit, Ban, Unlock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMCPServers } from "../hooks/useMCPData";
import type { MCPServer } from "../types/mcp.types";
import { CATEGORY_COLORS, SERVER_CATEGORIES } from "../types/mcp.types";

// ─── Server Detail Drawer ────────────────────────────────────────────────────

function ServerDetailDrawer({ server, open, onClose }: { server: MCPServer | null; open: boolean; onClose: () => void }) {
  if (!server) return null;
  const riskLabel = server.avgRiskScore < 30 ? "Low" : server.avgRiskScore < 60 ? "Medium" : "High";
  const riskColor = server.avgRiskScore < 30 ? "#16A34A" : server.avgRiskScore < 60 ? "#F59E0B" : "#DC2626";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Server size={18} style={{ color: CATEGORY_COLORS[server.category] || "#94A3B8" }} />
            {server.name}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 mt-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#94A3B8] text-xs">URL</span><p className="font-mono text-xs mt-0.5 break-all" style={{ color: "#1A1A2E" }}>{server.url}</p></div>
            <div><span className="text-[#94A3B8] text-xs">Category</span><p className="mt-0.5"><Badge style={{ backgroundColor: (CATEGORY_COLORS[server.category] || "#94A3B8") + "20", color: CATEGORY_COLORS[server.category] || "#94A3B8" }}>{server.category}</Badge></p></div>
            <div><span className="text-[#94A3B8] text-xs">Risk Rating</span><p className="font-bold mt-0.5" style={{ color: riskColor }}>{riskLabel} ({server.avgRiskScore})</p></div>
            <div><span className="text-[#94A3B8] text-xs">Rate Limit</span><p className="mt-0.5 font-medium">{server.rateLimit} calls/min</p></div>
            <div><span className="text-[#94A3B8] text-xs">Monthly Calls</span><p className="mt-0.5 font-medium">{server.monthlyCallCount.toLocaleString()}</p></div>
            <div><span className="text-[#94A3B8] text-xs">Status</span><p className="mt-0.5"><Badge variant={server.status === "approved" ? "default" : "destructive"}>{server.status}</Badge></p></div>
          </div>
          <div>
            <span className="text-[#94A3B8] text-xs">Description</span>
            <p className="text-sm mt-1" style={{ color: "#1A1A2E" }}>{server.description}</p>
          </div>
          <div>
            <span className="text-[#94A3B8] text-xs">Allowed Roles</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {server.allowedRoles.length > 0 ? server.allowedRoles.map(r => (
                <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
              )) : <span className="text-xs text-[#94A3B8]">None assigned</span>}
            </div>
          </div>
          {server.policy && (
            <div>
              <span className="text-[#94A3B8] text-xs">OPA Policy</span>
              <p className="text-sm font-medium mt-0.5" style={{ color: "#1A1A2E" }}>{server.policy.name}</p>
            </div>
          )}
          <Button className="mt-2" style={{ backgroundColor: "#FF5C1A" }}>
            <Edit size={14} className="mr-1.5" /> Edit Policy
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Add Server Modal ────────────────────────────────────────────────────────

function AddServerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add MCP Server</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div><Label className="text-xs">Server Name</Label><Input placeholder="e.g. GitHub MCP" className="mt-1" /></div>
          <div><Label className="text-xs">MCP Server URL</Label><Input placeholder="mcp://server.example.com/v1" className="mt-1" /></div>
          <div><Label className="text-xs">Category</Label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{SERVER_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Description</Label><Textarea placeholder="What does this server do?" className="mt-1" rows={2} /></div>
          <div><Label className="text-xs">Rate Limit (calls/min)</Label><Input type="number" placeholder="100" className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button style={{ backgroundColor: "#FF5C1A" }} onClick={onClose}>Add to Registry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPRegistryPage() {
  const { data: servers } = useMCPServers();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [search, setSearch] = useState("");

  const approved = servers?.filter(s => s.status === "approved") ?? [];
  const pending = servers?.filter(s => s.status === "pending") ?? [];
  const blocked = servers?.filter(s => s.status === "blocked") ?? [];

  const filteredApproved = approved.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredBlocked = blocked.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>MCP Registry</h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>Manage approved MCP servers</p>
        </div>
        <Button style={{ backgroundColor: "#FF5C1A" }} onClick={() => setAddOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Server
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
        <Input placeholder="Search servers…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="approved">
        <TabsList>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Review ({pending.length})</TabsTrigger>
          <TabsTrigger value="blocked">Blocked ({blocked.length})</TabsTrigger>
        </TabsList>

        {/* Approved Tab */}
        <TabsContent value="approved">
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Allowed Roles</TableHead>
                  <TableHead className="text-right">Monthly Calls</TableHead>
                  <TableHead className="text-right">Avg Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApproved.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-[#FAFBFC]" onClick={() => setSelectedServer(s)}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Server size={14} style={{ color: CATEGORY_COLORS[s.category] || "#94A3B8" }} />
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: CATEGORY_COLORS[s.category], color: CATEGORY_COLORS[s.category] }}>{s.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">{s.allowedRoles.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.monthlyCallCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold" style={{ color: s.avgRiskScore < 30 ? "#16A34A" : s.avgRiskScore < 60 ? "#F59E0B" : "#DC2626" }}>{s.avgRiskScore}</span>
                    </TableCell>
                    <TableCell><span className="flex items-center gap-1 text-xs text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit size={12} className="mr-1" />Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500"><Ban size={12} className="mr-1" />Block</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="grid grid-cols-2 gap-4">
            {pending.map(s => (
              <Card key={s.id} className="p-5 border-0 shadow-soft flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} style={{ color: CATEGORY_COLORS[s.category] || "#94A3B8" }} />
                    <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>{s.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: "#F59E0B", color: "#F59E0B" }}>Pending</Badge>
                </div>
                <p className="text-xs" style={{ color: "#6B7280" }}>{s.description}</p>
                <p className="text-xs font-mono" style={{ color: "#94A3B8" }}>{s.url}</p>
                {s.requestedBy && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px] text-white" style={{ backgroundColor: "#FF5C1A" }}>
                        {s.requestedBy.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs" style={{ color: "#6B7280" }}>Requested by {s.requestedBy.name}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-1">
                  <Button size="sm" className="flex-1 h-8 text-xs" style={{ backgroundColor: "#16A34A" }}>
                    <CheckCircle2 size={12} className="mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 h-8 text-xs">
                    <XCircle size={12} className="mr-1" /> Deny
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Info</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blocked Tab */}
        <TabsContent value="blocked">
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Calls (past)</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlocked.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-[#FAFBFC]" onClick={() => setSelectedServer(s)}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Server size={14} className="text-red-400" />{s.name}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{s.category}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{s.monthlyCallCount}</TableCell>
                    <TableCell className="text-right"><span className="font-bold text-red-600">{s.avgRiskScore}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-green-600"><Unlock size={12} className="mr-1" />Unblock</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Eye size={12} className="mr-1" />Details</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <AddServerModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ServerDetailDrawer server={selectedServer} open={!!selectedServer} onClose={() => setSelectedServer(null)} />
    </div>
  );
}
