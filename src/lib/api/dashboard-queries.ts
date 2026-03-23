/**
 * Server-only data fetching for dashboard pages.
 * All queries use the admin client (service role) — bypasses RLS.
 */

import { createAdminClient } from "@/lib/supabase/admin"
import { TIER_LIMITS, type Tier } from "@/lib/utils/constants"

// ─── Overview ────────────────────────────────────────

export interface DashboardStats {
  recordsToday: number
  recordsLimit: number
  requestsToday: number
  activeKeys: number
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const [profileRes, usageRes, keysRes] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", userId).single(),
    supabase.from("daily_usage").select("records_used, requests_count").eq("user_id", userId).eq("date", today).maybeSingle(),
    supabase.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true),
  ])

  const tier = (profileRes.data?.tier ?? "free") as Tier

  return {
    recordsToday: usageRes.data?.records_used ?? 0,
    recordsLimit: TIER_LIMITS[tier].dailyRecords,
    requestsToday: usageRes.data?.requests_count ?? 0,
    activeKeys: keysRes.count ?? 0,
  }
}

// ─── API Keys ────────────────────────────────────────

export interface ApiKeyRow {
  id: string
  name: string | null
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

export async function getUserApiKeys(userId: string): Promise<ApiKeyRow[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, is_active, created_at, last_used_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return (data ?? []) as ApiKeyRow[]
}

// ─── Usage ───────────────────────────────────────────

export interface DailyUsageRow {
  date: string
  records_used: number
}

export interface UsageLogRow {
  id: string
  records_generated: number
  tables_count: number
  format: string
  locale: string
  created_at: string
}

export interface UsageData {
  daily: DailyUsageRow[]
  recentCalls: UsageLogRow[]
  totalRequests: number
  totalRecords: number
  recordsToday: number
  recordsLimit: number
}

export async function getUsageData(userId: string): Promise<UsageData> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10)

  const [profileRes, dailyRes, todayRes, logsRes, totalReqRes, totalRecRes] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", userId).single(),
    supabase
      .from("daily_usage")
      .select("date, records_used")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoStr)
      .order("date", { ascending: true }),
    supabase
      .from("daily_usage")
      .select("records_used")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
    supabase
      .from("usage_logs")
      .select("id, records_generated, tables_count, format, locale, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("daily_usage").select("records_used").eq("user_id", userId),
  ])

  const tier = (profileRes.data?.tier ?? "free") as Tier

  return {
    daily: (dailyRes.data ?? []) as DailyUsageRow[],
    recentCalls: (logsRes.data ?? []) as UsageLogRow[],
    totalRequests: totalReqRes.count ?? 0,
    totalRecords: (totalRecRes.data ?? []).reduce((sum, r) => sum + (r.records_used ?? 0), 0),
    recordsToday: todayRes.data?.records_used ?? 0,
    recordsLimit: TIER_LIMITS[tier].dailyRecords,
  }
}

// ─── Billing ────────────────────────────────────────

export interface UserSubscription {
  polar_subscription_id: string
  polar_customer_id: string
  product_name: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("polar_subscription_id, polar_customer_id, product_name, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as UserSubscription | null
}

// ─── Settings ────────────────────────────────────────

export interface UserProfile {
  tier: Tier
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single()
  return {
    tier: (data?.tier ?? "free") as Tier,
  }
}
