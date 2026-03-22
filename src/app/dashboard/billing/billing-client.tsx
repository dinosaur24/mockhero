"use client"

import { useState } from "react"
import { Check, Loader2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import type { Tier } from "@/lib/utils/constants"
import type { UserSubscription } from "@/lib/api/dashboard-queries"

interface Props {
  tier: Tier
  subscription: UserSubscription | null
}

const plans: {
  tier: Tier
  name: string
  price: string
  priceNote: string
  features: string[]
  highlight?: boolean
}[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    features: [
      "1,000 records/day",
      "100 records/request",
      "10 requests/min",
      "All field types",
      "All output formats",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$29",
    priceNote: "/month",
    highlight: true,
    features: [
      "100,000 records/day",
      "10,000 records/request",
      "60 requests/min",

      "All field types & formats",
    ],
  },
  {
    tier: "scale",
    name: "Scale",
    price: "$79",
    priceNote: "/month",
    features: [
      "1,000,000 records/day",
      "50,000 records/request",
      "120 requests/min",

      "All field types & formats",
    ],
  },
]

const tierRank: Record<Tier, number> = { free: 0, pro: 1, scale: 2 }

export default function BillingClient({ tier, subscription }: Props) {
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPlan = plans.find((p) => p.tier === tier)!
  const isCanceling = subscription?.cancel_at_period_end ?? false

  async function handleCheckout(targetTier: Tier) {
    setLoadingTier(targetTier)
    setError(null)
    try {
      const res = await fetch("/api/dashboard/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Checkout failed")
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoadingTier(null)
    }
  }

  async function handleCancel() {
    setCanceling(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard/manage-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Cancel failed")
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setCanceling(false)
    }
  }

  function getButtonLabel(planTier: Tier): string {
    if (planTier === tier) return "Current plan"
    if (tierRank[planTier] > tierRank[tier]) return "Upgrade"
    return "Downgrade"
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Billing</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {tier === "free"
              ? "You're on the free plan. Upgrade to unlock higher limits."
              : `You're on the ${currentPlan.name} plan.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Plan</span>
            <span className="text-xs font-medium">{currentPlan.name}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-xs font-medium">
              {currentPlan.price}
              <span className="text-muted-foreground">{currentPlan.priceNote}</span>
            </span>
          </div>
          {subscription && (
            <>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge
                  variant={isCanceling ? "outline" : "default"}
                  className="text-[10px]"
                >
                  {isCanceling ? "Cancels at period end" : "Active"}
                </Badge>
              </div>
              {subscription.current_period_end && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-muted-foreground">
                      {isCanceling ? "Access until" : "Next billing date"}
                    </span>
                    <span className="text-xs font-medium" suppressHydrationWarning>
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
              {!isCanceling && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-muted-foreground">Manage</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
                          Cancel subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your {currentPlan.name} plan will remain active until the end of your
                            current billing period
                            {subscription.current_period_end && (
                              <> ({new Date(subscription.current_period_end).toLocaleDateString()})</>
                            )}
                            . After that, you&apos;ll be downgraded to the Free plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancel}
                            disabled={canceling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {canceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="font-heading text-sm font-semibold mb-4">All Plans</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.tier === tier
            const isUpgrade = tierRank[plan.tier] > tierRank[tier]
            const _isDowngrade = tierRank[plan.tier] < tierRank[tier] && plan.tier !== "free"

            return (
              <Card
                key={plan.tier}
                className={
                  plan.highlight && !isCurrent
                    ? "ring-2 ring-primary"
                    : isCurrent
                      ? "ring-2 ring-primary/50 bg-primary/[0.02]"
                      : ""
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.priceNote}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full min-h-[44px]" disabled>
                      Current plan
                    </Button>
                  ) : plan.tier === "free" ? (
                    // Can't "downgrade" to free via checkout — canceling handles that
                    <Button variant="outline" size="sm" className="w-full min-h-[44px]" disabled>
                      {tier === "free" ? "Current plan" : "Cancel to downgrade"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full min-h-[44px]"
                      variant={isUpgrade ? "default" : "outline"}
                      onClick={() => handleCheckout(plan.tier)}
                      disabled={loadingTier !== null}
                    >
                      {loadingTier === plan.tier ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      )}
                      {getButtonLabel(plan.tier)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Billing FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">How do upgrades work?</p>
            <p>
              When you upgrade, you&apos;ll be redirected to our payment provider (Polar) to
              complete the checkout. Your new limits take effect immediately.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium text-foreground mb-1">How do plan changes work?</p>
            <p>
              To downgrade, cancel your current subscription. You&apos;ll keep your current
              plan until the end of the billing period, then you can subscribe to a
              lower tier.
            </p>
          </div>
          <Separator />
          <div>
            <p className="font-medium text-foreground mb-1">What happens when I cancel?</p>
            <p>
              Your subscription remains active until the end of your billing period.
              After that, your account reverts to the Free plan. No data is deleted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
