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

// Demo: Simple token vault with formal verification specs
// This example demonstrates Move Prover capabilities for DeFi safety
const DEFAULT_CODE = `module 0x1::vault {
    /// A simple vault that tracks deposits
    /// Has 'drop' so it can be consumed when creating new instances
    struct Vault has drop, copy {
        balance: u64,
        total_deposits: u64,
    }

    /// Deposit funds into the vault
    /// Spec ensures balance never overflows and is correctly updated
    spec deposit {
        aborts_if vault.balance + amount > MAX_U64;
        aborts_if vault.total_deposits + 1 > MAX_U64;
        ensures result.balance == vault.balance + amount;
        ensures result.total_deposits == vault.total_deposits + 1;
    }
    public fun deposit(vault: Vault, amount: u64): Vault {
        Vault {
            balance: vault.balance + amount,
            total_deposits: vault.total_deposits + 1,
        }
    }

    /// Withdraw funds from the vault
    /// Spec ensures you cannot withdraw more than available
    spec withdraw {
        aborts_if amount > vault.balance;
        ensures result.balance == vault.balance - amount;
    }
    public fun withdraw(vault: Vault, amount: u64): Vault {
        assert!(amount <= vault.balance, 1);
        Vault {
            balance: vault.balance - amount,
            total_deposits: vault.total_deposits,
        }
    }

    /// Calculate swap output (AMM formula)
    /// Spec verifies mathematical properties
    spec calc_swap_output {
        requires reserve_in > 0 && reserve_out > 0;
        ensures result <= reserve_out;
    }
    public fun calc_swap_output(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64
    ): u64 {
        // Simplified constant product formula
        (amount_in * reserve_out) / (reserve_in + amount_in)
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
      return <XCircle className="text-destructive h-5 w-5" />;
    case "timeout":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <AlertCircle className="text-destructive h-5 w-5" />;
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
          <XCircle className="text-destructive h-4 w-4" />
        )}
        <span className="font-mono text-sm">{spec.name}</span>
      </div>

      {spec.counterexample && (
        <div className="bg-destructive/10 border-destructive/20 mt-2 ml-6 rounded-lg border p-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="text-destructive h-4 w-4" />
            <span className="text-destructive text-sm font-medium">
              Counterexample Found
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {Object.entries(spec.counterexample.inputs).map(([key, value]) => (
              <div key={key}>
                <span className="text-muted-foreground">{key}:</span>{" "}
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
          <p className="text-destructive mt-2 text-xs">
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
          <CardTitle className="font-mono text-sm">{module.name}</CardTitle>
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
          <CardHeader className="hover:bg-muted/50 cursor-pointer pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
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
            <pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold">Move Prover</h1>
          <p className="text-muted-foreground text-sm">
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
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? "Verifying..." : "Run Prover"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid min-h-0 flex-1 grid-cols-2">
        {/* Code editor */}
        <div className="border-r p-4">
          <Textarea
            className="h-full resize-none font-mono text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your Move code here..."
          />
        </div>

        {/* Results */}
        <div className="overflow-auto p-4">
          {!result && !isLoading && !error && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <ShieldCheck className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Click &quot;Run Prover&quot; to verify your Move code
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground">Running Move Prover...</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  This may take up to 2 minutes
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex h-full items-center justify-center">
              <Card className="border-destructive max-w-md">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Prover Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{error}</p>
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
                      <p className="text-muted-foreground mt-2 text-sm">
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
