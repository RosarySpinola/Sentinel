"use client";

import { useState, useCallback } from "react";
import type { TraceRequest, TraceResult, ExecutionStep } from "../types";
import { useApiKey } from "@/lib/contexts/api-key-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4004";

interface UseDebuggerReturn {
  trace: TraceResult | null;
  currentStep: number;
  currentInstruction: ExecutionStep | null;
  isLoading: boolean;
  error: string | null;
  hasSession: boolean;
  loadTrace: (request: TraceRequest) => Promise<void>;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
  restart: () => void;
  clear: () => void;
}

export function useDebugger(): UseDebuggerReturn {
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useApiKey();

  const hasSession = trace !== null && trace.steps.length > 0;
  const currentInstruction = trace?.steps[currentStep] ?? null;

  const loadTrace = useCallback(async (request: TraceRequest) => {
    if (!apiKey) {
      setError("No API key configured. Please create one in Settings > API Keys.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/trace`, {
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
        throw new Error(errorData.error || "Failed to load trace");
      }

      const data: TraceResult = await response.json();
      setTrace(data);
      setCurrentStep(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setTrace(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const stepForward = useCallback(() => {
    if (trace && currentStep < trace.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [trace, currentStep]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (trace && step >= 0 && step < trace.steps.length) {
        setCurrentStep(step);
      }
    },
    [trace]
  );

  const restart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const clear = useCallback(() => {
    setTrace(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  return {
    trace,
    currentStep,
    currentInstruction,
    isLoading,
    error,
    hasSession,
    loadTrace,
    stepForward,
    stepBackward,
    goToStep,
    restart,
    clear,
  };
}
