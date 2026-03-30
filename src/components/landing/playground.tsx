"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Copy, Check, Info, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShareCard } from "@/components/share-card"

// Template quick-start requests (playground-sized: ~3-5 records per table)
const PLAYGROUND_TEMPLATES = [
  {
    name: "E-commerce",
    request: { template: "ecommerce", scale: 0.05 },
  },
  {
    name: "Blog",
    request: { template: "blog", scale: 0.05 },
  },
  {
    name: "SaaS",
    request: { template: "saas", scale: 0.05 },
  },
  {
    name: "Social",
    request: { template: "social", scale: 0.05 },
  },
]

const sampleSchema = `{
  "tables": [
    {
      "name": "users",
      "count": 3,
      "fields": [
        { "name": "id", "type": "uuid" },
        { "name": "country", "type": "enum", "params": { "values": ["DE", "FR", "ES"] } },
        { "name": "first_name", "type": "first_name" },
        { "name": "last_name", "type": "last_name" },
        { "name": "email", "type": "email" },
        { "name": "role", "type": "enum", "params": { "values": ["admin", "editor", "viewer"] } },
        { "name": "created_at", "type": "datetime" }
      ]
    }
  ]
}`

// Pre-generated realistic output so the panel is never empty
const prefilledOutput = JSON.stringify({
  data: {
    users: [
      {
        id: "a7c3e1d0-9f24-4b18-ae52-d3f7b8c01e95",
        country: "DE",
        first_name: "Maximilian",
        last_name: "Bergmann",
        email: "maximilian.bergmann@web.de",
        role: "admin",
        created_at: "2025-11-03T09:14:22Z"
      },
      {
        id: "f2b8d4a1-6e73-4c09-b1d5-8a2f9e7c34b6",
        country: "FR",
        first_name: "Camille",
        last_name: "Dubois",
        email: "camille.dubois@orange.fr",
        role: "editor",
        created_at: "2026-01-17T15:42:08Z"
      },
      {
        id: "c9e5f3b2-1a48-4d67-9c83-5b0e2d6f18a7",
        country: "ES",
        first_name: "Alejandro",
        last_name: "Morales",
        email: "alejandro.morales@telefonica.es",
        role: "viewer",
        created_at: "2026-02-28T11:05:37Z"
      }
    ]
  },
  meta: {
    tables: 1,
    total_records: 3,
    generation_time_ms: 4
  }
}, null, 2)

export function Playground() {
  const [inputValue, setInputValue] = useState(sampleSchema)
  const [output, setOutput] = useState(prefilledOutput)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [meta, setMeta] = useState<{ tables?: number; total_records?: number; generation_time_ms?: number } | null>({
    tables: 1,
    total_records: 3,
    generation_time_ms: 4,
  })

  // Core fetch logic shared by generate button & template quick-start
  const fetchPlayground = useCallback(async (body: unknown) => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = await res.json()

      // Distinguish API errors from successful generation
      if (!res.ok || result.error) {
        const msg = result.error?.message ?? result.error ?? `Server error (${res.status})`
        setOutput(JSON.stringify({ error: msg }, null, 2))
        setMeta(null)
      } else {
        setOutput(JSON.stringify(result, null, 2))
        setMeta(result.meta ?? null)
      }
    } catch {
      setOutput(JSON.stringify({ error: "Invalid schema or server error" }, null, 2))
      setMeta(null)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    try {
      const schema = JSON.parse(inputValue)
      await fetchPlayground(schema)
    } catch {
      setOutput(JSON.stringify({ error: "Invalid JSON in schema input" }, null, 2))
    }
  }, [inputValue, fetchPlayground])

  // Auto-generate fresh data on mount (replaces the static prefill)
  useEffect(() => {
    // Fire once with the initial sample schema; handleGenerate is stable on mount
    handleGenerate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail on HTTP or without user gesture
    }
  }

  const handleLoadTemplate = async (templateName: string) => {
    const template = PLAYGROUND_TEMPLATES.find((t) => t.name === templateName)
    if (!template) return

    setInputValue(JSON.stringify(template.request, null, 2))
    await fetchPlayground(template.request)
  }

  return (
    <section id="playground" className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Try it <span className="text-primary">now</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Edit the schema below and hit generate. Watch locale-aware names appear based on country codes.
          </p>
        </div>

        {/* Template Quick Start Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Quick start:</span>
          {PLAYGROUND_TEMPLATES.map((template) => (
            <Button
              key={template.name}
              variant="secondary"
              size="sm"
              onClick={() => handleLoadTemplate(template.name)}
              disabled={isGenerating}
            >
              {template.name}
            </Button>
          ))}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                scale controls rows per table. Increase it for more data.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Schema Input</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                spellCheck={false}
                className="w-full h-[400px] text-sm font-mono leading-relaxed bg-muted rounded-md p-4 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {isGenerating ? "Generating..." : "JSON Output"}
                </CardTitle>
                {output && (
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <pre className="h-[400px] overflow-y-auto bg-muted rounded-md p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {output}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Play className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Data"}
          </Button>

          {meta && meta.total_records != null && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{meta.total_records} records</Badge>
              <Badge variant="secondary">{meta.generation_time_ms ?? "—"}ms</Badge>
              <Badge variant="secondary">{meta.tables ?? "—"} {(meta.tables ?? 0) === 1 ? "table" : "tables"}</Badge>
              <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                <Share2 className="mr-1 h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {meta && (
        <ShareCard
          records={meta.total_records ?? 0}
          tables={meta.tables ?? 0}
          timeMs={meta.generation_time_ms ?? 0}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      )}
    </section>
  )
}
