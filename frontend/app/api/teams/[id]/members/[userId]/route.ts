import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const teamMembersStore = new Map<string, any[]>();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { userId: authUserId } = await auth();
  const { id: teamId, userId: targetUserId } = await params;

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = teamMembersStore.get(teamId) || [];
  const userMember = members.find((m) => m.userId === authUserId);
  if (!userMember || userMember.role !== "owner") {
    return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 });
  }

  const body = await request.json();
  const { role } = body;

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const targetIndex = members.findIndex((m) => m.userId === targetUserId);
  if (targetIndex === -1) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (members[targetIndex].role === "owner") {
    return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
  }

  members[targetIndex].role = role;
  teamMembersStore.set(teamId, members);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { userId: authUserId } = await auth();
  const { id: teamId, userId: targetUserId } = await params;

  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = teamMembersStore.get(teamId) || [];
  const userMember = members.find((m) => m.userId === authUserId);

  // Can remove self or be admin/owner
  const canRemove =
    authUserId === targetUserId ||
    (userMember && ["owner", "admin"].includes(userMember.role));

  if (!canRemove) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const targetMember = members.find((m) => m.userId === targetUserId);
  if (!targetMember) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Owners cannot be removed
  if (targetMember.role === "owner") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
  }

  // Admins cannot remove other admins
  if (userMember?.role === "admin" && targetMember.role === "admin") {
    return NextResponse.json({ error: "Admins cannot remove admins" }, { status: 403 });
  }

  const newMembers = members.filter((m) => m.userId !== targetUserId);
  teamMembersStore.set(teamId, newMembers);

  return NextResponse.json({ success: true });
}
