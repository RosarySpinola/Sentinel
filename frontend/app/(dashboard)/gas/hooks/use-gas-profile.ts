"use client";

import { useState, useCallback } from "react";
import { GasProfile, GasAnalysisRequest } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4004";

export interface UseGasProfileReturn {
  profile: GasProfile | null;
  isLoading: boolean;
  error: string | null;
  analyzeTransaction: (request: GasAnalysisRequest) => Promise<void>;
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
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
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
