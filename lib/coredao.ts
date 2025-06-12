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

const encodeSourceCodeForApi = (content: string): string => {
  return Buffer.from(content, "utf-8").toString("base64");
};

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
    compilerType:
      | "solidity-single"
      | "solidity-multi"
      | "solidity-json"
      | number;
    sourceCodes?: string | Array<{ code: string; fileName?: string }>;
    contractName: string;
    compilerVersion: string;
    optimizationUsed: "0" | "1" | boolean;
    runs: number;
    licenseType: number;
    evmVersion?: string | number;
    constructorArguments?: string;
    libraryName1?: string;
    libraryAddress1?: string;
  }
): Promise<VerifySourceCodeResponse> {
  let evmVersion = verificationDetails.evmVersion;
  if (typeof evmVersion === "number") {
    evmVersion = evmVersion;
  } else if (typeof evmVersion === "string" && evmVersion === "shanghai") {
    evmVersion = 0;
  } else if (typeof evmVersion === "string") {
    const evmVersionMap: { [key: string]: number } = {
      cancun: 1,
      berlin: 2,
      london: 3,
      paris: 4,
    };
    evmVersion = evmVersionMap[evmVersion] || 0;
  }

  // Process the source code to ensure it's properly formatted and encoded
  let processedSourceCodes: Array<{ code: string; fileName: string }> = [];

  // Handle string source code (single file mode)
  if (typeof verificationDetails.sourceCodes === "string") {
    const encodedCode = encodeSourceCodeForApi(verificationDetails.sourceCodes);
    processedSourceCodes = [
      {
        code: encodedCode,
        fileName: `${verificationDetails.contractName}.sol`,
      },
    ];
  }
  // Handle array of source codes (multi-file mode)
  else if (Array.isArray(verificationDetails.sourceCodes)) {
    // Set compilerType to solidity-multi for multiple files
    if (verificationDetails.sourceCodes.length > 1) {
      verificationDetails.compilerType = "solidity-multi";
    }

    processedSourceCodes = verificationDetails.sourceCodes.map((item) => ({
      code: encodeSourceCodeForApi(item.code),
      fileName: item.fileName || `${verificationDetails.contractName}.sol`,
    }));
  }
  // Default empty array if no source codes provided
  else {
    processedSourceCodes = [];
  }

  const requestBody: VerifySourceCodeParams = {
    argument: null,
    compilerType:
      typeof verificationDetails.compilerType === "number"
        ? verificationDetails.compilerType
        : verificationDetails.compilerType === "solidity-single"
        ? 1
        : verificationDetails.compilerType === "solidity-multi"
        ? 2
        : verificationDetails.compilerType === "solidity-json"
        ? 3
        : undefined,
    compilerVersion: verificationDetails.compilerVersion,
    contractAddress: verificationDetails.contractAddress,
    evmVersion: evmVersion || 0,
    licenseType: verificationDetails.licenseType,
    optimizeEnable:
      typeof verificationDetails.optimizationUsed === "boolean"
        ? verificationDetails.optimizationUsed
        : verificationDetails.optimizationUsed === "1"
        ? true
        : verificationDetails.optimizationUsed === "0"
        ? false
        : undefined,
    optimizeRuns: verificationDetails.runs,
    sourceCodes: processedSourceCodes,
  };

  if (verificationDetails.constructorArguments) {
    requestBody.constructorArguements =
      verificationDetails.constructorArguments;
  }

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

/**
 * Extract contract name from source code using regex pattern matching
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
