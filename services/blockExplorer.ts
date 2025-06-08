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

export class BlockExplorer {
  private apiKey: string;
  private apiUrl: string;
  private browserUrl: string;

  constructor(network: Network = "testnet2") {
    this.apiKey = API_KEY;
    this.apiUrl = API_ENDPOINTS[network];
    this.browserUrl = BROWSER_URLS[network];
  }

  async isVerified(address: string): Promise<boolean> {
    const url = `${this.apiUrl}/contracts/abi_of_verified_contract/${address}?apikey=${this.apiKey}`;
    const requestOptions = {
      method: "GET",
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(url, requestOptions);
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
        console.log("Contract is verified.");
        return true;
      } else if (result.status === "0") {
        console.log("Contract is not verified:", result.message);
        return false;
      } else {
        console.log("Unexpected response:", result);
        return false;
      }
    } catch (error) {
      console.error("Error verifying contract:", error);
      throw error;
    }
  }

  async verifyContract(
    details: VerificationDetails
  ): Promise<VerificationResult> {
    const url = `${this.apiUrl}/contracts/verify_source_code?apikey=${this.apiKey}`;

    const payload = {
      address: details.address,
      contractaddress: details.address,
      sourceCode: details.sourceCode,
      contractname: details.contractName,
      compilerversion: details.compilerVersion,
      codeformat: details.compilerType || "solidity-single-file",
      evmversion: details.evmVersion || "shanghai",
      licenseType: this.getLicenseTypeNumber(details.licenseType),
      optimizationUsed: details.optimizationUsed || "0",
      runs: details.runs || 200,
    };

    try {
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

  async getContractABI(address: string): Promise<ContractABI> {
    const url = `${this.apiUrl}/contracts/abi_of_verified_contract/${address}?apikey=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "1") {
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
    const url = `${this.apiUrl}/contracts/source_code_of_verified_contract/${address}?apikey=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "1") {
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

  async verifyProxyContract(
    details: VerificationDetails
  ): Promise<VerificationResult> {
    const url = `${this.apiUrl}/contracts/verify_proxy_contract?apikey=${this.apiKey}`;

    const payload = {
      address: details.address,
      contractaddress: details.address,
    };

    try {
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
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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

  getBrowserUrl(address: string): string {
    return `${this.browserUrl}address/${address}`;
  }

  private getLicenseTypeNumber(licenseType?: string): number {
    const licenseMap: { [key: string]: number } = {
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
    };

    return licenseMap[licenseType || "None"] || 1;
  }
}

export default BlockExplorer;
