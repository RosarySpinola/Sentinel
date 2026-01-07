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
    .from("sentinel_simulations")
    .select("*", { count: "exact" })
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data: items, count, error } = await query;

  if (error) {
    console.error("Error fetching simulations:", error);
    return NextResponse.json(
      { error: "Failed to fetch simulations" },
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

  const { data: simulation, error } = await supabase
    .from("sentinel_simulations")
    .insert({
      wallet_address: walletAddress,
      project_id: body.projectId || null,
      network: body.network,
      sender_address: body.senderAddress,
      module_address: body.moduleAddress,
      module_name: body.moduleName,
      function_name: body.functionName,
      type_arguments: body.typeArguments || [],
      arguments: body.arguments || [],
      success: body.success,
      gas_used: body.gasUsed,
      vm_status: body.vmStatus,
      state_changes: body.stateChanges || [],
      events: body.events || [],
      error_message: body.errorMessage,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving simulation:", error);
    return NextResponse.json(
      { error: "Failed to save simulation" },
      { status: 500 }
    );
  }

  return NextResponse.json(simulation, { status: 201 });
}
