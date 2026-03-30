"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Zap, Clock, Database, Users, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIER_LIMITS } from "@/lib/utils/constants"

/* ------------------------------------------------------------------ */
/*  Plan definitions (sourced from TIER_LIMITS)                        */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    name: "Free",
    limit: TIER_LIMITS.free.dailyRecords,
    price: "$0/mo",
    href: "/sign-up",
  },
  {
    name: "Pro",
    limit: TIER_LIMITS.pro.dailyRecords,
    price: "$29/mo",
    href: "/pricing",
  },
  {
    name: "Scale",
    limit: TIER_LIMITS.scale.dailyRecords,
    price: "$79/mo",
    href: "/pricing",
  },
] as const

const FREQUENCY_MAP: Record<string, { label: string; monthlyMultiplier: number }> = {
  daily: { label: "Daily", monthlyMultiplier: 30 },
  weekly: { label: "Weekly", monthlyMultiplier: 4 },
  biweekly: { label: "Bi-weekly", monthlyMultiplier: 2 },
  monthly: { label: "Monthly", monthlyMultiplier: 1 },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

function formatNumberFull(n: number): string {
  return n.toLocaleString("en-US")
}

function formatTime(ms: number): string {
  if (ms < 1_000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)} min`
}

function getRecommendedPlan(dailyRecords: number) {
  for (const plan of PLANS) {
    if (dailyRecords <= plan.limit) return plan
  }
  return PLANS[PLANS.length - 1]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CalculatorClient() {
  const [tables, setTables] = useState(5)
  const [recordsPerTable, setRecordsPerTable] = useState(1000)
  const [frequency, setFrequency] = useState("weekly")
  const [ciEnabled, setCiEnabled] = useState(false)
  const [teamSize, setTeamSize] = useState(1)

  const results = useMemo(() => {
    const totalPerGeneration = tables * recordsPerTable
    const freq = FREQUENCY_MAP[frequency]
    const ciMultiplier = ciEnabled ? 2 : 1
    const monthlyApiCalls = freq.monthlyMultiplier * teamSize * ciMultiplier
    const monthlyRecords = totalPerGeneration * monthlyApiCalls
    const dailyRecords = Math.ceil(monthlyRecords / 30)
    const generationTimeMs = totalPerGeneration * 0.04
    const manualHours = (totalPerGeneration / 50) * (monthlyApiCalls / 60)
    const recommended = getRecommendedPlan(dailyRecords)

    return {
      totalPerGeneration,
      monthlyApiCalls,
      monthlyRecords,
      dailyRecords,
      generationTimeMs,
      manualHours,
      recommended,
    }
  }, [tables, recordsPerTable, frequency, ciEnabled, teamSize])

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ---- Inputs ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Your Setup</CardTitle>
          <CardDescription>
            Tell us about your testing workflow and we&apos;ll estimate your
            data needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tables */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How many database tables do you need to populate?
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={200}
                value={tables}
                onChange={(e) =>
                  setTables(
                    Math.max(1, Math.min(200, Number(e.target.value) || 1))
                  )
                }
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">
                table{tables !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Records per table */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Average records per table?
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={1_000_000}
                value={recordsPerTable}
                onChange={(e) =>
                  setRecordsPerTable(
                    Math.max(
                      1,
                      Math.min(1_000_000, Number(e.target.value) || 1)
                    )
                  )
                }
                className="w-32"
              />
              <span className="text-xs text-muted-foreground">records</span>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How often do you regenerate data?
            </label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_MAP).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CI/CD toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Do you run data generation in CI/CD?
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={ciEnabled}
              onClick={() => setCiEnabled(!ciEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                ciEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  ciEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            {ciEnabled && (
              <p className="text-xs text-muted-foreground">
                CI/CD doubles your API call volume (2x multiplier).
              </p>
            )}
          </div>

          {/* Team size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How many developers on your team?
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={500}
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(
                    Math.max(1, Math.min(500, Number(e.target.value) || 1))
                  )
                }
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">
                developer{teamSize !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Results ---- */}
      <div className="space-y-6">
        {/* Summary card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Database className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Records per generation
                  </p>
                  <p className="text-lg font-semibold">
                    {formatNumber(results.totalPerGeneration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly API calls
                  </p>
                  <p className="text-lg font-semibold">
                    {formatNumberFull(results.monthlyApiCalls)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly records
                  </p>
                  <p className="text-lg font-semibold">
                    {formatNumber(results.monthlyRecords)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Generation time
                  </p>
                  <p className="text-lg font-semibold">
                    {formatTime(results.generationTimeMs)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Time comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <p className="text-xs font-medium text-red-700 dark:text-red-400">
                  Without MockHero
                </p>
                <p className="mt-1 text-lg font-bold text-red-800 dark:text-red-300">
                  {results.manualHours < 1
                    ? `${Math.round(results.manualHours * 60)} min`
                    : `${results.manualHours.toFixed(1)} hrs`}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  of manual data creation/mo
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  With MockHero
                </p>
                <p className="mt-1 text-lg font-bold text-green-800 dark:text-green-300">
                  {formatTime(
                    results.generationTimeMs * results.monthlyApiCalls
                  )}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  total generation time/mo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended plan */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Plan</CardTitle>
            <CardDescription>
              Based on ~{formatNumberFull(results.dailyRecords)} records/day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-primary bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">
                      {results.recommended.name}
                    </p>
                    <Badge variant="default" className="text-[0.6rem]">
                      Best fit
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {results.recommended.price} &middot; up to{" "}
                    {formatNumberFull(results.recommended.limit)} records/day
                  </p>
                </div>
                <Button asChild>
                  <Link href={results.recommended.href}>
                    Get Started
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Or{" "}
              <Link
                href="/pricing#credits"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                buy a credit pack
              </Link>{" "}
              for one-time needs.
            </p>
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Plans</CardTitle>
            <CardDescription>
              See which plans cover your usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PLANS.map((plan) => {
                const fits = results.dailyRecords <= plan.limit
                const isRecommended = plan.name === results.recommended.name

                return (
                  <div
                    key={plan.name}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isRecommended
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {fits ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {plan.name}
                          {isRecommended && (
                            <Badge
                              variant="default"
                              className="ml-2 text-[0.6rem]"
                            >
                              Best fit
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Up to {formatNumberFull(plan.limit)} records/day
                          &middot; {plan.price}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        fits
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {fits ? "Fits" : "Too small"}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
