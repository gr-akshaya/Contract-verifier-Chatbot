"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CodeEditorProps {
  sourceCode: string;
  onSourceCodeChange: (value: string) => void;
  contractName: string;
  onContractNameChange: (value: string) => void;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  sourceCode,
  onSourceCodeChange,
  contractName,
  onContractNameChange,
  placeholder = "Paste your Solidity contract source code here...",
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".sol")) {
        setError("Invalid file type. Please upload a .sol file.");
        setFileName(null);
        onSourceCodeChange("");
        return;
      }
      setError(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onSourceCodeChange(content);
        if (!contractName) {
          const match = content.match(/contract\s+(\w+)\s*\{/);
          if (match && match[1]) {
            onContractNameChange(match[1]);
          }
        }
      };
      reader.readAsText(file);
    },
    [onSourceCodeChange, onContractNameChange, contractName]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const clearCode = () => {
    onSourceCodeChange("");
    setFileName(null);
    setError(null);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">
          Contract Source Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="contractName" className="text-sm font-medium">
            Contract Name
          </Label>
          <Input
            id="contractName"
            type="text"
            placeholder="e.g., MyToken (must match contract name in source)"
            value={contractName}
            onChange={(e) => onContractNameChange(e.target.value)}
            className="mt-1 font-body"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            The name of the contract exactly as it appears in the source code.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Upload .sol file
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".sol"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </Label>
          {fileName && (
            <span className="text-sm text-muted-foreground ml-2">
              File: {fileName}
            </span>
          )}
          {sourceCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCode}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <X size={16} className="mr-1" /> Clear
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            {error}
          </div>
        )}

        <div
          className={`relative border-2 rounded-md transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-dashed border-input hover:border-accent"
            }
            ${error ? "border-destructive" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Textarea
            value={sourceCode}
            onChange={(e) => onSourceCodeChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-80 min-h-[200px] p-4 font-code text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
            spellCheck="false"
          />
          {isDragActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-md pointer-events-none">
              <FileText size={48} className="text-primary mb-2" />
              <p className="text-lg font-medium text-primary">
                Drop Solidity file here
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
