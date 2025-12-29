import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo (replace with database in production)
const projectsStore = new Map<string, any[]>();

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProjects = projectsStore.get(userId) || [];

  return NextResponse.json({
    projects: userProjects,
    total: userProjects.length,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, network = "testnet" } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const project = {
    id: crypto.randomUUID(),
    name,
    description: description || null,
    network,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    simulationCount: 0,
    proverRunCount: 0,
  };

  const userProjects = projectsStore.get(userId) || [];
  userProjects.push(project);
  projectsStore.set(userId, userProjects);

  return NextResponse.json(project, { status: 201 });
}
