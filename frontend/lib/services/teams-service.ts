import type {
  Team,
  TeamMember,
  TeamInvite,
  CreateTeamInput,
  UpdateTeamInput,
  InviteMemberInput,
  TeamRole,
} from "@/lib/types/team";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function listTeams(): Promise<Team[]> {
  const response = await fetch(`${API_BASE}/api/teams`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  const data = await response.json();
  return data.teams;
}

export async function getTeam(id: string): Promise<Team & { members: TeamMember[]; invites: TeamInvite[] }> {
  const response = await fetch(`${API_BASE}/api/teams/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch team");
  }
  return response.json();
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const response = await fetch(`${API_BASE}/api/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create team");
  }
  return response.json();
}

export async function updateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
  const response = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update team");
  }
  return response.json();
}

export async function deleteTeam(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/teams/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete team");
  }
}

export async function inviteMember(teamId: string, input: InviteMemberInput): Promise<TeamInvite> {
  const response = await fetch(`${API_BASE}/api/teams/${teamId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to invite member");
  }
  return response.json();
}

export async function removeMember(teamId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to remove member");
  }
}

export async function updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<void> {
  const response = await fetch(`${API_BASE}/api/teams/${teamId}/members/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error("Failed to update member role");
  }
}

export async function acceptInvite(token: string): Promise<Team> {
  const response = await fetch(`${API_BASE}/api/teams/invites/${token}`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to accept invite");
  }
  return response.json();
}
