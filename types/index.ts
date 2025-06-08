export type Network = "testnet2" | "mainnet";

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
  optimizationUsed?: string;
  runs?: number;
}

export interface VerificationResult {
  status: string;
  message: string;
  result?: string;
}

export interface ContractABI {
  [key: string]: unknown;
}

export interface ContractSourceCode {
  ContractName?: string;
  CompilerVersion?: string;
  LicenseType?: string;
  SourceCode?: string;
  ABI?: string;
  OptimizationUsed?: string;
  Runs?: string;
  ConstructorArguments?: string;
  EVMVersion?: string;
  Library?: string;
  LibraryUsed?: string;
  SwarmSource?: string;
  [key: string]: unknown;
}

export interface VerificationStatus {
  status: string;
  message: string;
  result?: string;
  guid?: string;
}

export interface ProxyVerificationRequest {
  address: string;
  contractaddress?: string;
  apikey?: string;
}

export interface VerificationRequest {
  action?: string;
  address: string;
  apikey: string;
  blockno?: number;
  blocktype?: string;
  boolean?: boolean;
  closest?: string;
  codeformat?: string;
  compilerversion?: string;
  constructorArguements?: string;
  contractaddress?: string;
  contractaddresses?: string;
  data?: string;
  endblock?: number;
  evmversion?: string;
  fromBlock?: number;
  gas?: string;
  gasPrice?: string;
  guid?: string;
  hex?: string;
  index?: string;
  licenseType?: number;
  module?: string;
  offset?: number;
  optimizationUsed?: string;
  page?: number;
  position?: string;
  q?: string;
  runs?: number;
  sort?: string;
  sourceCode?: string;
  startblock?: number;
  tag?: string;
  timestamp?: number;
  to?: string;
  toBlock?: string;
  topic0?: string;
  topic0_1_opr?: string;
  topic0_2_opr?: string;
  topic0_3_opr?: string;
  topic1?: string;
  topic1_2_opr?: string;
  topic1_3_opr?: string;
  topic2?: string;
  topic2_3_opr?: string;
  topic3?: string;
  txhash?: string;
  value?: string;
  contractname?: string;
}
