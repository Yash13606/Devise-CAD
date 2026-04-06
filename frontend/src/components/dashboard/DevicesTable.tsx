import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useHeartbeats, useAlerts } from "@/hooks/useDashboard";

export function DevicesTable() {
  const { data: heartbeats = [] } = useHeartbeats();
  const { data: alerts = [] } = useAlerts();

  const tamperDevices = new Set(
    alerts.filter(a => a.type === "tamper").map(a => {
      const parts = a.id.split("-");
      return parts.slice(1, -1).join("-");
    })
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Device ID</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">OS</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Agent</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Last Heartbeat</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Queue</TableHead>
            <TableHead className="text-xs font-medium uppercase text-muted-foreground">Tamper</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {heartbeats.map((hb) => {
            const minutesAgo = (Date.now() - new Date(hb.timestamp).getTime()) / 60000;
            const isOnline = minutesAgo < 6;
            const hasTamper = tamperDevices.has(hb.device_id);

            return (
              <TableRow key={hb.device_id}>
                <TableCell className="font-mono text-xs">{hb.device_id.slice(0, 8)}…</TableCell>
                <TableCell className="text-sm">{hb.os_version}</TableCell>
                <TableCell className="text-sm font-mono">v{hb.agent_version}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(hb.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-mono ${hb.queue_depth > 0 ? "text-warning" : "text-muted-foreground"}`}>
                    {hb.queue_depth}
                  </span>
                </TableCell>
                <TableCell>
                  {hasTamper ? (
                    <Badge variant="destructive" className="text-[11px]">Alert</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {heartbeats.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                No devices reporting yet. Start the agent to see data here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
