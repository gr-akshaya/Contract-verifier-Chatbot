import { ArrowUp, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input"; // adjust import to your actual component path
import { Button } from "@/components/ui/button";


export default function FooterInput({
  userInput,
  setUserInput,
  handleUserInput,
  isProcessing,
}: {
  userInput: string;
  setUserInput: (val: string) => void;
  handleUserInput: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-border bg-background sticky bottom-0">
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Paste contract address, type 'lookup', 'help', or ask me anything..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
          className="flex-grow border-none"
          disabled={isProcessing}
        />
        <Button
          onClick={handleUserInput}
          disabled={isProcessing || !userInput.trim()}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp size={18} />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Core Smart Contract Verifier AI © {new Date().getFullYear()}
      </p>
    </div>
  </div>
  );
}
