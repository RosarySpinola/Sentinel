"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";
import * as teamsService from "@/lib/services/teams-service";
import type { Team, CreateTeamInput } from "@/lib/types/team";

export function useTeams() {
  const { walletAddress, isLoaded } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!walletAddress) {
      setTeams([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await teamsService.listTeams(walletAddress);
      setTeams(data);
    } catch (err) {
      setError("Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isLoaded) {
      fetchTeams();
    }
  }, [fetchTeams, isLoaded]);

  const createTeam = async (input: CreateTeamInput): Promise<Team | null> => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return null;
    }
    try {
      const team = await teamsService.createTeam(input, walletAddress);
      setTeams((prev) => [team, ...prev]);
      toast.success("Team created successfully");
      return team;
    } catch {
      toast.error("Failed to create team");
      return null;
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return false;
    }
    try {
      await teamsService.deleteTeam(id, walletAddress);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      toast.success("Team deleted successfully");
      return true;
    } catch {
      toast.error("Failed to delete team");
      return false;
    }
  };

  return {
    teams,
    isLoading,
    error,
    walletAddress,
    createTeam,
    deleteTeam,
    refreshTeams: fetchTeams,
  };
}
