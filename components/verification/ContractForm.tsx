import React from "react";
import {
  Network,
  VerificationDetails,
  CompilerType,
  LicenseType,
} from "../../types";
import CodeEditor from "./CodeEditor";
import { CheckCircle2 } from "lucide-react";

interface ContractFormProps {
  details: VerificationDetails;
  onChange: (details: Partial<VerificationDetails>) => void;
  currentStep: number;
}

const ContractForm: React.FC<ContractFormProps> = ({
  details,
  onChange,
  currentStep,
}) => {
  const networks: Network[] = ["testnet2", "mainnet"];

  const compilerTypes: { value: CompilerType; label: string }[] = [
    { value: "solidity-single", label: "Solidity (Single file)" },
    { value: "solidity-multi", label: "Solidity (Multi-Part files)" },
    { value: "solidity-json", label: "Solidity (Standard-Json-Input)" },
  ];

  const licenseTypes: { value: LicenseType; label: string }[] = [
    { value: "None", label: "No License (None)" },
    { value: "Unlicense", label: "The Unlicense (Unlicense)" },
    { value: "MIT", label: "MIT License (MIT)" },
    {
      value: "GNU GPLv2",
      label: "GNU General Public License v2.0 (GNU GPLv2)",
    },
    {
      value: "GNU GPLv3",
      label: "GNU General Public License v3.0 (GNU GPLv3)",
    },
    {
      value: "GNU LGPLv2.1",
      label: "GNU Lesser General Public License v2.1 (GNU LGPLv2.1)",
    },
    {
      value: "GNU LGPLv3",
      label: "GNU Lesser General Public License v3.0 (GNU LGPLv3)",
    },
    {
      value: "BSD-2-Clause",
      label: 'BSD 2-clause "Simplified" license (BSD-2-Clause)',
    },
    {
      value: "BSD-3-Clause",
      label: 'BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)',
    },
    { value: "MPL-2.0", label: "Mozilla Public License 2.0 (MPL-2.0)" },
    { value: "OSL-3.0", label: "Open Software License 3.0 (OSL-3.0)" },
    { value: "Apache-2.0", label: "Apache 2.0 (Apache-2.0)" },
    {
      value: "GNU AGPLv3",
      label: "GNU Affero General Public License (GNU AGPLv3)",
    },
  ];

  const compilerVersions = [
    "v0.8.24+commit.e11b9ed9",
    "v0.8.23+commit.f704f362",
    "v0.8.22+commit.4fc1097e",
    "v0.8.21+commit.d9974bed",
    "v0.8.20+commit.a1b79de6",
    "v0.8.19+commit.7dd6d404",
    "v0.8.18+commit.87f61d96",
    "v0.8.17+commit.8df45f5f",
    "v0.7.6+commit.7338295f",
    "v0.6.12+commit.27d51765",
  ];

  const evmVersions = [
    "shanghai",
    "paris",
    "london",
    "berlin",
    "istanbul",
    "petersburg",
    "constantinople",
    "byzantium",
  ];

  const isNetworkStep = currentStep === 2;
  const isCompilerTypeStep = currentStep === 3;
  const isLicenseStep = currentStep === 4;
  const isSourceCodeStep = currentStep === 5;
  const isCompilerStep = currentStep === 6;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {isNetworkStep && (
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Select Network
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {networks.map((network) => (
              <button
                key={network}
                type="button"
                onClick={() => onChange({ network })}
                className={`p-3 rounded-lg border ${
                  details.network === network
                    ? "border-primary-500 bg-primary-500/10 text-primary-400"
                    : "border-gray-700 bg-dark-700 text-gray-300 hover:bg-dark-800"
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{network}</span>
                  {details.network === network && (
                    <CheckCircle2 size={16} className="text-primary-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isCompilerTypeStep && (
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Select Compiler Type
          </label>
          <div className="grid grid-cols-1 gap-3">
            {compilerTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ compilerType: value })}
                className={`p-3 rounded-lg border ${
                  details.compilerType === value
                    ? "border-primary-500 bg-primary-500/10 text-primary-400"
                    : "border-gray-700 bg-dark-700 text-gray-300 hover:bg-dark-800"
                } transition-colors text-left`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {details.compilerType === value && (
                    <CheckCircle2 size={16} className="text-primary-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLicenseStep && (
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Select License Type
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {licenseTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ licenseType: value })}
                className={`p-3 rounded-lg border ${
                  details.licenseType === value
                    ? "border-primary-500 bg-primary-500/10 text-primary-400"
                    : "border-gray-700 bg-dark-700 text-gray-300 hover:bg-dark-800"
                } transition-colors text-left`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {details.licenseType === value && (
                    <CheckCircle2 size={16} className="text-primary-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isSourceCodeStep && (
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-200 mb-2">
              Contract Name
            </label>
            <input
              type="text"
              value={details.contractName || ""}
              onChange={(e) => onChange({ contractName: e.target.value })}
              placeholder="MyContract"
              className="w-full p-3 bg-dark-700 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <CodeEditor
            value={details.sourceCode || ""}
            onChange={(sourceCode) => onChange({ sourceCode })}
          />
        </div>
      )}

      {isCompilerStep && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-lg font-medium text-gray-200 mb-2">
              Compiler Version
            </label>
            <select
              value={details.compilerVersion || ""}
              onChange={(e) => onChange({ compilerVersion: e.target.value })}
              className="w-full p-3 bg-dark-700 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select compiler version</option>
              {compilerVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-200 mb-2">
              EVM Version
            </label>
            <select
              value={details.evmVersion || "shanghai"}
              onChange={(e) => onChange({ evmVersion: e.target.value })}
              className="w-full p-3 bg-dark-700 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {evmVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractForm;
