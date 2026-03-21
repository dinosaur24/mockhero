import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserApiKeys } from "@/lib/api/dashboard-queries"
import ApiKeysClient from "./api-keys-client"

export default async function ApiKeysPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const keys = await getUserApiKeys(userId)

  return <ApiKeysClient initialKeys={keys} />
}
