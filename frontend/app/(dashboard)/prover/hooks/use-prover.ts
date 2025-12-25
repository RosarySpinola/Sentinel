"use client";

import { useState, useCallback } from "react";
import type { ProverResult, UseProverReturn } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";
import { saveProverRun } from "@/lib/services/history-service";
import { useProject } from "@/lib/contexts/project-context";
import { useAuth } from "@/lib/hooks/use-auth";

export function useProver(): UseProverReturn {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [result, setResult] = useState<ProverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useApiKey();

  const runProver = useCallback(async (code: string, moduleName: string) => {
    if (!apiKey) {
      setError("No API key configured. Please create one in Settings > API Keys.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/prove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          move_code: code,
          module_name: moduleName,
          specs: [],
          timeout_seconds: 120,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Prover failed: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const data: ProverResult = await response.json();
      setResult(data);

      // Save to history if wallet is connected
      if (walletAddress) {
        try {
          await saveProverRun({
            walletAddress,
            projectId: projectId ?? undefined,
            code,
            modules: [moduleName],
            status: data.status,
            durationMs: data.duration_ms || 0,
            results: data as unknown as Record<string, unknown>,
            errorMessage: data.status !== "passed" ? data.summary : undefined,
          });
        } catch (saveError) {
          console.warn("Failed to save prover run to history:", saveError);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, projectId, walletAddress]);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    runProver,
    clear,
  };
}
