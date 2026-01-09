"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { GasProfile, GasAnalysisRequest, OperationGas, FunctionGas, GasSuggestion, GasStep } from "../types";
import { useNetwork } from "@/lib/contexts/network-context";

export interface UseGasProfileReturn {
  profile: GasProfile | null;
  isLoading: boolean;
  error: string | null;
  analyzeTransaction: (request: GasAnalysisRequest) => Promise<void>;
  clear: () => void;
}

// Get Aptos config for network
function getAptosConfig(network: "mainnet" | "testnet"): AptosConfig {
  const networkConfig = network === "mainnet"
    ? { network: Network.MAINNET }
    : { network: Network.TESTNET, fullnode: "https://testnet.movementnetwork.xyz/v1" };
  return new AptosConfig(networkConfig);
}

// Analyze operations from simulation result
function analyzeOperations(gasUsed: number, changes: unknown[], events: unknown[]): OperationGas[] {
  const operations: OperationGas[] = [];
  const totalGas = Math.max(gasUsed, 1);

  // Storage writes
  const writeCount = Array.isArray(changes) ? changes.length : 0;
  if (writeCount > 0) {
    const storageGas = Math.min(writeCount * 1000, Math.floor(totalGas / 2));
    operations.push({
      operation: "Storage Write",
      count: writeCount,
      total_gas: storageGas,
      percentage: (storageGas / totalGas) * 100,
    });
  }

  // Events
  const eventCount = Array.isArray(events) ? events.length : 0;
  if (eventCount > 0) {
    const eventGas = Math.min(eventCount * 200, Math.floor(totalGas / 4));
    operations.push({
      operation: "Event Emission",
      count: eventCount,
      total_gas: eventGas,
      percentage: (eventGas / totalGas) * 100,
    });
  }

  // Computation (remaining gas)
  const usedGas = operations.reduce((sum, op) => sum + op.total_gas, 0);
  const remainingGas = totalGas - usedGas;

  if (remainingGas > 0) {
    const computationGas = Math.floor(remainingGas * 0.6);
    const callGas = remainingGas - computationGas;

    operations.push({
      operation: "Computation",
      count: 1,
      total_gas: computationGas,
      percentage: (computationGas / totalGas) * 100,
    });

    operations.push({
      operation: "Function Calls",
      count: 1,
      total_gas: callGas,
      percentage: (callGas / totalGas) * 100,
    });
  }

  return operations.sort((a, b) => b.total_gas - a.total_gas);
}

// Analyze functions from simulation
function analyzeFunctions(
  moduleName: string,
  functionName: string,
  gasUsed: number,
  changes: unknown[]
): FunctionGas[] {
  return [{
    module_name: moduleName,
    function_name: functionName,
    gas_used: gasUsed,
    percentage: 100,
    hotspots: (changes as { data?: { type?: string } }[]).map((change, idx) => ({
      line: (idx + 1) * 10,
      gas: 1000,
      operation: `Storage write to ${change.data?.type || "resource"}`,
    })),
  }];
}

// Generate suggestions based on gas usage
function generateSuggestions(gasUsed: number, operations: OperationGas[]): GasSuggestion[] {
  const suggestions: GasSuggestion[] = [];

  if (gasUsed > 50000) {
    suggestions.push({
      severity: "warning",
      message: "High gas consumption detected",
      description: "Consider optimizing storage operations or breaking into smaller transactions.",
      estimated_savings: Math.floor(gasUsed * 0.2),
    });
  }

  const storageOp = operations.find(op => op.operation === "Storage Write");
  if (storageOp && storageOp.count > 5) {
    suggestions.push({
      severity: "info",
      message: "Multiple storage writes",
      description: "Batch storage updates when possible to reduce gas costs.",
      estimated_savings: storageOp.count * 200,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      severity: "info",
      message: "Gas usage looks optimal",
      description: "No significant optimization opportunities detected.",
      estimated_savings: 0,
    });
  }

  return suggestions;
}

// Create timeline steps
function createTimeline(gasUsed: number, operations: OperationGas[]): GasStep[] {
  const steps: GasStep[] = [];
  let runningTotal = 0;

  operations.forEach((op, idx) => {
    runningTotal += op.total_gas;
    steps.push({
      step: idx + 1,
      gas_total: runningTotal,
      gas_delta: op.total_gas,
      operation: op.operation,
    });
  });

  return steps;
}

export function useGasProfile(): UseGasProfileReturn {
  const [profile, setProfile] = useState<GasProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet();
  const { network } = useNetwork();

  const analyzeTransaction = useCallback(
    async (request: GasAnalysisRequest) => {
      // Check if wallet is connected for public key
      if (!account?.publicKey) {
        setError("Please connect your wallet to analyze gas. The public key is required for transaction simulation.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Initialize Aptos client
        const config = getAptosConfig(request.network);
        const aptos = new Aptos(config);

        // Build the function string
        const functionStr = `${request.moduleAddress}::${request.moduleName}::${request.functionName}`;

        // Build the transaction
        const transaction = await aptos.transaction.build.simple({
          sender: request.sender,
          data: {
            function: functionStr as `${string}::${string}::${string}`,
            typeArguments: request.typeArgs,
            functionArguments: request.args as (string | number | boolean | Uint8Array)[],
          },
        });

        // Simulate with the wallet's public key
        const [simResult] = await aptos.transaction.simulate.simple({
          signerPublicKey: account.publicKey,
          transaction,
        });

        // Parse gas from simulation result
        const gasUsed = parseInt(simResult.gas_used || "0", 10);
        const changes = simResult.changes || [];
        const events = simResult.events || [];

        if (!simResult.success) {
          throw new Error(`Simulation failed: ${simResult.vm_status}`);
        }

        // Analyze the results
        const byOperation = analyzeOperations(gasUsed, changes, events);
        const byFunction = analyzeFunctions(request.moduleName, request.functionName, gasUsed, changes);
        const suggestions = generateSuggestions(gasUsed, byOperation);
        const steps = createTimeline(gasUsed, byOperation);

        setProfile({
          total_gas: gasUsed,
          by_operation: byOperation,
          by_function: byFunction,
          suggestions,
          steps,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gas analysis failed";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.publicKey]
  );

  const clear = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    analyzeTransaction,
    clear,
  };
}
