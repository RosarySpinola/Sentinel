import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const teamMembersStore = new Map<string, any[]>();
const teamInvitesStore = new Map<string, any[]>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id: teamId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = teamMembersStore.get(teamId) || [];
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  return NextResponse.json({
    members: members.map((m) => ({
      ...m,
      email: `user-${m.userId}@example.com`,
      name: `User ${m.userId.slice(0, 8)}`,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id: teamId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = teamMembersStore.get(teamId) || [];
  const userMember = members.find((m) => m.userId === userId);
  if (!userMember || !["owner", "admin"].includes(userMember.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role = "member" } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Create invite
  const invite = {
    id: crypto.randomUUID(),
    teamId,
    email,
    role,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  const invites = teamInvitesStore.get(teamId) || [];
  invites.push(invite);
  teamInvitesStore.set(teamId, invites);

  return NextResponse.json(invite, { status: 201 });
}
