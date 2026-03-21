import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <div className="mt-6">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
