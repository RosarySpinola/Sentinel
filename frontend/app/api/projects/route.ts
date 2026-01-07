import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest, ensureUser } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const walletAddress = getWalletFromRequest(request);

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data: projects, error } = await supabase
    .from("sentinel_projects")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    projects: projects || [],
    total: projects?.length || 0,
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
  const { name, description, network = "testnet" } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: project, error } = await supabase
    .from("sentinel_projects")
    .insert({
      wallet_address: walletAddress,
      name,
      description: description || null,
      network,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }

  return NextResponse.json(project, { status: 201 });
}
