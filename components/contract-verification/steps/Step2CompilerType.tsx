import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step2CompilerTypeProps {
  compilerType: string;
  onSelect: (type: string) => void;
  disabled?: boolean;
}

const Step2CompilerType: React.FC<Step2CompilerTypeProps> = ({
  compilerType,
  onSelect,
  disabled,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>📝 Compiler Type Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select the compiler type that matches your source code
          </label>
          <select
            className="w-full p-3 border rounded-md bg-background text-sm"
            value={compilerType || ""}
            onChange={(e) => onSelect(e.target.value)}
            disabled={disabled}
          >
            <option value="" disabled>
              Select compiler type...
            </option>
            <option value="solidity-single">
              Single Solidity File (most common)
            </option>
            <option value="solidity-multi">
              Multiple Solidity Files (with imports)
            </option>
            <option value="solidity-json">
              Solidity Standard JSON Input (from Hardhat/Truffle)
            </option>
          </select>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <b>Tip:</b> If you&apos;re not sure, choose "Single Solidity
            File" - it&apos;s the most common option.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step2CompilerType;
