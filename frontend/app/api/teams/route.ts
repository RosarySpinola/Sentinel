import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { getWalletFromRequest, ensureUser } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const walletAddress = getWalletFromRequest(request);

  if (!walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Get teams where user is a member
  const { data: memberships, error: memberError } = await supabase
    .from("sentinel_team_members")
    .select("team_id, role")
    .eq("wallet_address", walletAddress);

  if (memberError) {
    console.error("Error fetching team memberships:", memberError);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }

  if (!memberships || memberships.length === 0) {
    return NextResponse.json({ teams: [] });
  }

  const teamIds = memberships.map((m) => m.team_id);
  const roleMap = new Map(memberships.map((m) => [m.team_id, m.role]));

  const { data: teams, error: teamsError } = await supabase
    .from("sentinel_teams")
    .select("*")
    .in("id", teamIds)
    .order("created_at", { ascending: false });

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }

  // Get member counts for each team
  const teamsWithCounts = await Promise.all(
    (teams || []).map(async (team) => {
      const { count: memberCount } = await supabase
        .from("sentinel_team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", team.id);

      const { count: projectCount } = await supabase
        .from("sentinel_projects")
        .select("*", { count: "exact", head: true })
        .eq("team_id", team.id);

      return {
        id: team.id,
        name: team.name,
        slug: team.id, // Use ID as slug since no slug column
        createdAt: team.created_at,
        memberCount: memberCount || 0,
        projectCount: projectCount || 0,
        role: roleMap.get(team.id),
      };
    })
  );

  return NextResponse.json({ teams: teamsWithCounts });
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

  // Create team with owner_wallet
  const { data: team, error: teamError } = await supabase
    .from("sentinel_teams")
    .insert({ name, owner_wallet: walletAddress })
    .select()
    .single();

  if (teamError) {
    console.error("Error creating team:", teamError);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }

  // Add creator as owner member
  const { error: memberError } = await supabase
    .from("sentinel_team_members")
    .insert({
      team_id: team.id,
      wallet_address: walletAddress,
      role: "owner",
    });

  if (memberError) {
    console.error("Error adding team owner:", memberError);
    // Rollback team creation
    await supabase.from("sentinel_teams").delete().eq("id", team.id);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      id: team.id,
      name: team.name,
      slug: team.id,
      createdAt: team.created_at,
      memberCount: 1,
      projectCount: 0,
      role: "owner",
    },
    { status: 201 }
  );
}
