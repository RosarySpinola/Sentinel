export type TeamRole = "owner" | "admin" | "member";

export interface Team {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  memberCount: number;
  projectCount: number;
  role?: TeamRole;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role: TeamRole;
  joinedAt?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  expiresAt: string;
}

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput {
  name?: string;
}

export interface InviteMemberInput {
  email: string;
  role?: TeamRole;
}
