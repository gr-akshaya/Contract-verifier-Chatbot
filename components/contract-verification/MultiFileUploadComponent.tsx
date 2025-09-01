/**
 * Multi-File Upload Component
 *
 * This component provides a simple interface for uploading multiple files
 * for smart contract verification. It supports:
 * - Multiple file selection
 * - File content reading
 * - File list display
 * - Confirmation callback
 *
 * Features:
 * - Hidden file input with custom trigger
 * - File content extraction
 * - File list management
 * - Confirmation workflow
 */

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function MultiFileUploadComponent({
  onConfirm,
}: {
  onConfirm: (files: { fileName: string; code: string }[]) => void;
}) {
  // Component state
  const [files, setFiles] = useState<{ fileName: string; code: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and content reading
   * @param e - File input change event
   */
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Read all selected files in parallel
    const fileReaders = Array.from(selectedFiles).map((file) => {
      return new Promise<{ fileName: string; code: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ fileName: file.name, code: ev.target?.result as string });
        };
        reader.readAsText(file);
      });
    });

    // Add new files to existing list
    Promise.all(fileReaders).then((newFiles) => {
      setFiles((prev) => [...prev, ...newFiles]);
    });

    // Reset input so user can select the same file again if needed
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".sol,.json"
        multiple
        style={{ display: "none" }}
        onChange={handleAddFiles}
      />
      <Button onClick={() => inputRef.current?.click()}>Add Files</Button>
      <ul className="mt-2">
        {files.map((file, idx) => (
          <li key={idx}>{file.fileName}</li>
        ))}
      </ul>
      <Button
        className="mt-4"
        disabled={files.length === 0}
        onClick={() => onConfirm(files)}
      >
        Confirm & Proceed
      </Button>
    </div>
  );
}
