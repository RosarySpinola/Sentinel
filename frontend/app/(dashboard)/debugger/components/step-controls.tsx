"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
} from "lucide-react";

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  gasUsed: number;
  onStepForward: () => void;
  onStepBackward: () => void;
  onRestart: () => void;
  onClear: () => void;
}

export function StepControls({
  currentStep,
  totalSteps,
  gasUsed,
  onStepForward,
  onStepBackward,
  onRestart,
  onClear,
}: StepControlsProps) {
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRestart}
          title="Restart"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onStepBackward}
          disabled={isAtStart}
          title="Step back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onStepForward}
          disabled={isAtEnd}
          title="Step forward"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled title="Run to end">
          <Play className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          title="End session"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">
          Step {currentStep + 1} / {totalSteps}
        </span>
        <Badge variant="outline">Gas: {gasUsed}</Badge>
      </div>
    </div>
  );
}
