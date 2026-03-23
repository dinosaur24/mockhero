import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HelpLoading() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-9 w-full rounded-md" />

      {/* Mobile category badges */}
      <div className="flex gap-2 overflow-hidden md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-20 rounded-full shrink-0" />
        ))}
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Desktop sidebar skeleton */}
        <aside className="hidden md:block w-56 shrink-0 space-y-1">
          <Skeleton className="h-7 w-full rounded-md" />
          <Separator className="my-1.5" />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </aside>

        {/* Articles skeleton */}
        <div className="flex-1 min-w-0 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-56 mt-1" />
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    {j > 0 && <Separator />}
                    <div className="flex items-center justify-between py-4">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact support skeleton */}
      <Separator />
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
