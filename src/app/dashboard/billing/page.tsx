import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getUserSubscription } from "@/lib/api/dashboard-queries"
import BillingClient from "./billing-client"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const params = await searchParams
  const justUpgraded = params.success === "true"

  const [profile, subscription] = await Promise.all([
    getUserProfile(userId),
    getUserSubscription(userId),
  ])

  return (
    <BillingClient
      tier={profile.tier}
      subscription={subscription}
      justUpgraded={justUpgraded}
    />
  )
}
