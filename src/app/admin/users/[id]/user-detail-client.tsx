"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { AdminUserDetail } from "@/lib/api/admin-queries"

interface Props {
  user: AdminUserDetail
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatLastUsed(iso: string | null) {
  if (!iso) return "Never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
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

export default function UserDetailClient({ user }: Props) {
  const router = useRouter()
  const [tier, setTier] = useState(user.tier)
  const [savingTier, setSavingTier] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [revokingKey, setRevokingKey] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const maxUsage = Math.max(...user.daily_usage.map((d) => d.records_used), 1)

  async function handleSaveTier() {
    setSavingTier(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/tier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })
      if (!res.ok) throw new Error("Failed to update tier")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingTier(false)
    }
  }

  async function handleRevokeKey(keyId: string) {
    setRevokingKey(keyId)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/keys/${keyId}/revoke`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to revoke key")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setRevokingKey(null)
    }
  }

  async function handleDisableUser() {
    setDisabling(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/disable`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to disable user")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setDisabling(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3" />
        Back to Users
      </Link>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle>{user.display_name ?? "Unknown User"}</CardTitle>
          <CardDescription className="font-mono text-xs">{user.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tier:</span>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={tier === user.tier || savingTier}
                onClick={handleSaveTier}
              >
                {savingTier && <Loader2 className="size-3 animate-spin" />}
                Save
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* API Keys table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>{user.api_keys.length} total keys</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.api_keys.map((key) => (
                <TableRow key={key.id} className={!key.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-mono text-xs">{key.key_prefix}...</TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? "secondary" : "destructive"}>
                      {key.is_active ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground" suppressHydrationWarning>
                    {formatLastUsed(key.last_used_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {key.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={revokingKey === key.id}
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        {revokingKey === key.id && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {user.api_keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No API keys
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription card */}
      {user.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Product</span>
                <p className="font-medium">{user.subscription.product_name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p>
                  <Badge
                    variant={user.subscription.status === "active" ? "secondary" : "destructive"}
                  >
                    {user.subscription.status}
                  </Badge>
                </p>
              </div>
              {user.subscription.current_period_end && (
                <div>
                  <span className="text-xs text-muted-foreground">Period End</span>
                  <p className="text-muted-foreground">
                    {formatDate(user.subscription.current_period_end)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Usage chart (30 day) */}
      {user.daily_usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] sm:gap-1 h-32">
              {user.daily_usage.map((day, i) => (
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
                      height: `${Math.max((day.records_used / maxUsage) * 100, 2)}px`,
                    }}
                  />
                </div>
              ))}
            </div>
            {hoveredBar !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center tabular-nums">
                {user.daily_usage[hoveredBar].date} — {user.daily_usage[hoveredBar].requests_count.toLocaleString()} calls
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent calls table */}
      {user.usage_logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Last 20 API calls</CardDescription>
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
                {user.usage_logs.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell
                      className="font-mono text-xs text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(call.created_at)}
                    </TableCell>
                    <TableCell>{call.records_generated.toLocaleString()}</TableCell>
                    <TableCell>{call.tables_count}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{call.format.toUpperCase()}</Badge>
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
      )}

      <Separator />

      {/* Disable user */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Disabling a user revokes all their active API keys immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={disabling}>
                {disabling && <Loader2 className="size-3 animate-spin" />}
                Disable User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disable user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will revoke all active API keys for{" "}
                  <span className="font-medium text-foreground">
                    {user.display_name ?? user.id}
                  </span>
                  . All integrations using their keys will immediately stop working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisableUser}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Disable User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
