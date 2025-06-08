"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import ContractDetailsForm from "@/components/contract-verification/ContractDetailsForm";
import ContractLookupForm from "@/components/contract-lookup/ContractLookupForm";
import VerificationStatus from "@/components/contract-verification/VerificationStatus";
import AISuggestionsCard from "@/components/contract-verification/AISuggestionsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot } from "lucide-react";
import type { GetSourceCodeResponse, AISuggestion } from "@/types/coredao";

interface Message {
  id: string;
  sender: "user" | "ai";
  text?: string;
  component?: React.ReactNode;
  timestamp: Date;
}

type ActiveFlow =
  | null
  | "verifying_new"
  | "looking_up"
  | "showing_ai_suggestions"
  | "showing_verification_results"
  | "showing_lookup_results";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = (
    sender: "user" | "ai",
    text?: string,
    component?: React.ReactNode
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender,
        text,
        component,
        timestamp: new Date(),
      },
    ]);
  };

  useEffect(() => {
    addMessage(
      "ai",
      "👋 Hi there! I'm your AI assistant for smart contract verification. I'll help you verify your contract source code or look up an existing one on the Core blockchain.\n\nWhat would you like to do?\n\n1. **Verify a new contract** (type 'verify')\n2. **Look up an existing contract** (type 'lookup')\n\nEnsure your contract was deployed using the Shanghai EVM version for best results. Let's begin!"
    );
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleUserInput = () => {
    if (!userInput.trim()) return;
    addMessage("user", userInput);
    const command = userInput.trim().toLowerCase();
    setUserInput("");
    setActiveFlow(null); // Reset flow on new command

    if (command.includes("verify")) {
      addMessage(
        "ai",
        "Great! I'll help you verify a new contract. Please provide the contract details below."
      );
      setActiveFlow("verifying_new");
    } else if (command.includes("lookup")) {
      addMessage(
        "ai",
        "Sure, I can look up an existing contract. Please provide the contract address and network below."
      );
      setActiveFlow("looking_up");
    } else {
      addMessage(
        "ai",
        "I'm not sure how to help with that. You can try 'verify' to verify a new contract, or 'lookup' to find an existing one."
      );
    }
  };

  const handleVerificationComplete = (
    error: string | null,
    data?: {
      isLoading: boolean;
      isPolling: boolean;
      statusMessage: string | null;
      errorMessage: string | null;
      isVerified: boolean | null;
      verifiedSourceCode?: GetSourceCodeResponse["result"][0] | null;
      verifiedAbi?: string | null;
      guid?: string | null;
    }
  ) => {
    if (error) {
      addMessage("ai", `Verification process update: ${error}`);
    }
    if (data) {
      addMessage(
        "ai",
        undefined,
        <VerificationStatus
          {...data}
          loadingOperationName="Contract Verification"
        />
      );
    }
    setActiveFlow(null);
  };

  const handleLookupComplete = (
    error: string | null,
    data?: {
      isLoading: boolean;
      statusMessage: string | null;
      errorMessage: string | null;
      isVerified: boolean | null;
      verifiedSourceCode?: GetSourceCodeResponse["result"][0] | null;
      verifiedAbi?: string | null;
    }
  ) => {
    if (error) {
      addMessage("ai", `Lookup process update: ${error}`);
    }
    if (data) {
      addMessage(
        "ai",
        undefined,
        <VerificationStatus
          isLoading={data.isLoading}
          isPolling={false} // No polling for lookup
          statusMessage={data.statusMessage}
          errorMessage={data.errorMessage}
          isVerified={data.isVerified}
          verifiedSourceCode={data.verifiedSourceCode}
          verifiedAbi={data.verifiedAbi}
          loadingOperationName="Contract Lookup"
        />
      );
    }
    setActiveFlow(null);
  };

  const handleAISuggestions = (
    suggestions: AISuggestion | null,
    isLoading: boolean
  ) => {
    addMessage(
      "ai",
      undefined,
      <AISuggestionsCard suggestions={suggestions} isLoading={isLoading} />
    );
    // Potentially setActiveFlow('showing_ai_suggestions'); if we want to pause here.
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      <Header />
      <main className="flex-grow flex flex-col container mx-auto px-4 py-8 overflow-hidden">
        <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex items-end gap-2 max-w-[85%]`}>
                  {msg.sender === "ai" && (
                    <Avatar className="w-8 h-8 self-start">
                      <AvatarFallback>
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`p-3 rounded-xl shadow-md ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card text-card-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.text && (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                    {msg.component && <div>{msg.component}</div>}
                    <p className="text-xs opacity-60 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <Avatar className="w-8 h-8 self-start">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {activeFlow === "verifying_new" && (
          <div className="my-4 p-4 border-t border-border">
            <ContractDetailsForm
              onCompletion={handleVerificationComplete}
              onShowAISuggestions={handleAISuggestions}
            />
          </div>
        )}
        {activeFlow === "looking_up" && (
          <div className="my-4 p-4 border-t border-border">
            <ContractLookupForm onCompletion={handleLookupComplete} />
          </div>
        )}

        <div className="py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message or command (e.g., 'verify', 'lookup')..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUserInput()}
              className="flex-grow"
              disabled={
                activeFlow === "verifying_new" || activeFlow === "looking_up"
              }
            />
            <Button
              onClick={handleUserInput}
              disabled={
                activeFlow === "verifying_new" || activeFlow === "looking_up"
              }
            >
              <Send size={18} />
              <span className="ml-2">Send</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Core Smart Contract Verifier &copy; {new Date().getFullYear()} -
            Powered by CoreDAO
          </p>
        </div>
      </main>
    </div>
  );
}
