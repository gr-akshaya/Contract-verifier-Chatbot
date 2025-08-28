"use client";

import React, { useState, useCallback } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, Wand2 } from "lucide-react";

import CodeEditor from "./CodeEditor";

import {
  NETWORKS,
  COMPILER_TYPES,
  LICENSE_TYPES,
  COMPILER_VERSIONS,
  EVM_VERSIONS,
  OPTIMIZATION_OPTIONS,
  DEFAULT_VERIFICATION_DETAILS,
} from "@/lib/constants";
import {
  verifyContract,
  checkVerificationStatus,
  getSourceCode,
  getAbi,
} from "@/lib/coredao";
import type {
  VerificationDetails,
  AISuggestion,
  Network,
  GetSourceCodeResponse,
} from "@/types/coredao";
import {
  suggestCompilerSettings,
  SuggestCompilerSettingsInput,
  SuggestCompilerSettingsOutput,
} from "@/ai/flows/suggest-compiler-settings";
import {
  suggestFixes,
  SuggestFixesInput,
  SuggestFixesOutput,
} from "@/ai/flows/suggest-fixes";
import { toast } from "sonner";

const FormSchema = z.object({
  network: z.enum(["mainnet", "testnet2"]).optional(),
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  compilerType: z.enum(
    COMPILER_TYPES.map((ct) => ct.value) as [
      (typeof COMPILER_TYPES)[number]["value"],
      ...(typeof COMPILER_TYPES)[number]["value"][]
    ]
  ),
  sourceCode: z.string().min(1, "Source code cannot be empty"),
  contractName: z.string().min(1, "Contract name is required"),
  compilerVersion: z.string().min(1, "Compiler version is required"),
  evmVersion: z.string().optional(),
  optimizationUsed: z.enum(["0", "1"]),
  runs: z
    .number()
    .min(0)
    .max(10000000)
    .or(z.string().regex(/^\d+$/).transform(Number)),
  licenseType: z.number().int().min(0, "License type is required"),
  constructorArguments: z.string().optional(),
});

type Step = "address" | "source" | "compiler";

interface ContractDetailsFormProps {
  onCompletion: (
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
  ) => void;
  onShowAISuggestions: (
    suggestions: AISuggestion | null,
    isLoading: boolean
  ) => void;
}

export default function ContractDetailsForm({
  onCompletion,
  onShowAISuggestions,
}: ContractDetailsFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [isAISuggestionsLoading, setIsAISuggestionsLoading] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion | null>(null);

  const [isSubmittingForVerification, setIsSubmittingForVerification] =
    useState(false);

  const methods = useForm<VerificationDetails>({
    resolver: zodResolver(FormSchema),
    defaultValues: DEFAULT_VERIFICATION_DETAILS,
  });
  const {
    control,
    watch,
    setValue,
    formState: { errors, touchedFields },
    trigger,
  } = methods;

  const sourceCode = watch("sourceCode");
  const optimizationUsed = watch("optimizationUsed");
  const compilerType = watch("compilerType");

  const handleGetAISuggestions = useCallback(async () => {
    if (!sourceCode) {
      toast("Source code empty", {
        className: "bg-red-500 text-white",
        description: "Please provide source code to get AI suggestions.",
      });
      return;
    }
    setIsAISuggestionsLoading(true);
    setAISuggestions(null);
    onShowAISuggestions(null, true);

    try {
      const compilerSettingsPromise = suggestCompilerSettings({
        sourceCode,
      } as SuggestCompilerSettingsInput);
      const fixesPromise = suggestFixes({ sourceCode } as SuggestFixesInput);

      const [compilerResult, fixesResult] = await Promise.all([
        compilerSettingsPromise,
        fixesPromise,
      ]);

      const combinedSuggestions: AISuggestion = {
        ...(compilerResult as SuggestCompilerSettingsOutput),
        optimizationUsed:
          (compilerResult as SuggestCompilerSettingsOutput).optimizationUsed ===
          "yes"
            ? "yes"
            : (compilerResult as SuggestCompilerSettingsOutput)
                .optimizationUsed === "no"
            ? "no"
            : undefined,
        fixes: (fixesResult as SuggestFixesOutput).fixes,
      };
      setAISuggestions(combinedSuggestions);
      onShowAISuggestions(combinedSuggestions, false);

      if (
        combinedSuggestions.compilerVersion &&
        !touchedFields.compilerVersion
      ) {
        setValue("compilerVersion", combinedSuggestions.compilerVersion, {
          shouldValidate: true,
        });
      }
      if (combinedSuggestions.evmVersion && !touchedFields.evmVersion) {
        setValue("evmVersion", combinedSuggestions.evmVersion, {
          shouldValidate: true,
        });
      }
      if (
        combinedSuggestions.optimizationUsed &&
        !touchedFields.optimizationUsed
      ) {
        setValue(
          "optimizationUsed",
          combinedSuggestions.optimizationUsed === "yes" ? "1" : "0",
          { shouldValidate: true }
        );
      }
      if (
        combinedSuggestions.runs &&
        combinedSuggestions.optimizationUsed === "yes" &&
        !touchedFields.runs
      ) {
        setValue("runs", combinedSuggestions.runs, { shouldValidate: true });
      }

      toast("AI Suggestions Retrieved", {
        description:
          "Suggestions for compiler settings and code improvements are available.",
      });
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast("AI Suggestion Error", {
        description: "Could not fetch AI suggestions.",
        className: "bg-red-500 text-white",
      });
      onShowAISuggestions(null, false);
    } finally {
      setIsAISuggestionsLoading(false);
    }
  }, [sourceCode, setValue, touchedFields, onShowAISuggestions]);

  const pollVerificationStatus = useCallback(
    (guid: string, selectedNetwork: Network, contractAddr: string) => {
      let attempts = 0;
      const maxAttempts = 24;

      const intervalId = setInterval(() => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(intervalId);
          onCompletion(
            "Verification polling timed out. Please check the explorer manually.",
            {
              isLoading: false,
              isPolling: false,
              statusMessage: null,
              errorMessage: "Polling Timeout",
              isVerified: null,
            }
          );
          toast("Polling Timeout", {
            description: "Verification check took too long.",
            className: "bg-red-500 text-white",
          });
          return;
        }

        (async () => {
          try {
            const statusRes = await checkVerificationStatus(
              selectedNetwork,
              guid
            );

            if (statusRes.message.toLowerCase().includes("pass - verified")) {
              clearInterval(intervalId);
              toast("Verification Successful!", {
                description: "Your contract has been verified.",
                className: "bg-green-500 text-white",
              });

              const [sourceData, abiData] = await Promise.all([
                getSourceCode(selectedNetwork, contractAddr),
                getAbi(selectedNetwork, contractAddr),
              ]);

              onCompletion(null, {
                isLoading: false,
                isPolling: false,
                statusMessage: "Contract successfully verified!",
                errorMessage: null,
                isVerified: true,
                verifiedSourceCode:
                  sourceData.status === "1" && sourceData.result.length > 0
                    ? sourceData.result[0]
                    : null,
                verifiedAbi: abiData.status === "1" ? abiData.result : null,
                guid,
              });
            } else if (
              statusRes.message
                .toLowerCase()
                .includes("fail - unable to verify") ||
              statusRes.message.toLowerCase().includes("already verified") ||
              statusRes.status === "0"
            ) {
              clearInterval(intervalId);
              const errorDetail =
                statusRes.result ||
                statusRes.message ||
                "Verification failed. Please check your inputs.";
              onCompletion(errorDetail, {
                isLoading: false,
                isPolling: false,
                statusMessage: null,
                errorMessage: errorDetail,
                isVerified: false,
                guid,
              });
              toast("Verification Failed", {
                description: errorDetail,
                className: "bg-red-500 text-white",
              });
            } else {
              onCompletion(null, {
                isLoading: true,
                isPolling: true,
                statusMessage: statusRes.message,
                errorMessage: null,
                isVerified: null,
                guid,
              });
            }
          } catch (error: unknown) {
            clearInterval(intervalId);
            const errorDetail =
              typeof error === "object" && error !== null && "message" in error
                ? String((error as { message?: string }).message)
                : "Error polling verification status.";
            onCompletion(errorDetail, {
              isLoading: false,
              isPolling: false,
              statusMessage: null,
              errorMessage: errorDetail,
              isVerified: false,
              guid,
            });
            toast("Polling Error", {
              description: errorDetail,
              className: "bg-red-500 text-white",
            });
          }
        })();
      }, 5000);
    },
    [onCompletion]
  );

  const onSubmit: SubmitHandler<VerificationDetails> = async (data) => {
    setIsSubmittingForVerification(true);
    onCompletion(null, {
      isLoading: true,
      isPolling: false,
      statusMessage: "Submitting for verification...",
      errorMessage: null,
      isVerified: null,
    });

    const license = LICENSE_TYPES.find((lt) => lt.value === data.licenseType);

    try {
      const response = await verifyContract(data.network, {
        contractAddress: data.contractAddress,
        compilerType: data.compilerType,
        sourceCode: data.sourceCode,
        contractName: data.contractName,
        compilerVersion: data.compilerVersion,
        optimizationUsed: data.optimizationUsed,
        runs: Number(data.runs),
        licenseType: license?.apiValue || 1,
        evmVersion: data.evmVersion,
        constructorArguments: data.constructorArguments,
      });

      if (response.data.success === true) {
        toast("Verification Submitted", {
          description: `Verification submitted successfully.`,
        });
        onCompletion(null, {
          isLoading: true,
          isPolling: true,
          statusMessage: `Verification submitted`,
          errorMessage: null,
          isVerified: null,
        });
        pollVerificationStatus(
          response.data.txHash || response.data.response,
          data.network,
          data.contractAddress
        );
      } else {
        const errorDetail =
          response.data.response ||
          response.message ||
          "Verification submission failed.";
        onCompletion(errorDetail, {
          isLoading: false,
          isPolling: false,
          statusMessage: null,
          errorMessage: errorDetail,
          isVerified: false,
        });
        toast("Verification Error", {
          description: errorDetail,
          className: "bg-red-500 text-white",
        });
      }
    } catch (error: unknown) {
      const errorDetail =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: string }).message)
          : "An unexpected error occurred.";
      onCompletion(errorDetail, {
        isLoading: false,
        isPolling: false,
        statusMessage: null,
        errorMessage: errorDetail,
        isVerified: false,
      });
      toast("Verification Error", {
        description: errorDetail,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmittingForVerification(false);
    }
  };

  const triggerSubmitAndProceed = async () => {
    const isValidForm = await trigger();
    if (isValidForm) {
      methods.handleSubmit(onSubmit)();
    } else {
      const fieldErrors = Object.keys(errors);
      if (fieldErrors.length > 0) {
        toast("Verification Error", {
          description: "Please correct the errors before proceeding.",
          className: "bg-red-500 text-white",
        });
      }
    }
  };

  const next = async () => {
    let currentFieldsToValidate: (keyof VerificationDetails)[] = [];
    if (currentStep === "address") {
      currentFieldsToValidate = ["network", "contractAddress"];
    } else if (currentStep === "source") {
      currentFieldsToValidate = ["sourceCode", "contractName"];
    } else if (currentStep === "compiler") {
      triggerSubmitAndProceed();
      return;
    }

    const isValidStep = await trigger(currentFieldsToValidate);
    if (isValidStep) {
      if (currentStep === "address") setCurrentStep("source");
      else if (currentStep === "source") setCurrentStep("compiler");
    } else {
      toast("Verification Error", {
        description: "Please correct the errors before proceeding.",
        className: "bg-red-500 text-white",
      });
    }
  };

  const prev = () => {
    if (currentStep === "source") setCurrentStep("address");
    else if (currentStep === "compiler") setCurrentStep("source");
  };

  const renderStep = () => {
    switch (currentStep) {
      case "address":
        return (
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="network" className="text-base">
                Network
              </Label>
              <Controller
                name="network"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={
                      field.value !== undefined ? String(field.value) : ""
                    }
                    className="flex space-x-4 mt-2"
                  >
                    {NETWORKS.map((networkItem) => (
                      <div
                        key={networkItem.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={networkItem.value as string}
                          id={`verify-${networkItem.value}`}
                        />
                        <Label
                          htmlFor={`verify-${networkItem.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {networkItem.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.network && (
                <p className="text-sm text-destructive mt-1">
                  {errors.network.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="contractAddress" className="text-base">
                Contract Address
              </Label>
              <Controller
                name="contractAddress"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contractAddress"
                    placeholder="0x..."
                    className="mt-1 text-base"
                  />
                )}
              />
              {errors.contractAddress && (
                <p className="text-sm text-destructive mt-1">
                  {errors.contractAddress.message}
                </p>
              )}
            </div>
          </CardContent>
        );
      case "source":
        return (
          <CardContent className="space-y-6 pt-6">
            <Controller
              name="sourceCode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Controller
                  name="contractName"
                  control={control}
                  render={({ field: contractNameField }) => (
                    <CodeEditor
                      sourceCode={value}
                      onSourceCodeChange={(newVal) => {
                        onChange(newVal);
                        if (aiSuggestions) {
                          setAISuggestions(null);
                          onShowAISuggestions(null, false);
                        }
                      }}
                      contractName={contractNameField.value}
                      onContractNameChange={contractNameField.onChange}
                      compilerType={compilerType}
                    />
                  )}
                />
              )}
            />
            {errors.sourceCode && (
              <p className="text-sm text-destructive mt-1">
                {errors.sourceCode.message}
              </p>
            )}
            {errors.contractName && (
              <p className="text-sm text-destructive mt-1">
                {errors.contractName.message}
              </p>
            )}
            <Button
              onClick={handleGetAISuggestions}
              disabled={isAISuggestionsLoading || !sourceCode}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isAISuggestionsLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get AI Suggestions
            </Button>
            {/* AISuggestionsCard is rendered by parent */}
          </CardContent>
        );
      case "compiler":
        return (
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="compilerType" className="text-base">
                  Compiler Type
                </Label>
                <Controller
                  name="compilerType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={
                        field.value !== undefined ? String(field.value) : ""
                      }
                    >
                      <SelectTrigger
                        id="compilerType"
                        className="mt-1 text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPILER_TYPES.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={String(type.value)}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.compilerType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.compilerType.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="compilerVersion" className="text-base">
                  Compiler Version
                </Label>
                <Controller
                  name="compilerVersion"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="compilerVersion"
                        className="mt-1 text-base"
                      >
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COMPILER_VERSIONS.map((version) => (
                          <SelectItem
                            key={version}
                            value={version || "default"}
                          >
                            {version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.compilerVersion && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.compilerVersion.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="evmVersion" className="text-base">
                  EVM Version (Optional)
                </Label>
                <Controller
                  name="evmVersion"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger id="evmVersion" className="mt-1 text-base">
                        <SelectValue placeholder="Select EVM version (e.g. shanghai)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="">Default</SelectItem>
                        {EVM_VERSIONS.map((version) => (
                          <SelectItem
                            key={version}
                            value={version || "default"}
                          >
                            {version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="licenseType" className="text-base">
                  License Type
                </Label>
                <Controller
                  name="licenseType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={
                        field.value !== undefined ? String(field.value) : ""
                      }
                    >
                      <SelectTrigger
                        id="licenseType"
                        className="mt-1 text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {LICENSE_TYPES.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={String(type.value) || "default"}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.licenseType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.licenseType.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="optimizationUsed" className="text-base">
                  Optimization Used
                </Label>
                <Controller
                  name="optimizationUsed"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        id="optimizationUsed"
                        className="mt-1 text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPTIMIZATION_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value || "default"}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="runs" className="text-base">
                  Optimization Runs
                </Label>
                <Controller
                  name="runs"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="runs"
                      type="number"
                      className="mt-1 text-base"
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                      disabled={optimizationUsed === "0"}
                    />
                  )}
                />
                {errors.runs && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.runs.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="constructorArguments" className="text-base">
                Constructor Arguments (ABI-encoded, Optional)
              </Label>
              <Controller
                name="constructorArguments"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="constructorArguments"
                    placeholder="0x..."
                    className="mt-1 text-base font-code"
                  />
                )}
              />
            </div>
            {aiSuggestions &&
              (aiSuggestions.compilerVersion || aiSuggestions.evmVersion) && (
                <Alert
                  variant="default"
                  className="border-accent/30 bg-accent/10 text-accent-foreground"
                >
                  <Wand2 className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent">
                    AI Suggested Settings Applied
                  </AlertTitle>
                  <AlertDescription>
                    Some compiler settings may have been pre-filled based on AI
                    analysis. You can adjust them if needed. View all
                    suggestions in the chat history.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        );
      default:
        return null;
    }
  };

  const stepTitles: Record<Step, string> = {
    address: "Contract Address & Network",
    source: "Source Code & Details",
    compiler: "Compiler & License",
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case "address":
        return 1;
      case "source":
        return 2;
      case "compiler":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6">
      <FormProvider {...methods}>
        <Card className="w-full shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">
              {`Step ${getStepNumber(currentStep)} of 3: ${
                stepTitles[currentStep]
              }`}
            </CardTitle>
            <CardDescription>
              {currentStep === "address" &&
                "Specify the contract address and the network it's deployed on."}
              {currentStep === "source" &&
                "Provide the Solidity source code and contract name. You can also get AI suggestions here."}
              {currentStep === "compiler" &&
                "Configure compiler settings, EVM version, and license type. Click 'Verify Contract' to submit."}
            </CardDescription>
          </CardHeader>

          {renderStep()}

          <CardFooter className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prev}
              disabled={
                currentStep === "address" || isSubmittingForVerification
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              type="button"
              onClick={next}
              disabled={
                isSubmittingForVerification ||
                (currentStep === "address" &&
                  (!watch("contractAddress") ||
                    !!errors.contractAddress ||
                    !watch("network") ||
                    !!errors.network))
              }
            >
              {isSubmittingForVerification && currentStep === "compiler" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : currentStep === "compiler" ? (
                "Verify Contract"
              ) : (
                "Next"
              )}{" "}
              {!isSubmittingForVerification && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </FormProvider>
    </div>
  );
}
