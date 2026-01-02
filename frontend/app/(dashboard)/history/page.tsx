"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulationTable } from "./components/simulation-table";
import { ProverTable } from "./components/prover-table";
import { DebuggerTable } from "./components/debugger-table";
import { GasTable } from "./components/gas-table";
import { useSimulationHistory, useProverRunHistory, useDebuggerHistory, useGasAnalysisHistory } from "./hooks/use-history";
import { useProject } from "@/lib/contexts/project-context";
import { useRouter } from "next/navigation";
import type { SimulationHistory, ProverRunHistory, DebuggerHistory, GasAnalysisHistory } from "@/lib/types/history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HistoryPage() {
  const router = useRouter();
  const { selectedProject } = useProject();
  const { simulations, isLoading: simsLoading } = useSimulationHistory();
  const { proverRuns, isLoading: proverLoading } = useProverRunHistory();
  const { debuggerRuns, isLoading: debugLoading } = useDebuggerHistory();
  const { gasAnalyses, isLoading: gasLoading } = useGasAnalysisHistory();

  const [selectedSimulation, setSelectedSimulation] =
    useState<SimulationHistory | null>(null);
  const [selectedProverRun, setSelectedProverRun] =
    useState<ProverRunHistory | null>(null);
  const [selectedDebuggerRun, setSelectedDebuggerRun] =
    useState<DebuggerHistory | null>(null);
  const [selectedGasAnalysis, setSelectedGasAnalysis] =
    useState<GasAnalysisHistory | null>(null);

  const handleRerun = (sim: SimulationHistory) => {
    // Navigate to simulator with pre-filled data
    router.push(
      `/simulator?module=${sim.moduleAddress}::${sim.moduleName}&function=${sim.functionName}`
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground">
            {selectedProject
              ? `Showing history for ${selectedProject.name}`
              : "Showing all history"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="simulations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="debugger">Debugger</TabsTrigger>
          <TabsTrigger value="gas">Gas Analysis</TabsTrigger>
          <TabsTrigger value="prover">Prover Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="simulations">
          <Card>
            <CardHeader>
              <CardTitle>Simulation History</CardTitle>
            </CardHeader>
            <CardContent>
              <SimulationTable
                simulations={simulations}
                onView={setSelectedSimulation}
                onRerun={handleRerun}
                isLoading={simsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debugger">
          <Card>
            <CardHeader>
              <CardTitle>Debugger History</CardTitle>
            </CardHeader>
            <CardContent>
              <DebuggerTable
                debuggerRuns={debuggerRuns}
                onView={setSelectedDebuggerRun}
                onRerun={(run) => router.push(`/debugger?module=${run.moduleAddress}::${run.moduleName}&function=${run.functionName}`)}
                isLoading={debugLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gas">
          <Card>
            <CardHeader>
              <CardTitle>Gas Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              <GasTable
                gasAnalyses={gasAnalyses}
                onView={setSelectedGasAnalysis}
                onRerun={(analysis) => router.push(`/gas?module=${analysis.moduleAddress}::${analysis.moduleName}&function=${analysis.functionName}`)}
                isLoading={gasLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prover">
          <Card>
            <CardHeader>
              <CardTitle>Prover Run History</CardTitle>
            </CardHeader>
            <CardContent>
              <ProverTable
                proverRuns={proverRuns}
                onView={setSelectedProverRun}
                isLoading={proverLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simulation Detail Dialog */}
      <Dialog
        open={!!selectedSimulation}
        onOpenChange={() => setSelectedSimulation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulation Details</DialogTitle>
          </DialogHeader>
          {selectedSimulation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Module</p>
                  <p className="font-mono">{selectedSimulation.moduleName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Function</p>
                  <p className="font-mono">{selectedSimulation.functionName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <Badge
                    variant={
                      selectedSimulation.success ? "default" : "destructive"
                    }
                  >
                    {selectedSimulation.success ? "Success" : "Failed"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Gas Used</p>
                  <p className="font-mono">
                    {selectedSimulation.gasUsed.toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedSimulation.result && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Result</p>
                  <ScrollArea className="h-64 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedSimulation.result, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prover Run Detail Dialog */}
      <Dialog
        open={!!selectedProverRun}
        onOpenChange={() => setSelectedProverRun(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prover Run Details</DialogTitle>
          </DialogHeader>
          {selectedProverRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Module</p>
                  <p className="font-mono">{selectedProverRun.moduleName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <Badge
                    variant={
                      selectedProverRun.status === "passed"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {selectedProverRun.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Duration</p>
                  <p className="font-mono">
                    {selectedProverRun.durationMs
                      ? `${(selectedProverRun.durationMs / 1000).toFixed(2)}s`
                      : "-"}
                  </p>
                </div>
              </div>
              {selectedProverRun.result && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Result</p>
                  <ScrollArea className="h-64 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedProverRun.result, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
