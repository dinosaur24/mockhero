import { getAdminRevenue } from "@/lib/api/admin-queries"
import RevenueClient from "./revenue-client"

export default async function AdminRevenuePage() {
  const revenue = await getAdminRevenue()

  return <RevenueClient revenue={revenue} />
}
