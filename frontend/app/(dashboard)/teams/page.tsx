"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import * as teamsService from "@/lib/services/teams-service";
import type { Team } from "@/lib/types/team";
import { CreateTeamDialog } from "./components/create-team-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await teamsService.listTeams();
      setTeams(data);
    } catch (err) {
      toast.error("Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreate = async (name: string) => {
    try {
      const team = await teamsService.createTeam({ name });
      setTeams((prev) => [team, ...prev]);
      toast.success("Team created successfully");
    } catch {
      toast.error("Failed to create team");
    }
  };

  const roleColors = {
    owner: "bg-yellow-500/10 text-yellow-500",
    admin: "bg-blue-500/10 text-blue-500",
    member: "bg-gray-500/10 text-gray-400",
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Teams</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No teams yet</h2>
          <p className="text-muted-foreground mb-4">
            Create a team to collaborate with others on projects.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/teams/${team.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {team.role && (
                    <Badge variant="outline" className={roleColors[team.role]}>
                      {team.role}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{team.memberCount} members</span>
                  </div>
                  <span>{team.projectCount} projects</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
