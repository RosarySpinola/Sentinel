"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GasPanelProps {
  gasCurrent: number;
  gasTotal: number;
  gasDelta: number;
}

export function GasPanel({ gasCurrent, gasTotal, gasDelta }: GasPanelProps) {
  const percentage = gasTotal > 0 ? Math.round((gasCurrent / gasTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Gas Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{gasCurrent}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>+{gasDelta} this step</span>
          <span>Total: {gasTotal}</span>
        </div>
      </CardContent>
    </Card>
  );
}
