"use client";

import { SimulationForm } from "./components/simulation-form";
import { SimulationResults } from "./components/simulation-results";
import { useSimulation } from "./hooks/use-simulation";

export default function SimulatorPage() {
  const { result, isLoading, error, execute } = useSimulation();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Preview transactions before execution on Movement Network
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SimulationForm onSimulate={execute} isLoading={isLoading} />
        <SimulationResults result={result} error={error} />
      </div>
    </div>
  );
}
