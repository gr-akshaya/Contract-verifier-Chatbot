"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SuggestFixesInputSchema = z.object({
  sourceCode: z.string().describe("The Solidity source code to analyze."),
});
export type SuggestFixesInput = z.infer<typeof SuggestFixesInputSchema>;

const SuggestFixesOutputSchema = z.object({
  fixes: z
    .string()
    .describe(
      "A list of suggested fixes for the Solidity code, including security vulnerabilities and gas optimization opportunities."
    ),
});
export type SuggestFixesOutput = z.infer<typeof SuggestFixesOutputSchema>;

export async function suggestFixes(
  input: SuggestFixesInput
): Promise<SuggestFixesOutput> {
  return suggestFixesFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestFixesPrompt",
  input: { schema: SuggestFixesInputSchema },
  output: { schema: SuggestFixesOutputSchema },
  prompt: `You are an AI-powered vulnerability scanner and gas optimization expert for Solidity smart contracts.

  Analyze the following Solidity source code and provide a list of suggested fixes, including potential security vulnerabilities and gas optimization opportunities.

  Make sure to provide detailed explaination of each vulnerability and suggest line numbers. Do not be vague.

  Source Code:
  \`\`\`solidity
  {{{sourceCode}}}
  \`\`\`
  `,
});

const suggestFixesFlow = ai.defineFlow(
  {
    name: "suggestFixesFlow",
    inputSchema: SuggestFixesInputSchema,
    outputSchema: SuggestFixesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
