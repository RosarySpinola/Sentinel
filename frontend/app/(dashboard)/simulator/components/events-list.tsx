"use client";

import { SimEvent } from "../types";

interface EventsListProps {
  events: SimEvent[];
}

export function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No events emitted
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={i} className="bg-card rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="max-w-[80%] truncate text-sm font-medium">
              {event.type}
            </span>
            <span className="text-muted-foreground text-xs">
              #{event.sequenceNumber}
            </span>
          </div>
          <pre className="bg-muted overflow-auto rounded p-2 font-mono text-xs">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
