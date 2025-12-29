import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const teamsStore = new Map<string, any>();
const teamMembersStore = new Map<string, any[]>();
const teamInvitesStore = new Map<string, any[]>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = teamsStore.get(id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const members = teamMembersStore.get(id) || [];
  const isMember = members.some((m) => m.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const invites = teamInvitesStore.get(id) || [];

  return NextResponse.json({
    ...team,
    memberCount: members.length,
    projectCount: 0,
    members: members.map((m) => ({
      ...m,
      email: `user-${m.userId}@example.com`,
      name: `User ${m.userId.slice(0, 8)}`,
    })),
    invites,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = teamsStore.get(id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const members = teamMembersStore.get(id) || [];
  const userMember = members.find((m) => m.userId === userId);
  if (!userMember || !["owner", "admin"].includes(userMember.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await request.json();
  const { name } = body;

  const updatedTeam = {
    ...team,
    name: name ?? team.name,
    updatedAt: new Date().toISOString(),
  };

  teamsStore.set(id, updatedTeam);

  return NextResponse.json({ ...updatedTeam, memberCount: members.length });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = teamsStore.get(id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const members = teamMembersStore.get(id) || [];
  const userMember = members.find((m) => m.userId === userId);
  if (!userMember || userMember.role !== "owner") {
    return NextResponse.json({ error: "Only owner can delete" }, { status: 403 });
  }

  teamsStore.delete(id);
  teamMembersStore.delete(id);
  teamInvitesStore.delete(id);

  return NextResponse.json({ success: true });
}
