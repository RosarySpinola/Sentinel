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

    // Try Shinami first if key is available, otherwise use public endpoint
    const baseUrl = shinamiKey
      ? SHINAMI_URLS[network as keyof typeof SHINAMI_URLS] || SHINAMI_URLS.testnet
      : PUBLIC_URLS[network as keyof typeof PUBLIC_URLS] || PUBLIC_URLS.testnet;

    const url = `${baseUrl}/${path}`;

    const headers: Record<string, string> = {};
    if (shinamiKey) {
      headers["X-Api-Key"] = shinamiKey;
    }

    let response: Response;
    try {
      response = await fetch(url, { headers });
    } catch (fetchError) {
      // Network error - try fallback to public endpoint if we were using Shinami
      if (shinamiKey) {
        const fallbackUrl = `${PUBLIC_URLS[network as keyof typeof PUBLIC_URLS] || PUBLIC_URLS.testnet}/${path}`;
        response = await fetch(fallbackUrl);
      } else {
        throw fetchError;
      }
    }

    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("RPC returned non-JSON response:", text.slice(0, 500));
      return NextResponse.json(
        { error: "RPC returned non-JSON response", status: response.status },
        { status: response.status || 502 }
      );
    }

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
