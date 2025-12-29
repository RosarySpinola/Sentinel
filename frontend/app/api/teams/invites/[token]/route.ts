import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface Invite {
  id: string;
  token: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

const teamsStore = new Map<string, any>();
const teamMembersStore = new Map<string, any[]>();
const teamInvitesStore = new Map<string, Invite[]>();

function findInviteByToken(token: string): { invite: Invite; teamId: string } | null {
  for (const [teamId, invites] of teamInvitesStore.entries()) {
    const invite = invites.find((i) => i.token === token);
    if (invite) {
      return { invite, teamId };
    }
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const result = findInviteByToken(token);
  if (!result) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const { invite, teamId } = result;

  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  const team = teamsStore.get(teamId);
  return NextResponse.json({
    invite,
    team: { id: team?.id, name: team?.name },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = await auth();
  const { token } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = findInviteByToken(token);
  if (!result) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const { invite, teamId } = result;

  if (new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Check if already a member
  const members = teamMembersStore.get(teamId) || [];
  if (members.some((m) => m.userId === userId)) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  // Add user to team
  members.push({
    id: crypto.randomUUID(),
    teamId,
    userId,
    role: invite.role,
    invitedAt: invite.createdAt,
    joinedAt: new Date().toISOString(),
  });
  teamMembersStore.set(teamId, members);

  // Remove invite
  const invites = teamInvitesStore.get(teamId) || [];
  const newInvites = invites.filter((i) => i.token !== token);
  teamInvitesStore.set(teamId, newInvites);

  const team = teamsStore.get(teamId);
  return NextResponse.json({ ...team, memberCount: members.length });
}
