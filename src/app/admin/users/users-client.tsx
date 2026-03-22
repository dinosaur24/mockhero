"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { AdminUser } from "@/lib/api/admin-queries"

interface Props {
  users: AdminUser[]
  total: number
  page: number
  pageSize: number
  currentSearch: string
  currentTier: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const tierVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  free: "secondary",
  pro: "default",
  scale: "outline",
}

export default function UsersClient({
  users,
  total,
  page,
  pageSize,
  currentSearch,
  currentTier,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) {
        params.set(k, v)
      } else {
        params.delete(k)
      }
    }
    // Reset to page 1 when filters change
    if (!updates.page) {
      params.delete("page")
    }
    router.push(`/admin/users?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ q: search })
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Users</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {total.toLocaleString()} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <Select
          value={currentTier || "all"}
          onValueChange={(v) => updateParams({ tier: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: card layout */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <Link key={user.id} href={`/admin/users/${user.id}`}>
            <Card className="transition-colors hover:ring-foreground/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">
                    {user.display_name ?? user.id.slice(0, 12) + "..."}
                  </span>
                  <Badge variant={tierVariant[user.tier] ?? "secondary"} className="capitalize">
                    {user.tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Keys: {user.active_keys}</span>
                  <span>Records: {user.records_today.toLocaleString()}</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Active Keys</TableHead>
                <TableHead>Records Today</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.display_name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.id.slice(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={tierVariant[user.tier] ?? "secondary"} className="capitalize">
                      {user.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.active_keys}</TableCell>
                  <TableCell>{user.records_today.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
