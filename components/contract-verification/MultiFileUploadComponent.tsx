import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function MultiFileUploadComponent({
  onConfirm,
}: {
  onConfirm: (files: { fileName: string; code: string }[]) => void;
}) {
  const [files, setFiles] = useState<{ fileName: string; code: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const fileReaders = Array.from(selectedFiles).map((file) => {
      return new Promise<{ fileName: string; code: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ fileName: file.name, code: ev.target?.result as string });
        };
        reader.readAsText(file);
      });
    });
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
