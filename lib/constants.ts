import type {
  CompilerType,
  LicenseType,
  Network,
  VerificationDetails,
} from "@/types/coredao";

export const NETWORKS: { value: Network; label: string }[] = [
  { value: "mainnet", label: "CoreDAO Mainnet" },
  { value: "testnet2", label: "CoreDAO Testnet" },
];

export const COMPILER_TYPES: { value: CompilerType; label: string }[] = [
  { value: "solidity-single", label: "Solidity (Single file)" },
  // { value: "solidity-multi", label: "Solidity (Multi-Part files)" }, // Not implementing multipart for simplicity
  { value: "solidity-json", label: "Solidity (Standard-Json-Input)" },
];

export const LICENSE_TYPES: {
  value: LicenseType;
  label: string;
  apiValue: number;
}[] = [
  { value: "None", label: "No License (None)", apiValue: 1 },
  { value: "Unlicense", label: "The Unlicense (Unlicense)", apiValue: 2 },
  { value: "MIT", label: "MIT License (MIT)", apiValue: 3 },
  {
    value: "GNU GPLv2",
    label: "GNU General Public License v2.0 (GNU GPLv2)",
    apiValue: 4,
  },
  {
    value: "GNU GPLv3",
    label: "GNU General Public License v3.0 (GNU GPLv3)",
    apiValue: 5,
  },
  {
    value: "GNU LGPLv2.1",
    label: "GNU Lesser General Public License v2.1 (GNU LGPLv2.1)",
    apiValue: 6,
  },
  {
    value: "GNU LGPLv3",
    label: "GNU Lesser General Public License v3.0 (GNU LGPLv3)",
    apiValue: 7,
  },
  {
    value: "BSD-2-Clause",
    label: 'BSD 2-clause "Simplified" license (BSD-2-Clause)',
    apiValue: 8,
  },
  {
    value: "BSD-3-Clause",
    label: 'BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)',
    apiValue: 9,
  },
  {
    value: "MPL-2.0",
    label: "Mozilla Public License 2.0 (MPL-2.0)",
    apiValue: 10,
  },
  {
    value: "OSL-3.0",
    label: "Open Software License 3.0 (OSL-3.0)",
    apiValue: 11,
  },
  { value: "Apache-2.0", label: "Apache 2.0 (Apache-2.0)", apiValue: 12 },
  {
    value: "GNU AGPLv3",
    label: "GNU Affero General Public License (GNU AGPLv3)",
    apiValue: 13,
  },
];

export const COMPILER_VERSIONS: string[] = [
  "v0.8.20+commit.a1b79de6",
  "v0.8.19+commit.7dd6d414",
  "v0.8.18+commit.87f61d96",
  "v0.8.17+commit.8df45f5f",
  "v0.8.10+commit.fc410830",
  "v0.7.6+commit.7338295f",
  "v0.6.12+commit.27d51765",
  "v0.5.17+commit.d19bba13",
];

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
  "shanghai", // Recommended for Core
];

export const OPTIMIZATION_OPTIONS: { value: "0" | "1"; label: string }[] = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

export const COREDAO_API_ENDPOINTS: Record<Network, string> = {
  mainnet: "https://openapi.coredao.org/api",
  testnet2: "https://api.testnet.coredao.org/api", // Corrected testnet endpoint
};

export const DEFAULT_VERIFICATION_DETAILS: VerificationDetails = {
  network: "mainnet",
  contractAddress: "",
  compilerType: "solidity-single",
  sourceCode: "",
  contractName: "",
  compilerVersion: COMPILER_VERSIONS[0],
  evmVersion: "shanghai",
  optimizationUsed: "0",
  runs: 200,
  licenseType: "MIT",
};
