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
    label: "Security Testing",
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
    const category = FIELD_TYPE_CATALOG[catKey as keyof typeof FIELD_TYPE_CATALOG]
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

export function FieldTypesExplorerClient() {
  const [search, setSearch] = useState("")
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_FIELDS
    const q = search.toLowerCase()
    return ALL_FIELDS.filter(
      (f) =>
        f.typeName.toLowerCase().includes(q) ||
        f.field.description.toLowerCase().includes(q) ||
        CATEGORY_META[f.category]?.label.toLowerCase().includes(q)
    )
  }, [search])

  const groupedByCategory = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const f of filtered) {
      if (!map[f.category]) map[f.category] = []
      map[f.category].push(f)
    }
    return map
  }, [filtered])

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
      {/* Search + count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search field types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 shrink-0">
          {filtered.length} field type{filtered.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Category sections */}
      {CATEGORY_KEYS.map((catKey) => {
        const fields = groupedByCategory[catKey]
        if (!fields || fields.length === 0) return null
        const meta = CATEGORY_META[catKey]

        return (
          <section key={catKey} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${meta.bgColor} ${meta.color}`}
              >
                {meta.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {fields.length} type{fields.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ typeName, field }) => {
                const isExpanded = expandedType === typeName
                const isCopied = copiedType === typeName

                return (
                  <Card
                    key={typeName}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isExpanded
                        ? "ring-2 ring-primary/30"
                        : ""
                    }`}
                    onClick={() =>
                      setExpandedType(isExpanded ? null : typeName)
                    }
                  >
                    <CardHeader className="pb-2">
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
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-2">
                        {field.description}
                      </p>
                      <code className="text-xs bg-muted rounded px-2 py-1 break-all block">
                        {formatExample(field.example)}
                      </code>

                      {isExpanded && (
                        <div className="mt-4 space-y-3 border-t pt-3">
                          {Object.keys(field.params).length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">
                                Parameters
                              </p>
                              <ul className="space-y-1">
                                {Object.entries(field.params).map(
                                  ([pName, pDesc]) => (
                                    <li
                                      key={pName}
                                      className="text-xs text-muted-foreground"
                                    >
                                      <span className="font-mono font-medium text-foreground">
                                        {pName}
                                      </span>{" "}
                                      &mdash; {String(pDesc)}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(typeName)
                            }}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                Use in Schema
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No field types match your search.</p>
          <p className="text-sm mt-1">Try a different keyword.</p>
        </div>
      )}

      {/* CTA */}
      <Card className="mt-12">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
          <div>
            <h2 className="text-xl font-semibold">
              Ready to use these types?
            </h2>
            <p className="text-muted-foreground mt-1">
              Generate realistic test data with any combination of these field types.
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
