"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useStudyData } from '@/hooks/use-study-data';
import type { Chapter, SubTopic, Reference } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PomodoroTimer } from '@/components/PomodoroTimer';

import { ArrowLeft, BookCopy, ChevronDown, Edit, FileText, Link as LinkIcon, MoreVertical, PlayCircle, Plus, Trash2, X } from 'lucide-react';


const chapterSchema = z.object({ title: z.string().min(2, "Title must be at least 2 characters.") });
const subTopicSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  priority: z.enum(['low', 'medium', 'high']),
});
const referenceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  type: z.enum(['link', 'note']),
  content: z.string().min(2, "Content is required."),
});


export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const {
    getSubject, isLoaded,
    addChapter, updateChapter, deleteChapter,
    addSubTopic, updateSubTopic, deleteSubTopic,
    addReference, updateReference, deleteReference
  } = useStudyData();

  const [pomodoroState, setPomodoroState] = useState<{isOpen: boolean; subTopicId?: string; chapterId?: string;}>({ isOpen: false });
  const [dialogState, setDialogState] = useState<{
    type: 'chapter' | 'subtopic' | 'reference' | null;
    mode: 'add' | 'edit';
    data?: Chapter | SubTopic | Reference;
    parentId?: string;
  } | null>(null);


  const subjectId = params.id as string;
  const subject = useMemo(() => getSubject(subjectId), [subjectId, getSubject]);

  const subjectProgress = useMemo(() => {
    if (!subject) return 0;
    const allSubTopics = subject.chapters.flatMap(c => c.subTopics);
    if (allSubTopics.length === 0) return 0;
    const completedSubTopics = allSubTopics.filter(st => st.completed).length;
    return (completedSubTopics / allSubTopics.length) * 100;
  }, [subject]);
  
  const handlePomodoroComplete = () => {
    if (pomodoroState.subTopicId && pomodoroState.chapterId) {
      updateSubTopic(subjectId, pomodoroState.chapterId, pomodoroState.subTopicId, { completed: true });
      toast({ title: "Session Complete!", description: "Sub-topic marked as completed. Great job!" });
    }
  };

  const handleFormSubmit = (values: any) => {
    if (!dialogState || !subjectId) return;
    const { type, mode, data, parentId } = dialogState;

    try {
      if (type === 'chapter') {
        if (mode === 'add') addChapter(subjectId, { title: values.title });
        else if (data) updateChapter(subjectId, data.id, { title: values.title });
      } else if (type === 'subtopic' && parentId) {
        if (mode === 'add') addSubTopic(subjectId, parentId, values);
        else if (data) updateSubTopic(subjectId, parentId, data.id, values);
      } else if (type === 'reference' && parentId) {
        if (mode === 'add') addReference(subjectId, parentId, values);
        else if (data) updateReference(subjectId, parentId, data.id, values);
      }
      toast({ title: `Successfully ${mode === 'add' ? 'added' : 'updated'} ${type}!` });
      setDialogState(null);
    } catch (e) {
      toast({ title: 'Error', description: `Failed to ${mode} ${type}.`, variant: 'destructive'});
    }
  }

  const priorityBadgeVariant = {
    low: "secondary",
    medium: "default",
    high: "destructive",
  } as const;

  if (!isLoaded) {
    return <Skeleton className="h-[60vh] w-full" />;
  }

  if (!subject) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Subject not found</h2>
        <p className="text-muted-foreground">The subject you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/subjects')} className="mt-4">Back to Subjects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/subjects')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Subjects
      </Button>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                <span className="w-5 h-5 rounded-full" style={{ backgroundColor: subject.color }}></span>
                {subject.title}
              </CardTitle>
              <CardDescription className="mt-2">
                Your study plan for {subject.title}. Track your progress and stay organized.
              </CardDescription>
            </div>
            <Button onClick={() => setDialogState({ type: 'chapter', mode: 'add'})}>
              <Plus className="mr-2 h-4 w-4" /> Add Chapter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={subjectProgress} className="h-2" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{subjectProgress.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {subject.chapters.map(chapter => (
          <AccordionItem key={chapter.id} value={chapter.id} className="border-none">
            <Card>
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <BookCopy className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{chapter.title}</h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                 <Tabs defaultValue="subtopics" className="w-full">
                  <div className='flex justify-between items-center border-b mb-4'>
                    <TabsList>
                      <TabsTrigger value="subtopics">Sub-Topics</TabsTrigger>
                      <TabsTrigger value="references">Reference Vault</TabsTrigger>
                    </TabsList>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDialogState({type: 'chapter', mode: 'edit', data: chapter })}>
                          <Edit className="mr-2 h-4 w-4"/> Edit Chapter
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className='text-destructive focus:text-destructive'>
                            <Trash2 className="mr-2 h-4 w-4"/> Delete Chapter
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <TabsContent value="subtopics">
                    <div className="space-y-2">
                      {chapter.subTopics.length > 0 ? chapter.subTopics.map(subTopic => (
                        <div key={subTopic.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                          <Checkbox
                            checked={subTopic.completed}
                            onCheckedChange={(checked) => updateSubTopic(subject.id, chapter.id, subTopic.id, { completed: !!checked })}
                            id={`subtopic-${subTopic.id}`}
                          />
                          <label htmlFor={`subtopic-${subTopic.id}`} className={cn("flex-1", subTopic.completed && "line-through text-muted-foreground")}>
                            {subTopic.title}
                          </label>
                          <Badge variant={priorityBadgeVariant[subTopic.priority]}>{subTopic.priority}</Badge>
                          <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => setPomodoroState({isOpen: true, subTopicId: subTopic.id, chapterId: chapter.id})}>
                            <PlayCircle className="h-5 w-5"/>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className='h-8 w-8'><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDialogState({type: 'subtopic', mode: 'edit', data: subTopic, parentId: chapter.id})}>
                                <Edit className="mr-2 h-4 w-4"/> Edit
                              </DropdownMenuItem>
                               <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className='text-destructive focus:text-destructive'>
                                      <Trash2 className="mr-2 h-4 w-4"/> Delete
                                  </DropdownMenuItem>
                               </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialog>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this sub-topic.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSubTopic(subject.id, chapter.id, subTopic.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )) : <p className="text-muted-foreground text-sm p-4 text-center">No sub-topics yet.</p>}
                    </div>
                     <Button variant="outline" size="sm" className="mt-4" onClick={() => setDialogState({ type: 'subtopic', mode: 'add', parentId: chapter.id})}>
                      <Plus className="mr-2 h-4 w-4" /> Add Sub-Topic
                    </Button>
                  </TabsContent>
                  <TabsContent value="references">
                    <div className="space-y-2">
                      {chapter.references.length > 0 ? chapter.references.map(ref => (
                        <div key={ref.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                           {ref.type === 'link' ? <LinkIcon className="h-4 w-4 text-muted-foreground"/> : <FileText className="h-4 w-4 text-muted-foreground"/>}
                           <a href={ref.type === 'link' ? ref.content : undefined} target="_blank" rel="noopener noreferrer" className={cn("flex-1", ref.type === 'link' && "hover:underline")}>
                            {ref.title}
                           </a>
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className='h-8 w-8'><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDialogState({type: 'reference', mode: 'edit', data: ref, parentId: chapter.id})}>
                                <Edit className="mr-2 h-4 w-4"/> Edit
                              </DropdownMenuItem>
                               <AlertDialogTrigger asChild>
                                <DropdownMenuItem className='text-destructive focus:text-destructive'>
                                  <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </DropdownMenuItem>
                               </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialog>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this reference.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteReference(subject.id, chapter.id, ref.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )) : <p className="text-muted-foreground text-sm p-4 text-center">No references yet.</p>}
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setDialogState({ type: 'reference', mode: 'add', parentId: chapter.id})}>
                      <Plus className="mr-2 h-4 w-4" /> Add Reference
                    </Button>
                  </TabsContent>
                </Tabs>
                <AlertDialog>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this chapter and all its sub-topics and references.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteChapter(subject.id, chapter.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <PomodoroTimer
        isOpen={pomodoroState.isOpen}
        onOpenChange={(isOpen) => setPomodoroState({ ...pomodoroState, isOpen })}
        onSessionComplete={handlePomodoroComplete}
      />
      
      <Dialog open={!!dialogState} onOpenChange={() => setDialogState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState?.mode === 'add' ? 'Add' : 'Edit'} {dialogState?.type}</DialogTitle>
          </DialogHeader>
           {dialogState?.type === 'chapter' && (
             <Form_Chapter defaultValues={dialogState.mode === 'edit' ? dialogState.data as Chapter : undefined} onSubmit={handleFormSubmit} />
           )}
           {dialogState?.type === 'subtopic' && (
             <Form_SubTopic defaultValues={dialogState.mode === 'edit' ? dialogState.data as SubTopic : undefined} onSubmit={handleFormSubmit} />
           )}
           {dialogState?.type === 'reference' && (
             <Form_Reference defaultValues={dialogState.mode === 'edit' ? dialogState.data as Reference : undefined} onSubmit={handleFormSubmit} />
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Form_Chapter = ({ defaultValues, onSubmit }: { defaultValues?: Chapter, onSubmit: (v: any) => void}) => {
  const form = useForm<z.infer<typeof chapterSchema>>({ resolver: zodResolver(chapterSchema), defaultValues });
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'><FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Chapter Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage /></FormItem>} /><Button type="submit">Save</Button></form></Form>;
}

const Form_SubTopic = ({ defaultValues, onSubmit }: { defaultValues?: SubTopic, onSubmit: (v: any) => void}) => {
  const form = useForm<z.infer<typeof subTopicSchema>>({ resolver: zodResolver(subTopicSchema), defaultValues });
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'><FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Sub-Topic Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="priority" render={({ field }) => <FormItem><FormLabel>Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select><FormMessage /></FormItem>} /><Button type="submit">Save</Button></form></Form>;
}

const Form_Reference = ({ defaultValues, onSubmit }: { defaultValues?: Reference, onSubmit: (v: any) => void}) => {
  const form = useForm<z.infer<typeof referenceSchema>>({ resolver: zodResolver(referenceSchema), defaultValues: defaultValues ?? { type: 'link' } });
  const type = form.watch('type');
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'><FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="type" render={({ field }) => <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="link">Link</SelectItem><SelectItem value="note">Note</SelectItem></SelectContent></Select><FormMessage /></FormItem>} /><FormField control={form.control} name="content" render={({ field }) => <FormItem><FormLabel>{type === 'link' ? 'URL' : 'Note'}</FormLabel><FormControl>{type === 'link' ? <Input {...field}/> : <Textarea {...field}/>}</FormControl><FormMessage /></FormItem>} /><Button type="submit">Save</Button></form></Form>;
}
