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
  codeformat: "solidity-single-file" | "solidity-standard-json-input";
  contractname: string;
  compilerversion: string;
  optimizationUsed: "0" | "1";
  runs: string;
  constructorArguements?: string;
  evmversion?: string;
  licenseType?: number;
  libraryname1?: string;
  libraryaddress1?: string;
}

export interface VerifySourceCodeResponse {
  status: "1" | "0";
  message: string;
  result: string;
}

export interface CheckVerificationStatusResponse {
  status: "1" | "0";
  message: string;
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
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
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
