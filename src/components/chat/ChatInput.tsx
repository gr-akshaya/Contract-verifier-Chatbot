import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 m-2"
    >
      <div className="flex items-end rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-500 dark:focus-within:ring-primary-400">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-grow min-h-[40px] max-h-[120px] p-2 bg-transparent border-0 focus:ring-0 resize-none text-gray-900 dark:text-gray-100"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`p-2 mr-1 mb-1 rounded-lg ${
            !message.trim() || disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900"
          } transition-colors`}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
