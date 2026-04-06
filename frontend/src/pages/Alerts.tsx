import { AlertTriangle, Shield, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { useStats, useAlerts } from "@/hooks/useDashboard";

const Alerts = () => {
  const { data: stats } = useStats();
  const { data: alerts = [] } = useAlerts();

  const tamperCount = alerts.filter(a => a.type === "tamper").length;
  const agentGapCount = alerts.filter(a => a.type === "agent_gap").length;

  return (
    <DashboardLayout title="Alerts">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard title="Active Alerts" value={stats?.activeAlerts ?? "—"} icon={AlertTriangle} variant="primary" />
          <StatsCard title="Tamper Alerts" value={tamperCount} icon={Shield} />
          <StatsCard title="Agent Gaps" value={agentGapCount} icon={Clock} />
          <StatsCard title="High Risk Unapproved" value={stats?.highRiskCount ?? "—"} icon={AlertTriangle} />
        </div>

        <AlertsList />
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
