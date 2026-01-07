import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest, ensureUser } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const walletAddress = getWalletFromRequest(request);

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const supabase = getSupabase();

  let query = supabase
    .from("sentinel_prover_runs")
    .select("*", { count: "exact" })
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data: items, count, error } = await query;

  if (error) {
    console.error("Error fetching prover runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch prover runs" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    items: items || [],
    total: count || 0,
    limit,
    offset,
  });
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
  const supabase = getSupabase();

  const { data: proverRun, error } = await supabase
    .from("sentinel_prover_runs")
    .insert({
      wallet_address: walletAddress,
      project_id: body.projectId || null,
      code: body.code,
      modules: body.modules || [],
      status: body.status,
      duration_ms: body.durationMs,
      results: body.results || {},
      error_message: body.errorMessage,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving prover run:", error);
    return NextResponse.json(
      { error: "Failed to save prover run" },
      { status: 500 }
    );
  }

  return NextResponse.json(proverRun, { status: 201 });
}
