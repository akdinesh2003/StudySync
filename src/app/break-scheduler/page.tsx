"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getOptimalBreakSchedule, type OptimalBreakSchedulerOutput } from "@/ai/flows/optimal-break-scheduler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CalendarClock, Timer, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  duration: z.coerce.number().min(10, { message: "Study duration must be at least 10 minutes." }).max(360, { message: "Study duration cannot exceed 360 minutes." }),
});

export default function BreakSchedulerPage() {
  const [result, setResult] = useState<OptimalBreakSchedulerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 60,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await getOptimalBreakSchedule({ studyDurationMinutes: values.duration });
      setResult(output);
    } catch (error) {
      console.error("Error getting break schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate break schedule. Please try again.",
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
          <CalendarClock className="w-8 h-8 text-primary" />
          Optimal Break Scheduler
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered break suggestions based on your study session duration to maximize focus.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Your Study Session</CardTitle>
          <CardDescription>Enter your total planned study time to get a recommended break schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Duration (in minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Timer className="mr-2 h-4 w-4" />
                    Get Break Schedule
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks />
              Your Recommended Break Schedule
            </CardTitle>
            <CardDescription>
              Follow these suggestions to stay fresh and focused during your study session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.breakSuggestions.length > 0 ? (
              <ul className="space-y-3">
                {result.breakSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific breaks recommended for this duration. Consider taking a short break if you feel tired.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
