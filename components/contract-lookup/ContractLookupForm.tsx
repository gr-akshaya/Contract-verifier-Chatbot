"use client";

import React, { useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Loader2, Search } from "lucide-react";
import { NETWORKS } from "@/lib/constants";
import { getSourceCode, getAbi } from "@/lib/coredao";
import type { Network, GetSourceCodeResponse } from "@/types/coredao";
import { toast } from "sonner";

const LookupSchema = z.object({
  network: z.enum(["mainnet", "testnet2"]).optional(),
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
});

type LookupFormData = z.infer<typeof LookupSchema>;

interface ContractLookupFormProps {
  onCompletion: (
    error: string | null,
    data?: {
      isLoading: boolean;
      statusMessage: string | null;
      errorMessage: string | null;
      isVerified: boolean | null;
      verifiedSourceCode?: GetSourceCodeResponse["result"][0] | null;
      verifiedAbi?: string | null;
    }
  ) => void;
}

export default function ContractLookupForm({
  onCompletion,
}: ContractLookupFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<LookupFormData>({
    resolver: zodResolver(LookupSchema),
    defaultValues: {
      network: "mainnet",
      contractAddress: "",
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<LookupFormData> = async (data) => {
    setIsLoading(true);
    onCompletion(null, {
      isLoading: true,
      statusMessage: "Fetching contract details...",
      errorMessage: null,
      isVerified: null,
    });

    try {
      const [sourceData, abiData] = await Promise.all([
        getSourceCode(data.network, data.contractAddress),
        getAbi(data.network, data.contractAddress),
      ]);

      if (sourceData.status === "1" && sourceData.result.length > 0) {
        const fetchedAbi = abiData.status === "1" ? abiData.result : null;
        if (abiData.status !== "1") {
          toast("ABI Not Found", {
            description:
              abiData.message || "Could not retrieve ABI for this contract.",
          });
        }
        onCompletion(null, {
          isLoading: false,
          statusMessage: "Contract details retrieved successfully.",
          errorMessage: null,
          isVerified: true,
          verifiedSourceCode: sourceData.result[0],
          verifiedAbi: fetchedAbi,
        });
        toast("Contract Found", {
          description: "Verified source code and ABI retrieved.",
        });
      } else {
        const errorMsg =
          sourceData.message ||
          "Contract not found or not verified on the selected network.";
        onCompletion(errorMsg, {
          isLoading: false,
          statusMessage: null,
          errorMessage: errorMsg,
          isVerified: false,
        });
        toast(
          <div>
            <div className="font-semibold">Not Found</div>
            <div>{errorMsg}</div>
          </div>,
          { className: "bg-destructive text-white" }
        );
      }
    } catch (error: unknown) {
      let errorMsg = "An unexpected error occurred during lookup.";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        errorMsg = (error as { message: string }).message;
      }
      onCompletion(errorMsg, {
        isLoading: false,
        statusMessage: null,
        errorMessage: errorMsg,
        isVerified: false,
      });
      toast(
        <div>
          <div className="font-semibold">Lookup Error</div>
          <div>{errorMsg}</div>
        </div>,
        { className: "bg-destructive text-white" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Card className="w-full shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">
                Lookup Verified Contract
              </CardTitle>
              <CardDescription>
                Enter the contract address and select the network to fetch its
                verified source code and ABI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label htmlFor="lookup-network" className="text-base">
                  Network
                </Label>
                <Controller
                  name="network"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4 mt-2"
                      id="lookup-network"
                    >
                      {NETWORKS.map((networkItem) => (
                        <div
                          key={networkItem.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={networkItem.value as string}
                            id={`lookup-${networkItem.value}`}
                          />
                          <Label
                            htmlFor={`lookup-${networkItem.value}`}
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
                <Label htmlFor="lookup-contractAddress" className="text-base">
                  Contract Address
                </Label>
                <Controller
                  name="contractAddress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="lookup-contractAddress"
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
            <CardFooter className="pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Contract
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
