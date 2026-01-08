import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest } from "@/lib/api/auth";

type RouteParams = { params: Promise<{ id: string }> };

async function checkTeamAccess(
  supabase: ReturnType<typeof getSupabase>,
  teamId: string,
  walletAddress: string
) {
  const { data: membership } = await supabase
    .from("sentinel_team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("wallet_address", walletAddress)
    .single();

  return membership;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const membership = await checkTeamAccess(supabase, id, walletAddress);
  if (!membership) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const { data: team, error: teamError } = await supabase
    .from("sentinel_teams")
    .select("*")
    .eq("id", id)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Get members
  const { data: members } = await supabase
    .from("sentinel_team_members")
    .select("wallet_address, role, joined_at")
    .eq("team_id", id);

  // Get invites
  const { data: invites } = await supabase
    .from("sentinel_team_invites")
    .select("*")
    .eq("team_id", id)
    .gt("expires_at", new Date().toISOString());

  return NextResponse.json({
    id: team.id,
    name: team.name,
    slug: team.id,
    createdAt: team.created_at,
    memberCount: members?.length || 0,
    projectCount: 0,
    role: membership.role,
    members: (members || []).map((m) => ({
      id: m.wallet_address,
      userId: m.wallet_address,
      email: "",
      name: m.wallet_address.slice(0, 10) + "...",
      role: m.role,
      joinedAt: m.joined_at,
    })),
    invites: (invites || []).map((i) => ({
      id: i.id,
      email: i.email || "",
      role: i.role,
      expiresAt: i.expires_at,
    })),
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const membership = await checkTeamAccess(supabase, id, walletAddress);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name } = body;

  const updates: Record<string, string> = {};
  if (name) updates.name = name;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No updates provided" },
      { status: 400 }
    );
  }

  const { data: team, error } = await supabase
    .from("sentinel_teams")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: team.id,
    name: team.name,
    slug: team.id,
    createdAt: team.created_at,
    role: membership.role,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const walletAddress = getWalletFromRequest(request);
  const { id } = await params;

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  const membership = await checkTeamAccess(supabase, id, walletAddress);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete team members first
  await supabase.from("sentinel_team_members").delete().eq("team_id", id);

  // Delete team invites
  await supabase.from("sentinel_team_invites").delete().eq("team_id", id);

  // Delete team
  const { error } = await supabase.from("sentinel_teams").delete().eq("id", id);

  if (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
