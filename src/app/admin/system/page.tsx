import { getSystemSettings } from "@/lib/api/admin-queries"
import { TIER_LIMITS } from "@/lib/utils/constants"
import SystemClient from "./system-client"

export default async function AdminSystemPage() {
  const settings = await getSystemSettings()

  return (
    <SystemClient
      settings={settings}
      tierLimits={TIER_LIMITS}
    />
  )
}
