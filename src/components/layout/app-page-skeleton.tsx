import { Skeleton } from "@/components/ui/skeleton";

export type AppPageSkeletonVariant = "default" | "table" | "stats" | "simple" | "academy";

interface AppPageSkeletonProps {
  variant?: AppPageSkeletonVariant;
}

export function AppPageSkeleton({ variant = "default" }: AppPageSkeletonProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-56 max-w-[80%] sm:h-10 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {variant === "academy" ? (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="hidden space-y-2 lg:block">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {variant !== "simple" && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: variant === "stats" ? 8 : 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] rounded-2xl" />
              ))}
            </div>
          )}

          {(variant === "default" || variant === "table") && (
            <div className="space-y-4">
              {variant === "table" && (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-10 w-full max-w-xs rounded-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-36 rounded-full" />
                      <Skeleton className="h-10 w-28 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-11 w-full rounded-full" />
                  <div className="flex gap-4 border-b border-[#e5e5e5] pb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                </>
              )}
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] rounded-2xl" />
                ))}
              </div>
            </div>
          )}

          {variant === "stats" && (
            <div className="grid gap-8 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          )}

          {variant === "simple" && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
