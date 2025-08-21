/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import FooterInput from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import MultiFileUploadComponent from "@/components/contract-verification/MultiFileUploadComponent";
import {
  Send,
  Bot,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Code,
  Loader2,
  User,
  Upload,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import { getSourceCode, verifyContract, getAbi } from "@/lib/coredao";
import { NETWORKS, LICENSE_TYPES } from "@/lib/constants";
import {
  type Network,
  type VerificationDetails,
  GetSourceCodeResponse,
  LicenseType,
} from "@/types/coredao";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text?: string;
  component?: React.ReactNode;
  timestamp: Date;
  isTyping?: boolean;
}

const CONTRACT_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;
const AVAILABLE_COMMANDS = [
  { command: "verify", description: "Verify a new smart contract" },
  { command: "lookup", description: "Look up an existing contract" },
  { command: "help", description: "Show available commands" },
  { command: "clear", description: "Clear chat history" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationSession, setVerificationSession] = useState<{
    address: string;
    network: Network;
    step: number;
    data: Partial<
      VerificationDetails & {
        compilerType: string;
        sourceCode: string;
        //sourceCodes?: { code: string; fileName: string }[];
      }
    >;
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addMessage = (
    sender: "user" | "ai",
    text?: string,
    component?: React.ReactNode,
    isTyping: boolean = false
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        sender,
        text,
        component,
        timestamp: new Date(),
        isTyping,
      },
    ]);
  };

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

  const removeTypingMessage = (typingId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== typingId));
  };

  useEffect(() => {
    const cachedMessages = localStorage.getItem("core-chatbot-messages");
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (error) {
        console.error("Failed to load cached messages:", error);
      }
    } else {
      addMessage(
        "ai",
        "🚀 **Welcome to Core Smart Contract Verifier!**\n\n** What I can do for you:**\n\n🔍 **Contract Lookup** - Drop any contract address & get instant insights!\n⚡ **Contract Verification** - I'll guide you through verification step-by-step\n🧠 **Smart Features** - Auto-detection of contracts and easy verification process\n\n**🚀 Try these:**\n  • Paste: `0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`\n  • Type: `verify 0x123...` \n  • Type: `help` for command list\n\n*Ready to verify your contracts? Let's go!* 🎊"
      );
    }
  }, []);

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

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;

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

  const extractContractAddress = (input: string): string | null => {
    const matches = input.match(CONTRACT_ADDRESS_REGEX);
    return matches ? matches[0] : null;
  };

  const detectNetwork = (input: string): Network => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("testnet") || lowerInput.includes("test")) {
      return "testnet2";
    }
    return "mainnet";
  };

  const formatContractInfo = (
    contractData: GetSourceCodeResponse["result"][0],
    network: Network,
    address: string
  ) => {
    const isVerified = contractData.ABI !== "Contract source code not verified";
    const networkInfo = NETWORKS.find((n) => n.value === network);

    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Contract Information
            </CardTitle>
            <Badge variant={isVerified ? "default" : "destructive"}>
              {isVerified ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Verified
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Network
              </label>
              <p className="text-sm">{networkInfo?.label || network}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Contract Name
              </label>
              <p className="text-sm">
                {contractData.ContractName || "Unknown"}
              </p>
            </div>
            {isVerified && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Compiler Version
                  </label>
                  <p className="text-sm">
                    {contractData.CompilerVersion || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Optimization
                  </label>
                  <p className="text-sm">
                    {contractData.OptimizationUsed === "1"
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Contract Address
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied to clipboard");
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm font-mono bg-muted p-2 rounded">{address}</p>
          </div>

          {isVerified && contractData.SourceCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  Source Code
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      contractData.SourceCode || ""
                    );
                    toast.success("Source code copied to clipboard");
                  }}
                >
                  <Copy className="w-3 h-3 cursor-pointer" />
                </Button>
              </div>
              <div className="bg-muted p-3 rounded max-h-60 overflow-y-auto">
                {(() => {
                  // Try to parse as JSON Standard Input
                  let parsed: any = null;
                  try {
                    // Remove leading/trailing braces if present (Etherscan-style)

                    let code = contractData.SourceCode.trim();
                    // Remove leading/trailing quotes if present
                    if (
                      (code.startsWith('"') && code.endsWith('"')) ||
                      (code.startsWith("'") && code.endsWith("'"))
                    ) {
                      code = code.slice(1, -1);
                    }

                    // Robustly remove extra braces and whitespace
                    code = code
                      .replace(/^\s*{\s*{+/, "{")
                      .replace(/}+}\s*$/, "}");
                    parsed = JSON.parse(code);
                  } catch {
                    parsed = null;
                  }
                  if (
                    parsed &&
                    typeof parsed === "object" &&
                    parsed.sources &&
                    typeof parsed.sources === "object"
                  ) {
                    // Multi-file: show each file
                    return (
                      <div>
                        {Object.entries(parsed.sources).map(
                          ([fileName, fileObj]: [string, any]) => (
                            <div key={fileName} className="mb-4">
                              <div className="font-bold text-xs mb-1">
                                {fileName}
                              </div>
                              <pre className="text-xs whitespace-pre-wrap bg-background p-2 rounded">
                                {(fileObj as any).content?.substring(0, 1000) ||
                                  ""}
                                {((fileObj as any).content?.length || 0) > 1000
                                  ? "..."
                                  : ""}
                              </pre>
                            </div>
                          )
                        )}
                      </div>
                    );
                  } else {
                    // Single file: show as before
                    return (
                      <pre className="text-xs whitespace-pre-wrap">
                        {contractData.SourceCode.substring(0, 1000)}...
                      </pre>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const explorerUrl =
                  network === "mainnet"
                    ? `https://scan.coredao.org/address/${address}`
                    : `https://scan.test2.btcs.network/address/${address}`;
                window.open(explorerUrl, "_blank");
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on Explorer
            </Button>
            {isVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(contractData.ABI || "");
                  toast.success("ABI copied to clipboard");
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy ABI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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

        addMessage(
          "ai",
          undefined,
          formatContractInfo(contractData, network, address)
        );

        if (isVerified) {
          addMessage(
            "ai",
            "💡 **What's next?**\n• Copy the source code or ABI using the buttons above\n• View the contract on the block explorer\n• Ask me to lookup another contract!\n\nJust paste another address or type `help` for more options."
          );
        } else {
          addMessage(
            "ai",
            `🚀 **Want to verify this contract?**\n\nI found your contract, but it's not verified yet. Verification makes your smart contract more trustworthy and transparent. Here's what you can do:\n\n• Type \`verify ${address}\` to start verification\n• Make sure you have the exact source code and compiler settings\n\nReady to verify? Just type \`verify ${address}\`!`
          );
        }
      } else {
        addMessage(
          "ai",
          `❌ **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }.\n\n**Double-check:**\n• The address is correct\n• The contract is deployed on the right network\n• Try the other network (mainnet/testnet)\n\nWant to try a different address or network?`
        );
      }
    } catch (error) {
      removeTypingMessage(typingId);
      console.error("Error looking up contract:", error);
      addMessage(
        "ai",
        `🚫 **Lookup failed**\n\nSorry, I encountered an error while looking up the contract:\n\`${
          error instanceof Error ? error.message : "Unknown error"
        }\`\n\nPlease try again or check if the Core blockchain API is accessible.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const createVerificationStepComponent = (step: number, sessionData: any) => {
    const renderStepContent = () => {
      switch (step) {
        case 1:
          return (
            <div className="space-y-6">
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

                      // First add the user message
                      addMessage("user", `Selected: ${compilerDescription}`);

                      // Then update the session state
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

                      // Finally add the AI response
                      addMessage(
                        "ai",
                        `✅ **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them, otherwise, type 'no' or 'na' to continue.`
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
                  📝 **Selected:**{" "}
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
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Contract Verification - Step {step} of 6
            </CardTitle>
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
                    // Add a message to indicate going back
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
    );
  };

  const startVerificationFlow = async (address: string, network: Network) => {
    const typingId = addTypingMessage();
    try {
      const sourceCodeResponse = await getSourceCode(network, address);
      removeTypingMessage(typingId);

      if (sourceCodeResponse.result && sourceCodeResponse.result.length > 0) {
        const contractData = sourceCodeResponse.result[0];
        const isVerified =
          contractData.ABI !== "Contract source code not verified";

        if (isVerified) {
          addMessage(
            "ai",
            `✅ **Contract already verified!**\n\nThe contract at \`${address}\` is already verified on ${
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

        addMessage(
          "ai",
          `🚀 **Starting verification for contract:** \`${address}\`\n\n**Network:** ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }\n\nLet's gather the required information step by step. I'll guide you through each step with proper forms and dropdown menus.\n\n**Step 1 of 7: Source Code**\nPlease provide your contract's source code in one of the following ways:`,
          createVerificationStepComponent(1, { address, network })
        );

        // Add source code input options
        addMessage(
          "ai",
          undefined,
          <Card className="w-full max-w-3xl mx-auto mt-4">
            <CardHeader>
              <CardTitle>📄 Source Code Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    addMessage("user", "📝 I'll paste my source code");
                    addMessage(
                      "ai",
                      "Perfect! Please paste your complete Solidity source code below. Make sure it includes all contracts, imports, and dependencies:",
                      <Card className="w-full max-w-3xl mx-auto mt-4">
                        <CardContent className="p-4">
                          <Textarea
                            placeholder="Paste your Solidity source code here..."
                            className="min-h-[300px] font-mono whitespace-pre preserve-whitespace"
                            style={{ wordBreak: "normal", whiteSpace: "pre" }}
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
                                const textarea = e.currentTarget.parentElement
                                  ?.previousElementSibling as HTMLTextAreaElement;

                                if (textarea) {
                                  const sourceCode = textarea.value;

                                  if (sourceCode.trim().length > 50) {
                                    // Add a user message to show the code is being processed
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
                                    // Process directly without changing step (handleVerificationInput will update state)
                                    setTimeout(() => {
                                      // Don't set the session directly here, let the handleVerificationInput function do it
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
                    );
                  }}
                >
                  <Code className="w-6 h-6 mb-2" />
                  Paste Code
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    // Only allow one file
                    input.multiple = false;
                    input.accept = ".sol,.json";
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length === 1) {
                        const file = files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const content = e.target?.result as string;
                          addMessage("user", `📁 Uploaded file: ${file.name}`);
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
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => {
                    // Show a modal or card for multi-file upload
                    addMessage("user", "📋 I'll use multiple files");
                    // Show a custom component for multi-file upload
                    addMessage(
                      "ai",
                      undefined,
                      <MultiFileUploadComponent
                        onConfirm={(files) => {
                          // Store files and advance to the next step
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
                            "✅ **Files uploaded!**\n\n**Step 2 of 6: Compiler Type**\nWhat type of source code are you providing?",
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
                                          `✅ **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them; otherwise, type 'no' or 'na' to continue.`
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
                                    💡 **Tip:** If you&apos;re not sure, choose
                                    &quot;Single Solidity File&quot; - it&apos;s
                                    the most common option.
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
        );
      } else {
        addMessage(
          "ai",
          `❌ **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "Core Mainnet" : "Core Testnet"
          }.\n\nPlease make sure:\n• The contract address is correct\n• The contract is deployed\n• You're using the right network\n\nTry again with a different address or network.`
        );
      }
    } catch (error) {
      removeTypingMessage(typingId);
      addMessage(
        "ai",
        `🚫 **Error checking contract**\n\nSorry, I couldn't check the contract status: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease try again.`
      );
    }
  };

  const handleVerificationInput = async (input: string) => {
    const step = verificationSession?.step || 1;

    // Add back button handling
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
        if (input.trim().length < 50) {
          addMessage(
            "ai",
            "⚠️ **Source code seems too short**\n\nPlease provide the complete Solidity source code. It should typically be at least a few lines long."
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 2,
                data: { ...prev.data, sourceCode: input },
              }
            : null
        );

        addMessage(
          "ai",
          "✅ **Source code received!**\n\n**Step 2 of 6: Compiler Type**\nWhat type of source code are you providing?",
          <Card className="w-full max-w-3xl mx-auto mt-4">
            <CardHeader>
              <CardTitle>📝 Compiler Type Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select the compiler type that matches your source code
                </label>
                <select
                  className="w-full p-3 border rounded-md bg-background text-sm"
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

                      // Then update the session state
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

                      // First add the user message
                      addMessage("user", `Selected: ${compilerDescription}`);

                      // Finally add the AI response
                      addMessage(
                        "ai",
                        `✅ **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Constructor Arguments**\nAre there any constructor arguments? If so, please provide them; otherwise, type no' or 'na' to continue.`
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
        if (!input.trim()) {
          addMessage(
            "ai",
            "⚠️ **Constructor Arguments is required**\n\nPlease provide if any else type 'no' to continue."
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 4,
                data: { ...prev.data, constructorArguments: input.trim() },
              }
            : null
        );

        addMessage(
          "ai",
          "✅ **Constructor Arguments set!**\n\n**Step 4 of 6: Compiler Version**\nWhich Solidity compiler version did you use?\n\nPlease select from the dropdown below:",
          <Card className="w-full max-w-3xl mx-auto mt-4">
            <CardHeader>
              <CardTitle>🔧 Compiler Version</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  className="w-full p-3 border rounded-md bg-background text-sm"
                  onChange={(e) => {
                    if (verificationSession && e.target.value) {
                      // Update the session with the compiler version
                      //console.log("Previous data:", verificationSession.data);
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
                        //console.log("After update - New state:", newState);
                        return newState;
                      });

                      addMessage("user", `Selected: ${e.target.value}`);

                      // Add AI response for EVM version selection
                      addMessage(
                        "ai",
                        "✅ **Compiler version set!**\n\n**Step 5 of 6: EVM Version**\nPlease select the EVM version used during compilation:",
                        <Card className="w-full max-w-3xl mx-auto mt-4">
                          <CardHeader>
                            <CardTitle>⚙️ EVM Version</CardTitle>
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
                                      "✅ **EVM version set!**\n\n**Step 6 of 7: Optimization Settings**\nWas optimization enabled during compilation?",
                                      <Card className="w-full max-w-3xl mx-auto mt-4">
                                        <CardHeader>
                                          <CardTitle>
                                            ⚙️ Optimization Settings
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
                                                    "✅ **Optimization settings complete!**\n\n**Step 7 of 7: License Type**\nPlease select the license type for your contract:",
                                                    <Card className="w-full max-w-3xl mx-auto mt-4">
                                                      <CardHeader>
                                                        <CardTitle>
                                                          📄 License Type
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
                                                                          "✅ **All settings complete!**\n\n**Ready to Verify**\nPerfect! I have all the information needed:\n\n• **Source Code:** ✅\n• **Compiler Type:** ✅\n• **Constructor Arguments :** ✅\n• **Compiler Version:** ✅\n• **EVM Version:** ✅\n• **Optimization:** " +
                                                                            (isEnabled
                                                                              ? "Enabled"
                                                                              : "Disabled") +
                                                                            "\n• **License:** ✅\n\nClick the button below to start the verification process!",
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
                                                                                "🚀 Start Verification"
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

  const shouldContinueVerificationSession = (
    lowerInput: string
  ): boolean | null => {
    return (
      verificationSession &&
      !lowerInput.startsWith("clear") &&
      !lowerInput.startsWith("help")
    );
  };

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

  const clearChatSession = (): void => {
    setMessages([]);
    setVerificationSession(null);
    localStorage.removeItem("core-chatbot-messages");
    addMessage(
      "ai",
      "🧹 **Chat cleared!**\n\nHow can I help you with smart contract verification today?"
    );
  };

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
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={handleVerificationHelp}
          className="px-6 py-2"
        >
          Yes
        </Button>
      </div>
    );
  };

  const handleVerificationHelp = () => {
    addMessage(
      "ai",
      undefined,
      <div>
        <div className="mb-2">
          <span>
            🔍 <strong>Troubleshooting Verification</strong>
          </span>
          <p className="mt-2">
            Verify the compiler version is <strong>0.8.24</strong> and the EVM
            version used is <strong>Shanghai</strong>, and then proceed with
            verification.
          </p>
          <p className="mt-2">
            If you are still facing issues, reach out to us on{" "}
            <a
              href="https://discord.com/invite/coredaoofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Discord
            </a>{" "}
            or{" "}
            <a
              href="https://t.me/CoreDAOTelegram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Telegram
            </a>
            .
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              addMessage(
                "ai",
                "To proceed, please paste `verify <contract address>` in the network name (e.g., `verify 0x123... on mainnet` or `verify 0x123... on testnet`)."
              );
            }}
            className="px-6 py-2"
          >
            No, I&apos;ll try again
          </Button>
        </div>
      </div>
    );
  };

  const handleVerifyCommand = async (input: string): Promise<void> => {
    const address = extractContractAddress(input);

    if (!address) {
      showVerifyUsageMessage();
      return;
    }

    const network = detectNetwork(input);
    const networkName = network === "mainnet" ? "Core Mainnet" : "Core Testnet";

    addMessage(
      "ai",
      `🔍 **Starting verification for:** \`${address}\`\n\n` +
        `Checking contract status on **${networkName}**...`
    );

    await startVerificationFlow(address, network);
  };

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

  const handleLookupCommand = async (input: string): Promise<void> => {
    const address = extractContractAddress(input);

    if (!address) {
      showLookupUsageMessage();
      return;
    }

    await performContractLookup(address, input);
  };

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

  const performContractLookup = async (
    address: string,
    input: string
  ): Promise<void> => {
    const network = detectNetwork(input);
    const networkName = network === "mainnet" ? "Core Mainnet" : "Core Testnet";

    addMessage(
      "ai",
      `🔍 **Looking up contract...**\n\n` +
        `Searching for \`${address}\` on **${networkName}**`
    );

    await handleContractLookup(address, network);
  };

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

  const executeVerification = async (sessionData: any) => {
    if (!sessionData) return;

    const { address, network, data } = sessionData;
    const typingId = addTypingMessage();
    setIsProcessing(true);

    try {
      addMessage(
        "ai",
        "🚀 **Starting verification process...**\n\nThis may take a few moments. Please wait..."
      );

      // Map compilerType to API value
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
        // Split by comma, trim each, and only wrap in quotes if more than one argument
        const args = constructorArguments
          .split(",")
          .map((arg: string) => arg.trim())
          .filter((arg: string) => arg.length > 0);

        if (args.length === 1) {
          constructorArguments = args[0]; // single argument, no extra quotes
        } else if (args.length > 1) {
          constructorArguments = args
            .map((arg: string) => `"${arg}"`)
            .join(",");
        } else {
          constructorArguments = null;
        }
      }

      // --- Build Standard JSON Input for multi-file upload with latest optimizer settings ---
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

      const verificationData = {
        contractAddress: address,
        compilerType,
        sourceCode, // <-- use the built JSON input
        contractName: data.contractName!,
        compilerVersion: data.compilerVersion!,
        optimizationUsed: data.optimizationUsed!,
        runs: Number(data.runs!),
        evmVersion: data.evmVersion ?? "shanghai",
        licenseType: licenseTypeApiValue,
        constructorArguments,
      };

      console.log("Final verificationData:", verificationData);
      //console.log("data.compilerVersion", data.compilerVersion);

      const result = await verifyContract(network, verificationData);
      //console.log("Result:", result);

      removeTypingMessage(typingId);

      if (result.message === "OK") {
        // Try to get the ABI to confirm verification
        await new Promise((r) => setTimeout(r, 3000));
        const abiResponse = await getAbi(network, address);
        // console.log("abiResponse", abiResponse);

        if (abiResponse.status === "1") {
          handleContractLookup(address, network);
        } else {
          // Verification submitted but not yet processed
          addMessage(
            "ai",
            `✅ **Verification submitted!**\n\nYour contract verification request has been submitted successfully. The verification process may take a few moments to complete.\n\n**GUID:** \`${result.result}\`\n\nYou can check the verification status on the block explorer:`,
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const explorerUrl =
                    network === "mainnet"
                      ? `https://scan.coredao.org/address/${address}`
                      : `https://scan.test2.btcs.network/address/${address}`;
                  window.open(explorerUrl, "_blank");
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on Explorer
              </Button>
            </div>
          );
        }
      } else {
        addMessage(
          "ai",
          `❌ **Verification failed**\n\n**Error:** ${result.result}\n\nPlease check your contract details and try again. Common issues:\n• Wrong compiler version\n• Incorrect optimization settings\n• Source code doesn't match deployed bytecode\n\nWant to try again with different settings?`
        );
      }

      setVerificationSession(null);
    } catch (error) {
      removeTypingMessage(typingId);
      console.error("Verification error:", error);
      addMessage(
        "ai",
        `🚫 **Verification error**\n\nSorry, there was an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease try again or contact support if the issue persists.`
      );
      setVerificationSession(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </div>
  );

  // Add an effect to monitor verification session step changes
  useEffect(() => {
    if (!verificationSession) return;
  }, [verificationSession]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden px-6 md:px-12 pt-4">
          <ScrollArea
            className="h-full max-w-6xl mx-auto overflow-y-auto chat-scroll-area"
            ref={scrollAreaRef}
          >
            <div className="space-y-6 pb-4 px-4 md:px-8">
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
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot size={18} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`p-3 rounded-xl shadow-md ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-card-foreground rounded-bl-none border"
                      }`}
                    >
                      {msg.isTyping ? (
                        <TypingIndicator />
                      ) : (
                        <>
                          {msg.text && (
                            <div className="text-sm whitespace-pre-wrap markdown-content">
                              {msg.text.split("\n").map((line, i) => {
                                const parts = [];
                                const boldParts = line.split("**");

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
                          {msg.component && (
                            <div className="mt-3">
                              {React.isValidElement(msg.component)
                                ? msg.component
                                : null}
                            </div>
                          )}
                        </>
                      )}
                      {!msg.isTyping && (
                        <p className="text-xs opacity-60 mt-2 text-right">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <Avatar className="w-8 h-8 self-start">
                        <AvatarFallback className="bg-muted">
                          <User size={18} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

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
