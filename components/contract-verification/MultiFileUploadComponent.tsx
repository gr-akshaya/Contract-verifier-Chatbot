import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Props interface for the MultiFileUploadComponent
 */
interface MultiFileUploadComponentProps {
  /**
   * Callback function called when user confirms file selection
   * @param files - Array of file objects containing fileName and code content
   */
  onConfirm: (files: { fileName: string; code: string }[]) => void;
}

/**
 * Component for uploading multiple Solidity files (.sol) and JSON files (.json)
 * Allows users to select multiple files and read their content for contract verification
 */
export default function MultiFileUploadComponent({
  onConfirm,
}: MultiFileUploadComponentProps) {
  // State to store the list of uploaded files with their content
  const [files, setFiles] = useState<{ fileName: string; code: string }[]>([]);

  // Reference to the hidden file input element
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and reads file contents asynchronously
   * @param e - File input change event
   */
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Create an array of promises to read all selected files
    const fileReaders = Array.from(selectedFiles).map((file) => {
      return new Promise<{ fileName: string; code: string }>((resolve) => {
        const reader = new FileReader();

        // Handle successful file read
        reader.onload = (ev) => {
          resolve({
            fileName: file.name,
            code: ev.target?.result as string,
          });
        };

        // Read file as text content
        reader.readAsText(file);
      });
    });

    // Wait for all files to be read, then update state
    Promise.all(fileReaders).then((newFiles) => {
      setFiles((prev) => [...prev, ...newFiles]);
    });

    // Reset input value to allow selecting the same files again if needed
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {/* Hidden file input for file selection */}
      <input
        ref={inputRef}
        type="file"
        accept=".sol,.json" // Only allow Solidity and JSON files
        multiple // Allow multiple file selection
        style={{ display: "none" }}
        onChange={handleAddFiles}
      />

      {/* Button to trigger file selection dialog */}
      <Button onClick={() => inputRef.current?.click()}>Add Files</Button>

      {/* Display list of selected files */}
      <ul className="mt-2">
        {files.map((file, idx) => (
          <li key={idx}>{file.fileName}</li>
        ))}
      </ul>

      {/* Confirm button - only enabled when files are selected */}
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
