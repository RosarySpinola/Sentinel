"use client";

import { StateChange } from "../types";

interface StateDiffViewProps {
  changes: StateChange[];
}

export function StateDiffView({ changes }: StateDiffViewProps) {
  if (changes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No state changes
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {changes.map((change, i) => (
        <div
          key={i}
          className="p-3 rounded-lg border bg-card"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="font-mono text-xs text-muted-foreground truncate max-w-[70%]">
              {change.address}
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
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

          <p className="text-sm font-medium mb-2 truncate">{change.resource}</p>

          {change.before !== undefined && (
            <div className="text-xs font-mono p-2 rounded bg-red-500/10 text-red-500 mb-1 overflow-auto">
              <span className="opacity-60">- </span>
              {JSON.stringify(change.before, null, 2)}
            </div>
          )}

          {change.after !== undefined && (
            <div className="text-xs font-mono p-2 rounded bg-green-500/10 text-green-500 overflow-auto">
              <span className="opacity-60">+ </span>
              {JSON.stringify(change.after, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
