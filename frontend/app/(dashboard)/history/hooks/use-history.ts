"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type {
  SimulationHistory,
  ProverRunHistory,
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
