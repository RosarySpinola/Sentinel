"use client";

import { useState, useCallback } from "react";
import { GasProfile, GasAnalysisRequest } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";
import { saveGasAnalysis } from "@/lib/services/history-service";
import { useProject } from "@/lib/contexts/project-context";
import { useAuth } from "@/lib/hooks/use-auth";

export interface UseGasProfileReturn {
  profile: GasProfile | null;
  isLoading: boolean;
  error: string | null;
  analyzeTransaction: (request: GasAnalysisRequest) => Promise<void>;
  clear: () => void;
}

export function useGasProfile(): UseGasProfileReturn {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [profile, setProfile] = useState<GasProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useApiKey();

  const analyzeTransaction = useCallback(
    async (request: GasAnalysisRequest) => {
      // Validate API key
      if (!apiKey) {
        setError("No API key configured. Please create one in Settings > API Keys.");
        return;
      }

      // Validate sender address
      if (!request.sender) {
        setError("Please provide a sender address for gas analysis.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call the Next.js API route which proxies to backend
        const response = await fetch("/api/analyze-gas", {
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
            max_gas: 100000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API request failed: ${response.statusText}`);
        }

        const gasProfile: GasProfile = await response.json();
        setProfile(gasProfile);

        // Save to history as a gas analysis (only if wallet connected)
        if (walletAddress) {
          try {
            // Find top operation and function from breakdown (handle missing breakdown)
            const breakdown = gasProfile.breakdown || [];
            const topOperation = breakdown[0]?.operation || "unknown";
            const topFunction = breakdown[0]?.function_name || request.functionName;

            await saveGasAnalysis({
              walletAddress,
              projectId: projectId ?? undefined,
              network: request.network,
              senderAddress: request.sender,
              moduleAddress: request.moduleAddress,
              moduleName: request.moduleName,
              functionName: request.functionName,
              typeArguments: request.typeArgs,
              arguments: request.args,
              totalGas: gasProfile.total_gas,
              topOperation,
              topFunction,
              suggestionsCount: gasProfile.suggestions?.length || 0,
              result: gasProfile as unknown as Record<string, unknown>,
            });
          } catch (historyErr) {
            console.warn("Failed to save to history:", historyErr);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gas analysis failed";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, projectId, walletAddress]
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
