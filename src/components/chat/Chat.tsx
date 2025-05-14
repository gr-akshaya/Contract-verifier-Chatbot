import React, { useState, useEffect, useRef } from "react";
import {
  Message,
  VerificationDetails,
  VerificationResult,
  Network,
  CompilerType,
  LicenseType,
} from "../../types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ContractForm from "../verification/ContractForm";
import VerificationResultDisplay from "../verification/VerificationResult";
import { BlockExplorer } from "../../services/blockExplorer";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [verificationDetails, setVerificationDetails] =
    useState<VerificationDetails>({});
  const [blockExplorer, setBlockExplorer] = useState<BlockExplorer | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      type: "bot",
      content:
        "👋 Hi there! I'm your AI assistant for smart contract verification. I'll help you verify your contract source code on the blockchain. To get started, please enter your contract address.",
      timestamp: new Date(),
    };

    setMessages([initialMessage]);
    setCurrentStep(1);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  useEffect(() => {
    if (verificationDetails.network) {
      const explorer = new BlockExplorer(verificationDetails.network);
      setBlockExplorer(explorer);
    }
  }, [verificationDetails.network]);

  useEffect(() => {
    if (blockExplorer && verificationDetails.address) {
      setExplorerUrl(blockExplorer.getBrowserUrl(verificationDetails.address));
    }
  }, [blockExplorer, verificationDetails.address]);

  const addMessage = (
    content: string | React.ReactNode,
    type: "user" | "bot"
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleUpdateVerificationDetails = (
    details: Partial<VerificationDetails>
  ) => {
    setVerificationDetails((prev) => ({ ...prev, ...details }));
  };

  const checkContractVerification = async (address: string) => {
    if (!blockExplorer) return false;
    try {
      const isVerified = await blockExplorer.isVerified(address);
      if (isVerified) {
        addMessage(
          <div className="flex items-center text-yellow-500">
            <AlertTriangle size={20} className="mr-2" />
            This contract is already verified. You can view it on the block
            explorer.
          </div>,
          "bot"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking contract verification:", error);
      return false;
    }
  };

  const handleUserSend = async (content: string) => {
    if (currentStep === 1) {
      const address = content.trim();
      if (address.startsWith("0x") && address.length === 42) {
        addMessage(address, "user");
        handleUpdateVerificationDetails({ address });
        addMessage(
          "Great! Now please select the network where your contract is deployed.",
          "bot"
        );
        setCurrentStep(2);
      } else {
        addMessage(content, "user");
        addMessage(
          "That doesn't look like a valid contract address. Please enter a valid address starting with '0x'.",
          "bot"
        );
      }
    }
  };

  const handleContinue = async () => {
    switch (currentStep) {
      case 2:
        if (verificationDetails.network) {
          addMessage(
            `Selected network: ${verificationDetails.network}`,
            "user"
          );
          const isVerified = await checkContractVerification(
            verificationDetails.address!
          );
          if (!isVerified) {
            addMessage(
              "Please select the compiler type for your contract:",
              "bot"
            );
            setCurrentStep(3);
          }
        }
        break;

      case 3:
        if (verificationDetails.compilerType) {
          addMessage(
            `Compiler type: ${verificationDetails.compilerType}`,
            "user"
          );
          if (verificationDetails.compilerType === "solidity-multi") {
            addMessage(
              <div>
                <p className="mb-2">⚠️ Recommendation for multi-part files:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Consider flattening your contract into a single file</li>
                  <li>
                    Or use the Standard-JSON-Input format for better
                    organization
                  </li>
                </ul>
              </div>,
              "bot"
            );
          }
          addMessage(
            "Please select the license type for your contract:",
            "bot"
          );
          setCurrentStep(4);
        }
        break;

      case 4:
        if (verificationDetails.licenseType) {
          addMessage(
            `License type: ${verificationDetails.licenseType}`,
            "user"
          );
          addMessage(
            "Now I need the contract's source code and name. Please enter the contract name and paste the source code or upload a file.",
            "bot"
          );
          setCurrentStep(5);
        }
        break;

      case 5:
        if (
          verificationDetails.sourceCode &&
          verificationDetails.contractName
        ) {
          addMessage(
            `Source code for ${verificationDetails.contractName} provided`,
            "user"
          );
          addMessage(
            "Great! Finally, please select the compiler version and EVM version used for your contract.",
            "bot"
          );
          setCurrentStep(6);
        } else {
          addMessage(
            "Please provide both the contract name and source code before continuing.",
            "bot"
          );
        }
        break;

      case 6:
        if (verificationDetails.compilerVersion) {
          addMessage(
            `Using compiler: ${verificationDetails.compilerVersion}, EVM: ${
              verificationDetails.evmVersion || "shanghai"
            }`,
            "user"
          );
          verifyContract();
        } else {
          addMessage(
            "Please select a compiler version before continuing.",
            "bot"
          );
        }
        break;
    }
  };

  const verifyContract = async () => {
    if (!blockExplorer) return;

    try {
      setIsVerifying(true);
      addMessage("Starting verification process...", "bot");

      const result = await blockExplorer.verifyContract(verificationDetails);
      setVerificationResult(result);

      addMessage(
        <VerificationResultDisplay
          result={result}
          isLoading={false}
          explorerUrl={explorerUrl}
        />,
        "bot"
      );

      if (result.status === "1") {
        addMessage(
          "Verification successful! You can view your verified contract on the block explorer. Would you like to verify another contract?",
          "bot"
        );
        resetVerification();
      } else {
        addMessage(
          "Verification failed. Please check the error message and try again with the correct details.",
          "bot"
        );
      }
    } catch (error) {
      console.error("Error during verification:", error);
      addMessage(
        `Verification error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "bot"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerificationDetails({});
    setVerificationResult(null);
    setCurrentStep(1);
    addMessage("Let's start again. Please enter your contract address.", "bot");
  };

  const isFormComplete = () => {
    switch (currentStep) {
      case 1:
        return !!verificationDetails.address;
      case 2:
        return !!verificationDetails.network;
      case 3:
        return !!verificationDetails.compilerType;
      case 4:
        return !!verificationDetails.licenseType;
      case 5:
        return (
          !!verificationDetails.sourceCode && !!verificationDetails.contractName
        );
      case 6:
        return !!verificationDetails.compilerVersion;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] relative">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {currentStep > 0 && currentStep < 7 && (
        <div className="p-4 border-t border-gray-800 bg-dark-800 sticky bottom-0">
          <ContractForm
            details={verificationDetails}
            onChange={handleUpdateVerificationDetails}
            currentStep={currentStep}
          />

          <div className="flex justify-between mt-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleContinue}
              disabled={!isFormComplete() || isVerifying}
              className={`ml-auto flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isFormComplete() && !isVerifying
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              } transition-colors`}
            >
              {isVerifying ? (
                <>
                  Verifying<span className="ml-2 animate-pulse">...</span>
                </>
              ) : (
                <>
                  {currentStep === 6 ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Verify Contract
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-dark-800">
        <ChatInput
          onSendMessage={handleUserSend}
          disabled={currentStep > 1 && currentStep < 7}
          placeholder={
            currentStep === 1
              ? "Enter contract address (0x...)"
              : "Type a message..."
          }
        />
      </div>
    </div>
  );
};

export default Chat;
