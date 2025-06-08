/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Network,
  VerifySourceCodeParams,
  VerifySourceCodeResponse,
  CheckVerificationStatusResponse,
  GetSourceCodeResponse,
  GetAbiResponse,
} from "@/types/coredao";
import { COREDAO_API_ENDPOINTS } from "./constants";

const API_KEY = process.env.NEXT_PUBLIC_CORE_API_KEY;

async function fetchCoreDAOApi<T>(
  network: Network,
  params: Record<string, string | undefined | number>,
  method: "GET" | "POST" = "GET"
): Promise<T> {
  if (!API_KEY) {
    throw new Error("CoreDAO API key is not configured.");
  }

  const baseUrl = COREDAO_API_ENDPOINTS[network];
  const allParams: Record<string, string | undefined | number> = {
    ...params,
    apikey: API_KEY,
  };

  let url = baseUrl;
  let body;

  if (method === "GET") {
    const queryParams = new URLSearchParams();
    for (const key in allParams) {
      if (allParams[key] !== undefined) {
        queryParams.append(key, String(allParams[key]));
      }
    }
    url += `?${queryParams.toString()}`;
  } else {
    const queryParams = new URLSearchParams();
    queryParams.append("module", String(allParams.module));
    queryParams.append("action", String(allParams.action));
    queryParams.append("apikey", API_KEY);
    url += `?${queryParams.toString()}`;

    const bodyParams: Record<string, any> = {};
    for (const key in params) {
      if (
        key !== "module" &&
        key !== "action" &&
        key !== "apikey" &&
        params[key] !== undefined
      ) {
        bodyParams[key] = params[key];
      }
    }
    body = JSON.stringify(bodyParams);
  }

  const response = await fetch(url, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : {},
    body: method === "POST" ? body : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CoreDAO API Error: ${response.status} ${errorText}`);
  }
  return response.json() as Promise<T>;
}

export async function verifySourceCode(
  network: Network,
  params: VerifySourceCodeParams
): Promise<VerifySourceCodeResponse> {
  const queryParams = {
    module: params.module,
    action: params.action,
    apikey: API_KEY,
  };

  const bodyParams: any = { ...params };
  delete bodyParams.module;
  delete bodyParams.action;
  // apikey is not part of the body according to docs

  const baseUrl = COREDAO_API_ENDPOINTS[network];
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("module", String(queryParams.module));
  urlSearchParams.append("action", String(queryParams.action));
  if (queryParams.apikey) {
    urlSearchParams.append("apikey", queryParams.apikey);
  }

  const fullUrl = `${baseUrl}?${urlSearchParams.toString()}`;

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyParams),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CoreDAO API Error: ${response.status} ${errorText}`);
  }
  return response.json() as Promise<VerifySourceCodeResponse>;
}

export async function checkVerificationStatus(
  network: Network,
  guid: string
): Promise<CheckVerificationStatusResponse> {
  return fetchCoreDAOApi<CheckVerificationStatusResponse>(network, {
    module: "contract",
    action: "checkverifystatus",
    guid,
  });
}

export async function getSourceCode(
  network: Network,
  address: string
): Promise<GetSourceCodeResponse> {
  const baseUrl = COREDAO_API_ENDPOINTS[network];
  const url = `${baseUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CoreDAO API Error: ${response.status} ${errorText}`);
  }
  return response.json() as Promise<GetSourceCodeResponse>;
}

export async function getAbi(
  network: Network,
  address: string
): Promise<GetAbiResponse> {
  const baseUrl = COREDAO_API_ENDPOINTS[network];

  const url = `${baseUrl}?module=contract&action=getabi&address=${address}&apikey=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CoreDAO API Error: ${response.status} ${errorText}`);
  }
  return response.json() as Promise<GetAbiResponse>;
}
