import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getDashboardStats } from "@/lib/api/dashboard-queries"
import { getActiveKeyPrefix } from "@/lib/api/keys"
import OverviewClient from "./overview-client"

export const metadata = { title: "Dashboard" }

export default async function DashboardOverview() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [stats, keyPrefix] = await Promise.all([
    getDashboardStats(userId),
    getActiveKeyPrefix(userId),
  ])

  return <OverviewClient stats={stats} keyPrefix={keyPrefix} />
}
