import { ArrowUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="shrink-0 border-t border-border bg-background sticky bottom-0 z-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        {/* relative wrapper so send-button can be absolute and flush to the pill */}
        <div className="relative">
          {/* pill: fixed height so we can match button height visually */}
          <div className="w-full flex items-center rounded-full bg-neutral-800 pl-4 pr-20 h-14">
            <Input
              type="text"
              placeholder="Paste contract address, type 'lookup', 'help', or ask me anything..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
              disabled={isProcessing}
              // important: remove borders/shadows and force full height
              className="flex-grow bg-transparent border-0 shadow-none appearance-none
                         focus:outline-none focus:ring-0 placeholder:text-[#8A8A8A] text-neutral-200 h-full
                         py-0"
              style={{ border: "none", boxShadow: "none", outline: "none" }}
            />
          </div>

          {/* absolute send button sits on the right edge of the pill */}
          <Button
            onClick={handleUserInput}
            disabled={isProcessing || !userInput.trim()}
            aria-label="send"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0 rounded-full
                       h-12 w-12 flex items-center justify-center bg-white"
            // slight inline min sizes to be certain across UI libs:
            style={{ minWidth: 48, minHeight: 48 }}
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
