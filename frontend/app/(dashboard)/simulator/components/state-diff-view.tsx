"use client";

import { StateChange } from "../types";

interface StateDiffViewProps {
  changes: StateChange[];
}

export function StateDiffView({ changes }: StateDiffViewProps) {
  if (changes.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No state changes
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change, i) => (
        <div key={i} className="bg-card rounded-lg border p-3">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-muted-foreground max-w-[70%] truncate font-mono text-xs">
              {change.address}
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                change.changeType === "write"
                  ? "bg-blue-500/10 text-blue-500"
                  : change.changeType === "delete"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-green-500/10 text-green-500"
              }`}
            >
              {change.changeType}
            </span>
          </div>

          <p className="mb-2 truncate text-sm font-medium">{change.resource}</p>

          {change.before !== undefined && (
            <div className="mb-1 overflow-auto rounded bg-red-500/10 p-2 font-mono text-xs text-red-500">
              <span className="opacity-60">- </span>
              {JSON.stringify(change.before, null, 2)}
            </div>
          )}

          {change.after !== undefined && (
            <div className="overflow-auto rounded bg-green-500/10 p-2 font-mono text-xs text-green-500">
              <span className="opacity-60">+ </span>
              {JSON.stringify(change.after, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
