import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
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
} from "@/services/api";
import type { HeartbeatEvent } from "@/data/mockData";

/**
 * Polling intervals (user-specified):
 *   Events:       10s
 *   Stats:        30s
 *   Heartbeats:   30s
 *   Alerts:       30s
 *   Analytics:    60s
 *   Subscriptions:60s
 *
 * All hooks are gated by `enabled: !!session` so they never fire
 * before auth is ready (prevents 401 race → sign-out loop).
 */

export function useEvents(category?: string, riskLevel?: string) {
  const { session } = useAuth();
  return useQuery<EventsResponse, Error>({
    queryKey: ["events", category, riskLevel],
    queryFn: () => fetchEvents(category, riskLevel),
    enabled: !!session,
    refetchInterval: 10_000,
    staleTime: 8_000,
    retry: 2,
  });
}

export function useStats() {
  const { session } = useAuth();
  return useQuery<StatsResponse, Error>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!session,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  });
}

export function useHeartbeats() {
  const { session } = useAuth();
  return useQuery<HeartbeatEvent[], Error>({
    queryKey: ["heartbeats"],
    queryFn: fetchHeartbeats,
    enabled: !!session,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  });
}

export function useAlerts() {
  const { session } = useAuth();
  return useQuery<AlertItem[], Error>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    enabled: !!session,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  });
}

export function useAnalytics() {
  const { session } = useAuth();
  return useQuery<AnalyticsResponse, Error>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    enabled: !!session,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSubscriptions() {
  const { session } = useAuth();
  return useQuery<SubscriptionItem[], Error>({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions,
    enabled: !!session,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSpendOverview() {
  const { session } = useAuth();
  return useQuery<SpendOverview, Error>({
    queryKey: ["spend-overview"],
    queryFn: fetchSpendOverview,
    enabled: !!session,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useTeam() {
  const { session } = useAuth();
  return useQuery<TeamResponse, Error>({
    queryKey: ["team"],
    queryFn: fetchTeam,
    enabled: !!session,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 2,
  });
}

export function useSettings() {
  const { session } = useAuth();
  return useQuery<OrgSettings, Error>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    enabled: !!session,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useMe() {
  const { session } = useAuth();
  return useQuery<UserProfile, Error>({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: !!session,
    staleTime: 300_000,
    retry: 2,
  });
}
