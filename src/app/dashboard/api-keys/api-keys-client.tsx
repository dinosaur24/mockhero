"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, Plus, Key, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ApiKeyRow } from "@/lib/api/dashboard-queries"

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

interface Props {
  initialKeys: ApiKeyRow[]
}

export default function ApiKeysClient({ initialKeys }: Props) {
  const router = useRouter()
  const [keys, setKeys] = useState(initialKeys)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [creating, setCreating] = useState(false)
  const [newRawKey, setNewRawKey] = useState<string | null>(null)
  const [copiedNew, setCopiedNew] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch("/api/dashboard/create-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() || undefined }),
      })
      if (!res.ok) throw new Error("Failed to create key")
      const { rawKey } = await res.json()
      setNewRawKey(rawKey)
      setShowCreateForm(false)
      setKeyName("")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    const key = keys.find((k) => k.id === id)
    if (!key) return
    const confirmed = window.confirm(
      `Revoke API key "${key.key_prefix}..."?\n\nAll integrations using this key will immediately stop working.`
    )
    if (!confirmed) return

    try {
      const res = await fetch("/api/dashboard/revoke-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: id }),
      })
      if (!res.ok) throw new Error("Failed to revoke key")
      // Optimistic update
      setKeys(keys.map((k) => (k.id === id ? { ...k, is_active: false } : k)))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopyNew = async () => {
    if (!newRawKey) return
    try {
      await navigator.clipboard.writeText(newRawKey)
      setCopiedNew(true)
      setTimeout(() => setCopiedNew(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold">API Keys</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your API keys</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
          <Plus className="size-3.5" />
          Create Key
        </Button>
      </div>

      {/* Create key form */}
      {showCreateForm && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-3">Name your API key</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g. Production, CI/CD, Local dev..."
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                maxLength={100}
                autoFocus
                className="flex-1"
              />
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Create
              </Button>
              <Button variant="ghost" onClick={() => { setShowCreateForm(false); setKeyName("") }}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Optional — helps you identify keys later.</p>
          </CardContent>
        </Card>
      )}

      {/* New key banner — shown once after creation */}
      {newRawKey && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 px-4 py-3">
          <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
            Your new API key — copy it now, it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
              {newRawKey}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopyNew}>
              {copiedNew ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copiedNew ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="size-8 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium mb-1">No API keys yet</p>
            <p className="text-xs text-muted-foreground mb-6">
              Create your first key to start generating test data.
            </p>
            <Button onClick={handleCreate} disabled={creating} className="min-h-[44px]">
              <Plus className="size-3.5" />
              Create Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: card layout */}
          <div className="space-y-3 md:hidden">
            {keys.map((key) => (
              <Card key={key.id} className={!key.is_active ? "opacity-50" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{key.name || "Unnamed key"}</span>
                    <Badge variant={key.is_active ? "secondary" : "destructive"}>
                      {key.is_active ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <code className="font-mono text-xs text-muted-foreground">
                    {key.key_prefix}...
                  </code>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>Created {formatDate(key.created_at)}</span>
                    <span suppressHydrationWarning>Used {formatLastUsed(key.last_used_at)}</span>
                  </div>
                  {key.is_active && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] flex-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(key.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table layout */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow
                      key={key.id}
                      className={!key.is_active ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium">
                        {key.name || <span className="text-muted-foreground">Unnamed</span>}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {key.key_prefix}...
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(key.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground" suppressHydrationWarning>
                        {formatLastUsed(key.last_used_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? "secondary" : "destructive"}>
                          {key.is_active ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRevoke(key.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
