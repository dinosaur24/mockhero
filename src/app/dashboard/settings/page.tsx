import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/api/dashboard-queries"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const profile = await getUserProfile(userId)
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress ?? ""

  return (
    <SettingsClient
      email={email}
      tier={profile.tier}
      isEarlyAdopter={profile.isEarlyAdopter}
    />
  )
}
