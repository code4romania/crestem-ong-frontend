import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Stand-in for an `OngCard` while its page is on the way. Mirrors the card's
 * shape — avatar, title, description lines, footer row — so the grid keeps its
 * rhythm instead of jumping when the real cards land.
 */
export function OngCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-start gap-2">
        <Skeleton className="w-11 h-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-1/2 rounded" />
          <Skeleton className="mt-2 h-4 w-full rounded" />
          <Skeleton className="mt-1.5 h-4 w-4/5 rounded" />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}
