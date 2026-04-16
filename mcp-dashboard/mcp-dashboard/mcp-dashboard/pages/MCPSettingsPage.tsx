import { useState } from "react";
import { Settings as SettingsIcon, Copy, Upload, RefreshCw, Trash2, CheckCircle2, XCircle, Zap, Link2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuditLog, useIntegrations, useBillingPlan, useInvoices, useSSOStatus, useSCIMConfig } from "../hooks/useMCPData";

// ─── Gateway Config Snippets ─────────────────────────────────────────────────

const CONFIG_SNIPPETS = {
  cursor: `// ~/.cursor/config.json
{
  "mcpProxy": "https://gate.devise.ai/proxy",
  "apiKey": "dg_key_xxxxxxxx"
}`,
  "claude-code": `// ~/.claude/config.json
{
  "mcpServers": {
    "devise-gate": {
      "url": "https://gate.devise.ai/proxy",
      "headers": { "Authorization": "Bearer dg_key_xxx" }
    }
  }
}`,
  vscode: `// .vscode/settings.json
{
  "mcp.proxy.url": "https://gate.devise.ai/proxy",
  "mcp.proxy.token": "dg_key_xxxxxxxx"
}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export function MCPSettingsPage() {
  const { data: auditLog } = useAuditLog();
  const { data: integrations } = useIntegrations();
  const { data: billing } = useBillingPlan();
  const { data: invoices } = useInvoices();
  const { data: sso } = useSSOStatus();
  const { data: scim } = useSCIMConfig();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedSnippet, setSelectedSnippet] = useState<keyof typeof CONFIG_SNIPPETS>("cursor");

  const integrationIcons: Record<string, { label: string; color: string }> = {
    siem: { label: "SIEM", color: "#3B82F6" },
    slack: { label: "Slack", color: "#4A154B" },
    pagerduty: { label: "PagerDuty", color: "#06AC38" },
    hr: { label: "HR System", color: "#F59E0B" },
    mdm: { label: "MDM", color: "#8B5CF6" },
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: "#1A1A2E" }}>Settings</h1>
        <p className="text-sm" style={{ color: "#94A3B8" }}>Gateway configuration, integrations, and billing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
          <TabsTrigger value="sso">SSO & SCIM</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Organization</span>
              <div><Label className="text-xs">Organization Name</Label><Input defaultValue="Devise Inc." className="mt-1" /></div>
              <div><Label className="text-xs">Timezone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">America/New_York (EST)</SelectItem>
                    <SelectItem value="pst">America/Los_Angeles (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-fit text-xs" style={{ backgroundColor: "#FF5C1A" }}>Save Changes</Button>
            </Card>

            {/* Audit Log */}
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Admin Audit Log</span>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {(auditLog ?? []).map(entry => (
                  <div key={entry.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#FAFBFC]">
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-medium" style={{ color: "#1A1A2E" }}>{entry.user}</span>
                      <span className="text-[10px]" style={{ color: "#6B7280" }}>{entry.detail}</span>
                      <span className="text-[10px] mt-0.5" style={{ color: "#94A3B8" }}>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Gateway Tab */}
        <TabsContent value="gateway">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Gateway Configuration</span>
              <div>
                <Label className="text-xs">Proxy Endpoint URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-[#F5F7FA] px-3 py-2 rounded flex-1">https://gate.devise.ai/proxy</code>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Copy size={13} /></Button>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Client Configuration</Label>
                <div className="flex gap-2 mb-2">
                  {(Object.keys(CONFIG_SNIPPETS) as (keyof typeof CONFIG_SNIPPETS)[]).map(k => (
                    <Button
                      key={k}
                      variant={selectedSnippet === k ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      style={selectedSnippet === k ? { backgroundColor: "#FF5C1A" } : {}}
                      onClick={() => setSelectedSnippet(k)}
                    >
                      {k === "claude-code" ? "Claude Code" : k === "vscode" ? "VS Code" : "Cursor"}
                    </Button>
                  ))}
                </div>
                <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ backgroundColor: "#1A1A2E", color: "#A5D6A7", fontSize: 11 }}>
                  {CONFIG_SNIPPETS[selectedSnippet]}
                </pre>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
                <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>TLS Certificate</span>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div>
                    <span className="text-xs font-medium block" style={{ color: "#1A1A2E" }}>Certificate valid</span>
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>Expires: Nov 2026</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBFC]">
                  <span className="text-xs" style={{ color: "#6B7280" }}>Auto-renew</span>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" size="sm" className="text-xs"><Upload size={12} className="mr-1" />Upload New Cert</Button>
              </Card>

              <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
                <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Redis Cache</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#6B7280" }}>Cache hit rate</span>
                  <span className="text-xs font-bold" style={{ color: "#16A34A" }}>94.2%</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs text-red-500"><Trash2 size={12} className="mr-1" />Clear Cache</Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SSO & SCIM Tab */}
        <TabsContent value="sso">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>SSO Status</span>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F0FDF4]">
                <CheckCircle2 size={18} className="text-green-500" />
                <div>
                  <span className="text-sm font-medium capitalize">{sso?.provider}</span>
                  <span className="text-xs block" style={{ color: "#6B7280" }}>Connected • Last sync {sso?.lastSync ? new Date(sso.lastSync).toLocaleTimeString() : "Never"}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs" style={{ borderColor: "#FF5C1A", color: "#FF5C1A" }}>
                <RefreshCw size={12} className="mr-1" />Reconnect
              </Button>
            </Card>
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>SCIM Sync</span>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                <p>{scim?.usersSynced} users synced</p>
                <p>Auto-revocation: {scim?.autoRevocationEnabled ? "Enabled" : "Disabled"}</p>
                <p>Mode: {scim?.offboardingMode}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Configure SCIM</Button>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="grid grid-cols-2 gap-4">
            {(integrations ?? []).map(intg => {
              const meta = integrationIcons[intg.type] || { label: intg.type, color: "#94A3B8" };
              return (
                <Card key={intg.id} className="p-5 border-0 shadow-soft flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                        <Link2 size={14} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>{intg.name}</span>
                        <span className="text-[10px] block uppercase tracking-wider" style={{ color: "#94A3B8" }}>{meta.label}</span>
                      </div>
                    </div>
                    <Badge
                      className="text-[10px]"
                      style={{
                        backgroundColor: intg.status === "connected" ? "#F0FDF4" : "#FEF2F2",
                        color: intg.status === "connected" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {intg.status === "connected" ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  {intg.lastSync && (
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>Last sync: {new Date(intg.lastSync).toLocaleString()}</span>
                  )}
                  <div className="flex gap-2">
                    {intg.status === "connected" ? (
                      <>
                        <Button variant="outline" size="sm" className="text-xs flex-1">Test Connection</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-red-500">Disconnect</Button>
                      </>
                    ) : (
                      <Button size="sm" className="text-xs flex-1" style={{ backgroundColor: "#FF5C1A" }}>Connect</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-0 shadow-soft flex flex-col gap-4">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Current Plan</span>
              {billing && (
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#94A3B8] text-xs">Plan</span><p className="font-bold text-base" style={{ color: "#FF5C1A" }}>{billing.name}</p></div>
                  <div><span className="text-[#94A3B8] text-xs">Seats</span><p className="font-medium text-sm">{billing.seatsActive} / {billing.seats}</p></div>
                  <div><span className="text-[#94A3B8] text-xs">Renewal</span><p className="text-sm">{billing.renewalDate}</p></div>
                  <div><span className="text-[#94A3B8] text-xs">Calls This Month</span><p className="font-medium text-sm">{billing.callsThisMonth.toLocaleString()}</p></div>
                </div>
              )}
              <Button size="sm" className="w-fit text-xs" style={{ backgroundColor: "#FF5C1A" }}>Upgrade Plan</Button>
            </Card>

            <Card className="p-5 border-0 shadow-soft flex flex-col gap-3">
              <span className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>Invoice History</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoices ?? []).map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-xs tabular-nums">{inv.date}</TableCell>
                      <TableCell className="text-xs">{inv.plan}</TableCell>
                      <TableCell className="text-xs text-right font-medium">${inv.amount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
