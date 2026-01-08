import type {
  Team,
  TeamMember,
  TeamInvite,
  CreateTeamInput,
  UpdateTeamInput,
  InviteMemberInput,
  TeamRole,
} from "@/lib/types/team";

export async function listTeams(walletAddress: string): Promise<Team[]> {
  const response = await fetch(`/api/teams`, {
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  const data = await response.json();
  return data.teams;
}

export async function getTeam(
  id: string,
  walletAddress: string
): Promise<Team & { members: TeamMember[]; invites: TeamInvite[] }> {
  const response = await fetch(`/api/teams/${id}`, {
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch team");
  }
  return response.json();
}

export async function createTeam(
  input: CreateTeamInput,
  walletAddress: string
): Promise<Team> {
  const response = await fetch(`/api/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create team");
  }
  return response.json();
}

export async function updateTeam(
  id: string,
  input: UpdateTeamInput,
  walletAddress: string
): Promise<Team> {
  const response = await fetch(`/api/teams/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update team");
  }
  return response.json();
}

export async function deleteTeam(
  id: string,
  walletAddress: string
): Promise<void> {
  const response = await fetch(`/api/teams/${id}`, {
    method: "DELETE",
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete team");
  }
}

export async function inviteMember(
  teamId: string,
  input: InviteMemberInput,
  walletAddress: string
): Promise<TeamInvite> {
  const response = await fetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to invite member");
  }
  return response.json();
}

export async function removeMember(
  teamId: string,
  userId: string,
  walletAddress: string
): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to remove member");
  }
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamRole,
  walletAddress: string
): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error("Failed to update member role");
  }
}

export async function acceptInvite(
  token: string,
  walletAddress: string
): Promise<Team> {
  const response = await fetch(`/api/teams/invites/${token}`, {
    method: "POST",
    headers: {
      "x-wallet-address": walletAddress,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to accept invite");
  }
  return response.json();
}
