import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// In-memory store for demo
const apiKeysStore = new Map<string, any[]>();

function generateApiKey(): { key: string; keyPrefix: string } {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomPart = "";
  for (let i = 0; i < 24; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const key = `stl_live_${randomPart}`;
  const keyPrefix = `stl_live_${randomPart.substring(0, 4)}...`;
  return { key, keyPrefix };
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = apiKeysStore.get(userId) || [];
  const safeKeys = keys.map(({ keyHash, ...rest }) => rest); // Remove hash from response

  return NextResponse.json({ apiKeys: safeKeys });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, expiresInDays } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check rate limit
  const existingKeys = apiKeysStore.get(userId) || [];
  if (existingKeys.length >= 10) {
    return NextResponse.json(
      { error: "Maximum of 10 API keys allowed" },
      { status: 429 }
    );
  }

  const { key, keyPrefix } = generateApiKey();
  const now = new Date().toISOString();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const newKey = {
    id: crypto.randomUUID(),
    name,
    keyPrefix,
    keyHash: key, // In production, store a hash instead
    lastUsedAt: null,
    expiresAt,
    createdAt: now,
  };

  existingKeys.unshift(newKey);
  apiKeysStore.set(userId, existingKeys);

  return NextResponse.json(
    {
      id: newKey.id,
      name: newKey.name,
      key, // Return raw key only on creation
      keyPrefix: newKey.keyPrefix,
      expiresAt: newKey.expiresAt,
      createdAt: newKey.createdAt,
    },
    { status: 201 }
  );
}
