import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Step3ConstructorArgsProps {
  value: string;
  onSubmit: (args: string) => void;
  disabled?: boolean;
}

const Step3ConstructorArgs: React.FC<Step3ConstructorArgsProps> = ({
  value,
  onSubmit,
  disabled,
}) => {
  const [input, setInput] = useState(value || "");

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Constructor Arguments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="text-sm font-medium mb-2 block">
          Are there any constructor arguments? If so, please provide them;
          otherwise, type 'no' or 'na' to continue.
        </label>
        <input
          className="w-full p-3 border rounded-md bg-background text-sm"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="e.g. 0x1234... or no"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(input);
          }}
        />
        <button
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          onClick={() => onSubmit(input)}
          disabled={disabled || !input.trim()}
        >
          Continue
        </button>
      </CardContent>
    </Card>
  );
};

export default Step3ConstructorArgs;
