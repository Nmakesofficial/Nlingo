
import React, { useState, useEffect, useContext } from 'react';
import { RoadmapLesson, UserPreferences, Quiz } from '../types';
import { generateLessonContent, generateQuiz } from '../services/geminiService';
import { ThemeContext } from '../contexts';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

interface LessonProps {
  lesson: RoadmapLesson;
  preferences: UserPreferences;
  onComplete: () => void;
  onBack: () => void;
  onQuizGenerated: (quiz: Quiz) => void;
  contentCache: Record<string, string>;
  setLessonContentCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  isFirstLesson: boolean;
  isLastLesson: boolean;
}

const Lesson: React.FC<LessonProps> = ({ lesson, preferences, onComplete, onBack, onQuizGenerated, contentCache, setLessonContentCache, onNextLesson, onPreviousLesson, isFirstLesson, isLastLesson }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const { themeColors } = useContext(ThemeContext);

  useEffect(() => {
    const fetchContent = async () => {
      // Always refetch when lesson changes
      setIsLoading(true);
      if (contentCache[lesson.title]) {
        setContent(contentCache[lesson.title]);
        setIsLoading(false);
        return;
      }
      const lessonContent = await generateLessonContent(lesson, preferences);
      setContent(lessonContent);
      setLessonContentCache(prev => ({ ...prev, [lesson.title]: lessonContent }));
      setIsLoading(false);
    };
    fetchContent();
  }, [lesson, preferences, contentCache, setLessonContentCache]);

  const handleGenerateQuiz = async () => {
    if (!content) return;
    setIsGeneratingQuiz(true);
    const quiz = await generateQuiz(lesson, content, preferences);
    if (quiz) {
      onQuizGenerated(quiz);
    } else {
      alert("Failed to generate quiz.");
    }
    setIsGeneratingQuiz(false);
  };

  const createMarkup = (markdown: string) => {
    // @ts-ignore
    const rawMarkup = marked.parse(markdown);
    return { __html: rawMarkup };
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
       <header className="p-4 flex items-center bg-slate-800 border-b border-slate-700 flex-shrink-0">
          <button onClick={onBack} className="ml-4 text-slate-400 hover:text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button onClick={onPreviousLesson} disabled={isFirstLesson} className="p-2 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed">
              <ChevronRightIcon className="h-6 w-6"></ChevronRightIcon>
          </button>
          <h1 className="text-xl font-bold text-slate-100 truncate text-center flex-1 mx-2">{lesson.title}</h1>
          <button onClick={onNextLesson} disabled={isLastLesson} className="p-2 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed">
              <ChevronLeftIcon className="h-6 w-6"></ChevronLeftIcon>
          </button>
      </header>
      <main className="flex-grow overflow-y-auto p-6 flex flex-col">
        {isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <svg className="animate-spin h-8 w-8 text-slate-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400 text-lg">جاري إعداد درسك...</p>
          </div>
        ) : content ? (
          <article
            className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-100"
            dangerouslySetInnerHTML={createMarkup(content)}
          />
        ) : (
          <div className="text-center">Could not load lesson content.</div>
        )}
      </main>
      <footer className="p-4 bg-slate-800 border-t border-slate-700 flex-shrink-0 grid grid-cols-2 gap-4">
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading || isGeneratingQuiz}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center bg-slate-700 hover:bg-slate-600`}
        >
          {isGeneratingQuiz ? 'جاري الإنشاء...' : 'إنشاء اختبار'}
        </button>
        <button
          onClick={onComplete}
          disabled={isLoading || isGeneratingQuiz}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center ${themeColors.bg} ${themeColors.bgHover}`}
        >
          وضع علامة كمكتمل
        </button>
      </footer>
    </div>
  );
};

export default Lesson;
