"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Play,
  AlertTriangle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { useProver } from "./hooks/use-prover";
import type { ProverStatus, ModuleResult, SpecResult } from "./types";

const DEFAULT_CODE = `module 0x1::swap {
    use std::signer;

    struct Pool has key {
        reserve_a: u64,
        reserve_b: u64,
    }

    /// Calculate output amount for a swap
    spec calc_output {
        ensures result <= reserve_b;
        ensures result > 0;
    }
    public fun calc_output(
        amount_in: u64,
        reserve_a: u64,
        reserve_b: u64
    ): u64 {
        (amount_in * reserve_b) / (reserve_a + amount_in)
    }
}`;

function extractModuleName(code: string): string {
  const match = code.match(/module\s+[\w:]+::(\w+)\s*\{/);
  return match ? match[1] : "unknown";
}

function StatusIcon({ status }: { status: ProverStatus }) {
  switch (status) {
    case "passed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "timeout":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
  }
}

function StatusTitle({ status }: { status: ProverStatus }) {
  switch (status) {
    case "passed":
      return "All Specs Passed";
    case "failed":
      return "Verification Failed";
    case "timeout":
      return "Verification Timed Out";
    case "error":
      return "Prover Error";
  }
}

function SpecResultItem({ spec }: { spec: SpecResult }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {spec.status === "passed" ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-sm font-mono">{spec.name}</span>
      </div>

      {spec.counterexample && (
        <div className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 ml-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Counterexample Found
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono">
            {Object.entries(spec.counterexample.inputs).map(([key, value]) => (
              <div key={key}>
                <span className="text-muted-foreground">{key}:</span>{" "}
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-destructive mt-2">
            Failed: {spec.counterexample.failed_assertion}
          </p>
        </div>
      )}
    </div>
  );
}

function ModuleResultCard({ module }: { module: ModuleResult }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">{module.name}</CardTitle>
          <Badge
            variant={module.status === "passed" ? "default" : "destructive"}
          >
            {module.specs.filter((s) => s.status === "passed").length}/
            {module.specs.length} passed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {module.specs.map((spec) => (
            <SpecResultItem key={spec.name} spec={spec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RawOutputSection({ output }: { output: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Raw Prover Output
              </CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function ProverPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const { result, isLoading, error, runProver, clear } = useProver();

  const handleRunProver = async () => {
    const moduleName = extractModuleName(code);
    await runProver(code, moduleName);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Move Prover</h1>
          <p className="text-sm text-muted-foreground">
            Formal verification for Move smart contracts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(result || error) && (
            <Button variant="outline" onClick={clear}>
              Clear
            </Button>
          )}
          <Button onClick={handleRunProver} disabled={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Verifying..." : "Run Prover"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {/* Code editor */}
        <div className="border-r p-4">
          <Textarea
            className="h-full font-mono text-sm resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your Move code here..."
          />
        </div>

        {/* Results */}
        <div className="p-4 overflow-auto">
          {!result && !isLoading && !error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Click &quot;Run Prover&quot; to verify your Move code
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Running Move Prover...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take up to 2 minutes
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Prover Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {result && !isLoading && (
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {/* Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon status={result.status} />
                        <StatusTitle status={result.status} />
                      </CardTitle>
                      <Badge variant="outline">{result.duration_ms}ms</Badge>
                    </div>
                    {result.summary && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {result.summary}
                      </p>
                    )}
                  </CardHeader>
                </Card>

                {/* Module results */}
                {result.modules.map((module) => (
                  <ModuleResultCard key={module.name} module={module} />
                ))}

                {/* Raw output */}
                {result.raw_output && (
                  <RawOutputSection output={result.raw_output} />
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
