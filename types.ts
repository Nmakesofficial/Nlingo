export enum View {
  DASHBOARD = 'DASHBOARD',
  VOICE_CHAT = 'VOICE_CHAT',
  TEXT_CHAT = 'TEXT_CHAT',
  QUIZZES = 'QUIZZES',
  ROADMAP = 'ROADMAP',
  LESSON = 'LESSON',
  UPGRADE = 'UPGRADE',
}

export type Theme = 'indigo' | 'teal' | 'rose' | 'amber';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface RoadmapLesson {
  title: string;
  description: string;
  completed: boolean;
}

export interface UserPreferences {
  nativeLanguage: string;
  targetLanguage: string;
  level: string;
  theme: Theme;
  lastLessonCompletedDate?: string;
}

export interface QuizOption {
    text: string;
}

export interface Question {
    questionText: string;
    options: QuizOption[];
    correctAnswerIndex: number;
    explanation: string;
}

export interface Quiz {
    title: string;
    questions: Question[];
}

export type VoiceChatConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';