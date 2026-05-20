import { TimelineEvent } from "@/lib/types";

interface OrderTimelineProps {
  events: TimelineEvent[];
}

export default function OrderTimeline({ events }: OrderTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent" />

      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={i} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            {/* Dot */}
            <div
              className={`absolute -left-6 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                event.completed
                  ? "border-indigo-500 bg-indigo-500/20"
                  : "border-slate-600 bg-slate-800"
              }`}
            >
              {event.completed && (
                <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${event.completed ? "text-white" : "text-slate-500"}`}>
                {event.status}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
              {event.timestamp && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(event.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
