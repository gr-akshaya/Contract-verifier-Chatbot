"use client";

/**
 * Verification Status Component
 *
 * This component displays the current status of contract verification operations.
 * It provides comprehensive status information including:
 * - Loading states and progress indicators
 * - Success/failure status with appropriate icons
 * - Detailed error messages and information
 * - Contract details display for verified contracts
 * - Source code and ABI viewing capabilities
 *
 * Features:
 * - Dynamic status icons based on operation state
 * - Accordion layout for organized information display
 * - Scrollable content areas for large data
 * - Conditional rendering based on verification status
 * - Support for different operation types (lookup, verification)
 */

import type { GetSourceCodeResponse } from "@/types/coredao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  FileJson,
  FileText,
  Info,
  SearchSlash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Props interface for VerificationStatus component
 */
interface VerificationStatusProps {
  isLoading: boolean;
  isPolling: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  isVerified: boolean | null;
  verifiedSourceCode?: GetSourceCodeResponse["result"][0] | null;
  verifiedAbi?: string | null;
  guid?: string | null;
  loadingOperationName?: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  isLoading,
  isPolling,
  statusMessage,
  errorMessage,
  isVerified,
  verifiedSourceCode,
  verifiedAbi,
  guid,
  loadingOperationName,
}) => {
  // Don't render if no status information available
  if (!isLoading && !statusMessage && !errorMessage && isVerified === null) {
    return null;
  }

  /**
   * Returns appropriate status icon based on current state
   */
  const getStatusIcon = () => {
    if (isLoading || isPolling)
      return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
    if (isVerified === true)
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (
      isVerified === false &&
      verifiedSourceCode === null &&
      !errorMessage?.toLowerCase().includes("error")
    )
      return <SearchSlash className="h-6 w-6 text-yellow-500" />;
    if (isVerified === false || errorMessage)
      return <XCircle className="h-6 w-6 text-destructive" />;
    return <Info className="h-6 w-6 text-blue-500" />;
  };

  /**
   * Returns appropriate status title based on current state
   */
  const getStatusTitle = () => {
    const defaultLoadingOpName = "Processing";
    const currentLoadingOpName = loadingOperationName || defaultLoadingOpName;

    if (isLoading && !isPolling) return `${currentLoadingOpName}...`;
    if (isLoading && isPolling) return "Checking Verification Status...";
    if (isVerified === true) return "Operation Successful";
    if (isVerified === false) {
      if (
        verifiedSourceCode === null &&
        !errorMessage?.toLowerCase().includes("error") &&
        loadingOperationName?.toLowerCase().includes("fetch")
      ) {
        return "Contract Not Found or Unverified";
      }
      return "Operation Failed";
    }
    if (errorMessage && isVerified === null) return "Status Update";
    return "Status Overview";
  };

  const cardBorderColor =
    isVerified === true
      ? "border-green-500/50"
      : isVerified === false || errorMessage
      ? "border-destructive/50"
      : "border-primary/50";
  if (
    isVerified === false &&
    verifiedSourceCode === null &&
    !errorMessage?.toLowerCase().includes("error") &&
    loadingOperationName?.toLowerCase().includes("fetch")
  ) {
  }

  return (
    <Card className={`shadow-lg mt-6 ${cardBorderColor}`}>
      <CardHeader className="flex flex-row items-center space-x-3">
        {getStatusIcon()}
        <div>
          <CardTitle className="text-xl font-headline">
            {getStatusTitle()}
          </CardTitle>
          {statusMessage && !errorMessage && (
            <CardDescription>{statusMessage}</CardDescription>
          )}
          {guid && (
            <CardDescription className="text-xs">GUID: {guid}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert
            variant={
              isVerified === false &&
              verifiedSourceCode === null &&
              !errorMessage?.toLowerCase().includes("error")
                ? "default"
                : "destructive"
            }
            className={`mb-4 ${
              isVerified === false &&
              verifiedSourceCode === null &&
              !errorMessage?.toLowerCase().includes("error")
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                : ""
            }`}
          >
            {isVerified === false &&
            verifiedSourceCode === null &&
            !errorMessage?.toLowerCase().includes("error") ? (
              <SearchSlash className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {isVerified === false &&
              verifiedSourceCode === null &&
              !errorMessage?.toLowerCase().includes("error")
                ? "Information"
                : "Error"}
            </AlertTitle>
            <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {isVerified === true && (verifiedSourceCode || verifiedAbi) && (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={["details", "source-code", "abi"]}
          >
            {verifiedSourceCode && (
              <AccordionItem value="details">
                <AccordionTrigger className="text-lg hover:no-underline">
                  Contract Details
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3 text-sm">
                  {verifiedSourceCode?.ContractName && (
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="font-medium">Name:</span>
                      <Badge variant="outline">
                        {verifiedSourceCode.ContractName}
                      </Badge>
                    </div>
                  )}
                  {verifiedSourceCode?.CompilerVersion && (
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                      <span className="font-medium">Compiler:</span>
                      <Badge variant="outline" className="font-code">
                        {verifiedSourceCode.CompilerVersion}
                      </Badge>
                    </div>
                  )}
                  {verifiedSourceCode?.EVMVersion &&
                    verifiedSourceCode.EVMVersion !== "Default" && (
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                        <span className="font-medium">EVM Version:</span>
                        <Badge variant="outline" className="font-code">
                          {verifiedSourceCode.EVMVersion}
                        </Badge>
                      </div>
                    )}
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span className="font-medium">Optimization:</span>
                    <Badge
                      variant={
                        verifiedSourceCode?.OptimizationUsed === "1"
                          ? "default"
                          : "secondary"
                      }
                      className="ml-2"
                    >
                      {verifiedSourceCode?.OptimizationUsed === "1"
                        ? `Enabled (${verifiedSourceCode.Runs} runs)`
                        : "Disabled"}
                    </Badge>
                  </div>
                  {verifiedSourceCode?.LicenseType &&
                    verifiedSourceCode.LicenseType !== "Unknown" &&
                    verifiedSourceCode.LicenseType !== "" && (
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                        <span className="font-medium">License:</span>
                        <Badge variant="outline">
                          {verifiedSourceCode.LicenseType}
                        </Badge>
                      </div>
                    )}
                </AccordionContent>
              </AccordionItem>
            )}

            {verifiedAbi && (
              <AccordionItem value="abi">
                <AccordionTrigger className="text-lg hover:no-underline">
                  <FileJson className="mr-2 h-5 w-5" /> Contract ABI
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-64 mt-2 rounded-md border bg-muted/30">
                    <pre className="text-xs p-4 font-code whitespace-pre-wrap break-all">
                      {JSON.stringify(JSON.parse(verifiedAbi), null, 2)}
                    </pre>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            )}

            {verifiedSourceCode?.SourceCode && (
              <AccordionItem value="source-code">
                <AccordionTrigger className="text-lg hover:no-underline">
                  <FileText className="mr-2 h-5 w-5" /> Verified Source Code
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-96 mt-2 rounded-md border bg-muted/30">
                    <pre className="text-xs p-4 font-code whitespace-pre-wrap break-all">
                      {verifiedSourceCode.SourceCode}
                    </pre>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
