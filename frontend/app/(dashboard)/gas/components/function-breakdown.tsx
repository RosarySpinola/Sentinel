"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FunctionGas } from "../types";

interface FunctionBreakdownProps {
  functions: FunctionGas[];
}

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

export function FunctionBreakdown({ functions }: FunctionBreakdownProps) {
  const data = functions.map((fn) => ({
    name: `${fn.module}::${fn.function}`,
    shortName: fn.function,
    gas: fn.gas_used,
    calls: fn.calls,
    percentage: fn.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Gas by Function</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
            <YAxis
              type="category"
              dataKey="shortName"
              width={80}
              tick={{ fontSize: 12, fontFamily: "monospace" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="font-mono font-medium">{item.name}</div>
                      <div className="text-muted-foreground text-sm">
                        Gas: {item.gas.toLocaleString()} (
                        {item.percentage.toFixed(1)}%)
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Calls: {item.calls}x
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="gas" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
