import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo (replace with database in production)
const simulationsStore = new Map<string, any[]>();

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let userSimulations = simulationsStore.get(userId) || [];

  if (projectId) {
    userSimulations = userSimulations.filter((s) => s.projectId === projectId);
  }

  const total = userSimulations.length;
  const items = userSimulations.slice(offset, offset + limit);

  return NextResponse.json({ items, total, limit, offset });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const simulation = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };

  const userSimulations = simulationsStore.get(userId) || [];
  userSimulations.unshift(simulation);
  simulationsStore.set(userId, userSimulations);

  return NextResponse.json(simulation, { status: 201 });
}
