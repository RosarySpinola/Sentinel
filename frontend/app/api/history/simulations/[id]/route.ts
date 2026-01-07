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

  const { data: simulation, error } = await supabase
    .from("sentinel_simulations")
    .select("*")
    .eq("id", id)
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !simulation) {
    return NextResponse.json(
      { error: "Simulation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(simulation);
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
    .from("sentinel_simulations")
    .delete()
    .eq("id", id)
    .eq("wallet_address", walletAddress);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete simulation" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
