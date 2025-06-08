import React, { useState } from "react";
import { Upload, File, X } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = "Paste your contract source code here...",
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".sol")) {
        handleFileUpload(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 p-3 bg-dark-700 rounded-t-lg border border-b-0 border-gray-700">
        <span className="text-lg font-medium text-gray-200">Source Code</span>
        <div className="flex items-center space-x-2">
          <label className="flex items-center px-4 py-2 text-sm bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 cursor-pointer transition-colors">
            <Upload size={14} className="mr-2" />
            Upload .sol
            <input
              type="file"
              accept=".sol"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
          {value && (
            <button
              onClick={() => onChange("")}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear code"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div
        className={`relative border rounded-b-lg border-gray-700 ${
          isDragActive ? "border-primary-500 bg-primary-500/5" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 p-3 font-mono text-sm bg-dark-700 text-gray-100 placeholder-gray-500 rounded-b-lg resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
          spellCheck="false"
        />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800/90 rounded-b-lg">
            <div className="flex flex-col items-center text-primary-400">
              <File size={32} />
              <p className="mt-2 font-medium">Drop Solidity file here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
