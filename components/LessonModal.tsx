
import React, { useState, useEffect } from 'react';
import { RoadmapLesson, UserPreferences } from '../types';
import { generateLessonContent } from '../services/geminiService';

interface LessonModalProps {
  lesson: RoadmapLesson;
  preferences: UserPreferences;
  onClose: () => void;
  contentCache: Record<string, string>;
  setLessonContentCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const LessonModal: React.FC<LessonModalProps> = ({ lesson, preferences, onClose, contentCache, setLessonContentCache }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (contentCache[lesson.title]) {
        setContent(contentCache[lesson.title]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const lessonContent = await generateLessonContent(lesson, preferences);
      setContent(lessonContent);
      setLessonContentCache(prev => ({ ...prev, [lesson.title]: lessonContent }));
      setIsLoading(false);
    };
    fetchContent();
  }, [lesson, preferences, contentCache, setLessonContentCache]);

  const createMarkup = (markdown: string) => {
    // @ts-ignore
    const rawMarkup = marked.parse(markdown);
    return { __html: rawMarkup };
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-[calc(100%-2rem)] h-[80%] max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 flex items-center border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-100 truncate">{lesson.title}</h2>
          <button onClick={onClose} className="mr-auto text-slate-400 hover:text-slate-200 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
      </div>
    </div>
  );
};

export default LessonModal;
