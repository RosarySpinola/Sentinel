import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest } from "@/lib/api/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("sentinel_api_keys")
    .delete()
    .eq("id", id)
    .eq("wallet_address", walletAddress);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
