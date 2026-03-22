import { notFound } from "next/navigation"
import { getAdminUserDetail } from "@/lib/api/admin-queries"
import UserDetailClient from "./user-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getAdminUserDetail(id)

  if (!user) {
    notFound()
  }

  return <UserDetailClient user={user} />
}
