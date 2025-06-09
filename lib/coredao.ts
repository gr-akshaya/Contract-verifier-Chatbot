import type {
  Network,
  VerifySourceCodeParams,
  VerifySourceCodeResponse,
  VerifyProxyContractParams,
  VerifyProxyContractResponse,
  CheckVerificationStatusResponse,
  CheckProxyVerificationStatusResponse,
  GetSourceCodeResponse,
  GetAbiResponse,
} from "@/types/coredao";

export async function verifySourceCode(
  network: Network,
  params: VerifySourceCodeParams
): Promise<VerifySourceCodeResponse> {
  const url = `/api/coredao/verify`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ network, ...params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<VerifySourceCodeResponse>;
}

export async function checkVerificationStatus(
  network: Network,
  guid: string
): Promise<CheckVerificationStatusResponse> {
  const url = `/api/coredao/status?guid=${guid}&network=${network}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<CheckVerificationStatusResponse>;
}

export async function getSourceCode(
  network: Network,
  address: string
): Promise<GetSourceCodeResponse> {
  const url = `/api/coredao/source-code/${address}?network=${network}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<GetSourceCodeResponse>;
}

export async function getAbi(
  network: Network,
  address: string
): Promise<GetAbiResponse> {
  const url = `/api/coredao/abi/${address}?network=${network}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<GetAbiResponse>;
}

export async function verifyProxyContract(
  network: Network,
  params: VerifyProxyContractParams
): Promise<VerifyProxyContractResponse> {
  const url = `/api/coredao/verify-proxy`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ network, ...params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<VerifyProxyContractResponse>;
}

export async function checkProxyVerificationStatus(
  network: Network,
  guid: string
): Promise<CheckProxyVerificationStatusResponse> {
  const url = `/api/coredao/proxy-status?guid=${guid}&network=${network}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json() as Promise<CheckProxyVerificationStatusResponse>;
}

/**
 * Comprehensive contract verification function that supports all compiler types
 */
export async function verifyContract(
  network: Network,
  verificationDetails: {
    contractAddress: string;
    compilerType: "solidity-single" | "solidity-multi" | "solidity-json";
    sourceCode: string;
    contractName: string;
    compilerVersion: string;
    optimizationUsed: "0" | "1";
    runs: number;
    licenseType: number;
    evmVersion?: string;
    constructorArguments?: string;
    libraryName1?: string;
    libraryAddress1?: string;
  }
): Promise<VerifySourceCodeResponse> {
  const codeFormatMap = {
    "solidity-single": "solidity-single-file",
    "solidity-multi": "solidity-multi-part-files",
    "solidity-json": "solidity-standard-json-input",
  };

  const requestBody: VerifySourceCodeParams = {
    contractaddress: verificationDetails.contractAddress,
    sourceCode: verificationDetails.sourceCode,
    codeformat: codeFormatMap[verificationDetails.compilerType],
    contractname: verificationDetails.contractName,
    compilerversion: verificationDetails.compilerVersion,
    optimizationUsed: verificationDetails.optimizationUsed,
    runs: verificationDetails.runs,
    licenseType: verificationDetails.licenseType,
    evmversion: verificationDetails.evmVersion || "shanghai",
    constructorArguements: verificationDetails.constructorArguments || "",
  };

  if (verificationDetails.libraryName1 && verificationDetails.libraryAddress1) {
    requestBody.libraryname1 = verificationDetails.libraryName1;
    requestBody.libraryaddress1 = verificationDetails.libraryAddress1;
  }

  return verifySourceCode(network, requestBody);
}

/**
 * Check verification status by GUID
 */
export async function checkVerificationStatusByGuid(
  network: Network,
  guid: string
): Promise<CheckVerificationStatusResponse> {
  return checkVerificationStatus(network, guid);
}
