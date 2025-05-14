export type Network = "testnet1" | "testnet2" | "mainnet";

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

export interface Message {
  id: string;
  type: "user" | "bot";
  content: string | React.ReactNode;
  timestamp: Date;
}

export interface VerificationDetails {
  address?: string;
  network?: Network;
  compilerType?: CompilerType;
  licenseType?: LicenseType;
  sourceCode?: string;
  contractName?: string;
  compilerVersion?: string;
  evmVersion?: string;
}

export interface VerificationResult {
  status: string;
  message: string;
  result?: string;
}
