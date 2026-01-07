"use client";

import { useState, useCallback } from "react";
import type { ProverResult, UseProverReturn } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useProver(): UseProverReturn {
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
      const response = await fetch(`${API_BASE}/api/v1/prove`, {
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

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
