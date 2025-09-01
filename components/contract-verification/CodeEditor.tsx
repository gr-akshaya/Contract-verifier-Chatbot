"use client";

/**
 * Code Editor Component
 *
 * This component provides a comprehensive code editor interface for smart contract
 * source code input. It supports:
 * - Drag and drop file upload
 * - Base64 decoding for encoded source code
 * - Contract name auto-detection
 * - Multiple file type support (.sol, .json, .zip, .tar.gz)
 * - Real-time contract name extraction
 *
 * Features:
 * - File validation based on compiler type
 * - Automatic contract name detection
 * - Paste handling with formatting preservation
 * - Error handling and user feedback
 * - Support for different compiler types (single, multi, JSON)
 */

import React, { useState, useCallback } from "react";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { extractContractName } from "@/lib/coredao";

/**
 * Helper function to detect and decode Base64-encoded source code
 * @param str - String to check for Base64 encoding
 * @returns true if string is Base64-encoded Solidity code
 */
const isBase64 = (str: string): boolean => {
  try {
    // Check if it's a valid Base64 string
    const base64regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (!base64regex.test(str)) return false;

    // Try to decode it and see if it contains Solidity patterns
    const decoded = atob(str);
    return (
      decoded.includes("pragma solidity") ||
      decoded.includes("contract ") ||
      decoded.includes("// SPDX-License")
    );
  } catch {
    return false;
  }
  return false;
};

/**
 * Decodes Base64-encoded source code and normalizes formatting
 * @param content - Source code content to decode
 * @returns Decoded and formatted source code
 */
const decodeSourceCodeIfNeeded = (content: string): string => {
  if (isBase64(content)) {
    try {
      const decoded = atob(content);
      // Normalize line endings and ensure proper formatting
      return decoded
        .replace(/\r\n/g, "\n")
        .replace(/(\/\/ SPDX-License-Identifier:[^\n]*?)(?!\n)/g, "$1\n")
        .replace(/(pragma solidity[^;]*?;)(?!\n)/g, "$1\n")
        .replace(/(\s*contract\s+\w+)/g, "\n$1");
    } catch (error) {
      console.warn("Failed to decode Base64 content:", error);
      return content;
    }
  }
  return content;
};

/**
 * Props interface for CodeEditor component
 */
interface CodeEditorProps {
  sourceCode: string;
  onSourceCodeChange: (value: string) => void;
  contractName: string;
  onContractNameChange: (value: string) => void;
  compilerType?:
    | "solidity-single"
    | "solidity-multi"
    | "solidity-json"
    | string;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  sourceCode,
  onSourceCodeChange,
  contractName,
  onContractNameChange,
  compilerType = "solidity-single",
  placeholder = "Paste your Solidity contract source code here...",
}) => {
  // Component state management
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles source code changes with auto-detection of contract name
   * @param content - New source code content
   */
  const handleSourceCodeChange = useCallback(
    (content: string) => {
      const decodedCode = decodeSourceCodeIfNeeded(content);
      onSourceCodeChange(decodedCode);

      // Try to auto-detect contract name if not already set
      if (!contractName) {
        const detected = extractContractName(decodedCode);
        if (detected) {
          onContractNameChange(detected);
        }
      }
    },
    [onSourceCodeChange, onContractNameChange, contractName]
  );

  /**
   * Handles file upload with validation based on compiler type
   * @param file - File to upload
   */
  const handleFileUpload = useCallback(
    (file: File) => {
      // Define valid extensions based on compiler type
      const validExtensions =
        compilerType === "solidity-json"
          ? [".json"]
          : compilerType === "solidity-multi"
          ? [".sol", ".zip", ".tar.gz"]
          : [".sol"];

      // Validate file extension
      if (
        !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      ) {
        const expectedTypes =
          compilerType === "solidity-json"
            ? "JSON files"
            : compilerType === "solidity-multi"
            ? ".sol, .zip, or .tar.gz files"
            : ".sol files";
        setError(`Invalid file type. Please upload ${expectedTypes}.`);
        setFileName(null);
        onSourceCodeChange("");
        return;
      }

      setError(null);
      setFileName(file.name);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleSourceCodeChange(content);
      };
      reader.readAsText(file);
    },
    [compilerType, handleSourceCodeChange, onSourceCodeChange]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <Card className="w-full p-4 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between">
          <Label>Source Code</Label>
          {fileName && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {fileName}
              <Button
                variant="ghost"
                size="icon"
                className="w-4 h-4 p-0"
                onClick={() => {
                  setFileName(null);
                  onSourceCodeChange("");
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {/* File upload zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-gray-200"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept={
              compilerType === "solidity-json" ? ".json" : ".sol,.zip,.tar.gz"
            }
          />
          <Upload className="mx-auto w-8 h-8 mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drop your file here or click to upload
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Code editor textarea */}
        <Textarea
          value={sourceCode}
          onChange={(e) => handleSourceCodeChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[300px] font-mono whitespace-pre-wrap break-words"
          style={{ wordBreak: "break-all" }}
          onPaste={(e) => {
            const pastedText = e.clipboardData.getData("text");
            // Preserve formatting and handle base64
            if (pastedText) {
              e.preventDefault();
              // Remove any Windows-style line endings and normalize
              const normalizedText = pastedText.replace(/\r\n/g, "\n");
              handleSourceCodeChange(normalizedText);
            }
          }}
          wrap="soft"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Contract name input */}
        <div className="space-y-2">
          <Label htmlFor="contract-name">Contract Name</Label>
          <Input
            id="contract-name"
            value={contractName}
            onChange={(e) => onContractNameChange(e.target.value)}
            placeholder="Enter the main contract name..."
            className="font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
