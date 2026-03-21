"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-lg font-semibold">
          Dashboard unavailable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We couldn&apos;t load the dashboard. This is usually temporary
          &mdash; try refreshing.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset} variant="default">
            Retry
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
