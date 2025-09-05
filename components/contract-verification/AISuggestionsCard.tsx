"use client";

import type { AISuggestion } from "@/types/coredao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lightbulb, Wrench, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Props interface for AISuggestionsCard component
 * @param suggestions - AI-generated suggestions for compiler settings and code fixes
 * @param isLoading - Loading state for AI suggestions
 */
interface AISuggestionsCardProps {
  suggestions: AISuggestion | null;
  isLoading: boolean;
}

/**
 * AISuggestionsCard Component
 *
 * Displays AI-generated suggestions for smart contract verification including:
 * - Compiler settings recommendations (version, EVM version, optimization)
 * - Code vulnerability fixes and optimizations
 *
 * Features:
 * - Loading state with skeleton animation
 * - Collapsible sections for different suggestion types
 * - Badge display for compiler settings
 * - Formatted code suggestions with syntax highlighting
 * - Conditional rendering based on available suggestions
 *
 * @param suggestions - AI suggestions object containing compiler settings and fixes
 * @param isLoading - Boolean indicating if suggestions are being loaded
 * @returns JSX element containing the AI suggestions card or null if no suggestions
 */
const AISuggestionsCard: React.FC<AISuggestionsCardProps> = ({
  suggestions,
  isLoading,
}) => {
  // Show loading skeleton while AI suggestions are being generated
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Lightbulb className="mr-2 h-6 w-6 text-accent" />
            AI Suggestions
          </CardTitle>
          <CardDescription>
            Analyzing your contract for improvements...
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading skeleton animation */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no suggestions are available
  if (!suggestions || (!suggestions.fixes && !suggestions.compilerVersion)) {
    return null;
  }

  // Check if we have compiler-related suggestions
  const hasCompilerSuggestions =
    suggestions.compilerVersion ||
    suggestions.evmVersion ||
    suggestions.optimizationUsed ||
    suggestions.runs;
  const hasFixSuggestions = suggestions.fixes;

  return (
    <Card className="shadow-lg border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-accent">
          <Lightbulb className="mr-2 h-6 w-6" />
          AI-Powered Suggestions
        </CardTitle>
        <CardDescription>
          Our AI has analyzed your contract and found potential improvements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={["compiler-settings", "code-fixes"]}
        >
          {/* Compiler Settings Suggestions Section */}
          {hasCompilerSuggestions && (
            <AccordionItem value="compiler-settings">
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center">
                  <Settings2 className="mr-2 h-5 w-5" />
                  Suggested Compiler Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3 text-sm">
                {/* Compiler Version Suggestion */}
                {suggestions.compilerVersion && (
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="font-medium">Compiler Version:</span>
                    <Badge variant="outline" className="font-code">
                      {suggestions.compilerVersion}
                    </Badge>
                  </div>
                )}

                {/* EVM Version Suggestion */}
                {suggestions.evmVersion && (
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="font-medium">EVM Version:</span>
                    <Badge variant="outline" className="font-code">
                      {suggestions.evmVersion}
                    </Badge>
                  </div>
                )}

                {/* Optimization Setting Suggestion */}
                {suggestions.optimizationUsed && (
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="font-medium">Optimization:</span>
                    <Badge variant="outline">
                      {suggestions.optimizationUsed === "yes"
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </div>
                )}

                {/* Optimization Runs Suggestion (only if optimization is enabled) */}
                {suggestions.runs !== undefined &&
                  suggestions.optimizationUsed === "yes" && (
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-medium">Optimization Runs:</span>
                      <Badge variant="outline" className="font-code">
                        {suggestions.runs}
                      </Badge>
                    </div>
                  )}

                <p className="text-xs text-muted-foreground pt-2">
                  You can apply these settings in the &apos;Compiler &
                  License&apos; step.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Code Fixes and Optimizations Section */}
          {hasFixSuggestions && (
            <AccordionItem value="code-fixes">
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5" />
                  Code Vulnerabilities & Optimizations
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                {/* Display formatted code suggestions */}
                <div className="prose prose-sm prose-invert max-w-none bg-muted/30 p-4 rounded-md font-body">
                  <pre className="whitespace-pre-wrap font-code text-xs p-0 bg-transparent">
                    {suggestions.fixes}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Review these suggestions and apply necessary changes to your
                  source code before verification for better security and
                  efficiency.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AISuggestionsCard;
