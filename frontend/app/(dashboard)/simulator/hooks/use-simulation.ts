"use client";

import { useState, useCallback } from "react";
import { SimulationRequest, SimulationResult } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (request: SimulationRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: request.network,
          sender: request.sender,
          module_address: request.moduleAddress,
          module_name: request.moduleName,
          function_name: request.functionName,
          type_args: request.typeArgs,
          args: request.args,
          max_gas: request.maxGas || 100000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Map snake_case to camelCase
      const mappedResult: SimulationResult = {
        success: data.success,
        gasUsed: data.gas_used,
        gasUnitPrice: data.gas_unit_price,
        vmStatus: data.vm_status,
        stateChanges: (data.state_changes || []).map((sc: Record<string, unknown>) => ({
          address: sc.address,
          resource: sc.resource,
          changeType: sc.change_type,
          before: sc.before,
          after: sc.after,
        })),
        events: (data.events || []).map((e: Record<string, unknown>) => ({
          type: e.type,
          data: e.data,
          sequenceNumber: e.sequence_number,
        })),
        error: data.error
          ? {
              code: data.error.code,
              message: data.error.message,
              location: data.error.location,
            }
          : undefined,
      };

      setResult(mappedResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Simulation failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    execute,
    reset,
  };
}
