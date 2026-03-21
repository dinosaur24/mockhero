import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page not found. The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs">Read the Docs</Link>
        </Button>
      </div>
    </div>
  )
}
