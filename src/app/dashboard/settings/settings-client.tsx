"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsActions } from "./settings-actions"
import type { Tier } from "@/lib/utils/constants"

interface Props {
  email: string
  tier: Tier
  isEarlyAdopter: boolean
}

const tierLabel: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  scale: "Scale",
}

export default function SettingsClient({ email, tier, isEarlyAdopter }: Props) {
  const [format, setFormat] = useState("json")
  const [locale, setLocale] = useState("en")

  // Hydrate preferences from localStorage after mount
  useEffect(() => {
    setFormat(localStorage.getItem("mh_format") ?? "json")
    setLocale(localStorage.getItem("mh_locale") ?? "en")
  }, [])

  const handleFormatChange = (v: string) => {
    setFormat(v)
    localStorage.setItem("mh_format", v)
  }

  const handleLocaleChange = (v: string) => {
    setLocale(v)
    localStorage.setItem("mh_locale", v)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-lg font-semibold">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-xs font-medium">{email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Plan</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{tierLabel[tier]}</span>
                {isEarlyAdopter && (
                  <Badge variant="secondary" className="text-[10px]">
                    Early Adopter
                  </Badge>
                )}
              </div>
              {tier === "free" && (
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link href="/dashboard/billing">Upgrade</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Default settings for API calls (saved locally)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Default format</span>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Default locale</span>
            <Select value={locale} onValueChange={handleLocaleChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account, API keys, and usage history. This
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsActions />
        </CardContent>
      </Card>
    </div>
  )
}
