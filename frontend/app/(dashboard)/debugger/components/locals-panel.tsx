"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocalVariable } from "../types";

interface LocalsPanelProps {
  locals: LocalVariable[];
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function LocalsPanel({ locals }: LocalsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Local Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 font-mono text-sm">
          {locals.length > 0 ? (
            locals.map((local, index) => (
              <div key={index} className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  {local.name}
                  <span className="text-xs opacity-60">: {local.var_type}</span>
                </span>
                <span className="text-primary max-w-[120px] truncate">
                  {formatValue(local.value)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No locals</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
