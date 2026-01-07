"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExecutionStep } from "../types";

interface SourceViewProps {
  steps: ExecutionStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function SourceView({
  steps,
  currentStep,
  onStepClick,
}: SourceViewProps) {
  const current = steps[currentStep];
  const title = current
    ? `${current.module_name}::${current.function_name}`
    : "Execution Trace";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <pre className="font-mono text-sm">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => onStepClick(index)}
                className={`hover:bg-muted/50 cursor-pointer px-2 py-1 ${
                  index === currentStep ? "bg-primary/20 rounded" : ""
                }`}
              >
                <span className="text-muted-foreground inline-block w-8">
                  {index + 1}
                </span>
                <span className={index === currentStep ? "text-primary" : ""}>
                  {step.instruction} ({step.module_name}::{step.function_name})
                </span>
                <span className="text-muted-foreground ml-2 text-xs">
                  +{step.gas_delta} gas
                </span>
              </div>
            ))}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
