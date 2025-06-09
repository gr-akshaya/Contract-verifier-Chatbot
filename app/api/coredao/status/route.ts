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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guid = searchParams.get("guid");
    const network = (searchParams.get("network") as Network) || "mainnet";

    if (!guid) {
      return NextResponse.json(
        { error: "GUID parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = getApiKey(network);
    if (!apiKey) {
      return NextResponse.json(
        { error: "CoreDAO API key is not configured" },
        { status: 500 }
      );
    }

    const baseUrl = COREDAO_API_ENDPOINTS[network];
    const url = `${baseUrl}/contracts/check_proxy_contract_verification_submission_status_using_cURL?guid=${guid}&apikey=${apiKey}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
