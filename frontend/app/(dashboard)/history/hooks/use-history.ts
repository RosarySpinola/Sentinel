"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  SimulationHistory,
  ProverRunHistory,
  DebuggerHistory,
  GasAnalysisHistory,
  HistoryFilters,
} from "@/lib/types/history";
import * as historyService from "@/lib/services/history-service";
import { useProject } from "@/lib/contexts/project-context";
import { useAuth } from "@/lib/hooks/use-auth";

export function useSimulationHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [simulations, setSimulations] = useState<SimulationHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    if (!walletAddress) {
      setSimulations([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listSimulations(
        {
          projectId: projectId ?? undefined,
          ...filters,
        },
        { walletAddress }
      );
      setSimulations(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch simulations"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters, walletAddress]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return { simulations, total, isLoading, error, refetch: fetchSimulations };
}

export function useProverRunHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [proverRuns, setProverRuns] = useState<ProverRunHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProverRuns = useCallback(async () => {
    if (!walletAddress) {
      setProverRuns([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listProverRuns(
        {
          projectId: projectId ?? undefined,
          ...filters,
        },
        { walletAddress }
      );
      setProverRuns(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prover runs"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters, walletAddress]);

  useEffect(() => {
    fetchProverRuns();
  }, [fetchProverRuns]);

  return { proverRuns, total, isLoading, error, refetch: fetchProverRuns };
}

export function useDebuggerHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [debuggerRuns, setDebuggerRuns] = useState<DebuggerHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebuggerRuns = useCallback(async () => {
    if (!walletAddress) {
      setDebuggerRuns([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listDebuggerRuns(
        {
          projectId: projectId ?? undefined,
          ...filters,
        },
        { walletAddress }
      );
      setDebuggerRuns(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch debugger runs"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters, walletAddress]);

  useEffect(() => {
    fetchDebuggerRuns();
  }, [fetchDebuggerRuns]);

  return { debuggerRuns, total, isLoading, error, refetch: fetchDebuggerRuns };
}

export function useGasAnalysisHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { walletAddress } = useAuth();
  const [gasAnalyses, setGasAnalyses] = useState<GasAnalysisHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGasAnalyses = useCallback(async () => {
    if (!walletAddress) {
      setGasAnalyses([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await historyService.listGasAnalyses(
        {
          projectId: projectId ?? undefined,
          ...filters,
        },
        { walletAddress }
      );
      setGasAnalyses(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch gas analyses"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters, walletAddress]);

  useEffect(() => {
    fetchGasAnalyses();
  }, [fetchGasAnalyses]);

  return { gasAnalyses, total, isLoading, error, refetch: fetchGasAnalyses };
}
