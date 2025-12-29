import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo
const teamsStore = new Map<string, any>();
const teamMembersStore = new Map<string, any[]>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find teams where user is a member
  const userTeams: any[] = [];
  teamMembersStore.forEach((members, teamId) => {
    const membership = members.find((m) => m.userId === userId);
    if (membership) {
      const team = teamsStore.get(teamId);
      if (team) {
        userTeams.push({
          ...team,
          role: membership.role,
          memberCount: members.length,
          projectCount: 0,
        });
      }
    }
  });

  return NextResponse.json({ teams: userTeams });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = slugify(name) + "-" + Date.now().toString(36);

  const team = {
    id: crypto.randomUUID(),
    name,
    slug,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  teamsStore.set(team.id, team);

  // Add creator as owner
  teamMembersStore.set(team.id, [
    {
      id: crypto.randomUUID(),
      teamId: team.id,
      userId,
      role: "owner",
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    },
  ]);

  return NextResponse.json(
    { ...team, memberCount: 1, projectCount: 0, role: "owner" },
    { status: 201 }
  );
}
