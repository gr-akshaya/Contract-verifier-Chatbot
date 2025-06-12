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
    console.log("Using CoreDAO API base URL:", baseUrl);
    const url = `https://scan.test2.btcs.network/api/chain/verify_contract?apikey=${apiKey}`;
    console.log("Verification URL:", url);
    console.log("Request payload:", JSON.stringify(params, null, 2));

    const requestBody = { ...params };
    if (Array.isArray(requestBody.sourceCodes)) {
      requestBody.sourceCodes = requestBody.sourceCodes.map(
        (item: { code: string; fileName: string }) => ({
          ...item,
          code: item.code ? Buffer.from(item.code).toString("base64") : "",
        })
      );
    } else if (typeof requestBody.sourceCodes === "string") {
      requestBody.sourceCodes = Buffer.from(requestBody.sourceCodes).toString(
        "base64"
      );
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log("Response status:", responseData);
    if (!responseData.data || responseData.data.success !== true) {
      return NextResponse.json(
        {
          error: `CoreDAO API Error: ${response.status} ${JSON.stringify(
            responseData
          )}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error verifying source code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
