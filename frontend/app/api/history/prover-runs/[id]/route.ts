import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest } from "@/lib/api/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data: proverRun, error } = await supabase
    .from("sentinel_prover_runs")
    .select("*")
    .eq("id", id)
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !proverRun) {
    return NextResponse.json(
      { error: "Prover run not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(proverRun);
}

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
    .from("sentinel_prover_runs")
    .delete()
    .eq("id", id)
    .eq("wallet_address", walletAddress);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete prover run" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
