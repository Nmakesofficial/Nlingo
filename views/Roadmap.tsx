import React, { useContext } from 'react';
import { RoadmapLesson } from '../types';
import { ThemeContext } from '../contexts';

interface RoadmapProps {
  roadmap: RoadmapLesson[] | null;
  onBack: () => void;
  onStartLesson: (lesson: RoadmapLesson) => void;
  hasCompletedLessonToday: boolean;
}

const Roadmap: React.FC<RoadmapProps> = ({ roadmap, onBack, onStartLesson, hasCompletedLessonToday }) => {
    const { themeColors } = useContext(ThemeContext);

    if (!roadmap || roadmap.length === 0) {
        return (
             <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4 text-slate-100">خارطة طريقك التعليمية</h2>
                <p className="text-slate-400 mb-6">لا توجد خارطة طريق حتى الآن. أكمل الإعدادات الأولية لإنشاء واحدة.</p>
             </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-slate-900">
             <header className="p-4 flex items-center bg-slate-800 border-b border-slate-700 flex-shrink-0">
                <button onClick={onBack} className="ml-4 text-slate-400 hover:text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-slate-100">خارطة طريقك التعليمية</h1>
            </header>
            <div className="overflow-y-auto p-6">
                {hasCompletedLessonToday && (
                    <div className="bg-slate-800 p-4 rounded-lg mb-6 text-center">
                        <p className="text-slate-300">لقد أكملت درس اليوم. عد غداً لفتح الدرس التالي!</p>
                    </div>
                )}
                <div className="relative border-r-2 border-slate-700 ml-3">
                    {roadmap.map((lesson, index) => {
                        const isLocked = !lesson.completed && hasCompletedLessonToday;
                        const canStart = !isLocked;

                        return (
                        <div key={index} className="mb-8 ml-6 relative">
                            <div className={`absolute -right-3.5 mt-1.5 h-6 w-6 rounded-full ${lesson.completed ? 'bg-green-500' : isLocked ? 'bg-slate-600' : themeColors.bg} border-4 border-slate-900`}></div>
                            <button 
                                onClick={() => canStart && onStartLesson(lesson)} 
                                disabled={!canStart}
                                className={`text-right w-full p-2 rounded-md transition-colors ${canStart ? 'hover:bg-slate-800' : 'cursor-not-allowed opacity-60'}`}
                            >
                                <h3 className="text-xl font-bold text-slate-100">{lesson.title}</h3>
                                <p className="mt-1 text-slate-400">{lesson.description}</p>
                                {isLocked && <p className="text-sm mt-2 text-amber-400">مغلق حتى الغد</p>}
                            </button>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Roadmap;