import {
  Network,
  VerificationDetails,
  VerificationResult,
  ContractABI,
  ContractSourceCode,
} from "../types";

const API_ENDPOINTS = {
  testnet2: "https://api.test2.btcs.network/api",
  mainnet: "https://openapi.coredao.org/api",
};

const BROWSER_URLS = {
  testnet2: "https://scan.test2.btcs.network/",
  mainnet: "https://scan.btcs.network/",
};

const API_KEY = process.env.NEXT_PUBLIC_CORE_API_KEY || "";

// Comprehensive compiler versions supported by Core blockchain
const COMPILER_VERSIONS = [
  "v0.8.24+commit.e11b9ed9",
  "v0.8.23+commit.f704f362",
  "v0.8.22+commit.4fc1097e",
  "v0.8.21+commit.d9974bed",
  "v0.8.20+commit.a1b79de6",
  "v0.8.19+commit.7dd6d404",
  "v0.8.18+commit.87f61d96",
  "v0.8.17+commit.8df45f5f",
  "v0.8.16+commit.07c72cc2",
  "v0.8.15+commit.e14f2714",
  "v0.8.14+commit.80d49f37",
  "v0.8.13+commit.abaa5c0e",
  "v0.8.12+commit.f00d7308",
  "v0.8.11+commit.d7f03943",
  "v0.8.10+commit.fc410830",
  "v0.8.9+commit.e5eed63a",
  "v0.8.8+commit.dddeac2f",
  "v0.8.7+commit.e28d00a7",
  "v0.8.6+commit.11564f7e",
  "v0.8.5+commit.a4f2e591",
  "v0.8.4+commit.c7e474f2",
  "v0.8.3+commit.8d00100c",
  "v0.8.2+commit.661d1103",
  "v0.8.1+commit.df193b15",
  "v0.8.0+commit.c7dfd78e",
  "v0.7.6+commit.7338295f",
  "v0.7.5+commit.eb77ed08",
  "v0.7.4+commit.3f05b770",
  "v0.7.3+commit.9bfce1f6",
  "v0.7.2+commit.51b20bc0",
  "v0.7.1+commit.f4a555be",
  "v0.7.0+commit.9e61f92b",
  "v0.6.12+commit.27d51765",
  "v0.6.11+commit.5ef660b1",
  "v0.6.10+commit.00c0fcaf",
  "v0.6.9+commit.3e3065ac",
  "v0.6.8+commit.0bbfe453",
  "v0.6.7+commit.b8d736ae",
  "v0.6.6+commit.6c089d02",
  "v0.6.5+commit.f956cc89",
  "v0.6.4+commit.1dca32f3",
  "v0.6.3+commit.8dda9521",
  "v0.6.2+commit.bacdbe57",
  "v0.6.1+commit.e6f7d5a4",
  "v0.6.0+commit.26b70077",
  "v0.5.17+commit.d19bba13",
  "v0.5.16+commit.9c3226ce",
  "v0.5.15+commit.6a57276f",
  "v0.5.14+commit.01f1aaa4",
  "v0.5.13+commit.5b0b510c",
  "v0.5.12+commit.7709ece9",
  "v0.5.11+commit.c082d0b4",
  "v0.5.10+commit.5a6ea5b1",
];

// EVM versions supported by Core blockchain
const EVM_VERSIONS = [
  "default",
  "london",
  "berlin",
  "istanbul",
  "petersburg",
  "constantinople",
  "byzantium",
  "spuriousDragon",
  "tangerineWhistle",
  "homestead",
  "frontier",
  "paris",
  "shanghai",
  "cancun",
];

// License types with their corresponding numbers
const LICENSE_TYPES = {
  None: 1,
  Unlicense: 2,
  MIT: 3,
  "GNU GPLv2": 4,
  "GNU GPLv3": 5,
  "GNU LGPLv2.1": 6,
  "GNU LGPLv3": 7,
  "BSD-2-Clause": 8,
  "BSD-3-Clause": 9,
  "MPL-2.0": 10,
  "OSL-3.0": 11,
  "Apache-2.0": 12,
  "GNU AGPLv3": 13,
  "BSL 1.1": 14,
  "LGPL-2.1-only": 15,
  "LGPL-2.1-or-later": 16,
  "LGPL-3.0-only": 17,
  "LGPL-3.0-or-later": 18,
};

export class BlockExplorer {
  private apiKey: string;
  private apiUrl: string;
  private browserUrl: string;
  private network: Network;

  constructor(network: Network = "testnet2") {
    this.apiKey = API_KEY;
    this.network = network;
    this.apiUrl = API_ENDPOINTS[network];
    this.browserUrl = BROWSER_URLS[network];
  }

  // Utility methods
  static getCompilerVersions(): string[] {
    return COMPILER_VERSIONS;
  }

  static getEvmVersions(): string[] {
    return EVM_VERSIONS;
  }

  static getLicenseTypes(): { [key: string]: number } {
    return LICENSE_TYPES;
  }

  static isValidAddress(address: string): boolean {
    // Check if it's a valid Ethereum-style address
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  switchNetwork(network: Network): void {
    this.network = network;
    this.apiUrl = API_ENDPOINTS[network];
    this.browserUrl = BROWSER_URLS[network];
  }

  getCurrentNetwork(): Network {
    return this.network;
  }

  getBrowserUrl(address: string): string {
    return `${this.browserUrl}address/${address}`;
  }

  getContractUrl(address: string): string {
    return `${this.browserUrl}address/${address}#code`;
  }

  getTransactionUrl(txHash: string): string {
    return `${this.browserUrl}tx/${txHash}`;
  }

  // Core API Methods
  async isVerified(address: string): Promise<boolean> {
    if (!BlockExplorer.isValidAddress(address)) {
      throw new Error("Invalid contract address format");
    }

    const url = `${this.apiUrl}/contracts/abi_of_verified_contract/${address}?apikey=${this.apiKey}`;

    try {
      console.log(
        `Checking verification status for ${address} on ${this.network}`
      );

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP Error: ${response.status} - ${response.statusText}`
        );
        console.error(`Error response: ${errorText}`);
        throw new Error(`Error fetching contract data: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === "1") {
        console.log("✅ Contract is verified.");
        return true;
      } else if (result.status === "0") {
        console.log("❌ Contract is not verified:", result.message);
        return false;
      } else {
        console.log("⚠️ Unexpected response:", result);
        return false;
      }
    } catch (error) {
      console.error("Error verifying contract:", error);
      throw error;
    }
  }

  async getContractABI(address: string): Promise<ContractABI> {
    if (!BlockExplorer.isValidAddress(address)) {
      throw new Error("Invalid contract address format");
    }

    const url = `${this.apiUrl}/contracts/abi_of_verified_contract/${address}?apikey=${this.apiKey}`;

    try {
      console.log(`Fetching ABI for ${address} on ${this.network}`);

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "1") {
        console.log("✅ ABI fetched successfully");
        return result.result;
      } else {
        throw new Error(result.message || "Failed to fetch contract ABI");
      }
    } catch (error) {
      console.error("Error fetching contract ABI:", error);
      throw error;
    }
  }

  async getContractSourceCode(address: string): Promise<ContractSourceCode> {
    if (!BlockExplorer.isValidAddress(address)) {
      throw new Error("Invalid contract address format");
    }

    const url = `${this.apiUrl}/contracts/source_code_of_verified_contract/${address}?apikey=${this.apiKey}`;

    try {
      console.log(`Fetching source code for ${address} on ${this.network}`);

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "1") {
        console.log("✅ Source code fetched successfully");
        return result.result;
      } else {
        throw new Error(
          result.message || "Failed to fetch contract source code"
        );
      }
    } catch (error) {
      console.error("Error fetching contract source code:", error);
      throw error;
    }
  }

  async verifyContract(
    details: VerificationDetails
  ): Promise<VerificationResult> {
    if (!details.address || !BlockExplorer.isValidAddress(details.address)) {
      throw new Error("Invalid contract address format");
    }

    const url = `${this.apiUrl}/contracts/verify_source_code?apikey=${this.apiKey}`;

    const payload = {
      address: details.address,
      contractaddress: details.address,
      sourceCode: details.sourceCode || "",
      contractname: details.contractName || "",
      compilerversion: details.compilerVersion || "",
      codeformat: this.getCodeFormat(details.compilerType),
      evmversion: details.evmVersion || "shanghai",
      licenseType: this.getLicenseTypeNumber(details.licenseType),
      optimizationUsed:
        details.optimizationUsed === "1" || details.optimizationUsed === "true"
          ? "1"
          : "0",
      runs: details.runs || 200,
      constructorArguements: "", // Will be added when constructor arguments are supported
    };

    try {
      console.log(`Verifying contract ${details.address} on ${this.network}`);
      console.log("Verification payload:", {
        ...payload,
        sourceCode: payload.sourceCode
          ? `${payload.sourceCode.substring(0, 100)}...`
          : "No source code",
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${errorText}`
        );
      }

      const result = await response.json();

      console.log("Verification response:", result);

      return {
        status: result.status,
        message: result.message,
        result: result.result,
      };
    } catch (error) {
      console.error("Error during contract verification:", error);
      throw new Error(
        `Verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async checkVerificationStatus(guid: string): Promise<VerificationResult> {
    const url = `${this.apiUrl}/contracts/check_source_code_verification_submission_status_using_cURL?apikey=${this.apiKey}&guid=${guid}`;

    try {
      console.log(`Checking verification status for GUID: ${guid}`);

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Verification status:", result);

      return {
        status: result.status,
        message: result.message,
        result: result.result,
      };
    } catch (error) {
      console.error("Error checking verification status:", error);
      throw error;
    }
  }

  async verifyProxyContract(
    details: VerificationDetails
  ): Promise<VerificationResult> {
    if (!details.address || !BlockExplorer.isValidAddress(details.address)) {
      throw new Error("Invalid contract address format");
    }

    const url = `${this.apiUrl}/contracts/verify_proxy_contract?apikey=${this.apiKey}`;

    const payload = {
      address: details.address,
      contractaddress: details.address,
    };

    try {
      console.log(
        `Verifying proxy contract ${details.address} on ${this.network}`
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${errorText}`
        );
      }

      const result = await response.json();

      console.log("Proxy verification response:", result);

      return {
        status: result.status,
        message: result.message,
        result: result.result,
      };
    } catch (error) {
      console.error("Error verifying proxy contract:", error);
      throw new Error(
        `Proxy verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async checkProxyVerificationStatus(
    guid: string
  ): Promise<VerificationResult> {
    const url = `${this.apiUrl}/contracts/check_proxy_contract_verification_submission_status_using_cURL?apikey=${this.apiKey}&guid=${guid}`;

    try {
      console.log(`Checking proxy verification status for GUID: ${guid}`);

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Proxy verification status:", result);

      return {
        status: result.status,
        message: result.message,
        result: result.result,
      };
    } catch (error) {
      console.error("Error checking proxy verification status:", error);
      throw error;
    }
  }

  // Enhanced contract information retrieval
  async getContractInfo(address: string): Promise<{
    isVerified: boolean;
    isProxy?: boolean;
    sourceCode?: ContractSourceCode;
    abi?: ContractABI;
  }> {
    try {
      const isVerified = await this.isVerified(address);

      if (!isVerified) {
        return { isVerified: false };
      }

      const [sourceCode, abi] = await Promise.all([
        this.getContractSourceCode(address),
        this.getContractABI(address),
      ]);

      // Check if it's a proxy contract by examining the source code
      const isProxy = this.detectProxyContract(sourceCode);

      return {
        isVerified: true,
        isProxy,
        sourceCode,
        abi,
      };
    } catch (error) {
      console.error("Error getting contract info:", error);
      throw error;
    }
  }

  // Detect if a contract is a proxy based on common proxy patterns
  private detectProxyContract(sourceCode: ContractSourceCode): boolean {
    if (!sourceCode || typeof sourceCode !== "object") {
      return false;
    }

    // Check for common proxy indicators in contract name and source
    const contractName = sourceCode.ContractName?.toLowerCase() || "";
    const source = sourceCode.SourceCode?.toLowerCase() || "";

    const proxyIndicators = [
      "proxy",
      "upgradeable",
      "upgrade",
      "transparent",
      "beacon",
      "delegate",
      "implementation",
      "eip1967",
      "eip1822",
      "uups",
    ];

    return proxyIndicators.some(
      (indicator) =>
        contractName.includes(indicator) || source.includes(indicator)
    );
  }

  // Batch verification status check
  async checkMultipleContracts(addresses: string[]): Promise<{
    [address: string]: boolean;
  }> {
    const results: { [address: string]: boolean } = {};

    const checks = addresses.map(async (address) => {
      try {
        const isVerified = await this.isVerified(address);
        results[address] = isVerified;
      } catch (error) {
        console.error(`Error checking ${address}:`, error);
        results[address] = false;
      }
    });

    await Promise.all(checks);
    return results;
  }

  // Helper method to validate verification details before submission
  validateVerificationDetails(details: VerificationDetails): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!details.address || !BlockExplorer.isValidAddress(details.address)) {
      errors.push("Invalid contract address format");
    }

    if (!details.contractName || details.contractName.trim().length === 0) {
      errors.push("Contract name is required");
    }

    if (!details.sourceCode || details.sourceCode.trim().length === 0) {
      errors.push("Source code is required");
    }

    if (!details.compilerVersion) {
      errors.push("Compiler version is required");
    } else if (!COMPILER_VERSIONS.includes(details.compilerVersion)) {
      errors.push("Unsupported compiler version");
    }

    if (details.evmVersion && !EVM_VERSIONS.includes(details.evmVersion)) {
      errors.push("Unsupported EVM version");
    }

    if (
      (details.optimizationUsed === "1" ||
        details.optimizationUsed === "true") &&
      (!details.runs || details.runs < 1)
    ) {
      errors.push(
        "Optimization runs must be greater than 0 when optimization is enabled"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods
  private getLicenseTypeNumber(licenseType?: string): number {
    if (!licenseType) {
      return LICENSE_TYPES["None"];
    }
    return (
      LICENSE_TYPES[licenseType as keyof typeof LICENSE_TYPES] ||
      LICENSE_TYPES["None"]
    );
  }

  private getCodeFormat(compilerType?: string): string {
    const formatMap: { [key: string]: string } = {
      "solidity-single": "solidity-single-file",
      "solidity-multi": "solidity-multi-file",
      "solidity-json": "solidity-standard-json-input",
    };

    return (
      formatMap[compilerType || "solidity-single"] || "solidity-single-file"
    );
  }

  // Error handling and retry logic
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        console.log(
          `Request attempt ${attempt} failed, retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error("Max retries exceeded");
  }
}

export default BlockExplorer;
