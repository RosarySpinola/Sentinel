import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Shared in-memory store
const simulationsStore = new Map<string, any[]>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userSimulations = simulationsStore.get(userId) || [];
  const simulation = userSimulations.find((s) => s.id === id);

  if (!simulation) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }

  return NextResponse.json(simulation);
}
