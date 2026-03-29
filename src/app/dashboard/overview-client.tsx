"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Copy, Check, ArrowRight, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DashboardStats } from "@/lib/api/dashboard-queries"

interface Props {
  stats: DashboardStats
  keyPrefix: string | null
}

export default function OverviewClient({ stats, keyPrefix }: Props) {
  const [copied, setCopied] = useState(false)

  // Fire signup goal once for new users arriving at the dashboard for the first time
  useEffect(() => {
    if (stats.requestsToday === 0 && stats.activeKeys <= 1 && !sessionStorage.getItem("df_signup_tracked")) {
      sessionStorage.setItem("df_signup_tracked", "1")
      window.datafast?.("signed_up")
    }
  }, [])

  const keyDisplay = keyPrefix ?? "mh_xxxxx"

  const curlExample = `curl -X POST https://mockhero.dev/api/v1/generate \\
  -H "Authorization: Bearer ${keyDisplay}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "tables": [{
      "name": "users",
      "count": 100,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "email", "type": "email" },
        { "name": "name", "type": "full_name" },
        { "name": "created_at", "type": "datetime" }
      ]
    }],
    "format": "json"
  }'`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlExample)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail on HTTP or without user gesture
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Your MockHero dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Records today</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {stats.recordsToday.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / {stats.recordsLimit.toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Requests today</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {stats.requestsToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active keys</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {stats.activeKeys.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1">
              <Coins className="size-3" /> Credits
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {stats.credits.toLocaleString()}
            </CardTitle>
          </CardHeader>
          {stats.credits === 0 && (
            <CardContent className="pt-0">
              <Link href="/pricing#credits">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Buy Credits
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Start</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <CardDescription>Make your first API call</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-md bg-muted p-3 sm:p-4 text-[11px] sm:text-xs font-mono leading-relaxed overflow-x-auto">
            <span className="text-primary">curl -X POST</span>{" "}
            <span className="text-foreground">https://mockhero.dev/api/v1/generate</span>{" \\\n"}
            {"  "}<span className="text-muted-foreground">-H</span>{" "}
            <span className="text-green-600 dark:text-green-400">{`"Authorization: Bearer ${keyDisplay}..."`}</span>{" \\\n"}
            {"  "}<span className="text-muted-foreground">-H</span>{" "}
            <span className="text-green-600 dark:text-green-400">{'"Content-Type: application/json"'}</span>{" \\\n"}
            {"  "}<span className="text-muted-foreground">-d</span>{" "}
            <span className="text-green-600 dark:text-green-400">{"'"}</span>{"{\n"}
            {"    "}<span className="text-primary">{'"tables"'}</span>: [{"{\n"}
            {"      "}<span className="text-primary">{'"name"'}</span>: <span className="text-green-600 dark:text-green-400">{'"users"'}</span>,{"\n"}
            {"      "}<span className="text-primary">{'"count"'}</span>: <span className="text-amber-600 dark:text-amber-400">100</span>,{"\n"}
            {"      "}<span className="text-primary">{'"fields"'}</span>: [{"\n"}
            {"        "}{"{ "}<span className="text-primary">{'"name"'}</span>: <span className="text-green-600 dark:text-green-400">{'"id"'}</span>, <span className="text-primary">{'"type"'}</span>: <span className="text-green-600 dark:text-green-400">{'"uuid"'}</span>{" },\n"}
            {"        "}{"{ "}<span className="text-primary">{'"name"'}</span>: <span className="text-green-600 dark:text-green-400">{'"email"'}</span>, <span className="text-primary">{'"type"'}</span>: <span className="text-green-600 dark:text-green-400">{'"email"'}</span>{" },\n"}
            {"        "}{"{ "}<span className="text-primary">{'"name"'}</span>: <span className="text-green-600 dark:text-green-400">{'"name"'}</span>, <span className="text-primary">{'"type"'}</span>: <span className="text-green-600 dark:text-green-400">{'"full_name"'}</span>{" }\n"}
            {"      "}]{"\n"}
            {"    "}{"}"}{"],\n"}
            {"    "}<span className="text-primary">{'"format"'}</span>: <span className="text-green-600 dark:text-green-400">{'"json"'}</span>{"\n"}
            {"  }"}<span className="text-green-600 dark:text-green-400">{"'"}</span>
          </pre>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="transition-colors hover:ring-foreground/20">
          <Link href="/docs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentation</CardTitle>
                  <CardDescription>API reference, field types, and guides.</CardDescription>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="transition-colors hover:ring-foreground/20">
          <Link href="/#playground">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Playground</CardTitle>
                  <CardDescription>Try MockHero in the browser.</CardDescription>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
