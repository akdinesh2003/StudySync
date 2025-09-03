'use server';

/**
 * @fileOverview Generates concise summaries and flashcards from textbook content or notes using AI.
 *
 * - generateSummary - A function that generates a summary from the given text.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  text: z
    .string()
    .describe('The textbook content or notes to summarize.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the input text.'),
  flashcards: z.string().describe('Generated flashcards from the input text.'),
  progress: z.string().describe('Progress indicator of the summary generation.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryInputSchema},
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `You are an expert summarizer and flashcard generator.

  Please generate a concise summary and flashcards from the following text, and a one-sentence progress summary of what you have generated.

  Text: {{{text}}}

  Summary:
  Flashcards:
  Progress: I have summarized the text and generated flashcards.`, 
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
