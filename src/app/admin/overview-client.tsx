"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminOverview, SignupTimeSeriesPoint } from "@/lib/api/admin-queries"

interface Props {
  overview: AdminOverview
  signupTrend: SignupTimeSeriesPoint[]
}

export default function AdminOverviewClient({ overview, signupTrend }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const maxSignup = Math.max(...signupTrend.map((d) => d.count), 1)

  const tierEntries = [
    { tier: "free", count: overview.tierDistribution.free },
    { tier: "pro", count: overview.tierDistribution.pro },
    { tier: "scale", count: overview.tierDistribution.scale },
  ]
  const totalTierUsers = tierEntries.reduce((s, t) => s + t.count, 0)

  const kpis = [
    { label: "Total Users", value: overview.totalUsers.toLocaleString() },
    { label: "Active 7d", value: overview.activeUsers7d.toLocaleString() },
    { label: "API Calls Today", value: overview.apiCallsToday.toLocaleString() },
    { label: "Records Today", value: overview.recordsToday.toLocaleString() },
    { label: "MRR", value: `$${overview.mrr.toLocaleString()}` },
    { label: "Signups Today", value: overview.signupsToday.toLocaleString() },
  ]

  const tierColors: Record<string, string> = {
    free: "bg-muted-foreground/30",
    pro: "bg-primary",
    scale: "bg-primary/60",
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Admin dashboard</p>
      </div>

      {/* KPI cards — 2x3 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums">
                {kpi.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Signup trend — bar chart */}
      {signupTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Signups — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] sm:gap-1 h-32">
              {signupTrend.map((day, i) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-2"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onTouchStart={() => setHoveredBar(i)}
                >
                  <span
                    className={`text-[10px] tabular-nums transition-opacity ${
                      hoveredBar === i
                        ? "opacity-100 text-foreground font-medium"
                        : "opacity-0"
                    }`}
                  >
                    {day.count}
                  </span>
                  <div
                    className={`w-full rounded-sm transition-colors ${
                      hoveredBar === i ? "bg-primary" : "bg-primary/20"
                    }`}
                    style={{
                      height: `${Math.max((day.count / maxSignup) * 100, 2)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
            {hoveredBar !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center tabular-nums">
                {signupTrend[hoveredBar].date}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tier distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tierEntries.map((tier) => {
            const pct = totalTierUsers > 0 ? (tier.count / totalTierUsers) * 100 : 0
            return (
              <div key={tier.tier} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {tier.tier}
                    </Badge>
                    <span className="text-muted-foreground">
                      {tier.count.toLocaleString()} users
                    </span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tierColors[tier.tier] ?? "bg-primary/40"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
