"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { SystemSettings } from "@/lib/api/admin-queries"
import type { TIER_LIMITS } from "@/lib/utils/constants"

type TierLimits = typeof TIER_LIMITS

interface Props {
  settings: SystemSettings
  tierLimits: TierLimits
}

export default function SystemClient({ settings, tierLimits }: Props) {
  const router = useRouter()
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode)
  const [toggling, setToggling] = useState(false)

  async function handleToggleMaintenance() {
    const newValue = !maintenanceMode
    setToggling(true)
    try {
      const res = await fetch("/api/admin/system/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newValue }),
      })
      if (!res.ok) throw new Error("Failed to toggle maintenance mode")
      setMaintenanceMode(newValue)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const tiers = Object.entries(tierLimits) as [string, { dailyRecords: number; perRequest: number; perMinute: number }][]

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">System</h1>
        <p className="text-xs text-muted-foreground mt-1">System settings and rate limits</p>
      </div>

      {/* Maintenance mode toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                When enabled, all API requests return 503 Service Unavailable.
              </CardDescription>
            </div>
            <Badge variant={maintenanceMode ? "destructive" : "secondary"}>
              {maintenanceMode ? "ON" : "OFF"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant={maintenanceMode ? "outline" : "destructive"}
            disabled={toggling}
            onClick={handleToggleMaintenance}
          >
            {toggling && <Loader2 className="size-3 animate-spin" />}
            {maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Rate limits — read-only */}
      <div>
        <h2 className="font-heading text-sm font-semibold mb-3">Rate Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {tiers.map(([name, limits]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="capitalize">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Daily Records</span>
                  <span className="font-medium tabular-nums">
                    {limits.dailyRecords.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Per Request</span>
                  <span className="font-medium tabular-nums">
                    {limits.perRequest.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Per Minute</span>
                  <span className="font-medium tabular-nums">
                    {limits.perMinute.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
