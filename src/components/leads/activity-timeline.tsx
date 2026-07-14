import type { LeadActivity, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities: LeadActivity[];
  users: User[];
}

function shortRef(id: string) {
  return id.replace(/[^a-z0-9]/gi, "").slice(0, 7).padEnd(7, "0");
}

export function ActivityTimeline({ activities, users }: ActivityTimelineProps) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return <p className="font-mono text-sm text-[#71717a]">// история пуста</p>;
  }

  return (
    <div>
      {sorted.map((activity, index) => {
        const author = users.find((u) => u.id === activity.userId)?.name ?? "—";
        const isLast = index === sorted.length - 1;
        const message = activity.comment || activity.actionType;

        return (
          <div key={activity.id} className="flex gap-4">
            <div className="flex w-5 shrink-0 flex-col items-center">
              <div className="relative mt-2 flex size-5 items-center justify-center">
                <div className="absolute size-5 rounded-full border border-[#18181b]/10" />
                <div className="size-2.5 rounded-full bg-[var(--color-sunrise-coral)]" />
              </div>
              {!isLast && (
                <div className="my-1 w-px flex-1 min-h-10 bg-[#18181b]/15" aria-hidden />
              )}
            </div>

            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-xs text-[#9ca3af]">{shortRef(activity.id)}</span>
                <span className="font-mono text-xs text-[#18181b]/15">—</span>
                <p className="text-sm font-medium leading-snug text-[#18181b]">{message}</p>
              </div>
              <p className="mt-1.5 font-mono text-xs text-[#71717a]">
                {author} · {formatDate(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
