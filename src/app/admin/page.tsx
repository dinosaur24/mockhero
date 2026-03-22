import { getAdminOverview, getSignupTimeSeries } from "@/lib/api/admin-queries"
import AdminOverviewClient from "./overview-client"

export default async function AdminOverview() {
  const [overview, signupTrend] = await Promise.all([
    getAdminOverview(),
    getSignupTimeSeries(30),
  ])

  return <AdminOverviewClient overview={overview} signupTrend={signupTrend} />
}
