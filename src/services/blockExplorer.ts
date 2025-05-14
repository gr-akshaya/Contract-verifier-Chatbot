import { Network, VerificationDetails, VerificationResult } from "../types";

// Network-specific API endpoints
const API_ENDPOINTS = {
  testnet1: "https://api.test.btcs.network/api",
  testnet2: "https://api.test2.btcs.network/api",
  mainnet: "https://api.btcs.network/api",
};

// Network-specific browser URLs
const BROWSER_URLS = {
  testnet1: "https://scan.test.btcs.network/",
  testnet2: "https://scan.test2.btcs.network/",
  mainnet: "https://scan.btcs.network/",
};

// API keys
const API_KEYS = {
  testnet1: import.meta.env.VITE_TESTNET1_API_KEY || "",
  testnet2: import.meta.env.VITE_TESTNET2_API_KEY || "",
  mainnet: import.meta.env.VITE_MAINNET_API_KEY || "",
};

export class BlockExplorer {
  private apiKey: string;
  private apiUrl: string;
  private browserUrl: string;

  constructor(network: Network = "testnet2") {
    this.apiKey = API_KEYS[network];
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
      codeformat: "solidity-single-file",
      evmversion: details.evmVersion || "shanghai",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error during contract verification:", error);
      throw error;
    }
  }

  getBrowserUrl(address: string): string {
    return `${this.browserUrl}/address/${address}`;
  }
}

export default BlockExplorer;
