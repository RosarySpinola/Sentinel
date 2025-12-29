import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo (replace with database in production)
const proverRunsStore = new Map<string, any[]>();

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let userRuns = proverRunsStore.get(userId) || [];

  if (projectId) {
    userRuns = userRuns.filter((r) => r.projectId === projectId);
  }

  const total = userRuns.length;
  const items = userRuns.slice(offset, offset + limit);

  return NextResponse.json({ items, total, limit, offset });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const proverRun = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };

  const userRuns = proverRunsStore.get(userId) || [];
  userRuns.unshift(proverRun);
  proverRunsStore.set(userId, userRuns);

  return NextResponse.json(proverRun, { status: 201 });
}
