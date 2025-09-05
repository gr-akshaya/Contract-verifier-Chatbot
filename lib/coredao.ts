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

/**
 * Encodes source code content to base64 for API transmission
 * @param content - Source code content as string
 * @returns Base64 encoded string
 */
const encodeSourceCodeForApi = (content: string): string => {
  return Buffer.from(content, "utf-8").toString("base64");
};

/**
 * Submits contract source code for verification
 * @param network - Target network (mainnet/testnet2)
 * @param params - Verification parameters including source code and compiler settings
 * @returns Promise resolving to verification response with GUID
 */
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

/**
 * Checks the status of a verification submission using GUID
 * @param network - Target network (mainnet/testnet2)
 * @param guid - Verification transaction GUID
 * @returns Promise resolving to verification status response
 */
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

/**
 * Retrieves verified source code for a contract address
 * @param network - Target network (mainnet/testnet2)
 * @param address - Contract address
 * @returns Promise resolving to source code response
 */
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

/**
 * Retrieves verified ABI for a contract address
 * @param network - Target network (mainnet/testnet2)
 * @param address - Contract address
 * @returns Promise resolving to ABI response
 */
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

/**
 * Verifies a proxy contract
 * @param network - Target network (mainnet/testnet2)
 * @param params - Proxy contract verification parameters
 * @returns Promise resolving to proxy verification response
 */
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

/**
 * Checks the status of a proxy contract verification
 * @param network - Target network (mainnet/testnet2)
 * @param guid - Proxy verification transaction GUID
 * @returns Promise resolving to proxy verification status response
 */
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
 * High-level function to verify a contract with simplified parameters
 * Handles parameter mapping and calls the appropriate verification endpoint
 * @param network - Target network (mainnet/testnet2)
 * @param verificationDetails - Contract verification details
 * @returns Promise resolving to verification response
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
  // Map compiler types to API format
  const codeFormatMap = {
    "solidity-single": "solidity-single-file",
    "solidity-multi": "solidity-multi-part-files",
    "solidity-json": "solidity-standard-json-input",
  };

  // Build request body with mapped parameters
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

  // Add library information if provided
  if (verificationDetails.libraryName1 && verificationDetails.libraryAddress1) {
    requestBody.libraryname1 = verificationDetails.libraryName1;
    requestBody.libraryaddress1 = verificationDetails.libraryAddress1;
  }

  return verifySourceCode(network, requestBody);
}

/**
 * Alias for checkVerificationStatus for backward compatibility
 * @param network - Target network (mainnet/testnet2)
 * @param guid - Verification transaction GUID
 * @returns Promise resolving to verification status response
 */
export async function checkVerificationStatusByGuid(
  network: Network,
  guid: string
): Promise<CheckVerificationStatusResponse> {
  return checkVerificationStatus(network, guid);
}

/**
 * Extracts contract name from Solidity source code using regex pattern matching
 * Handles various contract declaration types (contract, interface, abstract)
 * @param sourceCode - Solidity source code as string
 * @returns Contract name if found, null otherwise
 */
export function extractContractName(sourceCode: string): string | null {
  // Normalize line endings and remove comments first
  const normalizedCode = sourceCode
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\/\/.*/g, ""); // Remove single-line comments

  // Look for contract declaration
  const contractMatch = normalizedCode.match(
    /contract\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
  );

  if (contractMatch && contractMatch[1]) {
    return contractMatch[1].trim();
  }

  // Also look for interface or abstract contract declarations
  const interfaceMatch = normalizedCode.match(
    /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
  );
  if (interfaceMatch && interfaceMatch[1]) {
    return interfaceMatch[1].trim();
  }

  return null;
}

export { encodeSourceCodeForApi };
