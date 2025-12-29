import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Shared in-memory store (would be database in production)
const projectsStore = new Map<string, any[]>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProjects = projectsStore.get(userId) || [];
  const project = userProjects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
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

  const body = await request.json();
  const { name, description, network } = body;

  const userProjects = projectsStore.get(userId) || [];
  const projectIndex = userProjects.findIndex((p) => p.id === id);

  if (projectIndex === -1) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = userProjects[projectIndex];
  const updatedProject = {
    ...project,
    name: name ?? project.name,
    description: description ?? project.description,
    network: network ?? project.network,
    updatedAt: new Date().toISOString(),
  };

  userProjects[projectIndex] = updatedProject;
  projectsStore.set(userId, userProjects);

  return NextResponse.json(updatedProject);
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

  const userProjects = projectsStore.get(userId) || [];
  const projectIndex = userProjects.findIndex((p) => p.id === id);

  if (projectIndex === -1) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  userProjects.splice(projectIndex, 1);
  projectsStore.set(userId, userProjects);

  return NextResponse.json({ success: true });
}
