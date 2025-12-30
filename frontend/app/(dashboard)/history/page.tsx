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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { selectedProject } = useProject();
  const { simulations, isLoading: simsLoading, refetch: refetchSimulations } = useSimulationHistory();
  const { proverRuns, isLoading: proverLoading, refetch: refetchProver } = useProverRunHistory();
  const { debuggerRuns, isLoading: debugLoading, refetch: refetchDebugger } = useDebuggerHistory();
  const { gasAnalyses, isLoading: gasLoading, refetch: refetchGas } = useGasAnalysisHistory();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSimulations(),
        refetchProver(),
        refetchDebugger(),
        refetchGas(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      {/* Debugger Detail Dialog */}
      <Dialog
        open={!!selectedDebuggerRun}
        onOpenChange={() => setSelectedDebuggerRun(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Debugger Session Details</DialogTitle>
          </DialogHeader>
          {selectedDebuggerRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Module</p>
                  <p className="font-mono">{selectedDebuggerRun.moduleName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Function</p>
                  <p className="font-mono">{selectedDebuggerRun.functionName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Steps</p>
                  <Badge variant="secondary">{selectedDebuggerRun.totalSteps} steps</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Gas</p>
                  <p className="font-mono">{selectedDebuggerRun.totalGas.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Network</p>
                  <Badge variant="outline">{selectedDebuggerRun.network}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sender</p>
                  <p className="font-mono text-xs truncate">{selectedDebuggerRun.senderAddress}</p>
                </div>
              </div>
              {selectedDebuggerRun.typeArguments && selectedDebuggerRun.typeArguments.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Type Arguments</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDebuggerRun.typeArguments.map((arg, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-xs">
                        {arg}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedDebuggerRun.arguments && selectedDebuggerRun.arguments.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Arguments</p>
                  <ScrollArea className="h-32 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedDebuggerRun.arguments, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
              {selectedDebuggerRun.result && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Result</p>
                  <ScrollArea className="h-64 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedDebuggerRun.result, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gas Analysis Detail Dialog */}
      <Dialog
        open={!!selectedGasAnalysis}
        onOpenChange={() => setSelectedGasAnalysis(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gas Analysis Details</DialogTitle>
          </DialogHeader>
          {selectedGasAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Module</p>
                  <p className="font-mono">{selectedGasAnalysis.moduleName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Function</p>
                  <p className="font-mono">{selectedGasAnalysis.functionName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Gas</p>
                  <p className="font-mono">{selectedGasAnalysis.totalGas.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Suggestions</p>
                  <Badge variant="secondary">{selectedGasAnalysis.suggestionsCount} suggestions</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Top Operation</p>
                  <p className="font-mono text-sm">{selectedGasAnalysis.topOperation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Top Function</p>
                  <p className="font-mono text-sm">{selectedGasAnalysis.topFunction}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Network</p>
                  <Badge variant="outline">{selectedGasAnalysis.network}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sender</p>
                  <p className="font-mono text-xs truncate">{selectedGasAnalysis.senderAddress}</p>
                </div>
              </div>
              {selectedGasAnalysis.typeArguments && selectedGasAnalysis.typeArguments.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Type Arguments</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedGasAnalysis.typeArguments.map((arg, i) => (
                      <Badge key={i} variant="outline" className="font-mono text-xs">
                        {arg}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedGasAnalysis.arguments && selectedGasAnalysis.arguments.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Arguments</p>
                  <ScrollArea className="h-32 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedGasAnalysis.arguments, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
              {selectedGasAnalysis.result && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Result</p>
                  <ScrollArea className="h-64 rounded border p-4">
                    <pre className="font-mono text-sm">
                      {JSON.stringify(selectedGasAnalysis.result, null, 2)}
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
