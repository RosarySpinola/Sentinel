import { NextRequest, NextResponse } from "next/server";
import { getWalletFromApiKey } from "@/lib/api/auth";
import { getSupabase } from "@/lib/supabase/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = request.headers.get("X-API-Key");

    const response = await fetch(`${BACKEND_URL}/api/v1/analyze-gas`, {
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

          // Extract top operation and function from breakdown
          const breakdown = data.breakdown || [];
          const topOp = breakdown[0];

          await supabase.from("sentinel_gas_analyses").insert({
            wallet_address: walletAddress,
            project_id: null,
            network: body.network,
            sender_address: body.sender,
            module_address: body.module_address,
            module_name: body.module_name,
            function_name: body.function_name,
            type_arguments: body.type_args || [],
            arguments: body.args || [],
            total_gas: data.total_gas || 0,
            top_operation: topOp?.operation,
            top_function: topOp?.function_name,
            suggestions_count: data.suggestions?.length || 0,
            result: data,
          });
        } catch (saveError) {
          console.warn("Failed to save gas analysis to history:", saveError);
        }
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Analyze gas proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to gas analysis backend" },
      { status: 503 }
    );
  }
}
