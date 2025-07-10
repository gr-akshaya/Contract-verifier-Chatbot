import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step5EvmVersionProps {
  value: string;
  onSelect: (version: string) => void;
  disabled?: boolean;
}

const evmVersions = [
  { value: "cancun", label: "Cancun" },
  { value: "shanghai", label: "Shanghai" },
  { value: "paris", label: "Paris" },
];

const Step5EvmVersion: React.FC<Step5EvmVersionProps> = ({
  value,
  onSelect,
  disabled,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>⚙️ EVM Version</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          className="w-full p-3 border rounded-md bg-background text-sm"
          value={value || ""}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled>
            Select EVM version...
          </option>
          {evmVersions.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
};

export default Step5EvmVersion;
