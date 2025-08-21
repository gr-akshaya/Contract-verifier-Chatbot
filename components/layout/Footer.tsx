import { Send } from "lucide-react";
import { Input } from "@/components/ui/input"; // adjust import to your actual component path

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
    <div className="bg-black sticky bottom-0">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col items-center">
        {/* Input + send button */}
        <div className="w-full flex items-center rounded-full bg-neutral-800 px-4 py-2">
          <Input
            type="text"
            placeholder="Paste contract address, type 'lookup', 'help', or ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
            disabled={isProcessing}
            className="flex-grow bg-transparent border-none focus-visible:ring-0 text-sm text-gray-200 placeholder:text-gray-400"
          />
          <button
            onClick={handleUserInput}
            disabled={isProcessing || !userInput.trim()}
            className="ml-2 shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
          >
            {isProcessing ? (
              <svg
                className="animate-spin w-4 h-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : (
              <Send size={16} className="text-black" />
            )}
          </button>
        </div>

        {/* Footer text */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Core Smart Contract Verifier AI © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
