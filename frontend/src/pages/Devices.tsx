import { Monitor, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DevicesTable } from "@/components/dashboard/DevicesTable";
import { useStats } from "@/hooks/useDashboard";

const Devices = () => {
  const { data: stats } = useStats();

  return (
    <DashboardLayout title="Devices">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard title="Total Devices" value={stats?.totalDevices ?? "—"} icon={Monitor} variant="primary" />
          <StatsCard title="Online" value={stats?.onlineDevices ?? "—"} icon={Wifi} subtitle="Last 6 min" />
          <StatsCard title="Offline" value={stats ? stats.totalDevices - stats.onlineDevices : "—"} icon={WifiOff} />
          <StatsCard title="Active Alerts" value={stats?.activeAlerts ?? "—"} icon={AlertTriangle} />
        </div>

        <DevicesTable />
      </div>
    </DashboardLayout>
  );
};

export default Devices;
