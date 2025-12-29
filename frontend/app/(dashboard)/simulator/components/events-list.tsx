"use client";

import { SimEvent } from "../types";

interface EventsListProps {
  events: SimEvent[];
}

export function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No events emitted
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={i} className="p-3 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate max-w-[80%]">
              {event.type}
            </span>
            <span className="text-xs text-muted-foreground">
              #{event.sequenceNumber}
            </span>
          </div>
          <pre className="text-xs font-mono p-2 rounded bg-muted overflow-auto">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
