"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminRevenue } from "@/lib/api/admin-queries"

interface Props {
  revenue: AdminRevenue
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function RevenueClient({ revenue }: Props) {
  const kpis = [
    { label: "MRR", value: `$${revenue.mrr.toLocaleString()}` },
    { label: "Active Subscribers", value: revenue.activeSubscribers.toLocaleString() },
    { label: "New This Month", value: revenue.newThisMonth.toLocaleString() },
    { label: "Churn 30d", value: revenue.churnLast30d.toLocaleString() },
  ]

  // Derive tier breakdown from subscriptions
  const proSubs = revenue.subscriptions.filter((s) =>
    s.product_name.toLowerCase().includes("pro")
  )
  const scaleSubs = revenue.subscriptions.filter((s) =>
    s.product_name.toLowerCase().includes("scale")
  )

  const tierBreakdown = [
    { tier: "Pro", count: proSubs.length, price: 29 },
    { tier: "Scale", count: scaleSubs.length, price: 79 },
  ]

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Revenue</h1>
        <p className="text-xs text-muted-foreground mt-1">Subscription metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

      <Separator />

      {/* Tier breakdown */}
      <div>
        <h2 className="font-heading text-sm font-semibold mb-3">Tier Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {tierBreakdown.map((tier) => (
            <Card key={tier.tier}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.tier}</CardTitle>
                  <Badge variant="secondary">
                    ${tier.price}/mo
                  </Badge>
                </div>
                <CardDescription>
                  {tier.count.toLocaleString()} users x ${tier.price.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold tabular-nums">
                  ${(tier.count * tier.price).toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Subscriptions table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>All active subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Period End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenue.subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.display_name ?? sub.user_id.slice(0, 12) + "..."}
                  </TableCell>
                  <TableCell>{sub.product_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === "active" ? "secondary" : "destructive"}
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {sub.current_period_end ? formatDate(sub.current_period_end) : "\u2014"}
                  </TableCell>
                </TableRow>
              ))}
              {revenue.subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No subscriptions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
