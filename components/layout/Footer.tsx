/**
 * Footer Input Component
 *
 * This component provides the main input interface for the chat application.
 * It includes:
 * - Text input field for user messages
 * - Send button with loading state
 * - Keyboard navigation (Enter to send)
 * - Copyright information
 *
 * Features:
 * - Sticky positioning at bottom of screen
 * - Responsive design with proper spacing
 * - Loading state with spinner animation
 * - Disabled state during processing
 * - Auto-focus and keyboard shortcuts
 */

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
    <div className="shrink-0 border-t border-border bg-background sticky bottom-0">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <div className="relative">
          {/* Input container with rounded styling */}
          <div className="w-full flex items-center rounded-full bg-neutral-800 pl-4 pr-20 h-14">
            <Input
              type="text"
              placeholder="Paste contract address, type 'lookup', 'help', or ask me anything..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
              disabled={isProcessing}
              className="flex-grow placeholder:text-[#8A8A8A] text-neutral-200 h-full py-0"
              style={{
                border: "none",
                boxShadow: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          {/* Send button with loading state */}
          <Button
            onClick={handleUserInput}
            disabled={isProcessing || !userInput.trim()}
            aria-label="send"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-0 rounded-full h-12 w-12 flex items-center justify-center bg-white"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp size={18} />
            )}
          </Button>
        </div>

        {/* Copyright information */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Core Smart Contract Verifier AI © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
