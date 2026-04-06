import { Activity, Shield, AlertTriangle, Ban } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { useStats } from "@/hooks/useDashboard";

const Analytics = () => {
  const { data: stats } = useStats();

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard title="Total Detections" value={stats?.totalDetections ?? "—"} icon={Activity} variant="primary" />
          <StatsCard title="Unique Tools" value={stats?.uniqueTools ?? "—"} icon={Shield} />
          <StatsCard title="High Risk" value={stats?.highRiskCount ?? "—"} icon={AlertTriangle} />
          <StatsCard title="Unapproved" value={stats?.unapprovedCount ?? "—"} icon={Ban} />
        </div>

        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
