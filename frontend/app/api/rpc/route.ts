import { NextRequest, NextResponse } from "next/server";

// Shinami Node Service URLs for Movement
const SHINAMI_URLS = {
  mainnet: "https://api.shinami.com/aptos/node/v1/movement_mainnet",
  testnet: "https://api.shinami.com/aptos/node/v1/movement_testnet",
};

// Public fallback URLs
const PUBLIC_URLS = {
  mainnet: "https://mainnet.movementnetwork.xyz/v1",
  testnet: "https://testnet.movementnetwork.xyz/v1",
};

/**
 * RPC Proxy API Route
 * Proxies requests to Movement RPC with Shinami authentication
 * Use this for client-side RPC calls that need Shinami reliability
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network = "testnet", path = "", ...payload } = body;

    const shinamiKey = process.env.SHINAMI_KEY;

    // Choose URL based on Shinami key availability
    const baseUrl = shinamiKey
      ? SHINAMI_URLS[network as keyof typeof SHINAMI_URLS] || SHINAMI_URLS.testnet
      : PUBLIC_URLS[network as keyof typeof PUBLIC_URLS] || PUBLIC_URLS.testnet;

    const url = path ? `${baseUrl}/${path}` : baseUrl;

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (shinamiKey) {
      headers["X-Api-Key"] = shinamiKey;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("RPC proxy error:", error);
    return NextResponse.json(
      { error: "RPC request failed", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET proxy for REST API endpoints (e.g., /accounts/{address})
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network") || "testnet";
    const path = searchParams.get("path") || "";

    if (!path) {
      return NextResponse.json(
        { error: "Missing 'path' query parameter" },
        { status: 400 }
      );
    }

    const shinamiKey = process.env.SHINAMI_KEY;

    const baseUrl = shinamiKey
      ? SHINAMI_URLS[network as keyof typeof SHINAMI_URLS] || SHINAMI_URLS.testnet
      : PUBLIC_URLS[network as keyof typeof PUBLIC_URLS] || PUBLIC_URLS.testnet;

    const url = `${baseUrl}/${path}`;

    const headers: Record<string, string> = {};
    if (shinamiKey) {
      headers["X-Api-Key"] = shinamiKey;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("RPC proxy error:", error);
    return NextResponse.json(
      { error: "RPC request failed", details: String(error) },
      { status: 500 }
    );
  }
}
