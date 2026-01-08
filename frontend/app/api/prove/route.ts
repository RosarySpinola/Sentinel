import { NextRequest, NextResponse } from "next/server";
import { getWalletFromApiKey } from "@/lib/api/auth";
import { getSupabase } from "@/lib/supabase/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = request.headers.get("X-API-Key");

    const response = await fetch(`${BACKEND_URL}/api/v1/prove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "X-API-Key": apiKey }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Save to history if API key is valid
    if (response.ok && apiKey) {
      const walletAddress = await getWalletFromApiKey(apiKey);
      if (walletAddress) {
        try {
          const supabase = getSupabase();
          await supabase.from("sentinel_prover_runs").insert({
            wallet_address: walletAddress,
            project_id: null,
            code: body.move_code,
            modules: [body.module_name],
            status: data.status,
            duration_ms: data.duration_ms || 0,
            results: data,
            error_message:
              data.status !== "passed" ? data.summary : undefined,
          });
        } catch (saveError) {
          console.warn("Failed to save prover run to history:", saveError);
        }
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Prove proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to prover backend" },
      { status: 503 }
    );
  }
}
