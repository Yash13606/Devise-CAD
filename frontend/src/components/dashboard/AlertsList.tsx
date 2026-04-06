import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Shield, Clock, Zap, CheckCircle2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./RiskBadge";
import { useAlerts } from "@/hooks/useDashboard";
import { dismissAlert, resolveAlert } from "@/services/api";
import type { AlertItem } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, typeof AlertTriangle> = {
  high_risk:      AlertTriangle,
  unapproved:     Shield,
  tamper:         Shield,
  agent_gap:      Clock,
  high_frequency: Zap,
};

export function AlertsList() {
  const { data: alerts = [], isLoading } = useAlerts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dismissMutation = useMutation({
    mutationFn: dismissAlert,
    onMutate: async (alertId) => {
      // Optimistic update: remove from cache immediately
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previous = queryClient.getQueryData<AlertItem[]>(["alerts"]);
      queryClient.setQueryData<AlertItem[]>(["alerts"], (old) =>
        old ? old.filter((a) => a.id !== alertId) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["alerts"], context?.previous);
      toast({ title: "Failed to dismiss alert", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onSuccess: () => {
      toast({ title: "Alert dismissed" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: resolveAlert,
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previous = queryClient.getQueryData<AlertItem[]>(["alerts"]);
      queryClient.setQueryData<AlertItem[]>(["alerts"], (old) =>
        old ? old.filter((a) => a.id !== alertId) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["alerts"], context?.previous);
      toast({ title: "Failed to resolve alert", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onSuccess: () => {
      toast({ title: "Alert resolved" });
    },
  });

  if (isLoading && alerts.length === 0) {
    return (
      <p className="text-center text-xs text-muted-foreground py-8">Loading alerts…</p>
    );
  }

  if (alerts.length === 0) {
    return (
      <p className="text-center text-xs text-muted-foreground py-8">
        No alerts. Start the agent to begin receiving data.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert: AlertItem) => {
        const Icon = ICON_MAP[alert.type] ?? AlertTriangle;
        return (
          <Card key={alert.id} className={`border-l-4 ${
            alert.severity === "high" ? "border-l-red-500" : alert.severity === "medium" ? "border-l-amber-500" : "border-l-emerald-500"
          }`}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  alert.severity === "high" ? "bg-red-500/15" : "bg-amber-500/15"
                }`}>
                  <Icon className={`h-4 w-4 ${
                    alert.severity === "high" ? "text-red-500" : "text-amber-500"
                  }`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <RiskBadge level={alert.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {alert.severity === "high" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Resolve
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => dismissMutation.mutate(alert.id)}
                  disabled={dismissMutation.isPending}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
