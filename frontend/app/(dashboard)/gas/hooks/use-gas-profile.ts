"use client";

import { useState, useCallback } from "react";
import { GasProfile, GasAnalysisRequest } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4004";

// Mock data for demo
const mockGasProfile: GasProfile = {
  total_gas: 12450,
  by_operation: [
    { operation: "borrow_global", count: 8, total_gas: 4200, percentage: 33.7 },
    { operation: "move_to", count: 3, total_gas: 2800, percentage: 22.5 },
    { operation: "vector_push", count: 12, total_gas: 2100, percentage: 16.9 },
    { operation: "emit_event", count: 2, total_gas: 1800, percentage: 14.5 },
    { operation: "arithmetic", count: 45, total_gas: 1550, percentage: 12.4 },
  ],
  by_function: [
    {
      module: "swap",
      function: "execute",
      gas_used: 5200,
      percentage: 41.8,
      calls: 1,
    },
    {
      module: "pool",
      function: "get_reserves",
      gas_used: 2800,
      percentage: 22.5,
      calls: 2,
    },
    {
      module: "math",
      function: "calc_output",
      gas_used: 1900,
      percentage: 15.3,
      calls: 1,
    },
    {
      module: "token",
      function: "transfer",
      gas_used: 1600,
      percentage: 12.9,
      calls: 2,
    },
    {
      module: "events",
      function: "emit_swap",
      gas_used: 950,
      percentage: 7.6,
      calls: 1,
    },
  ],
  suggestions: [
    {
      severity: "warning",
      message: "Repeated storage reads detected",
      description:
        "borrow_global called 8 times on same resource. Consider caching the reference.",
      location: { module: "swap", function: "execute", line: 45 },
      estimated_savings: 2400,
    },
    {
      severity: "info",
      message: "Vector operations can be batched",
      description:
        "12 individual vector_push operations. Consider using vector::append for batch inserts.",
      location: { module: "pool", function: "add_liquidity" },
      estimated_savings: 800,
    },
    {
      severity: "critical",
      message: "Expensive loop detected",
      description:
        "Large iteration over vector with 500+ elements. Consider pagination.",
      location: { module: "rewards", function: "distribute" },
      estimated_savings: 5000,
    },
  ],
  steps: [
    { step: 0, gas_total: 0, gas_delta: 0, operation: "entry" },
    { step: 1, gas_total: 450, gas_delta: 450, operation: "MoveLoc" },
    { step: 2, gas_total: 1200, gas_delta: 750, operation: "borrow_global" },
    { step: 3, gas_total: 1800, gas_delta: 600, operation: "Call" },
    { step: 4, gas_total: 3200, gas_delta: 1400, operation: "borrow_global" },
    { step: 5, gas_total: 4500, gas_delta: 1300, operation: "move_to" },
    { step: 6, gas_total: 5800, gas_delta: 1300, operation: "vector_push" },
    { step: 7, gas_total: 7200, gas_delta: 1400, operation: "Call" },
    { step: 8, gas_total: 9000, gas_delta: 1800, operation: "emit_event" },
    { step: 9, gas_total: 10500, gas_delta: 1500, operation: "move_to" },
    { step: 10, gas_total: 11800, gas_delta: 1300, operation: "Return" },
    { step: 11, gas_total: 12450, gas_delta: 650, operation: "Return" },
  ],
};

export interface UseGasProfileReturn {
  profile: GasProfile | null;
  isLoading: boolean;
  error: string | null;
  analyzeTransaction: (request: GasAnalysisRequest) => Promise<void>;
  loadDemo: () => void;
  clear: () => void;
}

export function useGasProfile(): UseGasProfileReturn {
  const [profile, setProfile] = useState<GasProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useApiKey();

  const analyzeTransaction = useCallback(
    async (request: GasAnalysisRequest) => {
      if (!apiKey) {
        setError("No API key configured. Please create one in Settings > API Keys.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/v1/analyze-gas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            network: request.network,
            sender: request.sender,
            module_address: request.moduleAddress,
            module_name: request.moduleName,
            function_name: request.functionName,
            type_args: request.typeArgs,
            args: request.args,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Gas analysis failed");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        // On error, fall back to demo data for development
        if (process.env.NODE_ENV === "development") {
          setProfile(mockGasProfile);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  const loadDemo = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Simulate brief loading
    setTimeout(() => {
      setProfile(mockGasProfile);
      setIsLoading(false);
    }, 500);
  }, []);

  const clear = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    analyzeTransaction,
    loadDemo,
    clear,
  };
}
