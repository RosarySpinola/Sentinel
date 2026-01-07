"use client";

import { useDebugger } from "./hooks/use-debugger";
import { DebugForm } from "./components/debug-form";
import { StepControls } from "./components/step-controls";
import { SourceView } from "./components/source-view";
import { CallStack } from "./components/call-stack";
import { LocalsPanel } from "./components/locals-panel";
import { GasPanel } from "./components/gas-panel";

export default function DebuggerPage() {
  const {
    trace,
    currentStep,
    currentInstruction,
    isLoading,
    error,
    hasSession,
    loadTrace,
    stepForward,
    stepBackward,
    goToStep,
    restart,
    clear,
  } = useDebugger();

  if (!hasSession) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Visual Debugger</h1>
          <p className="text-muted-foreground mt-1">
            Step through Move execution with full state visibility
          </p>
        </div>
        <DebugForm onSubmit={loadTrace} isLoading={isLoading} error={error} />
      </div>
    );
  }

  const step = currentInstruction;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <StepControls
        currentStep={currentStep}
        totalSteps={trace?.steps.length ?? 0}
        gasUsed={step?.gas_total ?? 0}
        onStepForward={stepForward}
        onStepBackward={stepBackward}
        onRestart={restart}
        onClear={clear}
      />

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 p-4">
        <div className="col-span-2">
          <SourceView
            steps={trace?.steps ?? []}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>

        <div className="space-y-4 overflow-auto">
          <CallStack
            stack={step?.stack ?? []}
            currentModule={step?.module_name ?? ""}
            currentFunction={step?.function_name ?? ""}
          />
          <LocalsPanel locals={step?.locals ?? []} />
          <GasPanel
            gasCurrent={step?.gas_total ?? 0}
            gasTotal={trace?.total_gas ?? 0}
            gasDelta={step?.gas_delta ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
