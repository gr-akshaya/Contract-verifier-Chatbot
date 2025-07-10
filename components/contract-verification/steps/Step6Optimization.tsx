import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step6OptimizationProps {
  optimizationUsed: "0" | "1";
  runs: number;
  onSelectOptimization: (value: "0" | "1") => void;
  onSetRuns: (runs: number) => void;
  disabled?: boolean;
}

const Step6Optimization: React.FC<Step6OptimizationProps> = ({
  optimizationUsed,
  runs,
  onSelectOptimization,
  onSetRuns,
  disabled,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>⚙️ Optimization Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="text-sm font-medium mb-2 block">
          Was optimization enabled during compilation?
        </label>
        <select
          className="w-full p-3 border rounded-md bg-background text-sm"
          value={optimizationUsed || ""}
          onChange={(e) => onSelectOptimization(e.target.value as "0" | "1")}
          disabled={disabled}
        >
          <option value="" disabled>
            Select optimization setting...
          </option>
          <option value="0">No - Optimization was disabled</option>
          <option value="1">Yes - Optimization was enabled</option>
        </select>
        {optimizationUsed === "1" && (
          <div className="mt-2">
            <label className="text-sm font-medium mb-2 block">
              How many optimization runs were used?
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded-md bg-background"
              value={runs}
              onChange={(e) => onSetRuns(Number(e.target.value))}
              min={1}
              placeholder="200"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default is usually 200
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Step6Optimization;
