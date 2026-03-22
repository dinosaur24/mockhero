import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function BillingLoading() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-56 mt-2" />
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison Grid */}
      <div>
        <Skeleton className="h-4 w-20 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-16" />
                <div className="mt-2 flex items-baseline gap-1">
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded-sm shrink-0" />
                      <Skeleton className="h-3 w-full" />
                    </li>
                  ))}
                </ul>
                <Skeleton className="h-8 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-4" />}
              <Skeleton className="h-3 w-48 mb-2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4 mt-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
