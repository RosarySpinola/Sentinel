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

// Demo: DeFi Protocol - AMM + Lending with comprehensive formal verification
// Shows real-world security properties for hackathon judges
const DEFAULT_CODE = `module 0x1::defi_protocol {
    const MAX_U64: u64 = 18446744073709551615;
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_ZERO_AMOUNT: u64 = 2;
    const E_UNDERCOLLATERALIZED: u64 = 3;
    const COLLATERAL_RATIO: u64 = 150; // 150% collateralization

    // ============ AMM Liquidity Pool ============
    struct Pool has drop, copy {
        reserve_x: u64,
        reserve_y: u64,
        k: u128, // constant product invariant
    }

    /// Swap X tokens for Y tokens using constant product formula
    /// Proves: output never exceeds reserves, k is preserved
    spec swap_x_to_y {
        requires pool.reserve_x > 0 && pool.reserve_y > 0;
        aborts_if amount_in == 0;
        aborts_if pool.reserve_y <= (pool.k / ((pool.reserve_x + amount_in) as u128) as u64);
        ensures result <= old(pool.reserve_y);
        ensures (pool.reserve_x as u128) * (pool.reserve_y as u128) >= pool.k;
    }
    public fun swap_x_to_y(pool: Pool, amount_in: u64): (Pool, u64) {
        assert!(amount_in > 0, E_ZERO_AMOUNT);
        let new_x = pool.reserve_x + amount_in;
        let new_y = ((pool.k / (new_x as u128)) as u64);
        let amount_out = pool.reserve_y - new_y;
        (Pool { reserve_x: new_x, reserve_y: new_y, k: pool.k }, amount_out)
    }

    // ============ Lending Protocol ============
    struct LendingPosition has drop, copy {
        collateral: u64,
        debt: u64,
    }

    /// Borrow against collateral with 150% collateralization ratio
    /// Proves: position remains healthy, no underflows
    spec borrow {
        aborts_if position.debt + amount > MAX_U64;
        aborts_if position.collateral * 100 < (position.debt + amount) * COLLATERAL_RATIO;
        ensures result.debt == position.debt + amount;
        ensures result.collateral == position.collateral;
    }
    public fun borrow(position: LendingPosition, amount: u64): LendingPosition {
        let new_debt = position.debt + amount;
        assert!(
            position.collateral * 100 >= new_debt * COLLATERAL_RATIO,
            E_UNDERCOLLATERALIZED
        );
        LendingPosition { collateral: position.collateral, debt: new_debt }
    }

    /// Repay debt safely
    /// Proves: cannot repay more than owed
    spec repay {
        aborts_if amount > position.debt;
        ensures result.debt == position.debt - amount;
    }
    public fun repay(position: LendingPosition, amount: u64): LendingPosition {
        assert!(amount <= position.debt, E_INSUFFICIENT_BALANCE);
        LendingPosition { collateral: position.collateral, debt: position.debt - amount }
    }

    // ============ Safe Math ============
    /// Add with overflow protection
    spec safe_add {
        aborts_if a + b > MAX_U64;
        ensures result == a + b;
    }
    public fun safe_add(a: u64, b: u64): u64 {
        assert!(a <= MAX_U64 - b, 1);
        a + b
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
