"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UsageData } from "@/lib/api/dashboard-queries"

function formatDayLabel(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface Props {
  usage: UsageData
}

export default function UsageClient({ usage }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [monthLabel, setMonthLabel] = useState("")

  // Render month label client-side only to avoid SSR/hydration mismatch
  useEffect(() => {
    setMonthLabel(
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    )
  }, [])

  const maxValue = Math.max(...usage.daily.map((d) => d.records_used), 1)
  const usagePercent =
    usage.recordsLimit > 0
      ? (usage.recordsToday / usage.recordsLimit) * 100
      : 0

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Usage</h1>
        <p className="text-xs text-muted-foreground mt-1">{monthLabel}</p>
      </div>

      {/* Daily limit progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Daily record usage</CardDescription>
            <p className="text-xs text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">
                {usage.recordsToday.toLocaleString()}
              </span>{" "}
              / {usage.recordsLimit.toLocaleString()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(usagePercent, 100)} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { label: "Total requests", value: usage.totalRequests.toLocaleString() },
          { label: "Total records", value: usage.totalRecords.toLocaleString() },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      {usage.daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 sm:gap-3 h-32">
              {usage.daily.map((day, i) => (
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
                    {day.records_used.toLocaleString()}
                  </span>
                  <div
                    className={`w-full rounded-sm transition-colors ${
                      hoveredBar === i ? "bg-primary" : "bg-primary/20"
                    }`}
                    style={{
                      height: `${Math.max((day.records_used / maxValue) * 100, 2)}px`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {formatDayLabel(day.date)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent calls */}
      {usage.recentCalls.length > 0 ? (
        <>
          {/* Mobile: card layout */}
          <div className="space-y-3 md:hidden">
            <h3 className="font-heading text-sm font-semibold">Recent calls</h3>
            {usage.recentCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatRelativeTime(call.created_at)}
                    </span>
                    <Badge variant="secondary">{call.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span><span className="text-muted-foreground">Records:</span> {call.records_generated.toLocaleString()}</span>
                    <span><span className="text-muted-foreground">Tables:</span> {call.tables_count}</span>
                    <span className="font-mono text-muted-foreground">{call.locale}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table layout */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Recent calls</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Locale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.recentCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell
                        className="font-mono text-muted-foreground"
                        suppressHydrationWarning
                      >
                        {formatRelativeTime(call.created_at)}
                      </TableCell>
                      <TableCell>
                        {call.records_generated.toLocaleString()}
                      </TableCell>
                      <TableCell>{call.tables_count}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {call.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {call.locale}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm font-medium mb-1">No API calls yet</p>
            <p className="text-xs text-muted-foreground">
              Your recent API calls will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
