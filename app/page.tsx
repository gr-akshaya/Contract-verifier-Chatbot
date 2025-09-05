/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// React and Next.js imports
import React, { useState, useRef, useEffect } from "react";

// Component imports
import Header from "@/components/layout/Header";
import FooterInput from "@/components/layout/Footer";
import NetworkSelector from "../components/layout/NetworkOption";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import MultiFileUploadComponent from "@/components/contract-verification/MultiFileUploadComponent";

// Lucide React icons for UI elements
import {
  CheckCircle2, // Success/verified status
  XCircle, // Error/unverified status
  ExternalLink, // External links
  Copy, // Copy to clipboard
  Code, // Code-related actions
  Loader2, // Loading spinner
  Upload, // File upload
  FolderOpen, // Multiple files
  ArrowLeft, // Back navigation
} from "lucide-react";

// Core DAO API functions
import { getSourceCode, verifyContract, getAbi } from "@/lib/coredao";

// Constants and types
import { NETWORKS, LICENSE_TYPES } from "@/lib/constants";
import {
  type Network,
  type VerificationDetails,
  GetSourceCodeResponse,
  LicenseType,
} from "@/types/coredao";
import { toast } from "sonner";

/**
 * Message interface for chat messages
 * Represents individual messages in the conversation
 */
interface Message {
  id: string; // Unique identifier for the message
  sender: "user" | "ai"; // Who sent the message
  text?: string; // Text content of the message
  component?: React.ReactNode; // React component for rich content
  timestamp: Date; // When the message was created
  isTyping?: boolean; // Whether this is a typing indicator
}

// Regular expression to match Ethereum contract addresses (40 hex characters after 0x)
const CONTRACT_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

// Available commands that users can type
const AVAILABLE_COMMANDS = [
  { command: "verify", description: "Verify a new smart contract" },
  { command: "lookup", description: "Look up an existing contract" },
  { command: "help", description: "Show available commands" },
  { command: "clear", description: "Clear chat history" },
];

/**
 * Main Home component - Core Smart Contract Verifier Chatbot
 *
 * This component provides a conversational interface for:
 * - Looking up existing smart contracts
 * - Verifying new smart contracts on Core blockchain
 * - Managing verification sessions with step-by-step guidance
 */
export default function Home() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]); // Chat messages
  const [userInput, setUserInput] = useState(""); // Current user input
  const [isProcessing, setIsProcessing] = useState(false); // Loading state
  const [verificationSession, setVerificationSession] = useState<{
    // Current verification session
    address: string; // Contract address being verified
    network: Network; // Network (mainnet/testnet)
    step: number; // Current step in verification process
    data: Partial<
      // Verification data
      VerificationDetails & {
        compilerType: string; // Type of compiler (single/multi/json)
        sourceCode: string; // Contract source code
        //sourceCodes?: { code: string; fileName: string }[];       // Multi-file sources (commented out)
      }
    >;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Reference to scroll area for auto-scroll

  /**
   * Adds a new message to the chat
   * @param sender - Who sent the message ("user" or "ai")
   * @param text - Text content (optional)
   * @param component - React component for rich content (optional)
   * @param isTyping - Whether this is a typing indicator (default: false)
   */
  const addMessage = (
    sender: "user" | "ai",
    text?: string,
    component?: React.ReactNode,
    isTyping: boolean = false
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(), // Generate unique ID
        sender,
        text,
        component,
        timestamp: new Date(),
        isTyping,
      },
    ]);
  };

  /**
   * Adds a typing indicator message
   * @returns The ID of the typing message for later removal
   */
  const addTypingMessage = () => {
    const typingId = "typing-" + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: "ai",
        timestamp: new Date(),
        isTyping: true,
      },
    ]);
    return typingId;
  };

  /**
   * Removes a typing indicator message
   * @param typingId - The ID of the typing message to remove
   */
  const removeTypingMessage = (typingId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== typingId));
  };

  /**
   * Load cached messages from localStorage on component mount
   * If no cached messages exist, show welcome message
   */
  useEffect(() => {
    const cachedMessages = localStorage.getItem("core-chatbot-messages");
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp), // Convert timestamp back to Date object
          }))
        );
      } catch (error) {
        console.error("Failed to load cached messages:", error);
      }
    } else {
      // Show welcome message for new users
      addMessage(
        "ai",
        "**Welcome to Core Smart Contract Verifier!**\n\n** What I can do for you:**\n\n🔍 **Contract Lookup** - Drop any contract address & get instant insights!\n⚡ **Contract Verification** - I'll guide you through verification step-by-step\n🧠 **Smart Features** - Auto-detection of contracts and easy verification process\n\n**Try these:**\n  • Paste: `0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`\n  • Type: `verify 0x123...` \n  • Type: `help` for command list\n\n Ready to verify your contracts? Let's go!"
      );
    }
  }, []);

  /**
   * Save messages to localStorage whenever messages change
   * Filters out components to avoid circular reference issues
   */
  useEffect(() => {
    if (messages.length > 0) {
      // Filter out components before saving to localStorage since they contain circular references
      const serializableMessages = messages.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ component, ...rest }) => rest
      );
      localStorage.setItem(
        "core-chatbot-messages",
        JSON.stringify(serializableMessages)
      );
    }
  }, [messages]);

  /**
   * Auto-scroll to bottom when new messages are added
   * Uses multiple delayed scrolls for smooth animation
   */
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;

          // Multiple delayed scrolls for smooth animation
          const delays = [50, 100, 200, 500];

          delays.forEach((delay) => {
            setTimeout(() => {
              if (scrollElement) {
                scrollElement.scrollTo({
                  top: scrollElement.scrollHeight,
                  behavior: delay > 100 ? "smooth" : "auto",
                });
              }
            }, delay);
          });
        }
      }
    };

    if (messages.length > 0) {
      setTimeout(scrollToBottom, 10);
    }
  }, [messages]);

  /**
   * Extracts contract address from user input using regex
   * @param input - User input string
   * @returns Contract address if found, null otherwise
   */
  const extractContractAddress = (input: string): string | null => {
    const matches = input.match(CONTRACT_ADDRESS_REGEX);
    return matches ? matches[0] : null;
  };

  /**
   * Detects network from user input keywords
   * @param input - User input string
   * @returns Network type or undefined if not specified
   */
  const detectNetwork = (input: string): Network | undefined => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("testnet") || lowerInput.includes("test")) {
      return "testnet2";
    }
    if (lowerInput.includes("mainnet") || lowerInput.includes("main")) {
      return "mainnet";
    }
    return undefined; // Nothing specified
  };

  /**
   * Formats contract information into a displayable component
   * @param contractData - Contract data from API
   * @param network - Network the contract is on
   * @param address - Contract address
   * @returns JSX component displaying contract information
   */
  const formatContractInfo = (
    contractData: GetSourceCodeResponse["result"][0],
    network: Network,
    address: string
  ) => {
    const isVerified = contractData.ABI !== "Contract source code not verified";
    const networkInfo = NETWORKS.find((n) => n.value === network);

    return (
      <div className="contract-cards-wrapper">
        <div className="contract-card">
          {/* Header with verification status */}
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code className="w-5 h-5" /> Contract Information
            </h3>

            {/* Verification status badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isVerified ? "bg-black text-green-500" : "bg-black text-red-500"
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Not Verified
                </>
              )}
            </div>
          </div>

          {/* Contract details grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Network</span>
              <span className="text-sm mt-1">
                {networkInfo?.label || network}
              </span>

              {/* Show compiler version if verified */}
              {isVerified && (
                <>
                  <span className="text-xs text-muted-foreground mt-4">
                    Compiler Version
                  </span>
                  <span className="text-sm mt-1">
                    {contractData.CompilerVersion || "Unknown"}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Contract Name
              </span>
              <span className="text-sm mt-1">
                {contractData.ContractName || "Unknown"}
              </span>

              {/* Show optimization settings if verified */}
              {isVerified && (
                <>
                  <span className="text-xs text-muted-foreground mt-4">
                    Optimization
                  </span>
                  <span className="text-sm mt-1">
                    {contractData.OptimizationUsed === "1"
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-6"></div>

          {/* Contract address with copy functionality */}
          <div className="mb-6">
            <div className="text-xs text-muted-foreground mb-2">
              Contract Address
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={address}
                className="w-full rounded-md bg-muted/60 px-3 py-2 text-sm pr-10 border-none outline-none"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-foreground/5"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied to clipboard");
                }}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Source code display (only for verified contracts) */}
          {isVerified && contractData.SourceCode && (
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-2">
                Source Code
              </div>
              <div className="rounded-md bg-muted/60 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {contractData.ContractName || "Contract"}
                  </span>
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-foreground/5"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        contractData.SourceCode || ""
                      );
                      toast.success("Source code copied to clipboard");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {/* Source code display with syntax highlighting */}
                <div
                  className="rounded-md bg-black text-white text-xs font-mono p-3 max-h-56 overflow-y-auto"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 500,
                    fontStyle: "normal",
                    fontSize: "14px",
                    lineHeight: "140%",
                    letterSpacing: "0",
                    whiteSpace: "pre-wrap", // Preserves code formatting
                  }}
                >
                  {(() => {
                    // Parse and display source code
                    let parsed: any = null;
                    try {
                      let code = contractData.SourceCode.trim();
                      // Remove quotes if present
                      if (
                        (code.startsWith('"') && code.endsWith('"')) ||
                        (code.startsWith("'") && code.endsWith("'"))
                      ) {
                        code = code.slice(1, -1);
                      }
                      // Clean up JSON formatting
                      code = code
                        .replace(/^\s*{\s*{+/, "{")
                        .replace(/}+}\s*$/, "}");
                      parsed = JSON.parse(code);
                    } catch {
                      parsed = null;
                    }

                    // Handle multi-file source code (Standard JSON Input)
                    if (
                      parsed &&
                      typeof parsed === "object" &&
                      parsed.sources &&
                      typeof parsed.sources === "object"
                    ) {
                      return (
                        <div>
                          {Object.entries(parsed.sources).map(
                            ([fileName, fileObj]: [string, any]) => (
                              <div key={fileName} className="mb-4">
                                <div className="font-bold text-xs mb-1">
                                  {fileName}
                                </div>
                                <pre className="whitespace-pre-wrap">
                                  {(fileObj as any).content?.substring(
                                    0,
                                    600
                                  ) || ""}
                                  {((fileObj as any).content?.length || 0) > 600
                                    ? "..."
                                    : ""}
                                </pre>
                              </div>
                            )
                          )}
                        </div>
                      );
                    } else {
                      // Handle single file source code
                      return (
                        <pre className="whitespace-pre-wrap">
                          {contractData.SourceCode.substring(0, 600)}
                          {contractData.SourceCode.length > 600 ? "..." : ""}
                        </pre>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* View on Explorer button */}
            <button
              type="button"
              className="w-full rounded-full py-2 px-4 inline-flex items-center justify-center gap-2 bg-muted/60 hover:bg-muted/70"
              onClick={() => {
                const explorerUrl =
                  network === "mainnet"
                    ? `https://scan.coredao.org/address/${address}`
                    : `https://scan.test2.btcs.network/address/${address}`;
                window.open(explorerUrl, "_blank");
              }}
            >
              <span className="text-sm">View on Explorer</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Copy ABI button (only for verified contracts) */}
            {isVerified && (
              <button
                type="button"
                className="w-full rounded-full py-2 px-4 inline-flex items-center justify-center gap-2 bg-muted/60 hover:bg-muted/70"
                onClick={() => {
                  navigator.clipboard.writeText(contractData.ABI || "");
                  toast.success("ABI copied to clipboard");
                }}
              >
                <span className="text-sm">Copy ABI</span>
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Handles contract lookup functionality
   * @param address - Contract address to lookup
   * @param network - Network to search on
   */
  const handleContractLookup = async (address: string, network: Network) => {
    const typingId = addTypingMessage();
    setIsProcessing(true);

    try {
      const sourceCodeResponse = await getSourceCode(network, address);
      removeTypingMessage(typingId);

      if (sourceCodeResponse.result && sourceCodeResponse.result.length > 0) {
        const contractData = sourceCodeResponse.result[0];
        const isVerified =
          contractData.ABI !== "Contract source code not verified";

        // Display contract information
        addMessage(
          "ai",
          undefined,
          formatContractInfo(contractData, network, address)
        );

        // Provide next steps based on verification status
        if (isVerified) {
          addMessage(
            "ai",
            "💡 **What's next?**\n• Copy the source code or ABI using the buttons above\n• View the contract on the block explorer\n• Ask me to lookup another contract!\n\nJust paste another address or type `help` for more options."
          );
        } else {
          addMessage(
            "ai",
            `**Want to verify this contract?**\n\nI found your contract, but it's not verified yet. Verification makes your smart contract more trustworthy and transparent. Here's what you can do:\n\n• Type \`verify ${address}\` to start verification\n• Make sure you have the exact source code and compiler settings\n\nReady to verify? Just type \`verify ${address}\`!`
          );
        }
      } else {
        addMessage(
          "ai",
          ` **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }.\n\n**Double-check:**\n• The address is correct\n• The contract is deployed on the right network\n• Try the other network (mainnet/testnet)\n\nWant to try a different address or network?`
        );
      }
    } catch (error) {
      removeTypingMessage(typingId);
      console.error("Error looking up contract:", error);
      addMessage(
        "ai",
        ` **Lookup failed**\n\nSorry, I encountered an error while looking up the contract:\n\`${
          error instanceof Error ? error.message : "Unknown error"
        }\`\n\nPlease try again or check if the Core blockchain API is accessible.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Creates verification step component for the multi-step verification process
   * @param step - Current step number
   * @param sessionData - Current session data
   * @returns JSX component for the verification step
   */
  const createVerificationStepComponent = (step: number, sessionData: any) => {
    const renderStepContent = () => {
      switch (step) {
        case 1:
          // Step 1: Display contract address and network
          return (
            <div className="space-y-6 ">
              <div>
                <label className="text-sm font-medium">Contract Address</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {sessionData.address}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Network</label>
                <p className="text-sm">
                  {sessionData.network === "mainnet"
                    ? "Core Mainnet"
                    : "Core Testnet"}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 **Tip:** Make sure your source code is the exact same code
                  that was used to deploy the contract. Any differences will
                  cause verification to fail.
                </p>
              </div>
            </div>
          );
        case 2:
          // Step 2: Compiler type selection
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Compiler Type
                </label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={sessionData.compilerType || "solidity-single"}
                  onChange={(e) => {
                    if (verificationSession) {
                      let compilerDescription: string;
                      if (e.target.value === "solidity-single") {
                        compilerDescription = "Single Solidity File";
                      } else if (e.target.value === "solidity-multi") {
                        compilerDescription = "Multiple Solidity Files";
                      } else {
                        compilerDescription = "Solidity Standard JSON Input";
                      }

                      // Add user message
                      addMessage("user", `Selected: ${compilerDescription}`);

                      // Update session state and advance to next step
                      setVerificationSession((prev) =>
                        prev
                          ? {
                              ...prev,
                              step: 3,
                              data: {
                                ...prev.data,
                                compilerType: e.target.value as
                                  | "solidity-single"
                                  | "solidity-multi"
                                  | "solidity-json",
                              },
                            }
                          : null
                      );

                      // Add AI response for next step
                      addMessage(
                        "ai",
                        ` **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them, otherwise, type 'no' or 'na' to continue.`
                      );
                    }
                  }}
                >
                  <option value="solidity-single">Single Solidity File</option>
                  <option value="solidity-multi">
                    Multiple Solidity Files
                  </option>
                  <option value="solidity-json">
                    Solidity Standard JSON Input
                  </option>
                </select>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  **Selected:**{" "}
                  {sessionData.compilerType === "solidity-single"
                    ? "Single Solidity File"
                    : sessionData.compilerType === "solidity-multi"
                    ? "Multiple Solidity Files"
                    : "Solidity Standard JSON Input"}
                </p>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="contract-cards-wrapper">
        <Card className="contract-card no-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Contract Verification - Step {step} of 6
              </CardTitle>
              {/* Back button for steps after 1 */}
              {step > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (verificationSession) {
                      setVerificationSession({
                        ...verificationSession,
                        step: step - 1,
                      });
                      // Add message to indicate going back
                      addMessage(
                        "ai",
                        `Going back to Step ${step - 1}...`,
                        createVerificationStepComponent(
                          step - 1,
                          verificationSession
                        )
                      );
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            {/* Additional back button at bottom */}
            {step > 1 && (
              <div className="flex justify-start mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (verificationSession) {
                      setVerificationSession({
                        ...verificationSession,
                        step: step - 1,
                      });
                      addMessage(
                        "ai",
                        `Going back to Step ${step - 1}...`,
                        createVerificationStepComponent(
                          step - 1,
                          verificationSession
                        )
                      );
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Previous Step
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Starts the verification flow for a contract
   * @param address - Contract address to verify
   * @param network - Network the contract is on
   */
  const startVerificationFlow = async (address: string, network: Network) => {
    console.log("Verifyy");
    const typingId = addTypingMessage();

    try {
      // Check if contract exists and get current status
      const sourceCodeResponse = await getSourceCode(network, address);
      removeTypingMessage(typingId);

      if (sourceCodeResponse.result && sourceCodeResponse.result.length > 0) {
        const contractData = sourceCodeResponse.result[0];
        const isVerified =
          contractData.ABI !== "Contract source code not verified";

        // If already verified, show contract info and exit
        if (isVerified) {
          addMessage(
            "ai",
            ` **Contract already verified!**\n\nThe contract at \`${address}\` is already verified on ${
              network === "mainnet" ? "Core Mainnet" : "Core Testnet"
            }.\n\n${
              contractData.ContractName
                ? `**Contract Name:** ${contractData.ContractName}`
                : ""
            }\n**Compiler:** ${
              contractData.CompilerVersion
            }\n\nWould you like to lookup another contract?`
          );

          addMessage(
            "ai",
            undefined,
            formatContractInfo(contractData, network, address)
          );
          return;
        }

        // Initialize verification session
        setVerificationSession({
          address,
          network,
          step: 1,
          data: {
            network,
            contractAddress: address,
            evmVersion: "shanghai",
            optimizationUsed: "0",
            runs: 200,
            licenseType: LicenseType.MIT,
          },
        });

        // Start verification process
        addMessage(
          "ai",
          `**Starting verification for contract:** \`${address}\`\n\n**Network:** ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }\n\nLet's gather the required information step by step. I'll guide you through each step with proper forms and dropdown menus.\n\n**Step 1 of 7: Source Code**\nPlease provide your contract's source code in one of the following ways:`,
          createVerificationStepComponent(1, { address, network })
        );

        // Add source code input options
        addMessage(
          "ai",
          undefined,
          <div className="contract-cards-wrapper">
            <Card className="contract-card no-background">
              <CardHeader>
                <CardTitle>Source Code Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Paste Code Button */}
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    onClick={() => {
                      addMessage("user", "I'll paste my source code");
                      addMessage(
                        "ai",
                        "Perfect! Please paste your complete Solidity source code below. Make sure it includes all contracts, imports, and dependencies:",
                        <div className="contract-cards-wrapper">
                          <Card className="contract-card no-background">
                            <CardContent className="p-4">
                              <Textarea
                                placeholder="Paste your Solidity source code here..."
                                className="min-h-[300px] font-mono whitespace-pre preserve-whitespace"
                                style={{
                                  wordBreak: "normal",
                                  whiteSpace: "pre",
                                }}
                                onPaste={(e) => {
                                  const pastedText =
                                    e.clipboardData.getData("text");
                                  if (pastedText) {
                                    e.preventDefault();
                                    const textarea =
                                      e.target as HTMLTextAreaElement;
                                    textarea.value = pastedText;
                                    // Don't auto-submit on paste to allow user to verify the code first
                                  }
                                }}
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="off"
                                // Removed auto-submission on change to prevent premature processing
                              />
                              <div className="mt-4 flex justify-end">
                                <Button
                                  onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                  ) => {
                                    const textarea = e.currentTarget
                                      .parentElement
                                      ?.previousElementSibling as HTMLTextAreaElement;

                                    if (textarea) {
                                      const sourceCode = textarea.value;

                                      if (sourceCode.trim().length > 50) {
                                        // Add user message
                                        addMessage(
                                          "user",
                                          "Submitting contract source code..."
                                        );
                                        setVerificationSession({
                                          address,
                                          network,
                                          step: 1,
                                          data: {
                                            network,
                                            contractAddress: address,
                                            evmVersion: "shanghai",
                                            optimizationUsed: "0",
                                            runs: 200,
                                            licenseType: LicenseType.MIT,
                                            sourceCode: sourceCode,
                                          },
                                        });
                                        // Process the input
                                        setTimeout(() => {
                                          handleVerificationInput(sourceCode);
                                        }, 100);
                                      } else {
                                        addMessage(
                                          "ai",
                                          "⚠️ **Source code seems too short**\n\nPlease provide the complete Solidity source code. It should typically be more than a few lines long."
                                        );
                                      }
                                    }
                                  }}
                                >
                                  Submit Code
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    }}
                  >
                    <Code className="w-6 h-6 mb-2" />
                    Paste Code
                  </Button>
                  {/* Upload File Button */}
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = false; // Only allow one file
                      input.accept = ".sol,.json";
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length === 1) {
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const content = e.target?.result as string;
                            addMessage(
                              "user",
                              `📁 Uploaded file: ${file.name}`
                            );
                            // Process as single file
                            setVerificationSession((prev: any) =>
                              prev
                                ? {
                                    ...prev,
                                    data: {
                                      ...prev.data,
                                      compilerType: file.name.endsWith(".json")
                                        ? "solidity-json"
                                        : "solidity-single",
                                      sourceCode: content,
                                    },
                                  }
                                : null
                            );
                            handleVerificationInput(content);
                          };
                          reader.readAsText(file);
                        } else {
                          addMessage(
                            "ai",
                            "⚠️ Please select exactly one .sol or .json file."
                          );
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-6 h-6 mb-2" />
                    Upload File
                  </Button>
                  {/* Multiple Files Button */}
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    onClick={() => {
                      // Show multi-file upload component
                      addMessage("user", "📋 I'll use multiple files");
                      addMessage(
                        "ai",
                        undefined,
                        <MultiFileUploadComponent
                          onConfirm={(files) => {
                            // Store files and advance to next step
                            setVerificationSession((prev: any) =>
                              prev
                                ? {
                                    ...prev,
                                    step: 2, // Move to compiler type selection
                                    data: {
                                      ...prev.data,
                                      compilerType: "solidity-json",
                                      multiFileSources: files,
                                    },
                                  }
                                : null
                            );
                            addMessage(
                              "ai",
                              " **Files uploaded!**\n\n**Step 2 of 6: Compiler Type**\nWhat type of source code are you providing?",
                              <Card className="w-full max-w-3xl mx-auto mt-4">
                                <CardHeader>
                                  <CardTitle>
                                    📝 Compiler Type Selection
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Select the compiler type that matches your
                                      source code
                                    </label>
                                    <select
                                      className="w-full p-3 border rounded-md bg-background text-sm"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          let compilerDescription: string;
                                          if (
                                            e.target.value === "solidity-single"
                                          ) {
                                            compilerDescription =
                                              "Single Solidity File";
                                          } else if (
                                            e.target.value === "solidity-multi"
                                          ) {
                                            compilerDescription =
                                              "Multiple Solidity Files";
                                          } else {
                                            compilerDescription =
                                              "Solidity Standard JSON Input";
                                          }

                                          setVerificationSession((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  step: 3,
                                                  data: {
                                                    ...prev.data,
                                                    compilerType: e.target
                                                      .value as
                                                      | "solidity-single"
                                                      | "solidity-multi"
                                                      | "solidity-json",
                                                  },
                                                }
                                              : null
                                          );

                                          addMessage(
                                            "user",
                                            `Selected: ${compilerDescription}`
                                          );

                                          addMessage(
                                            "ai",
                                            ` **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them; otherwise, type 'no' or 'na' to continue.`
                                          );
                                        }
                                      }}
                                      defaultValue="solidity-json"
                                    >
                                      <option value="solidity-single">
                                        Single Solidity File (most common)
                                      </option>
                                      <option value="solidity-multi">
                                        Multiple Solidity Files (with imports)
                                      </option>
                                      <option value="solidity-json">
                                        Solidity Standard JSON Input (from
                                        Hardhat/Truffle)
                                      </option>
                                    </select>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      💡 **Tip:** If you&apos;re not sure,
                                      choose &quot;Single Solidity File&quot; -
                                      it&apos;s the most common option.
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }}
                        />
                      );
                    }}
                  >
                    <FolderOpen className="w-6 h-6 mb-2" />
                    Multiple Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      } else {
        addMessage(
          "ai",
          ` **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }.\n\nPlease make sure:\n• The contract address is correct\n• The contract is deployed\n• You're using the right network\n\nTry again with a different address or network.`
        );
      }
    } catch (error) {
      removeTypingMessage(typingId);
      addMessage(
        "ai",
        `**Error checking contract**\n\nSorry, I couldn't check the contract status: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease try again.`
      );
    }
  };

  /**
   * Handles verification input for each step of the verification process
   * @param input - User input for the current step
   */
  const handleVerificationInput = async (input: string) => {
    const step = verificationSession?.step || 1;

    // Handle back navigation
    if (input.toLowerCase() === "back" && step > 1) {
      setVerificationSession((prev) =>
        prev
          ? {
              ...prev,
              step: step - 1,
            }
          : null
      );
      addMessage(
        "ai",
        `Going back to Step ${step - 1}...`,
        createVerificationStepComponent(step - 1, verificationSession)
      );
      return;
    }

    switch (step) {
      case 1:
        // Step 1: Source code validation
        if (input.trim().length < 50) {
          addMessage(
            "ai",
            "⚠️ **Source code seems too short**\n\nPlease provide the complete Solidity source code. It should typically be at least a few lines long."
          );
          return;
        }

        // Update session and move to step 2
        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 2,
                data: { ...prev.data, sourceCode: input },
              }
            : null
        );

        // Show compiler type selection
        addMessage(
          "ai",
          " **Source code received!**\n\n**Step 2 of 6: Compiler Type**\nWhat type of source code are you providing?",
          <Card className="contract-card no-background">
            <CardHeader>
              <CardTitle>Compiler Type Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select the compiler type that matches your source code
                </label>
                <select
                  className="w-full p-3 border rounded-md bg-background text-sm"
                  // style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  onChange={(e) => {
                    // console.log("target value", e.target.value);
                    // console.log("verificationSession", verificationSession);
                    if (e.target.value) {
                      let compilerDescription: string;
                      if (e.target.value === "solidity-single") {
                        compilerDescription = "Single Solidity File";
                      } else if (e.target.value === "solidity-multi") {
                        compilerDescription = "Multiple Solidity Files";
                      } else {
                        compilerDescription = "Solidity Standard JSON Input";
                      }

                      // Update session state
                      setVerificationSession((prev) =>
                        prev
                          ? {
                              ...prev,
                              step: 3,
                              data: {
                                ...prev.data,
                                compilerType: e.target.value as
                                  | "solidity-single"
                                  | "solidity-multi"
                                  | "solidity-json",
                              },
                            }
                          : null
                      );

                      // Add user message
                      addMessage("user", `Selected: ${compilerDescription}`);

                      // Add AI response for next step
                      addMessage(
                        "ai",
                        ` **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them; otherwise, type no' or 'na' to continue.`
                      );
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select compiler type...
                  </option>
                  <option value="solidity-single">
                    Single Solidity File (most common)
                  </option>
                  <option value="solidity-multi">
                    Multiple Solidity Files (with imports)
                  </option>
                  <option value="solidity-json">
                    Solidity Standard JSON Input (from Hardhat/Truffle)
                  </option>
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 **Tip:** If you&apos;re not sure, choose &quot;Single
                  Solidity File&quot; - it&apos;s the most common option.
                </p>
              </div>
            </CardContent>
          </Card>
        );
        break;

      case 3:
        // Step 3: Constructor arguments
        if (!input.trim()) {
          addMessage(
            "ai",
            "⚠️ **Constructor Arguments is required**\n\nPlease provide if any else type 'no' to continue."
          );
          return;
        }

        // Update session and move to step 4
        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 4,
                data: { ...prev.data, constructorArguments: input.trim() },
              }
            : null
        );

        // Show compiler version selection
        addMessage(
          "ai",
          " **Constructor Arguments set!**\n\n**Step 4 of 6: Compiler Version**\nWhich Solidity compiler version did you use?\n\nPlease select from the dropdown below:",
          <Card className="contract-card no-background">
            <CardHeader>
              <CardTitle>Compiler Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  className="w-full p-3 border rounded-md bg-background text-sm"
                  onChange={(e) => {
                    if (verificationSession && e.target.value) {
                      // Update session with compiler version
                      setVerificationSession((prev) => {
                        if (!prev) return null;

                        const newState = {
                          ...prev,
                          step: 5,
                          data: {
                            ...prev.data,
                            compilerVersion: e.target.value,
                          },
                        };
                        return newState;
                      });

                      addMessage("user", `Selected: ${e.target.value}`);

                      // Show EVM version selection
                      addMessage(
                        "ai",
                        " **Compiler version set!**\n\n**Step 5 of 6: EVM Version**\nPlease select the EVM version used during compilation:",
                        <Card className="contract-card no-background">
                          <CardHeader>
                            <CardTitle>EVM Version</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <select
                                className="w-full p-3 border rounded-md bg-background text-sm"
                                onChange={(ev) => {
                                  if (ev.target.value) {
                                    setVerificationSession((prev) => {
                                      if (!prev) return null;

                                      //console.log("Previous data:", prev.data);
                                      return {
                                        ...prev,
                                        step: 6, // Move to optimization step
                                        data: {
                                          ...prev.data,
                                          evmVersion: ev.target.value,
                                        },
                                      };
                                    });

                                    // Add user message
                                    addMessage(
                                      "user",
                                      `Selected EVM version: ${ev.target.value}`
                                    );

                                    // Add AI response for optimization step
                                    addMessage(
                                      "ai",
                                      " **EVM version set!**\n\n**Step 6 of 7: Optimization Settings**\nWas optimization enabled during compilation?",
                                      <Card className="contract-card no-background">
                                        <CardHeader>
                                          <CardTitle>
                                            Optimization Settings
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">
                                              Was optimization enabled during
                                              compilation?
                                            </label>
                                            <select
                                              className="w-full p-3 border rounded-md bg-background text-sm"
                                              onChange={(e) => {
                                                if (e.target.value) {
                                                  const isEnabled =
                                                    e.target.value === "1";

                                                  setVerificationSession(
                                                    (prev) => {
                                                      if (!prev) return null;
                                                      return {
                                                        ...prev,
                                                        step: 7, // Move to license step
                                                        data: {
                                                          ...prev.data,
                                                          optimizationUsed: e
                                                            .target.value as
                                                            | "0"
                                                            | "1",
                                                          runs: isEnabled
                                                            ? prev.data.runs ||
                                                              200
                                                            : 200,
                                                        },
                                                      };
                                                    }
                                                  );

                                                  addMessage(
                                                    "user",
                                                    `Selected: ${
                                                      isEnabled
                                                        ? "Optimization enabled"
                                                        : "Optimization disabled"
                                                    }`
                                                  );

                                                  if (isEnabled) {
                                                    addMessage(
                                                      "ai",
                                                      "**Optimization enabled!** How many optimization runs were used?",
                                                      <Card className="w-full max-w-md mx-auto mt-2">
                                                        <CardContent className="pt-4">
                                                          <input
                                                            type="number"
                                                            placeholder="200"
                                                            className="w-full p-2 border rounded-md bg-background"
                                                            onChange={(e) => {
                                                              if (
                                                                e.target.value
                                                              ) {
                                                                setVerificationSession(
                                                                  (prev) => {
                                                                    if (!prev)
                                                                      return null;

                                                                    return {
                                                                      ...prev,
                                                                      data: {
                                                                        ...prev.data,
                                                                        runs: parseInt(
                                                                          e
                                                                            .target
                                                                            .value
                                                                        ),
                                                                      },
                                                                    };
                                                                  }
                                                                );
                                                              }
                                                            }}
                                                          />
                                                          <p className="text-xs text-muted-foreground mt-1">
                                                            Default is usually
                                                            200
                                                          </p>
                                                        </CardContent>
                                                      </Card>
                                                    );
                                                  }

                                                  // Add AI response for license step
                                                  addMessage(
                                                    "ai",
                                                    " **Optimization settings complete!**\n\n**Step 7 of 7: License Type**\nPlease select the license type for your contract:",
                                                    <Card className="contract-card no-background">
                                                      <CardHeader>
                                                        <CardTitle>
                                                          License Type
                                                        </CardTitle>
                                                      </CardHeader>
                                                      <CardContent className="space-y-4">
                                                        <div>
                                                          <label className="text-sm font-medium mb-2 block">
                                                            Select the license
                                                            type for your
                                                            contract
                                                          </label>
                                                          <select
                                                            className="w-full p-3 border rounded-md bg-background text-sm"
                                                            onChange={(e) => {
                                                              if (
                                                                e.target.value
                                                              ) {
                                                                setVerificationSession(
                                                                  (prev) => {
                                                                    if (!prev)
                                                                      return null;

                                                                    const updatedSession =
                                                                      {
                                                                        ...prev,
                                                                        data: {
                                                                          ...prev.data,
                                                                          licenseType:
                                                                            e
                                                                              .target
                                                                              .value as any,
                                                                        },
                                                                      };

                                                                    // Store the updated session for immediate use
                                                                    const finalSession =
                                                                      updatedSession;

                                                                    addMessage(
                                                                      "user",
                                                                      `Selected license: ${e.target.value}`
                                                                    );

                                                                    // Final step - show verification ready message with callback
                                                                    // Only add this message once to prevent duplicates
                                                                    setTimeout(
                                                                      () => {
                                                                        addMessage(
                                                                          "ai",
                                                                          " **All settings complete!**\n\n**Ready to Verify**\nPerfect! I have all the information needed:\n\n• **Source Code** \n• **Compiler Type** \n• **Constructor Arguments ** \n• **Compiler Version** \n• **EVM Version** \n• **Optimization** " +
                                                                            (isEnabled
                                                                              ? "Enabled"
                                                                              : "Disabled") +
                                                                            "\n• **License:** \n\nClick the button below to start the verification process!",
                                                                          <div className="mt-4 flex justify-center">
                                                                            <Button
                                                                              onClick={() => {
                                                                                // Use the captured session data directly
                                                                                executeVerification(
                                                                                  finalSession
                                                                                );
                                                                              }}
                                                                              className="px-8 py-3 text-lg"
                                                                              disabled={
                                                                                isProcessing
                                                                              }
                                                                            >
                                                                              {isProcessing ? (
                                                                                <>
                                                                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                                                  Verifying...
                                                                                </>
                                                                              ) : (
                                                                                "Start Verification"
                                                                              )}
                                                                            </Button>
                                                                          </div>
                                                                        );
                                                                      },
                                                                      0
                                                                    );

                                                                    return updatedSession;
                                                                  }
                                                                );
                                                              }
                                                            }}
                                                            defaultValue=""
                                                          >
                                                            <option
                                                              value=""
                                                              disabled
                                                            >
                                                              Select license
                                                              type...
                                                            </option>
                                                            <option value="Unlicensed">
                                                              No License (None)
                                                            </option>
                                                            <option value="Unlicense">
                                                              The Unlicense
                                                              (Unlicense)
                                                            </option>
                                                            <option value="MIT">
                                                              MIT License (MIT)
                                                            </option>
                                                            <option value="GNU GPLv2">
                                                              GNU General Public
                                                              License v2.0 (GNU
                                                              GPLv2)
                                                            </option>
                                                            <option value="GNU GPLv3">
                                                              GNU General Public
                                                              License v3.0 (GNU
                                                              GPLv3)
                                                            </option>
                                                            <option value="GNU LGPLv2.1">
                                                              GNU Lesser General
                                                              Public License
                                                              v2.1 (GNU
                                                              LGPLv2.1)
                                                            </option>
                                                            <option value="GNU LGPLv3">
                                                              GNU Lesser General
                                                              Public License
                                                              v3.0 (GNU LGPLv3)
                                                            </option>
                                                            <option value="BSD-2-Clause">
                                                              BSD 2-clause
                                                              Simplified license
                                                              (BSD-2-Clause)
                                                            </option>
                                                            <option value="BSD-3-Clause">
                                                              BSD 3-clause New
                                                              Or Revised license
                                                              (BSD-3-Clause)
                                                            </option>
                                                            <option value="MPL-2.0">
                                                              Mozilla Public
                                                              License 2.0
                                                              (MPL-2.0)
                                                            </option>
                                                            <option value="OSL-3.0">
                                                              Open Software
                                                              License 3.0
                                                              (OSL-3.0)
                                                            </option>
                                                            <option value="Apache-2.0">
                                                              Apache 2.0
                                                              (Apache-2.0)
                                                            </option>
                                                            <option value="GNU AGPLv3">
                                                              GNU Affero General
                                                              Public License
                                                              (GNU AGPLv3)
                                                            </option>
                                                            <option value="BSL-1.1">
                                                              Business Source
                                                              License (BSL-1.1)
                                                            </option>
                                                          </select>
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                  );
                                                }
                                              }}
                                              defaultValue=""
                                            >
                                              <option value="" disabled>
                                                Select optimization setting...
                                              </option>
                                              <option value="0">
                                                No - Optimization was disabled
                                              </option>
                                              <option value="1">
                                                Yes - Optimization was enabled
                                              </option>
                                            </select>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Select EVM version...
                                </option>
                                <option value="cancun">Cancun</option>
                                <option value="shanghai">Shanghai</option>
                                <option value="paris">Paris</option>
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select compiler version...
                  </option>
                  <option value="v0.8.28+commit.7893614a">
                    v0.8.28+commit.7893614a
                  </option>
                  <option value="v0.8.27+commit.40a35a09">
                    v0.8.27+commit.40a35a09
                  </option>
                  <option value="v0.8.26+commit.8a97fa7a">
                    v0.8.26+commit.8a97fa7a
                  </option>
                  <option value="v0.8.25+commit.b61c2a91">
                    v0.8.25+commit.b61c2a91
                  </option>
                  <option value="v0.8.24+commit.e11b9ed9">
                    v0.8.24+commit.e11b9ed9
                  </option>
                  <option value="v0.8.23+commit.f704f362">
                    v0.8.23+commit.f704f362
                  </option>
                  <option value="v0.8.22+commit.4fc1097e">
                    v0.8.22+commit.4fc1097e
                  </option>
                  <option value="v0.8.21+commit.d9974bed">
                    v0.8.21+commit.d9974bed
                  </option>
                  <option value="v0.8.20+commit.a1b79de6">
                    v0.8.20+commit.a1b79de6
                  </option>
                  <option value="v0.8.19+commit.7dd6d414">
                    v0.8.19+commit.7dd6d414
                  </option>
                  <option value="v0.8.18+commit.87f61d96">
                    v0.8.18+commit.87f61d96
                  </option>
                  <option value="v0.8.17+commit.8df45f5f">
                    v0.8.17+commit.8df45f5f
                  </option>
                  <option value="v0.8.16+commit.07c72cc2">
                    v0.8.16+commit.07c72cc2
                  </option>
                  <option value="v0.8.15+commit.e14f2714">
                    v0.8.15+commit.e14f2714
                  </option>
                  <option value="v0.8.14+commit.80d49f37">
                    v0.8.14+commit.80d49f37
                  </option>
                  <option value="v0.8.13+commit.abaa5c0e">
                    v0.8.13+commit.abaa5c0e
                  </option>
                  <option value="v0.8.12+commit.f00d7308">
                    v0.8.12+commit.f00d7308
                  </option>
                  <option value="v0.8.11+commit.d7f03943">
                    v0.8.11+commit.d7f03943
                  </option>
                  <option value="v0.8.10+commit.fc410830">
                    v0.8.10+commit.fc410830
                  </option>
                  <option value="v0.8.9+commit.e5eed63a">
                    v0.8.9+commit.e5eed63a
                  </option>
                  <option value="v0.8.8+commit.dddeac2f">
                    v0.8.8+commit.dddeac2f
                  </option>
                  <option value="v0.8.7+commit.e28d00a7">
                    v0.8.7+commit.e28d00a7
                  </option>
                  <option value="v0.8.6+commit.11564f7e">
                    v0.8.6+commit.11564f7e
                  </option>
                  <option value="v0.8.5+commit.a4f2e591">
                    v0.8.5+commit.a4f2e591
                  </option>
                  <option value="v0.8.4+commit.c7e474f2">
                    v0.8.4+commit.c7e474f2
                  </option>
                  <option value="v0.8.3+commit.8d00100c">
                    v0.8.3+commit.8d00100c
                  </option>
                  <option value="v0.8.2+commit.661d1103">
                    v0.8.2+commit.661d1103
                  </option>
                  <option value="v0.8.1+commit.df193b15">
                    v0.8.1+commit.df193b15
                  </option>
                  <option value="v0.8.0+commit.c7dfd78e">
                    v0.8.0+commit.c7dfd78e
                  </option>
                </select>
                <div className="text-sm text-muted-foreground">
                  💡 Recommended versions: v0.8.24+commit.e11b9ed9
                </div>
              </div>
            </CardContent>
          </Card>
        );
        break;
    }
  };

  /**
   * Main handler for user input processing
   * Routes input to appropriate handlers based on context and content
   */
  const handleUserInput = async (): Promise<void> => {
    if (!userInput.trim() || isProcessing) return;

    const input = userInput.trim();
    addMessage("user", input);
    setUserInput("");

    const lowerInput = input.toLowerCase();

    if (shouldContinueVerificationSession(lowerInput)) {
      await handleVerificationInput(input);
      return;
    }

    if (await handleCommand(lowerInput, input)) {
      return;
    }

    if (await handleContractAddressInput(input)) {
      return;
    }

    showHelpMessage();
  };

  /**
   * Determines if the current input should continue a verification session
   * @param lowerInput - Lowercase user input
   * @returns True if should continue verification, false otherwise
   */
  const shouldContinueVerificationSession = (
    lowerInput: string
  ): boolean | null => {
    return (
      verificationSession &&
      !lowerInput.startsWith("clear") &&
      !lowerInput.startsWith("help")
    );
  };

  /**
   * Handles command processing for user input
   * @param lowerInput - Lowercase user input
   * @param originalInput - Original user input
   * @returns True if command was handled, false otherwise
   */
  const handleCommand = async (
    lowerInput: string,
    originalInput: string
  ): Promise<boolean> => {
    if (lowerInput === "clear") {
      clearChatSession();
      return true;
    }

    if (lowerInput === "help") {
      showAvailableCommands();
      return true;
    }

    if (lowerInput.startsWith("verify")) {
      await handleVerifyCommand(originalInput);
      return true;
    }

    if (lowerInput.startsWith("lookup")) {
      await handleLookupCommand(originalInput);
      return true;
    }

    return false;
  };

  /**
   * Clears the chat session and resets state
   */
  const clearChatSession = (): void => {
    setMessages([]);
    setVerificationSession(null);
    localStorage.removeItem("core-chatbot-messages");
    addMessage(
      "ai",
      "🧹 **Chat cleared!**\n\nHow can I help you with smart contract verification today?"
    );
  };

  /**
   * Shows available commands to the user
   */
  const showAvailableCommands = (): void => {
    const commandList = AVAILABLE_COMMANDS.map(
      (cmd) => `• \`${cmd.command}\` - ${cmd.description}`
    ).join("\n");

    addMessage(
      "ai",
      `📚 **Available Commands:**\n\n${commandList}\n\n` +
        "**Quick Tips:**\n" +
        "• Just paste any contract address and I'll look it up\n" +
        "• Use `verify <address>` to start contract verification\n" +
        "• Specify network with keywords like 'testnet' or 'mainnet'\n" +
        "• Example: `verify 0x123...`\n\n" +
        "Are you facing issues while verifying a contract?",
      <div className="mt-4 ">
        <Button
          variant="outline"
          onClick={handleVerificationHelp}
          className="w-full px-6 py-2 rounded-full text-black hover:text-black"
          style={{ background: "white" }}
        >
          Yes
        </Button>
      </div>
    );
  };

  /**
   * Shows verification help and troubleshooting information
   */
  const handleVerificationHelp = () => {
    addMessage(
      "ai",
      undefined,
      <div className="bg-card text-card-foreground rounded-xl p-4 max-w-md mx-auto">
        {/* Heading */}
        <h3 className="font-semibold flex items-center gap-2 mb-6">
          <span>🔍</span> Troubleshooting Verification
        </h3>

        {/* Troubleshooting information */}
        <p className="mb-3">
          Recommended compiler version is <strong>0.8.24</strong> and the EVM
          version used is <strong>Shanghai</strong>. Please verify EVM and
          compiler version and then proceed with verification.
          <br />
          If you are still facing issues, reach out to us <br />
          on{" "}
          <a
            href="https://discord.com/invite/coredaoofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 underline"
          >
            Discord
          </a>{" "}
          or{" "}
          <a
            href="https://t.me/CoreDAOTelegram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 underline"
          >
            Telegram.
          </a>
        </p>

        {/* Action button */}
        <div className="mt-7">
          <Button
            variant="outline"
            onClick={() => {
              addMessage(
                "ai",
                "To proceed, please paste `verify <contract address>` in the network name (e.g., `verify 0x123... on mainnet` or `verify 0x123... on testnet`)."
              );
            }}
            className="w-full px-6 py-2 rounded-full text-black hover:text-black"
            style={{ background: "white" }}
          >
            No, I&apos;ll try again
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Handles the verify command
   * @param input - User input containing verify command
   */
  const handleVerifyCommand = async (input: string): Promise<void> => {
    const address = extractContractAddress(input);

    if (!address) {
      showVerifyUsageMessage();
      return;
    }

    const network = detectNetwork(input);

    if (network === undefined) {
      addMessage(
        "ai",
        "Please choose a network to proceed with verification:",
        <NetworkSelector
          address={address}
          onSelect={(chosenNetwork) => {
            const networkName =
              chosenNetwork === "mainnet" ? "Core Mainnet" : "Core Testnet";

            addMessage(
              "ai",
              `**Starting verification for:** \`${address}\`\n\n` +
                `Checking contract status on **${networkName}**...`
            );

            startVerificationFlow(address, chosenNetwork);
          }}
        />
      );

      return;
    }

    // Network was auto-detected from input
    const networkName = network === "mainnet" ? "Core Mainnet" : "Core Testnet";

    addMessage(
      "ai",
      `🔍 **Starting verification for:** \`${address}\`\n\n` +
        `Checking contract status on **${networkName}**...`
    );

    await startVerificationFlow(address, network);
  };

  /**
   * Shows usage message for verify command
   */
  const showVerifyUsageMessage = (): void => {
    addMessage(
      "ai",
      "⚡ **Contract Verification**\n\n" +
        "To verify a contract, please provide the contract address:\n\n" +
        "**Usage:** `verify 0x1234...`\n" +
        "**With network:** `verify 0x1234... on testnet`\n\n" +
        "**Example:**\n" +
        "`verify 0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
    );
  };

  /**
   * Handles the lookup command
   * @param input - User input containing lookup command
   */
  const handleLookupCommand = async (input: string): Promise<void> => {
    const address = extractContractAddress(input);

    if (!address) {
      showLookupUsageMessage();
      return;
    }

    await performContractLookup(address, input);
  };

  /**
   * Shows usage message for lookup command
   */
  const showLookupUsageMessage = (): void => {
    addMessage(
      "ai",
      "🔍 **Contract Lookup**\n\n" +
        "To look up a contract, please provide the contract address. You can:\n\n" +
        "• Type: `lookup 0x1234...`\n" +
        "• Just paste the address directly\n" +
        "• Specify network: `lookup 0x1234... on testnet`\n\n" +
        "**Example:**\n" +
        "`lookup 0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
    );
  };

  /**
   * Handles direct contract address input (without commands)
   * @param input - User input that may contain a contract address
   * @returns True if contract address was found and processed, false otherwise
   */
  const handleContractAddressInput = async (
    input: string
  ): Promise<boolean> => {
    const contractAddress = extractContractAddress(input);

    if (!contractAddress) {
      return false;
    }

    await performContractLookup(contractAddress, input);
    return true;
  };

  /**
   * Performs contract lookup with network detection
   * @param address - Contract address to lookup
   * @param input - Original user input for network detection
   */
  const performContractLookup = async (
    address: string,
    input: string
  ): Promise<void> => {
    const network = detectNetwork(input);

    if (network === undefined) {
      addMessage(
        "ai",
        "Please choose a network to proceed with verification:",
        <NetworkSelector
          address={address}
          onSelect={(chosenNetwork) => {
            const networkName =
              chosenNetwork === "mainnet" ? "Core Mainnet" : "Core Testnet";

            addMessage(
              "ai",
              `🔍 **Looking up contract...**\n\n` +
                `Searching for \`${address}\` on **${networkName}**`
            );

            handleContractLookup(address, chosenNetwork);
          }}
        />
      );

      return;
    }

    const networkName = network === "mainnet" ? "Core Mainnet" : "Core Testnet";

    addMessage(
      "ai",
      `🔍 **Looking up contract...**\n\n` +
        `Searching for \`${address}\` on **${networkName}**`
    );

    await handleContractLookup(address, network);
  };

  /**
   * Shows general help message when input is not recognized
   */
  const showHelpMessage = (): void => {
    addMessage(
      "ai",
      "🤔 **I'm not sure how to help with that.**\n\n" +
        "Here's what I can do:\n\n" +
        "• **Look up contracts**: Just paste a contract address\n" +
        "• **Verify contracts**: Type `verify <address>`\n" +
        "• **Show help**: Type `help`\n" +
        "• **Clear chat**: Type `clear`\n\n" +
        "**Example**: Try pasting this address:\n" +
        "`0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
    );
  };

  /**
   * Executes the final contract verification with all collected data
   * @param sessionData - Complete verification session data
   */
  const executeVerification = async (sessionData: any) => {
    if (!sessionData) return;

    const { address, network, data } = sessionData;
    const typingId = addTypingMessage();
    setIsProcessing(true);

    try {
      addMessage(
        "ai",
        "**Starting verification process...**\n\nThis may take a few moments. Please wait..."
      );

      // Map compiler type to API value
      let compilerType: "solidity-single" | "solidity-multi" | "solidity-json";
      switch (data.compilerType) {
        case "solidity-single":
          compilerType = "solidity-single";
          break;
        case "solidity-multi":
        case "solidity-json":
          compilerType = "solidity-json";
          break;
        default:
          compilerType = "solidity-single";
      }

      // Map license type to API value
      const licenseTypeMapping = LICENSE_TYPES.find(
        (lt) => lt.value === data.licenseType
      );
      const licenseTypeApiValue = licenseTypeMapping?.apiValue || 3; // Default to MIT (3)

      // Format constructor arguments as a quoted, comma-separated string
      let constructorArguments = data.constructorArguments || "";
      if (
        typeof constructorArguments === "string" &&
        ["no", "na"].includes(constructorArguments.trim().toLowerCase())
      ) {
        constructorArguments = null;
      } else if (constructorArguments) {
        const args = constructorArguments
          .split(",")
          .map((arg: string) => arg.trim())
          .filter((arg: string) => arg.length > 0);

        if (args.length === 1) {
          constructorArguments = args[0];
        } else if (args.length > 1) {
          constructorArguments = args
            .map((arg: string) => `"${arg}"`)
            .join(",");
        } else {
          constructorArguments = null;
        }
      }

      // Build Standard JSON Input for multi-file upload with latest optimizer settings
      let sourceCode = data.sourceCode || "";
      if (compilerType === "solidity-json" && data.multiFileSources) {
        const sources: Record<string, { content: string }> = {};
        data.multiFileSources.forEach(
          (file: { fileName: string; code: string }) => {
            sources[file.fileName] = { content: file.code };
          }
        );
        const optimizerEnabled = data.optimizationUsed === "1";
        const standardJsonInput = {
          language: "Solidity",
          sources,
          settings: {
            optimizer: {
              enabled: optimizerEnabled,
              runs: data.runs || 200,
            },
            outputSelection: {
              "*": {
                "*": [
                  "abi",
                  "evm.bytecode",
                  "evm.deployedBytecode",
                  "metadata",
                ],
              },
            },
          },
        };
        sourceCode = JSON.stringify(standardJsonInput, null, 2);
      }

      // Ensure contract name is set
      let contractName = data.contractName;

      if (!contractName) {
        // Try to extract from source code (first "contract X {" match)
        const match = sourceCode.match(/contract\s+(\w+)/);
        if (match) {
          contractName = match[1];
        } else if (data.multiFileSources && data.multiFileSources.length > 0) {
          // Fallback: use first file name
          contractName = data.multiFileSources[0].fileName.replace(
            /\.sol$/,
            ""
          );
        } else {
          contractName = "UnknownContract";
        }
      }

      console.log("Final contractName:", contractName);

      const verificationData = {
        contractAddress: address,
        compilerType,
        sourceCode,
        contractName,
        compilerVersion: data.compilerVersion!,
        optimizationUsed: data.optimizationUsed!,
        runs: Number(data.runs!),
        evmVersion: data.evmVersion ?? "shanghai",
        licenseType: licenseTypeApiValue,
        constructorArguments,
      };

      console.log("Final verificationData:", verificationData);

      const result = await verifyContract(network, verificationData);

      removeTypingMessage(typingId);

      if (result.message === "OK") {
        // Wait a moment for verification to process
        await new Promise((r) => setTimeout(r, 3000));
        const abiResponse = await getAbi(network, address);

        if (abiResponse.status === "1") {
          // Verification successful, show contract info
          handleContractLookup(address, network);
        } else {
          addMessage(
            "ai",
            ` **Verification failed**\n\n**Error:** ${result.result}\n\nPlease check your contract details and try again.`
          );
        }
      }

      setVerificationSession(null);
    } catch (error) {
      removeTypingMessage(typingId);
      console.error("Verification error:", error);
      addMessage(
        "ai",
        `**Verification error**\n\nSorry, there was an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease try again or contact support if the issue persists.`
      );
      setVerificationSession(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Typing indicator component for showing AI is processing
   */
  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </div>
  );

  /**
   * Monitor verification session step changes
   * This effect can be used for additional session management if needed
   */
  useEffect(() => {
    if (!verificationSession) return;
  }, [verificationSession]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header component */}
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Chat messages area */}
        <div className="flex-1 overflow-hidden px-6 md:px-12 pt-4">
          <ScrollArea
            className="h-full max-w-6xl mx-auto overflow-y-auto chat-scroll-area"
            ref={scrollAreaRef}
          >
            <div className="space-y-6 pb-4 px-4 md:px-8">
              {/* Render all messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%]`}>
                    <div
                      className={`p-3 rounded-xl shadow-md ${
                        msg.sender === "user"
                          ? "user-chat-bubble rounded-br-none"
                          : "bg-card text-card-foreground rounded-bl-none border p-3 rounded-xl"
                      }`}
                    >
                      {msg.isTyping ? (
                        <TypingIndicator />
                      ) : (
                        <>
                          {/* Render text content with markdown-like formatting */}
                          {msg.text && (
                            <div className="text-sm whitespace-pre-wrap markdown-content">
                              {msg.text.split("\n").map((line, i) => {
                                const parts = [];
                                const boldParts = line.split("**");

                                // Process bold text and inline code
                                for (let j = 0; j < boldParts.length; j++) {
                                  if (j % 2 === 0) {
                                    const codeParts = boldParts[j].split("`");
                                    for (let k = 0; k < codeParts.length; k++) {
                                      if (k % 2 === 0) {
                                        parts.push(
                                          <span key={`${i}-${j}-${k}`}>
                                            {codeParts[k]}
                                          </span>
                                        );
                                      } else {
                                        parts.push(
                                          <code
                                            key={`${i}-${j}-${k}`}
                                            className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                                          >
                                            {codeParts[k]}
                                          </code>
                                        );
                                      }
                                    }
                                  } else {
                                    parts.push(
                                      <strong key={`${i}-${j}`}>
                                        {boldParts[j]}
                                      </strong>
                                    );
                                  }
                                }
                                return (
                                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                                    {parts}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                          {/* Render React components */}
                          {msg.component && (
                            <div className="mt-3">
                              {React.isValidElement(msg.component)
                                ? msg.component
                                : null}
                            </div>
                          )}
                        </>
                      )}
                      {/* Show timestamp for non-typing messages */}
                      {!msg.isTyping && (
                        <p className="text-xs opacity-60 mt-2 text-right">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer input component */}
        <FooterInput
          userInput={userInput}
          setUserInput={setUserInput}
          handleUserInput={handleUserInput}
          isProcessing={isProcessing}
        />
      </main>
    </div>
  );
}
