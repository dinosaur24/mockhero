/**
 * Admin-level Supabase queries for the internal admin dashboard.
 * All queries use the admin client (service role) — bypasses RLS.
 */

import { createAdminClient } from "@/lib/supabase/admin"

// ─── Interfaces ─────────────────────────────────────

export interface AdminOverview {
  totalUsers: number
  signupsToday: number
  activeUsers7d: number
  apiCallsToday: number
  recordsToday: number
  mrr: number
  tierDistribution: { free: number; pro: number; scale: number }
}

export interface SignupTimeSeriesPoint {
  date: string
  count: number
}

export interface AdminUser {
  id: string
  display_name: string | null
  avatar_url: string | null
  tier: string
  created_at: string
  active_keys: number
  records_today: number
}

export interface AdminUsersResult {
  users: AdminUser[]
  total: number
}

export interface AdminUserApiKey {
  id: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export interface AdminUserSubscription {
  id: string
  polar_subscription_id: string
  polar_customer_id: string
  product_name: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface AdminUserUsageLog {
  id: string
  records_generated: number
  tables_count: number
  format: string
  locale: string
  created_at: string
}

export interface AdminUserDailyUsage {
  date: string
  records_used: number
  requests_count: number
}

export interface AdminUserDetail {
  id: string
  display_name: string | null
  avatar_url: string | null
  tier: string
  created_at: string
  updated_at: string | null
  api_keys: AdminUserApiKey[]
  subscription: AdminUserSubscription | null
  usage_logs: AdminUserUsageLog[]
  daily_usage: AdminUserDailyUsage[]
  total_records: number
  total_requests: number
}

export interface DailyStatPoint {
  date: string
  requests: number
  records: number
}

export interface TopUser {
  user_id: string
  display_name: string | null
  records: number
}

export interface FormatDistItem {
  format: string
  count: number
}

export interface LocaleDistItem {
  locale: string
  count: number
}

export interface BulkJobStats {
  pending: number
  processing: number
  completed: number
  failed: number
}

export interface AdminUsageAnalytics {
  dailyStats: DailyStatPoint[]
  topUsers: TopUser[]
  formatDist: FormatDistItem[]
  localeDist: LocaleDistItem[]
  bulkJobStats: BulkJobStats
}

export interface AdminRevenueSubscription {
  id: string
  user_id: string
  display_name: string | null
  product_name: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
}

export interface AdminRevenue {
  mrr: number
  activeSubscribers: number
  newThisMonth: number
  churnLast30d: number
  subscriptions: AdminRevenueSubscription[]
}

export interface SystemSettings {
  maintenanceMode: boolean
}

// ─── Helpers ────────────────────────────────────────

const PRO_PRICE = 19
const SCALE_PRICE = 59

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toISODate(d)
}

function startOfMonth(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// ─── 1. Admin Overview ──────────────────────────────

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = createAdminClient()
  const today = toISODate(new Date())
  const sevenDaysAgoStr = daysAgo(7)

  const [
    totalUsersRes,
    signupsTodayRes,
    activeUsers7dRes,
    apiCallsTodayRes,
    recordsTodayRes,
    proCountRes,
    scaleCountRes,
    freeCountRes,
  ] = await Promise.all([
    // Total users
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    // Signups today
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`)
      .lt("created_at", `${today}T23:59:59.999Z`),

    // Active users in last 7 days (users with usage_logs entries)
    supabase
      .from("usage_logs")
      .select("user_id")
      .gte("created_at", `${sevenDaysAgoStr}T00:00:00Z`),

    // API calls today
    supabase
      .from("daily_usage")
      .select("requests_count")
      .eq("date", today),

    // Records today
    supabase
      .from("daily_usage")
      .select("records_used")
      .eq("date", today),

    // Pro active subscriptions
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .ilike("product_name", "%pro%")
      .eq("status", "active"),

    // Scale active subscriptions
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .ilike("product_name", "%scale%")
      .eq("status", "active"),

    // Free tier (profiles not on pro or scale via subscriptions)
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tier", "free"),
  ])

  // Deduplicate active users
  const uniqueActiveUsers = new Set(
    (activeUsers7dRes.data ?? []).map((r: { user_id: string }) => r.user_id)
  )

  const apiCallsToday = (apiCallsTodayRes.data ?? []).reduce(
    (sum: number, r: { requests_count: number }) => sum + (r.requests_count ?? 0),
    0
  )

  const recordsToday = (recordsTodayRes.data ?? []).reduce(
    (sum: number, r: { records_used: number }) => sum + (r.records_used ?? 0),
    0
  )

  const proCount = proCountRes.count ?? 0
  const scaleCount = scaleCountRes.count ?? 0
  const freeCount = freeCountRes.count ?? 0

  return {
    totalUsers: totalUsersRes.count ?? 0,
    signupsToday: signupsTodayRes.count ?? 0,
    activeUsers7d: uniqueActiveUsers.size,
    apiCallsToday,
    recordsToday,
    mrr: proCount * PRO_PRICE + scaleCount * SCALE_PRICE,
    tierDistribution: {
      free: freeCount,
      pro: proCount,
      scale: scaleCount,
    },
  }
}

// ─── 2. Signup Time Series ──────────────────────────

export async function getSignupTimeSeries(
  days: number
): Promise<SignupTimeSeriesPoint[]> {
  const supabase = createAdminClient()
  const sinceDate = daysAgo(days)

  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", `${sinceDate}T00:00:00Z`)
    .order("created_at", { ascending: true })

  // Count signups per date
  const countsByDate = new Map<string, number>()
  for (const row of data ?? []) {
    const date = (row.created_at as string).slice(0, 10)
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1)
  }

  // Fill gaps with 0
  const result: SignupTimeSeriesPoint[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - days)

  for (let i = 0; i <= days; i++) {
    const dateStr = toISODate(cursor)
    result.push({ date: dateStr, count: countsByDate.get(dateStr) ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

// ─── 3. Admin Users (paginated, searchable) ─────────

export async function getAdminUsers(options: {
  search?: string
  tier?: string
  page: number
  pageSize: number
}): Promise<AdminUsersResult> {
  const supabase = createAdminClient()
  const { search, tier, page, pageSize } = options
  const today = toISODate(new Date())
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build the profiles query
  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, tier, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,id.ilike.%${search}%`)
  }

  if (tier) {
    query = query.eq("tier", tier)
  }

  const { data: profiles, count } = await query

  if (!profiles || profiles.length === 0) {
    return { users: [], total: count ?? 0 }
  }

  // Fetch active keys count and records today for each user
  const userIds = profiles.map((p: { id: string }) => p.id)

  const [keysRes, usageRes] = await Promise.all([
    supabase
      .from("api_keys")
      .select("user_id")
      .in("user_id", userIds)
      .eq("is_active", true),
    supabase
      .from("daily_usage")
      .select("user_id, records_used")
      .in("user_id", userIds)
      .eq("date", today),
  ])

  // Build lookup maps
  const keyCountMap = new Map<string, number>()
  for (const row of keysRes.data ?? []) {
    const uid = (row as { user_id: string }).user_id
    keyCountMap.set(uid, (keyCountMap.get(uid) ?? 0) + 1)
  }

  const usageMap = new Map<string, number>()
  for (const row of usageRes.data ?? []) {
    const r = row as { user_id: string; records_used: number }
    usageMap.set(r.user_id, r.records_used ?? 0)
  }

  const users: AdminUser[] = profiles.map(
    (p: { id: string; display_name: string | null; avatar_url: string | null; tier: string; created_at: string }) => ({
      id: p.id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      tier: p.tier,
      created_at: p.created_at,
      active_keys: keyCountMap.get(p.id) ?? 0,
      records_today: usageMap.get(p.id) ?? 0,
    })
  )

  return { users, total: count ?? 0 }
}

// ─── 4. Admin User Detail ───────────────────────────

export async function getAdminUserDetail(
  userId: string
): Promise<AdminUserDetail> {
  const supabase = createAdminClient()
  const thirtyDaysAgo = daysAgo(30)

  const [profileRes, keysRes, subscriptionRes, logsRes, dailyRes, totalRecordsRes, totalRequestsRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url, tier, created_at, updated_at")
        .eq("id", userId)
        .single(),

      supabase
        .from("api_keys")
        .select("id, key_prefix, is_active, created_at, last_used_at, revoked_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("subscriptions")
        .select(
          "id, polar_subscription_id, polar_customer_id, product_name, status, current_period_end, cancel_at_period_end, created_at, updated_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("usage_logs")
        .select("id, records_generated, tables_count, format, locale, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("daily_usage")
        .select("date, records_used, requests_count")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: true }),

      // Total records across all time
      supabase
        .from("daily_usage")
        .select("records_used")
        .eq("user_id", userId),

      // Total requests across all time
      supabase
        .from("daily_usage")
        .select("requests_count")
        .eq("user_id", userId),
    ])

  const profile = profileRes.data

  const totalRecords = (totalRecordsRes.data ?? []).reduce(
    (sum: number, r: { records_used: number }) => sum + (r.records_used ?? 0),
    0
  )

  const totalRequests = (totalRequestsRes.data ?? []).reduce(
    (sum: number, r: { requests_count: number }) => sum + (r.requests_count ?? 0),
    0
  )

  return {
    id: profile?.id ?? userId,
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    tier: profile?.tier ?? "free",
    created_at: profile?.created_at ?? "",
    updated_at: profile?.updated_at ?? null,
    api_keys: (keysRes.data ?? []) as AdminUserApiKey[],
    subscription: subscriptionRes.data as AdminUserSubscription | null,
    usage_logs: (logsRes.data ?? []) as AdminUserUsageLog[],
    daily_usage: (dailyRes.data ?? []) as AdminUserDailyUsage[],
    total_records: totalRecords,
    total_requests: totalRequests,
  }
}

// ─── 5. Usage Analytics ─────────────────────────────

export async function getAdminUsageAnalytics(
  days: number
): Promise<AdminUsageAnalytics> {
  const supabase = createAdminClient()
  const sinceDate = daysAgo(days)
  const sinceTimestamp = `${sinceDate}T00:00:00Z`

  const [dailyRes, logsRes, bulkPendingRes, bulkProcessingRes, bulkCompletedRes, bulkFailedRes] =
    await Promise.all([
      // Daily stats from daily_usage table
      supabase
        .from("daily_usage")
        .select("date, records_used, requests_count")
        .gte("date", sinceDate)
        .order("date", { ascending: true }),

      // Usage logs for format/locale distribution and top users
      supabase
        .from("usage_logs")
        .select("user_id, records_generated, format, locale")
        .gte("created_at", sinceTimestamp),

      // Bulk job stats
      supabase
        .from("bulk_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("bulk_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "processing"),
      supabase
        .from("bulk_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("bulk_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed"),
    ])

  // Aggregate daily stats by date
  const dailyMap = new Map<string, { requests: number; records: number }>()
  for (const row of dailyRes.data ?? []) {
    const r = row as { date: string; records_used: number; requests_count: number }
    const existing = dailyMap.get(r.date)
    if (existing) {
      existing.requests += r.requests_count ?? 0
      existing.records += r.records_used ?? 0
    } else {
      dailyMap.set(r.date, {
        requests: r.requests_count ?? 0,
        records: r.records_used ?? 0,
      })
    }
  }

  // Fill gaps
  const dailyStats: DailyStatPoint[] = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - days)
  for (let i = 0; i <= days; i++) {
    const dateStr = toISODate(cursor)
    const entry = dailyMap.get(dateStr)
    dailyStats.push({
      date: dateStr,
      requests: entry?.requests ?? 0,
      records: entry?.records ?? 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Top users by records
  const userRecordsMap = new Map<string, number>()
  for (const row of logsRes.data ?? []) {
    const r = row as { user_id: string; records_generated: number }
    userRecordsMap.set(
      r.user_id,
      (userRecordsMap.get(r.user_id) ?? 0) + (r.records_generated ?? 0)
    )
  }

  const topUserIds = [...userRecordsMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Fetch display names for top users
  let topUsers: TopUser[] = []
  if (topUserIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in(
        "id",
        topUserIds.map(([uid]) => uid)
      )

    const nameMap = new Map<string, string | null>()
    for (const p of profilesData ?? []) {
      const profile = p as { id: string; display_name: string | null }
      nameMap.set(profile.id, profile.display_name)
    }

    topUsers = topUserIds.map(([uid, records]) => ({
      user_id: uid,
      display_name: nameMap.get(uid) ?? null,
      records,
    }))
  }

  // Format distribution
  const formatMap = new Map<string, number>()
  for (const row of logsRes.data ?? []) {
    const r = row as { format: string }
    if (r.format) {
      formatMap.set(r.format, (formatMap.get(r.format) ?? 0) + 1)
    }
  }
  const formatDist: FormatDistItem[] = [...formatMap.entries()]
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count)

  // Locale distribution
  const localeMap = new Map<string, number>()
  for (const row of logsRes.data ?? []) {
    const r = row as { locale: string }
    if (r.locale) {
      localeMap.set(r.locale, (localeMap.get(r.locale) ?? 0) + 1)
    }
  }
  const localeDist: LocaleDistItem[] = [...localeMap.entries()]
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count)

  return {
    dailyStats,
    topUsers,
    formatDist,
    localeDist,
    bulkJobStats: {
      pending: bulkPendingRes.count ?? 0,
      processing: bulkProcessingRes.count ?? 0,
      completed: bulkCompletedRes.count ?? 0,
      failed: bulkFailedRes.count ?? 0,
    },
  }
}

// ─── 6. Revenue ─────────────────────────────────────

export async function getAdminRevenue(): Promise<AdminRevenue> {
  const supabase = createAdminClient()
  const monthStart = startOfMonth()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

  const [activeSubsRes, newSubsRes, churnedRes] = await Promise.all([
    // All active subscriptions with user profile data
    supabase
      .from("subscriptions")
      .select("id, user_id, product_name, status, current_period_end, cancel_at_period_end, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false }),

    // New subscriptions this month
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("created_at", monthStart),

    // Churned in last 30 days (canceled or expired)
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["canceled", "expired"])
      .gte("updated_at", thirtyDaysAgoStr),
  ])

  const activeSubs = (activeSubsRes.data ?? []) as Array<{
    id: string
    user_id: string
    product_name: string
    status: string
    current_period_end: string | null
    cancel_at_period_end: boolean
    created_at: string
  }>

  // Calculate MRR from active subscriptions
  let mrr = 0
  for (const sub of activeSubs) {
    const name = (sub.product_name ?? "").toLowerCase()
    if (name.includes("scale")) {
      mrr += SCALE_PRICE
    } else if (name.includes("pro")) {
      mrr += PRO_PRICE
    }
  }

  // Fetch display names for subscription holders
  const userIds = [...new Set(activeSubs.map((s) => s.user_id))]
  const nameMap = new Map<string, string | null>()
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds)

    for (const p of profilesData ?? []) {
      const profile = p as { id: string; display_name: string | null }
      nameMap.set(profile.id, profile.display_name)
    }
  }

  const subscriptions: AdminRevenueSubscription[] = activeSubs.map((s) => ({
    id: s.id,
    user_id: s.user_id,
    display_name: nameMap.get(s.user_id) ?? null,
    product_name: s.product_name,
    status: s.status,
    current_period_end: s.current_period_end,
    cancel_at_period_end: s.cancel_at_period_end,
    created_at: s.created_at,
  }))

  return {
    mrr,
    activeSubscribers: activeSubs.length,
    newThisMonth: newSubsRes.count ?? 0,
    churnLast30d: churnedRes.count ?? 0,
    subscriptions,
  }
}

// ─── 7. System Settings ─────────────────────────────

export async function getSystemSettings(): Promise<SystemSettings> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .maybeSingle()

  // Default to false if table doesn't exist or row not found
  if (error || !data) {
    return { maintenanceMode: false }
  }

  return {
    maintenanceMode: data.value === true || data.value === "true",
  }
}
