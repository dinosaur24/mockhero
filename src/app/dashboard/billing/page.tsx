import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile, getUserSubscription } from "@/lib/api/dashboard-queries"
import BillingClient from "./billing-client"

export default async function BillingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [profile, subscription] = await Promise.all([
    getUserProfile(userId),
    getUserSubscription(userId),
  ])

  return (
    <BillingClient
      tier={profile.tier}
      isEarlyAdopter={profile.isEarlyAdopter}
      subscription={subscription}
    />
  )
}
