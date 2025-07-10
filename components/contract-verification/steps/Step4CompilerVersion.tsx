import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step4CompilerVersionProps {
  value: string;
  onSelect: (version: string) => void;
  disabled?: boolean;
}

const versions = [
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
];

const Step4CompilerVersion: React.FC<Step4CompilerVersionProps> = ({
  value,
  onSelect,
  disabled,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>🔧 Compiler Version</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          className="w-full p-3 border rounded-md bg-background text-sm"
          value={value || ""}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled>
            Select compiler version...
          </option>
          {versions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <div className="text-sm text-muted-foreground">
          💡 Recommended versions: v0.8.24+commit.e11b9ed9
        </div>
      </CardContent>
    </Card>
  );
};

export default Step4CompilerVersion;
