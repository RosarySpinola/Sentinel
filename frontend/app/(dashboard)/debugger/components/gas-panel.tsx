"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GasPanelProps {
  gasCurrent: number;
  gasTotal: number;
  gasDelta: number;
}

export function GasPanel({ gasCurrent, gasTotal, gasDelta }: GasPanelProps) {
  const percentage =
    gasTotal > 0 ? Math.round((gasCurrent / gasTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Gas Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-primary text-2xl font-bold">{gasCurrent}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">{percentage}%</span>
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>+{gasDelta} this step</span>
          <span>Total: {gasTotal}</span>
        </div>
      </CardContent>
    </Card>
  );
}
