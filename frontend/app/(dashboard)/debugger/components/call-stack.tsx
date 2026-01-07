"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StackFrame } from "../types";

interface CallStackProps {
  stack: StackFrame[];
  currentModule: string;
  currentFunction: string;
}

export function CallStack({
  stack,
  currentModule,
  currentFunction,
}: CallStackProps) {
  // Sort by depth descending to show deepest frame first
  const sortedStack = [...stack].sort((a, b) => b.depth - a.depth);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Call Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 font-mono text-sm">
          {sortedStack.length > 0 ? (
            sortedStack.map((frame, index) => (
              <div
                key={index}
                className={
                  index === 0 ? "text-primary" : "text-muted-foreground"
                }
                style={{ paddingLeft: `${index * 16}px` }}
              >
                {index === 0 ? "→ " : ""}
                {frame.module_name}::{frame.function_name}
              </div>
            ))
          ) : (
            <>
              <div className="text-primary">
                → {currentModule}::{currentFunction}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
