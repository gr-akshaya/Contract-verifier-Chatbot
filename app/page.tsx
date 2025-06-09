/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import {
  getSourceCode,
  verifySourceCode,
  checkVerificationStatus,
} from "@/lib/coredao";
import { NETWORKS } from "@/lib/constants";
import type {
  Network,
  GetSourceCodeResponse,
  VerificationDetails,
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
    data: Partial<VerificationDetails & { compilerType: string }>;
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
        "🚀 **Welcome to Core Smart Contract Verifier!**\n\n🔥 *The smartest way to verify contracts on Core blockchain!* 🔥\n\n**🎯 What I can do for you:**\n\n🔍 **Contract Lookup** - Drop any contract address & get instant insights!\n⚡ **Contract Verification** - I'll guide you through verification step-by-step\n🧠 **Smart Features** - Auto-detection of contracts and easy verification process\n🛡️ **Multi-Format Support** - Single files, multi-files, and JSON inputs\n\n**🚀 Try these:**\n  • Paste: `0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`\n  • Type: `verify 0x123...` \n  • Type: `help` for command list\n\n💡 **Pro tip:** Just paste your contract address to start! ✨\n\n*Ready to verify your contracts? Let's go!* 🎊"
      );
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("core-chatbot-messages", JSON.stringify(messages));
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

          setTimeout(() => {
            scrollElement.scrollTo({
              top: scrollElement.scrollHeight,
              behavior: "smooth",
            });
          }, 100);

          setTimeout(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }, 300);
        }
      }
    };

    if (messages.length > 0) {
      scrollToBottom();
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
                <pre className="text-xs whitespace-pre-wrap">
                  {contractData.SourceCode.substring(0, 1000)}...
                </pre>
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

      if (
        sourceCodeResponse.status === "1" &&
        sourceCodeResponse.result &&
        sourceCodeResponse.result.length > 0
      ) {
        const contractData = sourceCodeResponse.result[0];
        addMessage(
          "ai",
          undefined,
          formatContractInfo(contractData, network, address)
        );

        const isVerified =
          contractData.ABI !== "Contract source code not verified";

        if (isVerified) {
          addMessage(
            "ai",
            "💡 **What's next?**\n• Copy the source code or ABI using the buttons above\n• View the contract on the block explorer\n• Ask me to lookup another contract!\n\nJust paste another address or type `help` for more options."
          );
        } else {
          addMessage(
            "ai",
            `🚀 **Want to verify this contract?**\n\nContract verification makes your smart contract more trustworthy and transparent. Here's what you can do:\n\n• Type \`verify ${address}\` to start verification\n• Make sure you have the exact source code and compiler settings\n\nReady to verify? Just type \`verify ${address}\`!`
          );
        }
      } else {
        addMessage(
          "ai",
          `❌ **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
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
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Contract Verification - Step {step} of 6
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
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
                    ? "CoreDAO Mainnet"
                    : "CoreDAO Testnet"}
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

      if (
        sourceCodeResponse.status === "1" &&
        sourceCodeResponse.result &&
        sourceCodeResponse.result.length > 0
      ) {
        const contractData = sourceCodeResponse.result[0];
        const isVerified =
          contractData.ABI !== "Contract source code not verified";

        if (isVerified) {
          addMessage(
            "ai",
            `✅ **Contract already verified!**\n\nThe contract at \`${address}\` is already verified on ${
              network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
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
            licenseType: "MIT",
          },
        });

        addMessage(
          "ai",
          `🚀 **Starting verification for contract:** \`${address}\`\n\n**Network:** ${
            network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
          }\n\nLet's gather the required information. First, I need your contract's source code.\n\n**Step 1 of 6: Source Code**\nPlease paste your complete Solidity source code below:`,
          createVerificationStepComponent(1, { address, network })
        );
      } else {
        addMessage(
          "ai",
          `❌ **Contract not found**\n\nI couldn't find a contract at address \`${address}\` on ${
            network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
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
    if (!verificationSession) return;

    const { step } = verificationSession;

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
                data: { ...prev.data, sourceCode: input.trim() },
              }
            : null
        );

        addMessage(
          "ai",
          "✅ **Source code received!**\n\n**Step 2 of 6: Compiler Type**\nWhat type of source code are you providing?\n\n• Type `1` for **Single Solidity File** (most common)\n• Type `2` for **Multiple Solidity Files** (with imports)\n• Type `3` for **Solidity Standard JSON Input** (from Hardhat/Truffle)\n\nIf you're not sure, choose option 1 (Single File)."
        );
        break;

      case 2:
        const compilerChoice = input.trim();
        let compilerType:
          | "solidity-single"
          | "solidity-multi"
          | "solidity-json";
        let compilerDescription: string;

        if (compilerChoice === "1") {
          compilerType = "solidity-single";
          compilerDescription = "Single Solidity File";
        } else if (compilerChoice === "2") {
          compilerType = "solidity-multi";
          compilerDescription = "Multiple Solidity Files";
        } else if (compilerChoice === "3") {
          compilerType = "solidity-json";
          compilerDescription = "Solidity Standard JSON Input";
        } else {
          addMessage(
            "ai",
            "⚠️ **Invalid choice**\n\nPlease select a valid option:\n• Type `1` for Single Solidity File\n• Type `2` for Multiple Solidity Files\n• Type `3` for Solidity Standard JSON Input"
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 3,
                data: { ...prev.data, compilerType },
              }
            : null
        );

        addMessage(
          "ai",
          `✅ **Compiler type set:** ${compilerDescription}\n\n**Step 3 of 6: Contract Name**\nWhat's the name of your main contract? (This should match the contract name in your source code)\n\nExample: \`MyToken\`, \`SwapContract\`, etc.`
        );
        break;

      case 3:
        if (!input.trim()) {
          addMessage(
            "ai",
            "⚠️ **Contract name is required**\n\nPlease provide the name of your main contract."
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 4,
                data: { ...prev.data, contractName: input.trim() },
              }
            : null
        );

        addMessage(
          "ai",
          "✅ **Contract name set!**\n\n**Step 4 of 6: Compiler Version**\nWhich Solidity compiler version did you use? Common versions:\n\n• `v0.8.20+commit.a1b79de6`\n• `v0.8.19+commit.7dd6d404`\n• `v0.8.18+commit.87f61d96`\n• `v0.8.17+commit.8df45f5f`\n\nPlease enter the full version string:"
        );
        break;

      case 4:
        if (!input.trim().startsWith("v0.")) {
          addMessage(
            "ai",
            "⚠️ **Invalid compiler version format**\n\nPlease use the full compiler version format like `v0.8.20+commit.a1b79de6`"
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 5,
                data: { ...prev.data, compilerVersion: input.trim() },
              }
            : null
        );

        addMessage(
          "ai",
          "✅ **Compiler version set!**\n\n**Step 5 of 6: Optimization Settings**\nWas optimization enabled when you compiled your contract?\n\n• Type `yes` if optimization was enabled\n• Type `no` if optimization was disabled\n• If yes, I'll also need the number of runs (usually 200)"
        );
        break;

      case 5:
        const lowerInput = input.toLowerCase();
        if (
          lowerInput.includes("yes") ||
          lowerInput === "y" ||
          lowerInput === "1"
        ) {
          addMessage(
            "ai",
            "**Optimization enabled!** How many optimization runs were used? (Default is usually 200)"
          );
          setVerificationSession((prev) =>
            prev
              ? {
                  ...prev,
                  step: 5.5,
                  data: { ...prev.data, optimizationUsed: "1" },
                }
              : null
          );
        } else if (
          lowerInput.includes("no") ||
          lowerInput === "n" ||
          lowerInput === "0"
        ) {
          setVerificationSession((prev) =>
            prev
              ? {
                  ...prev,
                  step: 6,
                  data: { ...prev.data, optimizationUsed: "0", runs: 200 },
                }
              : null
          );
          addMessage(
            "ai",
            "✅ **Settings complete!**\n\n**Step 6 of 6: Ready to Verify**\nGreat! I have all the information needed:\n\n• **Source Code:** ✅\n• **Compiler Type:** ✅\n• **Contract Name:** ✅\n• **Compiler Version:** ✅\n• **Optimization:** Disabled\n\nType `confirm` to start the verification process!"
          );
        } else {
          addMessage(
            "ai",
            "⚠️ **Please specify optimization**\n\nType `yes` if optimization was enabled, or `no` if it was disabled."
          );
        }
        break;

      case 5.5:
        const runs = parseInt(input.trim());
        if (isNaN(runs) || runs < 1) {
          addMessage(
            "ai",
            "⚠️ **Invalid number of runs**\n\nPlease enter a valid number (usually 200)."
          );
          return;
        }

        setVerificationSession((prev) =>
          prev
            ? {
                ...prev,
                step: 6,
                data: { ...prev.data, runs },
              }
            : null
        );

        addMessage(
          "ai",
          `✅ **Settings complete!**\n\n**Step 6 of 6: Ready to Verify**\nPerfect! I have all the information needed:\n\n• **Source Code:** ✅\n• **Compiler Type:** ✅\n• **Contract Name:** ✅\n• **Compiler Version:** ✅\n• **Optimization:** Enabled (${runs} runs)\n\nType \`confirm\` to start the verification process!`
        );
        break;

      case 6:
        if (input.toLowerCase() === "confirm") {
          await executeVerification();
        } else {
          addMessage(
            "ai",
            "Please type `confirm` to proceed with verification, or `cancel` to abort."
          );
        }
        break;
    }
  };

  const executeVerification = async () => {
    if (!verificationSession) return;

    const { address, network, data } = verificationSession;
    const typingId = addTypingMessage();
    setIsProcessing(true);

    try {
      addMessage(
        "ai",
        "🚀 **Starting verification process...**\n\nThis may take a few moments. Please wait..."
      );

      let codeformat: "solidity-single-file" | "solidity-standard-json-input";

      switch (data.compilerType) {
        case "solidity-single":
          codeformat = "solidity-single-file";
          break;
        case "solidity-multi":
          codeformat = "solidity-single-file";
          break;
        case "solidity-json":
          codeformat = "solidity-standard-json-input";
          break;
        default:
          codeformat = "solidity-single-file";
      }

      const verificationData = {
        module: "contract" as const,
        action: "verifysourcecode" as const,
        contractaddress: address,
        sourceCode: data.sourceCode!,
        codeformat,
        contractname: data.contractName!,
        compilerversion: data.compilerVersion!,
        optimizationUsed: data.optimizationUsed!,
        runs: Number(data.runs!),
        evmversion: data.evmVersion || "shanghai",
        licenseType: 1,
      };

      const result = await verifySourceCode(network, verificationData);
      removeTypingMessage(typingId);

      if (result.status === "1") {
        addMessage(
          "ai",
          `🎉 **Verification submitted successfully!**\n\n**GUID:** \`${result.result}\`\n\nYour contract verification is now in the queue. This typically takes 1-2 minutes.\n\nI'll check the status for you automatically...`
        );

        setTimeout(async () => {
          await checkVerificationStatusPeriodically(network, result.result);
        }, 10000);
      } else {
        addMessage(
          "ai",
          `❌ **Verification failed**\n\n**Error:** ${result.message}\n\nPlease check your contract details and try again. Common issues:\n• Wrong compiler version\n• Incorrect optimization settings\n• Source code doesn't match deployed bytecode\n\nWant to try again with different settings?`
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

  const checkVerificationStatusPeriodically = async (
    network: Network,
    guid: string,
    attempts = 0
  ) => {
    if (attempts >= 10) {
      addMessage(
        "ai",
        "⏰ **Verification taking longer than expected**\n\nYour contract verification request is still being processed. You can check the status manually on the Core block explorer using this GUID: `" +
          guid +
          "`\n\nThe process usually completes within 5 minutes."
      );
      return;
    }

    try {
      const statusResult = await checkVerificationStatus(network, guid);

      if (statusResult.status === "1") {
        if (statusResult.result === "Pass - Verified") {
          const explorerUrl =
            network === "mainnet"
              ? `https://scan.coredao.org/address/${verificationSession?.address}`
              : `https://scan.test2.btcs.network/address/${verificationSession?.address}`;

          addMessage(
            "ai",
            `🎉 **Verification successful!**\n\nYour contract has been successfully verified! You can now view it on the Core block explorer.\n\nThe verified source code and ABI are now publicly available. Great job! 🎊\n\nWant to verify another contract?`
          );

          try {
            if (verificationSession?.address) {
              setTimeout(async () => {
                const sourceCodeResponse = await getSourceCode(
                  network,
                  verificationSession.address
                );
                if (
                  sourceCodeResponse.status === "1" &&
                  sourceCodeResponse.result &&
                  sourceCodeResponse.result.length > 0
                ) {
                  const contractData = sourceCodeResponse.result[0];
                  addMessage(
                    "ai",
                    undefined,
                    formatContractInfo(
                      contractData,
                      network,
                      verificationSession.address
                    )
                  );
                }
              }, 2000);
            }
          } catch (error) {
            console.error("Error fetching verified contract details:", error);
          }
        } else if (
          statusResult.result.includes("Fail") ||
          statusResult.result === "Fail"
        ) {
          addMessage(
            "ai",
            `❌ **Verification failed**\n\n**Reason:** ${statusResult.result}\n\nPlease check your contract details and try again. Common issues:\n• Compiler version mismatch\n• Wrong optimization settings\n• Source code doesn't match deployed bytecode\n• Constructor arguments might be incorrect\n\nWant to try again with different settings? Type \`verify ${verificationSession?.address}\``
          );
        } else if (
          statusResult.result.includes("Pending") ||
          statusResult.result === "Pending in queue"
        ) {
          addMessage(
            "ai",
            `⏳ **Verification in progress**\n\nYour contract is still being verified. This typically takes 1-2 minutes.\n\nI'll check again shortly...`
          );
          setTimeout(() => {
            checkVerificationStatusPeriodically(network, guid, attempts + 1);
          }, 15000);
        } else {
          setTimeout(() => {
            checkVerificationStatusPeriodically(network, guid, attempts + 1);
          }, 15000);
        }
      } else {
        setTimeout(() => {
          checkVerificationStatusPeriodically(network, guid, attempts + 1);
        }, 15000);
      }
    } catch (error) {
      console.error("Status check error:", error);
      if (attempts < 5) {
        setTimeout(() => {
          checkVerificationStatusPeriodically(network, guid, attempts + 1);
        }, 20000);
      } else {
        addMessage(
          "ai",
          `⚠️ **Verification status check failed**\n\nI'm having trouble checking the status of your verification. You can check it manually on the Core block explorer using this GUID: \`${guid}\`\n\nError: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || isProcessing) return;

    const input = userInput.trim();
    addMessage("user", input);
    setUserInput("");

    const lowerInput = input.toLowerCase();

    if (
      verificationSession &&
      !lowerInput.startsWith("clear") &&
      !lowerInput.startsWith("help")
    ) {
      await handleVerificationInput(input);
      return;
    }

    if (lowerInput === "clear") {
      setMessages([]);
      setVerificationSession(null);
      localStorage.removeItem("core-chatbot-messages");
      addMessage(
        "ai",
        "🧹 **Chat cleared!**\n\nHow can I help you with smart contract verification today?"
      );
      return;
    }

    if (lowerInput === "help") {
      addMessage(
        "ai",
        "📚 **Available Commands:**\n\n" +
          AVAILABLE_COMMANDS.map(
            (cmd) => `• \`${cmd.command}\` - ${cmd.description}`
          ).join("\n") +
          "\n\n**Quick Tips:**\n• Just paste any contract address and I'll look it up\n• Use `verify <address>` to start contract verification\n• Specify network with keywords like 'testnet' or 'mainnet'\n• Example: `verify 0x123... on testnet`"
      );
      return;
    }

    const contractAddress = extractContractAddress(input);

    if (contractAddress) {
      const network = detectNetwork(input);
      addMessage(
        "ai",
        `🔍 **Looking up contract...**\n\nSearching for \`${contractAddress}\` on **${
          network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
        }**`
      );
      await handleContractLookup(contractAddress, network);
      return;
    }

    if (lowerInput.startsWith("lookup")) {
      addMessage(
        "ai",
        "🔍 **Contract Lookup**\n\nTo look up a contract, please provide the contract address. You can:\n\n• Type: `lookup 0x1234...`\n• Just paste the address directly\n• Specify network: `lookup 0x1234... on testnet`\n\n**Example:**\n`lookup 0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
      );
      return;
    }

    if (lowerInput.startsWith("verify")) {
      const address = extractContractAddress(input);
      if (address) {
        const network = detectNetwork(input);
        addMessage(
          "ai",
          `🔍 **Starting verification for:** \`${address}\`\n\nChecking contract status on **${
            network === "mainnet" ? "CoreDAO Mainnet" : "CoreDAO Testnet"
          }**...`
        );
        await startVerificationFlow(address, network);
      } else {
        addMessage(
          "ai",
          "⚡ **Contract Verification**\n\nTo verify a contract, please provide the contract address:\n\n**Usage:** `verify 0x1234...`\n**With network:** `verify 0x1234... on testnet`\n\n**Example:**\n`verify 0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
        );
      }
      return;
    }

    addMessage(
      "ai",
      "🤔 **I'm not sure how to help with that.**\n\nHere's what I can do:\n\n• **Look up contracts**: Just paste a contract address\n• **Verify contracts**: Type `verify <address>`\n• **Show help**: Type `help`\n• **Clear chat**: Type `clear`\n\n**Example**: Try pasting this address:\n`0x8C9d5AeA15C2A6eF94bC3C8317B889bED6E8Bf8d`"
    );
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden px-4 pt-4">
          <ScrollArea
            className="h-full md:px-28 overflow-y-auto chat-scroll-area"
            ref={scrollAreaRef}
          >
            <div className="space-y-6 pb-4">
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
                              {msg.text.split("\n").map((line, i) => (
                                <p key={i} className={i > 0 ? "mt-2" : ""}>
                                  {line.split("**").map((part, j) =>
                                    j % 2 === 1 ? (
                                      <strong key={j}>{part}</strong>
                                    ) : (
                                      part.split("`").map((codePart, k) =>
                                        k % 2 === 1 ? (
                                          <code
                                            key={k}
                                            className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                                          >
                                            {codePart}
                                          </code>
                                        ) : (
                                          <span key={k}>{codePart}</span>
                                        )
                                      )
                                    )
                                  )}
                                </p>
                              ))}
                            </div>
                          )}
                          {msg.component && (
                            <div className="mt-3">{msg.component}</div>
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

        <div className="shrink-0 border-t border-border bg-background sticky bottom-0">
          <div className="md:px-48 px-5 py-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Paste contract address, type 'lookup', 'help', or ask me anything..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
                className="flex-grow"
                disabled={isProcessing}
              />
              <Button
                onClick={handleUserInput}
                disabled={isProcessing || !userInput.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span className="ml-2">
                  {isProcessing ? "Processing..." : "Send"}
                </span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Core Smart Contract Verifier AI © {new Date().getFullYear()} -
              Powered by CoreDAO Blockchain
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
