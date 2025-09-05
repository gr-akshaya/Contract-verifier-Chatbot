import type {
  CompilerType,
  LicenseType,
  Network,
  VerificationDetails,
} from "@/types/coredao";

/**
 * Available CoreDAO networks for contract verification
 * Maps network values to their display labels
 */
export const NETWORKS: { value: Network; label: string }[] = [
  { value: "mainnet", label: "Core Mainnet" },
  { value: "testnet2", label: "Core Testnet" },
];

/**
 * Available Solidity compiler types for contract verification
 * Different formats for submitting source code
 */
export const COMPILER_TYPES: { value: CompilerType; label: string }[] = [
  { value: "solidity-single", label: "Solidity (Single file)" },
  { value: "solidity-multi", label: "Solidity (Multi-Part files)" },
  { value: "solidity-json", label: "Solidity (Standard-Json-Input)" },
];

/**
 * Available license types for contract verification
 * Maps license names to their API values and display labels
 * Includes common open-source licenses used in smart contracts
 */
export const LICENSE_TYPES: {
  value: LicenseType;
  label: string;
  apiValue: number;
}[] = [
  {
    value: "Unlicensed" as unknown as LicenseType,
    label: "No License (None)",
    apiValue: 1,
  },
  {
    value: "Unlicense" as unknown as LicenseType,
    label: "The Unlicense (Unlicense)",
    apiValue: 2,
  },
  {
    value: "MIT" as unknown as LicenseType,
    label: "MIT License (MIT)",
    apiValue: 3,
  },
  {
    value: "GNU GPLv2" as unknown as LicenseType,
    label: "GNU General Public License v2.0 (GNU GPLv2)",
    apiValue: 4,
  },
  {
    value: "GNU GPLv3" as unknown as LicenseType,
    label: "GNU General Public License v3.0 (GNU GPLv3)",
    apiValue: 5,
  },
  {
    value: "GNU LGPLv2.1" as unknown as LicenseType,
    label: "GNU Lesser General Public License v2.1 (GNU LGPLv2.1)",
    apiValue: 6,
  },
  {
    value: "GNU LGPLv3" as unknown as LicenseType,
    label: "GNU Lesser General Public License v3.0 (GNU LGPLv3)",
    apiValue: 7,
  },
  {
    value: "BSD-2-Clause" as unknown as LicenseType,
    label: 'BSD 2-clause "Simplified" license (BSD-2-Clause)',
    apiValue: 8,
  },
  {
    value: "BSD-3-Clause" as unknown as LicenseType,
    label: 'BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)',
    apiValue: 9,
  },
  {
    value: "MPL-2.0" as unknown as LicenseType,
    label: "Mozilla Public License 2.0 (MPL-2.0)",
    apiValue: 10,
  },
  {
    value: "OSL-3.0" as unknown as LicenseType,
    label: "Open Software License 3.0 (OSL-3.0)",
    apiValue: 11,
  },
  {
    value: "Apache-2.0" as unknown as LicenseType,
    label: "Apache 2.0 (Apache-2.0)",
    apiValue: 12,
  },
  {
    value: "GNU AGPLv3" as unknown as LicenseType,
    label: "GNU Affero General Public License (GNU AGPLv3)",
    apiValue: 13,
  },
  {
    value: "BSL-1.1" as unknown as LicenseType,
    label: "Business Source License (BSL-1.1)",
    apiValue: 14,
  },
];

/**
 * Available Solidity compiler versions
 * Ordered from newest to oldest versions
 * Includes versions from v0.8.28 down to v0.5.10
 */
export const COMPILER_VERSIONS: string[] = [
  "v0.8.28+commit.7893614a",
  "v0.8.27+commit.40a35a09",
  "v0.8.26+commit.8a97fa7a",
  "v0.8.25+commit.b61c2a91",
  "v0.8.24+commit.e11b9ed9",
  "v0.8.23+commit.f704f362",
  "v0.8.22+commit.4fc1097e",
  "v0.8.21+commit.d9974bed",
  "v0.8.20+commit.a1b79de6",
  "v0.8.19+commit.7dd6d414",
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
  "v0.5.11+commit.22be8592",
  "v0.5.10+commit.5a6ea5b1",
];

/**
 * Available EVM versions for contract compilation
 * Ordered from newest to oldest EVM versions
 * "default" uses the compiler's default EVM version
 */
export const EVM_VERSIONS: string[] = [
  "default",
  "homestead",
  "tangerineWhistle",
  "spuriousDragon",
  "byzantium",
  "constantinople",
  "petersburg",
  "istanbul",
  "muirGlacier",
  "berlin",
  "london",
  "paris",
  "shanghai",
];

/**
 * Optimization options for contract compilation
 * Maps boolean values to user-friendly labels
 */
export const OPTIMIZATION_OPTIONS: { value: "0" | "1"; label: string }[] = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

/**
 * CoreDAO API endpoints for different networks
 * Maps network types to their respective API base URLs
 */
export const COREDAO_API_ENDPOINTS: {
  [key in Exclude<Network, undefined>]?: string;
} = {
  mainnet: "https://openapi.coredao.org/api",
  testnet2: "https://api.test2.btcs.network/api",
};

/**
 * CoreDAO API endpoint paths for contract operations
 * Provides URL builders for different contract-related API calls
 */
export const COREDAO_CONTRACT_ENDPOINTS = {
  /** Get ABI for a verified contract */
  getAbi: (address: string) => `/contracts/abi_of_verified_contract/${address}`,
  /** Get source code for a verified contract */
  getSourceCode: (address: string) =>
    `/contracts/source_code_of_verified_contract/${address}`,
  /** Verify contract source code */
  verifySourceCode: "/contracts/verify_source_code",
  /** Verify proxy contract */
  verifyProxyContract: "/contracts/verify_proxy_contract",
  /** Verify proxy contract using cURL */
  verifyProxyContractCurl: "/contracts/verify_proxy_contract_using_cURL",
  /** Check proxy contract verification status using cURL */
  checkProxyVerificationStatus:
    "/contracts/check_proxy_contract_verification_submission_status_using_cURL",
};

/**
 * Default values for contract verification form
 * Provides sensible defaults for all verification parameters
 */
export const DEFAULT_VERIFICATION_DETAILS: VerificationDetails = {
  network: "mainnet",
  contractAddress: "",
  compilerType: "solidity-single",
  sourceCode: "",
  contractName: "",
  compilerVersion: COMPILER_VERSIONS[0], // Latest version
  evmVersion: "shanghai", // Latest EVM version
  optimizationUsed: "0", // No optimization by default
  runs: 200, // Default optimization runs
  licenseType: 3, // MIT License by default
};
