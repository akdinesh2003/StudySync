"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateSummary, type GenerateSummaryOutput } from "@/ai/flows/ai-summary-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  text: z.string().min(50, { message: "Please enter at least 50 characters to generate a summary." }),
});

export default function AiSummaryPage() {
  const [result, setResult] = useState<GenerateSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateSummary({ text: values.text });
      setResult(output);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-accent" />
          AI Summary Generator
        </h1>
        <p className="text-muted-foreground">
          Paste your textbook content or notes to get concise summaries and flashcards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
          <CardDescription>Enter the content you want to summarize below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Content to summarize</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your notes or textbook chapter here..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Summary</CardTitle>
              <CardDescription>{result.progress}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{result.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Generated Flashcards</CardTitle>
              <CardDescription>Use these for quick revision.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{result.flashcards}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
