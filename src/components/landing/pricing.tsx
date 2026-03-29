"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Coins } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CREDIT_PACKS } from "@/lib/utils/constants"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1,000 records/day",
      "100 records per request",
      "All 156 field types",
      "Plain English prompts (10/day)",
      "Schema & template mode (unlimited)",
      "JSON output",
      "All 22 locales",
    ],
    cta: "Start Free",
    ctaLoggedIn: "Current plan",
    href: "/sign-up",
    hrefLoggedIn: "/dashboard",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious developers",
    features: [
      "100,000 records/day",
      "10,000 records per request",
      "Plain English prompts (100/day)",
      "Schema & template mode (unlimited)",
      "JSON + CSV + SQL output",
      "Seed for reproducibility",
      "Schema detection endpoint",
      "60 requests/minute",
    ],
    cta: "Get Pro",
    ctaLoggedIn: "Upgrade to Pro",
    href: "/sign-up",
    hrefLoggedIn: "/dashboard/billing",
    popular: true,
  },
  {
    name: "Scale",
    price: "$79",
    period: "/month",
    description: "For teams and high-volume",
    features: [
      "1,000,000 records/day",
      "50,000 records per request",
      "Plain English prompts (500/day)",
      "Schema & template mode (unlimited)",
      "Everything in Pro",
      "Webhook delivery",
      "Bulk async generation",
      "120 requests/minute",
    ],
    cta: "Get Scale",
    ctaLoggedIn: "Upgrade to Scale",
    href: "/sign-up",
    hrefLoggedIn: "/dashboard/billing",
    popular: false,
  },
]

const creditPacks = Object.entries(CREDIT_PACKS).map(([key, pack]) => ({
  key,
  ...pack,
  perRecord: `$${(pack.price / pack.credits * 1000).toFixed(1)}/1K`,
  popular: key === "builder",
}))

export function Pricing() {
  const { isSignedIn } = useAuth()
  const [tab, setTab] = useState<"plans" | "credits">("plans")

  return (
    <section id="pricing" className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8" id="credits">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setTab("plans")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === "plans"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly Plans
            </button>
            <button
              onClick={() => setTab("credits")}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
                tab === "credits"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Coins className="size-3.5" />
              Credit Packs
            </button>
          </div>
        </div>

        {tab === "plans" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "flex flex-col overflow-visible",
                    plan.popular && "ring-2 ring-primary shadow-md relative"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge>Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex-1 pt-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full h-10 text-sm"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link
                        href={isSignedIn ? plan.hrefLoggedIn : plan.href}
                        data-fast-goal="click_pricing_cta"
                        data-fast-goal-plan={plan.name.toLowerCase()}
                        data-fast-goal-location="pricing"
                      >
                        {isSignedIn ? plan.ctaLoggedIn : plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              No contracts. Cancel anytime.{" "}
              <button
                onClick={() => setTab("credits")}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Or buy credit packs
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <p className="text-muted-foreground">
                One-time purchases. No subscription required. Credits never expire and are used automatically when you generate data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
              {creditPacks.map((pack) => (
                <Card
                  key={pack.key}
                  className={cn(
                    "flex flex-col overflow-visible",
                    pack.popular && "ring-2 ring-primary shadow-md relative"
                  )}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge>Best Value</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{pack.label}</CardTitle>
                    <CardDescription>{pack.credits.toLocaleString()} credits</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${pack.price}</span>
                      <span className="text-muted-foreground ml-1">one-time</span>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex-1 pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{pack.perRecord} records</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Never expires</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Works with any plan</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Used before daily limits</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full h-10 text-sm"
                      variant={pack.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link
                        href={isSignedIn ? "/dashboard/billing" : "/sign-up"}
                        data-fast-goal="click_pricing_cta"
                        data-fast-goal-plan={`credits_${pack.key}`}
                        data-fast-goal-location="pricing"
                      >
                        {isSignedIn ? `Buy ${pack.label}` : "Sign Up to Buy"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              1 credit = 1 record generated.{" "}
              <button
                onClick={() => setTab("plans")}
                className="underline underline-offset-2 hover:text-foreground"
              >
                View monthly plans
              </button>
            </p>
          </>
        )}
      </div>
    </section>
  )
}
