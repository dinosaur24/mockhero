"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminUsageAnalytics } from "@/lib/api/admin-queries"

interface Props {
  analytics: AdminUsageAnalytics
  days: number
}

const PERIOD_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
]

export default function UsageClient({ analytics, days }: Props) {
  const router = useRouter()
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const maxRequests = Math.max(...analytics.dailyStats.map((d) => d.requests), 1)

  const totalCalls = analytics.dailyStats.reduce((s, d) => s + d.requests, 0)
  const totalRecords = analytics.dailyStats.reduce((s, d) => s + d.records, 0)
  const avgCallsPerDay = analytics.dailyStats.length > 0
    ? Math.round(totalCalls / analytics.dailyStats.length)
    : 0

  const totalFormatCount = analytics.formatDist.reduce((s, f) => s + f.count, 0)
  const totalLocaleCount = analytics.localeDist.reduce((s, l) => s + l.count, 0)

  function handlePeriod(d: number) {
    router.push(`/admin/usage?days=${d}`)
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold">Usage Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">Platform-wide usage</p>
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={days === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Calls</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {totalCalls.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {totalRecords.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg Calls / Day</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {avgCallsPerDay.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* API calls bar chart */}
      {analytics.dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Calls — Last {days} Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] sm:gap-1 h-32">
              {analytics.dailyStats.map((day, i) => (
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
                    {day.requests.toLocaleString()}
                  </span>
                  <div
                    className={`w-full rounded-sm transition-colors ${
                      hoveredBar === i ? "bg-primary" : "bg-primary/20"
                    }`}
                    style={{
                      height: `${Math.max((day.requests / maxRequests) * 100, 2)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
            {hoveredBar !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center tabular-nums">
                {analytics.dailyStats[hoveredBar].date} — {analytics.dailyStats[hoveredBar].records.toLocaleString()} records
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top 10 users */}
      {analytics.topUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Users</CardTitle>
            <CardDescription>By record volume</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topUsers.map((u, i) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {u.display_name ?? u.user_id.slice(0, 12) + "..."}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.records.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Format + Locale distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Format Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.formatDist.map((f) => (
                <Badge key={f.format} variant="secondary" className="gap-1">
                  {f.format.toUpperCase()}
                  <span className="text-muted-foreground tabular-nums">
                    {totalFormatCount > 0
                      ? ((f.count / totalFormatCount) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </Badge>
              ))}
              {analytics.formatDist.length === 0 && (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locale Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.localeDist.map((l) => (
                <Badge key={l.locale} variant="secondary" className="gap-1">
                  {l.locale}
                  <span className="text-muted-foreground tabular-nums">
                    {totalLocaleCount > 0
                      ? ((l.count / totalLocaleCount) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </Badge>
              ))}
              {analytics.localeDist.length === 0 && (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
