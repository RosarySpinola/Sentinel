import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest, ensureUser } from "@/lib/api/auth";
import { createHash, randomBytes } from "crypto";

function generateApiKey(): { key: string; keyPrefix: string; keyHash: string } {
  const randomPart = randomBytes(24).toString("base64url");
  const key = `stl_live_${randomPart}`;
  const keyPrefix = `stl_live_${randomPart.substring(0, 8)}`;
  const keyHash = createHash("sha256").update(key).digest("hex");
  return { key, keyPrefix, keyHash };
}

export async function GET(request: NextRequest) {
  const walletAddress = getWalletFromRequest(request);

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data: keys, error } = await supabase
    .from("sentinel_api_keys")
    .select("id, name, key_prefix, last_used_at, created_at")
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKeys: keys || [] });
}

export async function POST(request: NextRequest) {
  const walletAddress = getWalletFromRequest(request);

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUser(walletAddress);
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check rate limit
  const { count } = await supabase
    .from("sentinel_api_keys")
    .select("*", { count: "exact", head: true })
    .eq("wallet_address", walletAddress);

  if (count && count >= 10) {
    return NextResponse.json(
      { error: "Maximum of 10 API keys allowed" },
      { status: 429 }
    );
  }

  const { key, keyPrefix, keyHash } = generateApiKey();

  const { data: newKey, error } = await supabase
    .from("sentinel_api_keys")
    .insert({
      wallet_address: walletAddress,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })
    .select("id, name, key_prefix, created_at")
    .single();

  if (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ...newKey,
      key, // Return raw key only on creation
    },
    { status: 201 }
  );
}
