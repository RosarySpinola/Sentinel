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

  const { data: project, error } = await supabase
    .from("sentinel_projects")
    .select("*")
    .eq("id", id)
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, network } = body;

  const supabase = getSupabase();

  const { data: project, error } = await supabase
    .from("sentinel_projects")
    .update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(network && { network }),
    })
    .eq("id", id)
    .eq("wallet_address", walletAddress)
    .select()
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
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
    .from("sentinel_projects")
    .delete()
    .eq("id", id)
    .eq("wallet_address", walletAddress);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
