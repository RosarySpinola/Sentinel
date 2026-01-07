"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { OperationGas } from "../types";

interface OperationBreakdownProps {
  operations: OperationGas[];
}

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

export function OperationBreakdown({ operations }: OperationBreakdownProps) {
  const data = operations.map((op) => ({
    name: op.operation,
    value: op.total_gas,
    count: op.count,
    percentage: op.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Gas by Operation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(props: PieLabelRenderProps) => {
                const item = data.find((d) => d.name === props.name);
                return `${props.name} (${item?.percentage.toFixed(1) ?? 0}%)`;
              }}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <div className="font-mono font-medium">{item.name}</div>
                      <div className="text-muted-foreground text-sm">
                        Gas: {item.value.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Count: {item.count}x
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
