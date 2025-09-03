"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStudyData } from "@/hooks/use-study-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, BookOpen, BrainCircuit, Grip, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const subjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  color: z.string().min(1, "Please select a color."),
});

const availableColors = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

export default function SubjectsPage() {
  const { subjects, addSubject, isLoaded } = useStudyData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      title: "",
      color: availableColors[0],
    },
  });

  function onSubmit(values: z.infer<typeof subjectSchema>) {
    addSubject(values);
    form.reset();
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <BookOpen />
            Your Subjects
          </h1>
          <p className="text-muted-foreground">Manage your study subjects, chapters, and topics.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Subject</DialogTitle>
              <DialogDescription>What new subject are you ready to conquer?</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Quantum Physics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Palette /> Subject Color</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-6 gap-2">
                          {availableColors.map(color => (
                            <button
                              type="button"
                              key={color}
                              className={cn(
                                "w-full h-8 rounded-md border-2 transition-transform hover:scale-110",
                                field.value === color ? "border-ring" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Add Subject</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoaded ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <Link key={subject.id} href={`/subjects/${subject.id}`} className="block group">
              <Card className="h-full transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></span>
                      {subject.title}
                    </span>
                    <Grip className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {subject.chapters.length} {subject.chapters.length === 1 ? "chapter" : "chapters"}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center text-muted-foreground py-16">
            <BrainCircuit className="mx-auto h-16 w-16" />
            <h3 className="mt-4 text-xl font-semibold font-headline">No Subjects Yet</h3>
            <p className="mt-2">Click "Add New Subject" to get started on your learning journey.</p>
        </Card>
      )}
    </div>
  );
}
