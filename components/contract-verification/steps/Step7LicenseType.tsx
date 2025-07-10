import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step7LicenseTypeProps {
  value: string;
  onSelect: (license: string) => void;
  disabled?: boolean;
}

const licenseOptions = [
  { value: "Unlicensed", label: "No License (None)" },
  { value: "Unlicense", label: "The Unlicense (Unlicense)" },
  { value: "MIT", label: "MIT License (MIT)" },
  { value: "GNU GPLv2", label: "GNU General Public License v2.0 (GNU GPLv2)" },
  { value: "GNU GPLv3", label: "GNU General Public License v3.0 (GNU GPLv3)" },
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
    label: "BSD 2-clause Simplified license (BSD-2-Clause)",
  },
  {
    value: "BSD-3-Clause",
    label: "BSD 3-clause New Or Revised license (BSD-3-Clause)",
  },
  { value: "MPL-2.0", label: "Mozilla Public License 2.0 (MPL-2.0)" },
  { value: "OSL-3.0", label: "Open Software License 3.0 (OSL-3.0)" },
  { value: "Apache-2.0", label: "Apache 2.0 (Apache-2.0)" },
  {
    value: "GNU AGPLv3",
    label: "GNU Affero General Public License (GNU AGPLv3)",
  },
  { value: "BSL-1.1", label: "Business Source License (BSL-1.1)" },
];

const Step7LicenseType: React.FC<Step7LicenseTypeProps> = ({
  value,
  onSelect,
  disabled,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>📄 License Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="text-sm font-medium mb-2 block">
          Select the license type for your contract
        </label>
        <select
          className="w-full p-3 border rounded-md bg-background text-sm"
          value={value || ""}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled>
            Select license type...
          </option>
          {licenseOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
};

export default Step7LicenseType;
