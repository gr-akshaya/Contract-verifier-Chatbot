export type Network = "mainnet" | "testnet2" | undefined;

export type CompilerType =
  | "solidity-single"
  | "solidity-multi"
  | "solidity-json";

export enum LicenseType {
  None = 1,
  Unlicense = 2,
  MIT = 3,
  GNU_GPLv2 = 4,
  GNU_GPLv3 = 5,
  GNU_LGPLv2_1 = 6,
  GNU_LGPLv3 = 7,
  BSD_2_Clause = 8,
  BSD_3_Clause = 9,
  MPL_2_0 = 10,
  OSL_3_0 = 11,
  Apache_2_0 = 12,
  GNU_AGPLv3 = 13,
  BSL_1_1 = 14,
}

export type VerificationDetails = {
  network?: Network;
  contractAddress: string;
  compilerType: CompilerType;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: "0" | "1";
  runs: string | number;
  licenseType: number;
  evmVersion?: string;
  constructorArguments?: string;
};

export interface VerifySourceCodeParams {
  action?: string;
  address?: string;
  apikey?: string;
  blockno?: number;
  blocktype?: string;
  boolean?: boolean;
  closest?: string;
  codeformat?: string;
  compilerversion?: string;
  constructorArguements?: string;
  contractaddress?: string;
  contractname?: string;
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
  libraryname1?: string;
  libraryaddress1?: string;
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
}

export interface VerifyProxyContractParams {
  action?: string;
  address: string;
  apikey?: string;
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
}

export interface VerifySourceCodeResponse {
  code: string;
  data: {
    success: boolean;
    response: string;
    abi?: Array<{
      inputs: Array<{ internalType: string; name: string; type: string }>;
      stateMutability: string;
      type: string;
    }>;
    errMsg?: string;
    txHash?: string;
  };
  message?: string;
  result?: string;
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

export interface VerifyProxyContractResponse {
  status: "1" | "0";
  message: string;
  result: string;
}

export interface CheckProxyVerificationStatusResponse {
  status: "1" | "0";
  message: string;
  result: string;
}
