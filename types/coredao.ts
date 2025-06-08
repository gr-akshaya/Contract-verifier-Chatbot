export type Network = "mainnet" | "testnet2";

export type CompilerType =
  | "solidity-single"
  | "solidity-multi"
  | "solidity-json";

export type LicenseType =
  | "None"
  | "Unlicense"
  | "MIT"
  | "GNU GPLv2"
  | "GNU GPLv3"
  | "GNU LGPLv2.1"
  | "GNU LGPLv3"
  | "BSD-2-Clause"
  | "BSD-3-Clause"
  | "MPL-2.0"
  | "OSL-3.0"
  | "Apache-2.0"
  | "GNU AGPLv3";

export type VerificationDetails = {
  network: Network;
  contractAddress: string;
  compilerType: CompilerType;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: "0" | "1";
  runs: string | number;
  licenseType: LicenseType;
  evmVersion?: string;
  constructorArguments?: string;
};

export interface VerifySourceCodeParams {
  module: "contract";
  action: "verifysourcecode";
  contractaddress: string;
  sourceCode: string;
  codeformat: "solidity-single-file" | "solidity-standard-json-input"; // Adjust based on compilerType
  contractname: string;
  compilerversion: string; // e.g., "v0.8.20+commit.a1b79de6"
  optimizationUsed: "0" | "1"; // 0 = No, 1 = Yes
  runs: string; // number of runs if optimizationUsed is 1
  constructorArguements?: string; // ABI-encoded
  evmversion?: string; // e.g., "london"
  licenseType?: number; // Integer mapping to license type
  libraryname1?: string;
  libraryaddress1?: string;
}

export interface VerifySourceCodeResponse {
  status: "1" | "0"; // "1" for success, "0" for error
  message: string; // "OK" or "Error message"
  result: string; // GUID or error details
}

export interface CheckVerificationStatusResponse {
  status: "1" | "0";
  message: string; // "Pending in queue", "Pass - Verified", "Fail - Unable to verify"
  result: string;
}

export interface GetSourceCodeResponse {
  status: "1" | "0";
  message: string;
  result: Array<{
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string; // "0" or "1"
    Runs: string;
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string; // "0" or "1"
    Implementation: string;
    SwarmSource: string;
  }>;
}

export interface GetAbiResponse {
  status: "1" | "0";
  message: string;
  result: string;
}

export interface AISuggestion {
  compilerVersion?: string;
  evmVersion?: string;
  optimizationUsed?: "yes" | "no";
  runs?: number;
  fixes?: string;
}
