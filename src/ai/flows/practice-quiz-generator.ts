'use server';

/**
 * @fileOverview Generates a practice quiz with multiple-choice questions based on a given topic.
 *
 * - generatePracticeQuiz - A function that generates a quiz.
 * - GeneratePracticeQuizInput - The input type for the generatePracticeQuiz function.
 * - GeneratePracticeQuizOutput - The return type for the generatePracticeQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers for the question.'),
  correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('A brief explanation for why the correct answer is right.'),
});

const GeneratePracticeQuizInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a practice quiz.'),
  numQuestions: z.number().min(1).max(10).describe('The number of questions to generate.'),
});
export type GeneratePracticeQuizInput = z.infer<typeof GeneratePracticeQuizInputSchema>;

const GeneratePracticeQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated quiz questions.'),
});
export type GeneratePracticeQuizOutput = z.infer<typeof GeneratePracticeQuizOutputSchema>;

export async function generatePracticeQuiz(input: GeneratePracticeQuizInput): Promise<GeneratePracticeQuizOutput> {
  return generatePracticeQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeQuizPrompt',
  input: { schema: GeneratePracticeQuizInputSchema },
  output: { schema: GeneratePracticeQuizOutputSchema },
  prompt: `You are an expert educator creating a practice quiz. Generate a multiple-choice quiz about the following topic.

Topic: {{{topic}}}
Number of Questions: {{{numQuestions}}}

Please generate the questions with 4 options each, and provide an explanation for the correct answer.`,
});

const generatePracticeQuizFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuizFlow',
    inputSchema: GeneratePracticeQuizInputSchema,
    outputSchema: GeneratePracticeQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
