"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStudyData } from "@/hooks/use-study-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, Book, Sparkles, CalendarClock, BrainCircuit, PencilRuler } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Subject, SubTopic } from "@/lib/types";

function getSubjectProgress(subject: Subject): number {
  const allSubTopics = subject.chapters.flatMap(c => c.subTopics);
  if (allSubTopics.length === 0) return 0;
  const completedSubTopics = allSubTopics.filter(st => st.completed).length;
  return (completedSubTopics / allSubTopics.length) * 100;
}

function getOverallProgress(subjects: Subject[]): { total: number; completed: number; percentage: number } {
  const allSubTopics = subjects.flatMap(s => s.chapters.flatMap(c => c.subTopics));
  const completedSubTopics = allSubTopics.filter(st => st.completed).length;
  const total = allSubTopics.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 0 };
  return {
    total,
    completed: completedSubTopics,
    percentage: (completedSubTopics / total) * 100,
  };
}

export default function Dashboard() {
  const { subjects, isLoaded } = useStudyData();

  const overallProgress = useMemo(() => getOverallProgress(subjects), [subjects]);
  const nextSubTopic = useMemo(() => {
    for (const subject of subjects) {
      for (const chapter of subject.chapters) {
        const topic = chapter.subTopics.find(st => !st.completed);
        if (topic) {
          return { subjectTitle: subject.title, subjectId: subject.id, topicTitle: topic.title };
        }
      }
    }
    return null;
  }, [subjects]);

  const QuickLink = ({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string; }) => (
    <Link href={href} className="block group">
      <Card className="h-full transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your study overview.</p>
        </div>
        <Link href="/subjects" passHref>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Subject
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {isLoaded ? `You've completed ${overallProgress.completed} of ${overallProgress.total} sub-topics.` : "Loading your progress..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoaded ? (
              <Progress value={overallProgress.percentage} aria-label={`${overallProgress.percentage.toFixed(0)}% complete`} />
            ) : (
              <Skeleton className="h-4 w-full" />
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Next Up: Your Focus for Today</CardTitle>
             <CardDescription>
              {isLoaded && !nextSubTopic && subjects.length > 0 ? "Congratulations! You've completed all your sub-topics." : "Here's the next uncompleted sub-topic on your list."}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoaded ? (
                nextSubTopic ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{nextSubTopic.subjectTitle}</p>
                      <p className="font-semibold">{nextSubTopic.topicTitle}</p>
                    </div>
                    <Link href={`/subjects/${nextSubTopic.subjectId}`} passHref>
                      <Button variant="ghost" size="sm">
                        Go to Subject <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No subjects added yet.</p>
                    <Link href="/subjects" passHref>
                       <Button variant="link" className="mt-2">Start by adding a subject</Button>
                    </Link>
                  </div>
                ) : (
                   <div className="text-center text-green-600 font-semibold py-4">
                     All tasks completed! 🎉
                   </div>
                )
             ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/subjects" icon={Book} title="Manage Subjects" description="Add, edit, and organize your study materials."/>
        <QuickLink href="/ai-summary" icon={Sparkles} title="AI Summary" description="Generate summaries and flashcards from text."/>
        <QuickLink href="/break-scheduler" icon={CalendarClock} title="Break Scheduler" description="Get optimal break times for your study sessions."/>
        <QuickLink href="/practice-quiz" icon={PencilRuler} title="Practice Quiz" description="Test your knowledge with AI-generated quizzes."/>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Your Subjects</h2>
        <div className="space-y-4">
          {isLoaded ? (
            subjects.length > 0 ? (
              subjects.map(subject => (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="block">
                  <Card className="transition-all duration-300 ease-in-out hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: subject.color}}></span>
                        {subject.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={getSubjectProgress(subject)} aria-label={`${getSubjectProgress(subject).toFixed(0)}% complete for ${subject.title}`} />
                      <p className="text-xs text-muted-foreground mt-2">{getSubjectProgress(subject).toFixed(0)}% Complete</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="text-center text-muted-foreground py-10">
                <BrainCircuit className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Ready to Get Started?</h3>
                <p>Add your first subject to begin your study journey.</p>
              </Card>
            )
          ) : (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /></CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
