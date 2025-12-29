"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  SimulationHistory,
  ProverRunHistory,
  HistoryFilters,
} from "@/lib/types/history";
import * as historyService from "@/lib/services/history-service";
import { useProject } from "@/lib/contexts/project-context";

export function useSimulationHistory(filters?: Omit<HistoryFilters, "projectId">) {
  const { projectId } = useProject();
  const [simulations, setSimulations] = useState<SimulationHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listSimulations({
        projectId: projectId ?? undefined,
        ...filters,
      });
      setSimulations(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch simulations");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return { simulations, total, isLoading, error, refetch: fetchSimulations };
}

export function useProverRunHistory(filters?: Omit<HistoryFilters, "projectId">) {
  const { projectId } = useProject();
  const [proverRuns, setProverRuns] = useState<ProverRunHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProverRuns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listProverRuns({
        projectId: projectId ?? undefined,
        ...filters,
      });
      setProverRuns(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prover runs");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    fetchProverRuns();
  }, [fetchProverRuns]);

  return { proverRuns, total, isLoading, error, refetch: fetchProverRuns };
}
