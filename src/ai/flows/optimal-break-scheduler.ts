'use server';

/**
 * @fileOverview Suggests optimal break times based on study duration using an AI tool to calculate cognitive load.
 *
 * - getOptimalBreakSchedule - A function that returns break suggestions.
 * - OptimalBreakSchedulerInput - The input type for the getOptimalBreakSchedule function.
 * - OptimalBreakSchedulerOutput - The return type for the getOptimalBreakSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimalBreakSchedulerInputSchema = z.object({
  studyDurationMinutes: z
    .number()
    .describe('The duration of the study session in minutes.')
    .min(1),
});
export type OptimalBreakSchedulerInput = z.infer<
  typeof OptimalBreakSchedulerInputSchema
>;

const OptimalBreakSchedulerOutputSchema = z.object({
  breakSuggestions: z
    .array(z.string())
    .describe(
      'An array of suggested break times, formatted as sentences. For example: [\n        "Take a 5-minute break at the 25-minute mark.",
        "Take a 10-minute break at the 50-minute mark.",
      ]'
    ),
});
export type OptimalBreakSchedulerOutput = z.infer<
  typeof OptimalBreakSchedulerOutputSchema
>;

export async function getOptimalBreakSchedule(
  input: OptimalBreakSchedulerInput
): Promise<OptimalBreakSchedulerOutput> {
  return optimalBreakSchedulerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimalBreakSchedulerPrompt',
  input: {schema: OptimalBreakSchedulerInputSchema},
  output: {schema: OptimalBreakSchedulerOutputSchema},
  prompt: `You are an AI study assistant that suggests optimal break times during study sessions to maximize focus and minimize burnout.

  Given a study duration, calculate the optimal break schedule considering cognitive load and the need for regular breaks. The break suggestions should be formatted as sentences.

  Study Duration: {{{studyDurationMinutes}}} minutes

  Break Suggestions:`,
});

const optimalBreakSchedulerFlow = ai.defineFlow(
  {
    name: 'optimalBreakSchedulerFlow',
    inputSchema: OptimalBreakSchedulerInputSchema,
    outputSchema: OptimalBreakSchedulerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
