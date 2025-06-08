"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SuggestCompilerSettingsInputSchema = z.object({
  sourceCode: z.string().describe("The source code of the smart contract."),
});
export type SuggestCompilerSettingsInput = z.infer<
  typeof SuggestCompilerSettingsInputSchema
>;

const SuggestCompilerSettingsOutputSchema = z.object({
  compilerVersion: z
    .string()
    .describe("The suggested compiler version for the contract."),
  evmVersion: z
    .string()
    .describe("The suggested EVM version for the contract."),
  optimizationUsed: z
    .string()
    .describe("Whether optimization should be used (yes/no)."),
  runs: z
    .number()
    .describe("The suggested number of runs if optimization is enabled."),
});
export type SuggestCompilerSettingsOutput = z.infer<
  typeof SuggestCompilerSettingsOutputSchema
>;

export async function suggestCompilerSettings(
  input: SuggestCompilerSettingsInput
): Promise<SuggestCompilerSettingsOutput> {
  return suggestCompilerSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestCompilerSettingsPrompt",
  input: { schema: SuggestCompilerSettingsInputSchema },
  output: { schema: SuggestCompilerSettingsOutputSchema },
  prompt: `You are an AI assistant that helps developers to verify smart contracts.
Based on the provided smart contract source code, suggest the appropriate compiler version, EVM version and optimization settings (including the number of runs if applicable) to improve the contract verification success rate.

Smart Contract Source Code:
{{sourceCode}}

Consider:
- Current best practices for smart contract deployment and verification.
- Common pitfalls that lead to verification failures.

Output in JSON format. Example:
{
  "compilerVersion": "v0.8.19+commit.7dd6d414",
  "evmVersion": "london",
  "optimizationUsed": "yes",
  "runs": 200
}
`,
});

const suggestCompilerSettingsFlow = ai.defineFlow(
  {
    name: "suggestCompilerSettingsFlow",
    inputSchema: SuggestCompilerSettingsInputSchema,
    outputSchema: SuggestCompilerSettingsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
