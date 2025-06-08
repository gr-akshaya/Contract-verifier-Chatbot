import React, { useState, useEffect, useRef } from "react";
import { Message, VerificationDetails, VerificationResult } from "../../types";
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
  const [isProxyContract, setIsProxyContract] = useState<boolean>(false);
  // eslint-disable-next-line
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string>("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      type: "bot",
      content:
        "👋 Hi there! I'm your AI assistant for smart contract verification. I'll help you verify your contract source code on the Core blockchain. To get started, please enter your contract address.\n\nEnsure your contract was deployed using the Shanghai version.\n\nLet's begin!",
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
      addMessage("🔍 Checking contract verification status...", "bot");
      
      const contractInfo = await blockExplorer.getContractInfo(address);
      
      if (contractInfo.isVerified) {
        addMessage(
          <div className="flex items-center text-yellow-500">
            <AlertTriangle size={20} className="mr-2" />
            This contract is already verified. You can view it on the block
            explorer.
          </div>,
          "bot"
        );

        if (contractInfo.sourceCode) {
          addMessage(
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Contract Information:</h4>
              <p className="text-sm text-gray-300">
                <strong>Contract Name:</strong> {contractInfo.sourceCode.ContractName || "Unknown"}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Compiler Version:</strong> {contractInfo.sourceCode.CompilerVersion || "Unknown"}
              </p>
              <p className="text-sm text-gray-300">
                <strong>License:</strong> {contractInfo.sourceCode.LicenseType || "Unknown"}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Optimization:</strong> {contractInfo.sourceCode.OptimizationUsed === "1" ? "Enabled" : "Disabled"}
              </p>
              {contractInfo.sourceCode.Runs && (
                <p className="text-sm text-gray-300">
                  <strong>Optimization Runs:</strong> {contractInfo.sourceCode.Runs}
                </p>
              )}
              {contractInfo.isProxy && (
                <p className="text-sm text-yellow-400">
                  <strong>⚠️ This appears to be a proxy contract</strong>
                </p>
              )}
            </div>,
            "bot"
          );
        }

        return true;
      }
      
      addMessage("✅ Contract is not yet verified. Let's proceed with verification!", "bot");
      return false;
    } catch (error) {
      console.error("Error checking contract verification:", error);
      addMessage(
        `❌ Error checking contract: ${error instanceof Error ? error.message : "Unknown error"}`,
        "bot"
      );
      return false;
    }
  };

  const handleUserSend = async (content: string) => {
    if (currentStep === 1) {
      const address = content.trim();
      if (BlockExplorer.isValidAddress(address)) {
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
          "That doesn't look like a valid contract address. Please enter a valid Ethereum-style address starting with '0x' and exactly 42 characters long.",
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
            // Check if it might be a proxy contract
            addMessage("Checking if this is a proxy contract...", "bot");

            // Add a simple heuristic to detect potential proxy contracts
            // This is a basic check - in production you might want more sophisticated detection
            addMessage(
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h4 className="font-semibold mb-2 text-blue-400">
                  📋 Contract Type Detection
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Is this a proxy contract? Proxy contracts delegate calls to
                  implementation contracts.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsProxyContract(true);
                      addMessage("Yes, this is a proxy contract", "user");
                      addMessage(
                        "Great! For proxy contracts, I'll help you verify the proxy itself. The implementation contract should be verified separately. Please select the compiler type:",
                        "bot"
                      );
                      setCurrentStep(3);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Yes, Proxy Contract
                  </button>
                  <button
                    onClick={() => {
                      setIsProxyContract(false);
                      addMessage("No, regular contract", "user");
                      addMessage(
                        "Perfect! Please select the compiler type for your contract:",
                        "bot"
                      );
                      setCurrentStep(3);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    No, Regular Contract
                  </button>
                </div>
              </div>,
              "bot"
            );
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
      
      // Validate verification details first
      const validation = blockExplorer.validateVerificationDetails(verificationDetails);
      if (!validation.isValid) {
        addMessage(
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
            <h4 className="font-semibold mb-2 text-red-400">❌ Validation Failed</h4>
            <p className="text-sm text-gray-300 mb-2">Please fix the following issues:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>,
          "bot"
        );
        return;
      }
      
      addMessage("🚀 Starting verification process...", "bot");

      let result: VerificationResult;

      if (isProxyContract) {
        addMessage("🔧 Verifying as proxy contract...", "bot");
        result = await blockExplorer.verifyProxyContract(verificationDetails);
      } else {
        addMessage("📝 Verifying source code...", "bot");
        result = await blockExplorer.verifyContract(verificationDetails);
      }

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
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
            <h4 className="font-semibold mb-2 text-green-400">
              🎉 Verification Successful!
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              Your contract has been successfully verified on the Core
              blockchain. You can now:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300 mb-3">
              <li>View your contract on the block explorer</li>
              <li>Interact with it through the explorer interface</li>
              <li>
                Others can now read and verify your contract&apos;s source code
              </li>
            </ul>
            <div className="flex gap-2 mt-3">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                View on Explorer
              </a>
              <button
                onClick={resetVerification}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Verify Another Contract
              </button>
            </div>
          </div>,
          "bot"
        );
      } else {
        addMessage(
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
            <h4 className="font-semibold mb-2 text-red-400">
              ❌ Verification Failed
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              The verification process failed. Common issues include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300 mb-3">
              <li>Incorrect compiler version</li>
              <li>Missing constructor arguments</li>
              <li>Wrong optimization settings</li>
              <li>Source code doesn&apos;t match deployed bytecode</li>
              <li>Wrong EVM version selected</li>
            </ul>
            <p className="text-sm text-gray-400 mb-3">
              Error details: {result.message}
            </p>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
          </div>,
          "bot"
        );
      }
    } catch (error) {
      console.error("Error during verification:", error);
      addMessage(
        <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
          <h4 className="font-semibold mb-2 text-red-400">❌ Verification Error</h4>
          <p className="text-sm text-gray-300 mb-3">
            An unexpected error occurred: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => setCurrentStep(3)}
            className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>,
        "bot"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerificationDetails({});
    setVerificationResult(null);
    setIsProxyContract(false);
    setCurrentStep(1);
    addMessage(
      "Let&apos;s start again. Please enter your contract address.",
      "bot"
    );
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
