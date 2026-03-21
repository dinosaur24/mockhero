import Link from "next/link"
import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
      "Plain English prompts",
      "JSON output",
      "All 22 locales",
    ],
    cta: "Start Free",
    href: "/sign-up",
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
      "Plain English prompts",
      "JSON + CSV + SQL output",
      "Seed for reproducibility",
      "Schema detection endpoint",
      "60 requests/minute",
    ],
    cta: "Get Pro",
    href: "/sign-up",
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
      "Plain English prompts",
      "Everything in Pro",
      "Webhook delivery",
      "Bulk async generation",
      "120 requests/minute",
    ],
    cta: "Get Scale",
    href: "/sign-up",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-4 md:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start free, scale as you grow. No hidden fees. Annual plans get 2 months free.
          </p>
        </div>

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
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          No contracts. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
