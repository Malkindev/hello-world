import { Check } from "lucide-react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/config";
import { formatDate } from "@/lib/format";

export function OrderTimeline({
  current,
  history,
}: {
  current: OrderStatus;
  history: { status: OrderStatus; at: string }[];
}) {
  const currentIdx = ORDER_STATUSES.indexOf(current);
  return (
    <ol className="relative space-y-0">
      {ORDER_STATUSES.map((status, i) => {
        const done = i <= currentIdx;
        const event = history.find((h) => h.status === status);
        const last = i === ORDER_STATUSES.length - 1;
        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-16px)] w-px ${done ? "bg-electric/50" : "bg-hair"}`}
              />
            )}
            <span
              className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border ${
                done
                  ? "border-electric bg-electric text-ink"
                  : "border-hair bg-panel text-transparent"
              }`}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-steel/40" />}
            </span>
            <div className="pt-0.5">
              <div
                className={`text-sm font-medium ${done ? "text-foreground" : "text-faint"}`}
              >
                {status}
              </div>
              {event && (
                <div className="mt-0.5 font-mono text-[10px] text-steel/70">
                  {formatDate(event.at)}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
