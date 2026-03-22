import { getAdminUsageAnalytics } from "@/lib/api/admin-queries"
import UsageClient from "./usage-client"

interface Props {
  searchParams: Promise<{ days?: string }>
}

export default async function AdminUsagePage({ searchParams }: Props) {
  const params = await searchParams
  const days = parseInt(params.days ?? "30", 10) || 30
  const analytics = await getAdminUsageAnalytics(days)

  return <UsageClient analytics={analytics} days={days} />
}
