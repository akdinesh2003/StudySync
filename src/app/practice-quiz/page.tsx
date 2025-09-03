"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generatePracticeQuiz,
  type GeneratePracticeQuizOutput,
} from '@/ai/flows/practice-quiz-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Loader2, PencilRuler, Wand2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  topic: z
    .string()
    .min(3, { message: 'Topic must be at least 3 characters.' }),
  numQuestions: z.coerce.number().min(1).max(10),
});

type QuizResult = {
  isCorrect: boolean;
  correctAnswerIndex: number;
  selectedAnswerIndex: number;
};

export default function PracticeQuizPage() {
  const [quizData, setQuizData] = useState<GeneratePracticeQuizOutput | null>(null);
  const [quizResults, setQuizResults] = useState<(QuizResult | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setQuizData(null);
    setQuizResults([]);
    setShowResults(false);
    try {
      const output = await generatePracticeQuiz(values);
      setQuizData(output);
      setQuizResults(new Array(output.questions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerSelect = (
    questionIndex: number,
    selectedOptionIndex: number
  ) => {
    if (!quizData || showResults) return;

    const newResults = [...quizResults];
    newResults[questionIndex] = {
      isCorrect:
        quizData.questions[questionIndex].correctAnswerIndex ===
        selectedOptionIndex,
      correctAnswerIndex: quizData.questions[questionIndex].correctAnswerIndex,
      selectedAnswerIndex: selectedOptionIndex,
    };
    setQuizResults(newResults);
  };
  
  const allQuestionsAnswered = quizResults.every(r => r !== null);

  const calculateScore = () => {
    const correctAnswers = quizResults.filter(r => r?.isCorrect).length;
    const totalQuestions = quizData?.questions.length ?? 0;
    return {
      score: correctAnswers,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    };
  }
  
  const score = calculateScore();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <PencilRuler className="w-8 h-8 text-primary" />
          Practice Quiz Generator
        </h1>
        <p className="text-muted-foreground">
          Test your knowledge on any topic with an AI-generated quiz.
        </p>
      </div>

      {!quizData && (
        <Card>
          <CardHeader>
            <CardTitle>Create a Quiz</CardTitle>
            <CardDescription>
              Enter a topic and the number of questions you want.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The French Revolution"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {quizData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-headline">Quiz on: {form.getValues('topic')}</h2>
          
          {showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
                <CardDescription>You scored {score.score} out of {score.total} ({score.percentage.toFixed(0)}%)</CardDescription>
              </CardHeader>
            </Card>
          )}

          {quizData.questions.map((q, qIndex) => (
            <Card key={qIndex}>
              <CardHeader>
                <CardTitle>
                  Question {qIndex + 1}
                </CardTitle>
                <CardDescription>{q.questionText}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={quizResults[qIndex]?.selectedAnswerIndex.toString()}
                  onValueChange={(value) =>
                    handleAnswerSelect(qIndex, parseInt(value))
                  }
                  disabled={showResults}
                >
                  {q.options.map((option, oIndex) => {
                    const result = quizResults[qIndex];
                    const isSelected = result?.selectedAnswerIndex === oIndex;
                    const isCorrect = q.correctAnswerIndex === oIndex;

                    return (
                      <FormItem key={oIndex} className={cn("flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors",
                         showResults && isCorrect && "border-green-500 bg-green-500/10",
                         showResults && isSelected && !isCorrect && "border-red-500 bg-red-500/10"
                      )}>
                        <FormControl>
                          <RadioGroupItem value={oIndex.toString()} />
                        </FormControl>
                        <FormLabel className="font-normal flex-1 cursor-pointer">
                          {option}
                        </FormLabel>
                        {showResults && isSelected && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {showResults && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                        {showResults && !isSelected && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </FormItem>
                    );
                  })}
                </RadioGroup>
              </CardContent>
              {showResults && (
                <CardFooter>
                  <Alert>
                    <AlertTitle>Explanation</AlertTitle>
                    <AlertDescription>{q.explanation}</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
            </Card>
          ))}
          
          <div className="flex justify-between items-center">
            {!showResults ? (
              <Button onClick={() => setShowResults(true)} disabled={!allQuestionsAnswered}>
                  Check Answers
              </Button>
            ) : (
              <Button onClick={form.handleSubmit(onSubmit)}>
                Create a New Quiz
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
