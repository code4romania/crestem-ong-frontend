import { Skeleton } from "@/components/ui/Skeleton";

export type DashboardSkeletonVariant = "table" | "cards" | "detail";

/**
 * Shared shell for the dashboard `loading.tsx` boundaries. Every dashboard
 * route is dynamic (they all read the session cookie), so Next only prefetches
 * a route that has a loading boundary above it — these files both give instant
 * feedback and re-enable prefetching.
 */
export function DashboardPageSkeleton({
  variant = "table",
  withTabs = false,
  rows = 6,
}: {
  variant?: DashboardSkeletonVariant;
  withTabs?: boolean;
  rows?: number;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      {withTabs && (
        <nav
          className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-border"
          aria-hidden
        >
          {[64, 56, 104, 76].map((width, index) => (
            <div key={index} className="shrink-0 pb-3">
              <Skeleton className="h-4" width={width} />
            </div>
          ))}
        </nav>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-white p-6"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              <Skeleton className="mt-6 h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {variant === "table" && (
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center gap-4 border-b border-border px-6 py-4">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="hidden h-4 w-32 sm:block" />
                <Skeleton className="hidden h-4 w-24 lg:block" />
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "detail" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {[0, 1].map((block) => (
              <div
                key={block}
                className="rounded-xl border border-border bg-white p-6"
              >
                <Skeleton className="h-5 w-1/3" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-white p-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      <span className="sr-only">Se încarcă…</span>
    </div>
  );
}
