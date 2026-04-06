import { useState, useMemo } from "react";
import { Activity, Shield, AlertTriangle, Ban } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LiveFeedTable } from "@/components/dashboard/LiveFeedTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, riskLevels } from "@/lib/aiToolsRegistry";
import { useEvents, useStats } from "@/hooks/useDashboard";

const LiveFeed = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: eventsData, isLoading } = useEvents(categoryFilter, riskFilter);
  const { data: stats } = useStats();

  const events = useMemo(() => eventsData?.events ?? [], [eventsData]);

  return (
    <DashboardLayout title="Live Feed">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard title="Total Detections" value={stats?.totalDetections ?? "—"} icon={Activity} variant="primary" subtitle="Last 24h" />
          <StatsCard title="Unique Tools" value={stats?.uniqueTools ?? "—"} icon={Shield} subtitle="Active tools" />
          <StatsCard title="High Risk" value={stats?.highRiskCount ?? "—"} icon={AlertTriangle} subtitle="Needs review" />
          <StatsCard title="Unapproved" value={stats?.unapprovedCount ?? "—"} icon={Ban} subtitle="Not sanctioned" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              {riskLevels.map(r => (
                <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">Refreshing…</span>
          )}
        </div>

        <LiveFeedTable events={events} />
      </div>
    </DashboardLayout>
  );
};

export default LiveFeed;
