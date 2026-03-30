"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Copy, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FIELD_TYPE_CATALOG } from "@/lib/engine/field-type-catalog"

/* ------------------------------------------------------------------ */
/*  Category metadata                                                  */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  identity: {
    label: "Identity",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  location: {
    label: "Location",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/40",
  },
  business: {
    label: "Business",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/40",
  },
  temporal: {
    label: "Temporal",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
  },
  technical: {
    label: "Technical",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800/60",
  },
  content: {
    label: "Content",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/40",
  },
  logic: {
    label: "Logic",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/40",
  },
  security_testing: {
    label: "Security",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/40",
  },
}

const CATEGORY_KEYS = Object.keys(CATEGORY_META)

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type FieldEntry = {
  description: string
  params: Record<string, string>
  example: unknown
}

function formatExample(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function getAllFieldTypes() {
  const results: {
    category: string
    typeName: string
    field: FieldEntry
  }[] = []

  for (const catKey of CATEGORY_KEYS) {
    const category =
      FIELD_TYPE_CATALOG[catKey as keyof typeof FIELD_TYPE_CATALOG]
    if (!category || Array.isArray(category)) continue
    for (const [typeName, field] of Object.entries(
      category as Record<string, FieldEntry>
    )) {
      results.push({ category: catKey, typeName, field })
    }
  }
  return results
}

const ALL_FIELDS = getAllFieldTypes()

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DataTypesClient() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let results = ALL_FIELDS

    if (activeCategory) {
      results = results.filter((f) => f.category === activeCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (f) =>
          f.typeName.toLowerCase().includes(q) ||
          f.field.description.toLowerCase().includes(q) ||
          CATEGORY_META[f.category]?.label.toLowerCase().includes(q)
      )
    }

    return results
  }, [search, activeCategory])

  async function handleCopy(typeName: string) {
    const snippet = JSON.stringify(
      { name: "field_name", type: typeName },
      null,
      2
    )
    await navigator.clipboard.writeText(snippet)
    setCopiedType(typeName)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <div>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by type name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 shrink-0">
          {filtered.length} type{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {CATEGORY_KEYS.map((catKey) => {
          const meta = CATEGORY_META[catKey]
          const isActive = activeCategory === catKey
          return (
            <button
              key={catKey}
              onClick={() =>
                setActiveCategory(isActive ? null : catKey)
              }
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                isActive
                  ? `${meta.bgColor} ${meta.color} ring-2 ring-current/20`
                  : `${meta.bgColor} ${meta.color} opacity-70 hover:opacity-100`
              }`}
            >
              {meta.label}
            </button>
          )
        })}
      </div>

      {/* Field type cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(({ category, typeName, field }) => {
          const meta = CATEGORY_META[category]
          const isCopied = copiedType === typeName
          const paramKeys = Object.keys(field.params)

          return (
            <Card key={`${category}-${typeName}`} className="flex flex-col">
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-mono font-semibold">
                    {typeName}
                  </CardTitle>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-medium ${meta.bgColor} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col flex-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {field.description}
                </p>

                {/* Example value */}
                <code className="text-xs bg-muted rounded px-2 py-1 break-all block mb-3">
                  {formatExample(field.example)}
                </code>

                {/* Parameters */}
                {paramKeys.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {paramKeys.map((pName) => (
                      <span
                        key={pName}
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.625rem] font-mono bg-muted text-muted-foreground"
                        title={String(field.params[pName])}
                      >
                        {pName}
                      </span>
                    ))}
                  </div>
                )}

                {/* Copy button pushed to bottom */}
                <div className="mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopy(typeName)}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy Definition
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No field types match your search.</p>
          <p className="text-sm mt-1">Try a different keyword or clear the category filter.</p>
        </div>
      )}

      {/* CTA */}
      <Card className="mt-12">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <div>
            <h2 className="text-xl font-semibold">
              Ready to use these field types?
            </h2>
            <p className="text-muted-foreground mt-1">
              Generate realistic test data with any combination of these types via API or dashboard.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
