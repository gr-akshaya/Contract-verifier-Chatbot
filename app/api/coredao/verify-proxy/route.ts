import { NextRequest, NextResponse } from "next/server";
import { COREDAO_API_ENDPOINTS } from "@/lib/constants";
import type { Network } from "@/types/coredao";

function getApiKey(network: Network): string {
  if (network === "mainnet") {
    return process.env.NEXT_PUBLIC_CORE_MAINNET_API_KEY || "";
  } else {
    return process.env.NEXT_PUBLIC_CORE_TESTNET2_API_KEY || "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, ...params } = body;
    const selectedNetwork = (network as Network) || "mainnet";

    const apiKey = getApiKey(selectedNetwork);
    if (!apiKey) {
      return NextResponse.json(
        { error: "CoreDAO API key is not configured" },
        { status: 500 }
      );
    }

    const baseUrl = COREDAO_API_ENDPOINTS[selectedNetwork];
    const url = `${baseUrl}/contracts/verify_proxy_contract?apikey=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `CoreDAO API Error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error verifying proxy contract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
