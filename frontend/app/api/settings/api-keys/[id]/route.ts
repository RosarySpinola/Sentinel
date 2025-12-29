import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo (shared with parent route in real implementation)
const apiKeysStore = new Map<string, any[]>();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = apiKeysStore.get(userId) || [];
  const keyIndex = keys.findIndex((k) => k.id === id);

  if (keyIndex === -1) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  keys.splice(keyIndex, 1);
  apiKeysStore.set(userId, keys);

  return NextResponse.json({ success: true });
}
