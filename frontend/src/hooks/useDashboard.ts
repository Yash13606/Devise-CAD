import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  fetchEvents,
  fetchHeartbeats,
  fetchStats,
  fetchAlerts,
  fetchAnalytics,
  fetchSubscriptions,
  fetchSpendOverview,
  fetchTeam,
  fetchSettings,
  fetchMe,
  type StatsResponse,
  type AlertItem,
  type AnalyticsResponse,
  type EventsResponse,
  type SubscriptionItem,
  type SpendOverview,
  type TeamResponse,
  type OrgSettings,
  type UserProfile,
  type HeartbeatEvent,
} from "@/services/api";

/**
 * Polling intervals:
 *   Events:       30s (+ instant Supabase Realtime push)
 *   Stats:        30s
 *   Heartbeats:   30s
 *   Alerts:       30s
 *   Analytics:    60s
 *
 * Supabase Realtime subscription triggers instant refetch
 * on INSERT to detection_events — so the dashboard updates
 * within seconds of any AI tool being detected.
 */

// ─── Realtime Hook ───────────────────────────────────────────────────────────
/**
 * Subscribes to Supabase Realtime for detection_events.
 * On any INSERT, invalidates + refetches events/stats/alerts instantly.
 */
function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime:detection_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "detection_events" },
        () => {
          // Instantly invalidate all event-derived queries
          queryClient.invalidateQueries({ queryKey: ["events"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
          queryClient.invalidateQueries({ queryKey: ["alerts"] });
          queryClient.invalidateQueries({ queryKey: ["analytics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useEvents(category?: string, riskLevel?: string) {
  // Subscribe to Realtime for instant updates
  useRealtimeEvents();

  return useQuery<EventsResponse, Error>({
    queryKey: ["events", category, riskLevel],
    queryFn: () => fetchEvents(category, riskLevel),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
    retry: 2,
  });
}

export function useStats() {
  return useQuery<StatsResponse, Error>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: 2,
  });
}

export function useHeartbeats() {
  return useQuery<HeartbeatEvent[], Error>({
    queryKey: ["heartbeats"],
    queryFn: fetchHeartbeats,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  });
}

export function useAlerts() {
  return useQuery<AlertItem[], Error>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 30_000,
    staleTime: 10_000,
    retry: 2,
  });
}

export function useAnalytics() {
  return useQuery<AnalyticsResponse, Error>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSubscriptions() {
  return useQuery<SubscriptionItem[], Error>({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSpendOverview() {
  return useQuery<SpendOverview, Error>({
    queryKey: ["spend-overview"],
    queryFn: fetchSpendOverview,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useTeam() {
  return useQuery<TeamResponse, Error>({
    queryKey: ["team"],
    queryFn: fetchTeam,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSettings() {
  return useQuery<OrgSettings, Error>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useMe() {
  return useQuery<UserProfile, Error>({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 300_000,
    retry: 2,
  });
}
