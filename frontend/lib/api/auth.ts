import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createHash } from "crypto";

// Get wallet address from request header
export function getWalletFromRequest(request: NextRequest): string | null {
  return request.headers.get("x-wallet-address");
}

// Get wallet address from API key (looks up key hash in database)
export async function getWalletFromApiKey(
  apiKey: string | null
): Promise<string | null> {
  if (!apiKey) return null;

  const supabase = getSupabase();
  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  const { data, error } = await supabase
    .from("sentinel_api_keys")
    .select("wallet_address")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last_used_at timestamp
  await supabase
    .from("sentinel_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  return data.wallet_address;
}

// Ensure user exists in database (upsert)
export async function ensureUser(walletAddress: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from("sentinel_users").upsert(
    {
      wallet_address: walletAddress,
      last_login_at: new Date().toISOString(),
    },
    { onConflict: "wallet_address" }
  );

  if (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

// Auth middleware wrapper
export function withAuth(
  handler: (
    request: NextRequest,
    walletAddress: string
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const walletAddress = getWalletFromRequest(request);

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized - wallet address required" },
        { status: 401 }
      );
    }

    try {
      await ensureUser(walletAddress);
      return await handler(request, walletAddress);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
