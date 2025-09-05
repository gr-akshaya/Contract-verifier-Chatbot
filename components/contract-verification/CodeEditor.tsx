"use client";

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
 * Checks if a string is valid Base64 and contains Solidity patterns
 *
 * @param str - String to check for Base64 encoding
 * @returns boolean indicating if string is Base64-encoded Solidity code
 */
const isBase64 = (str: string): boolean => {
  try {
    // Check if it's a valid Base64 string using regex pattern
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
 * Handles line endings and ensures proper Solidity code formatting
 *
 * @param content - Source code content (potentially Base64-encoded)
 * @returns Decoded and normalized source code string
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
 * @param sourceCode - Current source code content
 * @param onSourceCodeChange - Callback when source code changes
 * @param contractName - Current contract name
 * @param onContractNameChange - Callback when contract name changes
 * @param compilerType - Type of compiler (single, multi, json)
 * @param placeholder - Placeholder text for the textarea
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

/**
 * CodeEditor Component
 *
 * A comprehensive code editor for Solidity smart contracts with the following features:
 * - Drag and drop file upload support
 * - Base64 decoding for encoded source code
 * - Automatic contract name detection
 * - File type validation based on compiler type
 * - Paste handling with formatting preservation
 * - Visual feedback for file uploads and errors
 *
 * Supported file types:
 * - Single file: .sol files
 * - Multi-file: .sol, .zip, .tar.gz files
 * - JSON input: .json files
 *
 * @param sourceCode - Current source code content
 * @param onSourceCodeChange - Callback function when source code changes
 * @param contractName - Current contract name
 * @param onContractNameChange - Callback function when contract name changes
 * @param compilerType - Compiler type determining accepted file formats
 * @param placeholder - Placeholder text for the textarea
 * @returns JSX element containing the code editor interface
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  sourceCode,
  onSourceCodeChange,
  contractName,
  onContractNameChange,
  compilerType = "solidity-single",
  placeholder = "Paste your Solidity contract source code here...",
}) => {
  // Local state for managing UI interactions
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles source code changes with automatic decoding and contract name detection
   *
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
   * Handles file upload with validation and content processing
   *
   * @param file - File object to be processed
   */
  const handleFileUpload = useCallback(
    (file: File) => {
      // Define valid file extensions based on compiler type
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

      // Read file content as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleSourceCodeChange(content);
      };
      reader.readAsText(file);
    },
    [compilerType, handleSourceCodeChange, onSourceCodeChange]
  );

  /**
   * Handles file input change event
   *
   * @param event - File input change event
   */
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
          {/* Display uploaded file name with remove option */}
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
        {/* File upload zone with drag and drop support */}
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

        {/* Error message display */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Main code editor textarea */}
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

        {/* Contract name input field */}
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
