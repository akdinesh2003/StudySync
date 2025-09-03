"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Subject, Chapter, SubTopic, Reference } from '@/lib/types';

const STORAGE_KEY = 'studySyncData';

export function useStudyData() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedData = JSON.parse(item);
        if (Array.isArray(parsedData.subjects)) {
          setSubjects(parsedData.subjects);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse study data from localStorage", error);
      setSubjects([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        const dataToStore = { subjects };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Failed to save study data to localStorage", error);
      }
    }
  }, [subjects, isLoaded]);

  const updateSubjects = useCallback((newSubjects: Subject[] | ((prev: Subject[]) => Subject[])) => {
    setSubjects(newSubjects);
  }, []);

  // Subject operations
  const addSubject = useCallback((subject: Omit<Subject, 'id' | 'chapters'>) => {
    const newSubject: Subject = {
      ...subject,
      id: crypto.randomUUID(),
      chapters: [],
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const updateSubject = useCallback((subjectId: string, updatedData: Partial<Subject>) => {
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, ...updatedData } : s))
    );
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  const getSubject = useCallback((subjectId: string) => {
      return subjects.find(s => s.id === subjectId);
  }, [subjects]);


  // Chapter operations
  const addChapter = useCallback((subjectId: string, chapter: Omit<Chapter, 'id' | 'subTopics' | 'references'>) => {
    const newChapter: Chapter = {
      ...chapter,
      id: crypto.randomUUID(),
      subTopics: [],
      references: [],
    };
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s))
    );
  }, []);

  const updateChapter = useCallback((subjectId: string, chapterId: string, updatedData: Partial<Chapter>) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? { ...s, chapters: s.chapters.map(c => (c.id === chapterId ? { ...c, ...updatedData } : c)) }
          : s
      )
    );
  }, []);

  const deleteChapter = useCallback((subjectId: string, chapterId: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId ? { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) } : s
      )
    );
  }, []);
  
  // Sub-topic operations
  const addSubTopic = useCallback((subjectId: string, chapterId: string, subTopic: Omit<SubTopic, 'id' | 'completed'>) => {
    const newSubTopic: SubTopic = {
      ...subTopic,
      id: crypto.randomUUID(),
      completed: false,
    };
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId ? { ...c, subTopics: [...c.subTopics, newSubTopic] } : c
              ),
            }
          : s
      )
    );
  }, []);

  const updateSubTopic = useCallback((subjectId: string, chapterId: string, subTopicId: string, updatedData: Partial<SubTopic>) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId
                  ? { ...c, subTopics: c.subTopics.map(st => (st.id === subTopicId ? { ...st, ...updatedData } : st)) }
                  : c
              ),
            }
          : s
      )
    );
  }, []);

  const deleteSubTopic = useCallback((subjectId: string, chapterId: string, subTopicId: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId
                  ? { ...c, subTopics: c.subTopics.filter(st => st.id !== subTopicId) }
                  : c
              ),
            }
          : s
      )
    );
  }, []);
  
  // Reference operations
  const addReference = useCallback((subjectId: string, chapterId: string, reference: Omit<Reference, 'id'>) => {
    const newReference: Reference = { ...reference, id: crypto.randomUUID() };
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId ? { ...c, references: [...c.references, newReference] } : c
              ),
            }
          : s
      )
    );
  }, []);

  const updateReference = useCallback((subjectId: string, chapterId: string, referenceId: string, updatedData: Partial<Reference>) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId
                  ? { ...c, references: c.references.map(r => (r.id === referenceId ? { ...r, ...updatedData } : r)) }
                  : c
              ),
            }
          : s
      )
    );
  }, []);
  
  const deleteReference = useCallback((subjectId: string, chapterId: string, referenceId: string) => {
    setSubjects(prev =>
      prev.map(s =>
        s.id === subjectId
          ? {
              ...s,
              chapters: s.chapters.map(c =>
                c.id === chapterId ? { ...c, references: c.references.filter(r => r.id !== referenceId) } : c
              ),
            }
          : s
      )
    );
  }, []);

  return {
    subjects,
    isLoaded,
    updateSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    addSubTopic,
    updateSubTopic,
    deleteSubTopic,
    addReference,
    updateReference,
    deleteReference
  };
}
