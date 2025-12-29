import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Shared in-memory store
const proverRunsStore = new Map<string, any[]>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRuns = proverRunsStore.get(userId) || [];
  const proverRun = userRuns.find((r) => r.id === id);

  if (!proverRun) {
    return NextResponse.json({ error: "Prover run not found" }, { status: 404 });
  }

  return NextResponse.json(proverRun);
}
