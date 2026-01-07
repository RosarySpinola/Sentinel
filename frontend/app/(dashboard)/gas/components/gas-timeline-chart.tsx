"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { GasStep } from "../types";

interface GasTimelineChartProps {
  steps: GasStep[];
}

export function GasTimelineChart({ steps }: GasTimelineChartProps) {
  const data = steps.map((step) => ({
    step: step.step,
    total: step.gas_total,
    delta: step.gas_delta,
    operation: step.operation,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Gas Over Execution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="step"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.toLocaleString()}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="text-sm font-medium">
                        Step {item.step}
                      </div>
                      <div className="text-muted-foreground font-mono text-xs">
                        {item.operation}
                      </div>
                      <div className="mt-1 text-sm">
                        Total: {item.total.toLocaleString()} gas
                      </div>
                      <div className="text-sm text-green-600">
                        +{item.delta.toLocaleString()}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gasGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
