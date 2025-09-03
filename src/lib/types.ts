export interface Reference {
  id: string;
  title: string;
  type: 'link' | 'note';
  content: string;
}

export interface SubTopic {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Chapter {
  id: string;
  title: string;
  subTopics: SubTopic[];
  references: Reference[];
}

export interface Subject {
  id: string;
  title: string;
  color: string;
  chapters: Chapter[];
}

export type StudyData = {
  subjects: Subject[];
};
