"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This documentation page encountered an error. Please try again or
          head back to the docs home.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/docs">Back to docs</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
