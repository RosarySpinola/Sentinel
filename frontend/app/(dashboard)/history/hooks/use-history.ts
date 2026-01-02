"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type {
  SimulationHistory,
  ProverRunHistory,
  DebuggerHistory,
  GasAnalysisHistory,
  HistoryFilters,
} from "@/lib/types/history";
import * as historyService from "@/lib/services/history-service";
import { useProject } from "@/lib/contexts/project-context";

export function useSimulationHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { account } = useWallet();
  const [simulations, setSimulations] = useState<SimulationHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    if (!account?.address) {
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
        { walletAddress: account.address.toString() }
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
  }, [projectId, filters, account?.address]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return { simulations, total, isLoading, error, refetch: fetchSimulations };
}

export function useProverRunHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { account } = useWallet();
  const [proverRuns, setProverRuns] = useState<ProverRunHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProverRuns = useCallback(async () => {
    if (!account?.address) {
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
        { walletAddress: account.address.toString() }
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
  }, [projectId, filters, account?.address]);

  useEffect(() => {
    fetchProverRuns();
  }, [fetchProverRuns]);

  return { proverRuns, total, isLoading, error, refetch: fetchProverRuns };
}

export function useDebuggerHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { account } = useWallet();
  const [debuggerRuns, setDebuggerRuns] = useState<DebuggerHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebuggerRuns = useCallback(async () => {
    if (!account?.address) {
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
        { walletAddress: account.address.toString() }
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
  }, [projectId, filters, account?.address]);

  useEffect(() => {
    fetchDebuggerRuns();
  }, [fetchDebuggerRuns]);

  return { debuggerRuns, total, isLoading, error, refetch: fetchDebuggerRuns };
}

export function useGasAnalysisHistory(
  filters?: Omit<HistoryFilters, "projectId">
) {
  const { projectId } = useProject();
  const { account } = useWallet();
  const [gasAnalyses, setGasAnalyses] = useState<GasAnalysisHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGasAnalyses = useCallback(async () => {
    if (!account?.address) {
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
        { walletAddress: account.address.toString() }
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
  }, [projectId, filters, account?.address]);

  useEffect(() => {
    fetchGasAnalyses();
  }, [fetchGasAnalyses]);

  return { gasAnalyses, total, isLoading, error, refetch: fetchGasAnalyses };
}
