import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Code, FolderOpen } from "lucide-react";

interface Step1SourceCodeProps {
  address: string;
  network: string;
  onSubmitSourceCode: (code: string) => void;
  onUploadFiles: (files: { code: string; fileName: string }[]) => void;
}

const Step1SourceCode: React.FC<Step1SourceCodeProps> = ({
  address,
  network,
  onSubmitSourceCode,
  onUploadFiles,
}) => {
  const [sourceCode, setSourceCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    const processFiles = Array.from(files).map((file) => {
      return new Promise<{ code: string; fileName: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ code: ev.target?.result as string, fileName: file.name });
        };
        reader.readAsText(file);
      });
    });
    const processed = await Promise.all(processFiles);
    setIsUploading(false);
    onUploadFiles(processed);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Contract Verification - Step 1 of 7</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">Contract Address</label>
            <p className="text-sm font-mono bg-muted p-2 rounded">{address}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Network</label>
            <p className="text-sm">
              {network === "mainnet" ? "Core Mainnet" : "Core Testnet"}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <b>Tip:</b> Make sure your source code is the exact same code
              that was used to deploy the contract. Any differences will cause
              verification to fail.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => {
                // Focus textarea for paste
                document.getElementById("step1-source-textarea")?.focus();
              }}
            >
              <Code className="w-6 h-6 mb-2" />
              Paste Code
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = ".sol,.json";
                input.onchange = (e) => handleFileUpload(e as any);
                input.click();
              }}
              disabled={isUploading}
            >
              <Upload className="w-6 h-6 mb-2" />
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => {
                // Info for multiple files
                alert(
                  "For multiple files, please combine them or provide as JSON input. You can also zip multiple .sol files and upload them."
                );
              }}
            >
              <FolderOpen className="w-6 h-6 mb-2" />
              Multiple Files
            </Button>
          </div>
          <div className="mt-6">
            <Textarea
              id="step1-source-textarea"
              placeholder="Paste your Solidity source code here..."
              className="min-h-[300px] font-mono whitespace-pre preserve-whitespace"
              style={{ wordBreak: "normal", whiteSpace: "pre" }}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  if (sourceCode.trim().length > 50) {
                    onSubmitSourceCode(sourceCode);
                  } else {
                    alert(
                      "Source code seems too short. Please provide the complete Solidity source code."
                    );
                  }
                }}
                disabled={sourceCode.trim().length < 10}
              >
                Submit Code
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1SourceCode;
