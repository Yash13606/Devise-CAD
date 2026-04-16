import { useState } from "react";
import { KeyRound, RefreshCw, Copy, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, UserPlus, Trash2, Edit, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSSOStatus, useSCIMConfig, useRoleAccessMatrix, useMCPSessions, useTeamMembers } from "../hooks/useMCPData";
import { AI_CLIENT_LABELS } from "../types/mcp.types";

// ═══════════════════════════════════════════════════════════════════════════
// IDENTITY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPIdentityPage() {
  const { data: sso } = useSSOStatus();
  const { data: scim } = useSCIMConfig();
  const { data: matrix } = useRoleAccessMatrix();
  const { data: sessions } = useMCPSessions();
  const { data: team } = useTeamMembers();
  const [tokenVisible, setTokenVisible] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sso");

  const roles = ["Admin", "Engineer", "Analyst", "PM"];

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Identity & Access</h1>
        <p className="text-sm" style={{ color: "#94A3B8" }}>SSO, SCIM provisioning, role management, and sessions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sso">SSO & SCIM</TabsTrigger>
          <TabsTrigger value="roles">Role Matrix</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* SSO & SCIM Tab */}
        <TabsContent value="sso">
          <div className="grid grid-cols-2 gap-4">
            {/* SSO Status */}
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <KeyRound size={18} style={{ color: "#FF5C1A" }} />
                <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>SSO Configuration</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[#94A3B8] text-xs">Provider</span><p className="font-semibold text-sm mt-0.5 capitalize">{sso?.provider ?? "—"}</p></div>
                <div><span className="text-[#94A3B8] text-xs">Status</span>
                  <p className="mt-0.5">
                    {sso?.isConnected
                      ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle2 size={12} />Connected</span>
                      : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><XCircle size={12} />Not Configured</span>}
                  </p>
                </div>
                <div className="col-span-2"><span className="text-[#94A3B8] text-xs">Last Sync</span><p className="text-xs mt-0.5">{sso?.lastSync ? new Date(sso.lastSync).toLocaleString() : "Never"}</p></div>
              </div>
              <Button variant="outline" size="sm" className="text-xs mt-1" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
                <RefreshCw size={12} className="mr-1" /> {sso?.isConnected ? "Reconnect" : "Configure SSO"}
              </Button>
            </Card>

            {/* SCIM Provisioning */}
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Shield size={18} style={{ color: "#FF5C1A" }} />
                <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>SCIM Provisioning</span>
              </div>
              {scim && (
                <>
                  <div className="text-sm">
                    <span className="text-[#94A3B8] text-xs">SCIM Endpoint</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-[#F5F7FA] px-2 py-1 rounded flex-1 truncate">{scim.endpointUrl}</code>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Copy size={12} /></Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#94A3B8] text-xs">Secret Token</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-[#F5F7FA] px-2 py-1 rounded flex-1">{tokenVisible ? "sk-scim-a23f-b19c-7de8-7f3a" : scim.secretToken}</code>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setTokenVisible(!tokenVisible)}>
                        {tokenVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><RefreshCw size={12} /></Button>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>
                    Last sync: {scim.usersSynced} users synced {Math.floor((Date.now() - new Date(scim.lastSyncAt).getTime()) / 60000)}m ago
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFBFC]">
                    <div>
                      <span className="text-xs font-medium" style={{ color: "#1A1A2E" }}>Auto-revoke on deactivation</span>
                      <span className="text-[10px] block" style={{ color: "#94A3B8" }}>Mode: {scim.offboardingMode}</span>
                    </div>
                    <Switch checked={scim.autoRevocationEnabled} />
                  </div>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Role Matrix Tab */}
        <TabsContent value="roles">
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  {roles.map(r => <TableHead key={r} className="text-center">{r}</TableHead>)}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(matrix ?? []).map(entry => (
                  <TableRow key={entry.serverId}>
                    <TableCell className="font-medium text-xs">{entry.serverName}</TableCell>
                    {roles.map(r => {
                      const access = entry.roles[r];
                      return (
                        <TableCell key={r} className="text-center">
                          {access === "allowed" && <CheckCircle2 size={14} className="mx-auto text-green-500" />}
                          {access === "blocked" && <XCircle size={14} className="mx-auto text-red-400" />}
                          {access === "conditional" && <AlertTriangle size={14} className="mx-auto text-yellow-500" />}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit size={12} className="mr-1" />Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <div className="flex justify-end mb-3">
            <Button variant="destructive" size="sm" className="text-xs">Revoke All Sessions</Button>
          </div>
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>AI Client</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sessions ?? []).map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] text-white" style={{ backgroundColor: "#FF5C1A" }}>{s.user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                        <span className="text-xs font-medium">{s.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{s.device}</TableCell>
                    <TableCell className="text-xs">{AI_CLIENT_LABELS[s.aiClient]}</TableCell>
                    <TableCell className="text-xs tabular-nums">{new Date(s.startedAt).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-xs tabular-nums">{new Date(s.expiresAt).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-[10px] capitalize">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status === "active" && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500">Revoke</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="text-xs" style={{ backgroundColor: "#FF5C1A" }} onClick={() => setInviteOpen(true)}>
              <UserPlus size={13} className="mr-1" /> Invite Admin
            </Button>
          </div>
          <Card className="border-0 shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(team ?? []).map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] text-white" style={{ backgroundColor: "#FF5C1A" }}>{m.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                        <span className="text-xs font-medium">{m.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{m.email}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{m.role}</Badge></TableCell>
                    <TableCell className="text-xs tabular-nums">{new Date(m.lastLogin).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"><Edit size={12} className="mr-1" />Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500"><Trash2 size={12} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Invite Admin</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div><Label className="text-xs">Email</Label><Input placeholder="admin@company.com" className="mt-1" /></div>
            <div><Label className="text-xs">Role</Label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button style={{ backgroundColor: "#FF5C1A" }} onClick={() => setInviteOpen(false)}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
