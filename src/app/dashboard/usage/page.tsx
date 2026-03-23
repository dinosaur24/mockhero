import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUsageData } from "@/lib/api/dashboard-queries"
import UsageClient from "./usage-client"

export const metadata = { title: "Usage" }

export default async function UsagePage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const usage = await getUsageData(userId)

  return <UsageClient usage={usage} />
}
