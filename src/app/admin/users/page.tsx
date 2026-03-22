import { getAdminUsers } from "@/lib/api/admin-queries"
import UsersClient from "./users-client"

interface Props {
  searchParams: Promise<{ q?: string; tier?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const pageSize = 20
  const result = await getAdminUsers({
    search: params.q,
    tier: params.tier,
    page,
    pageSize,
  })

  return (
    <UsersClient
      users={result.users}
      total={result.total}
      page={page}
      pageSize={pageSize}
      currentSearch={params.q ?? ""}
      currentTier={params.tier ?? ""}
    />
  )
}
