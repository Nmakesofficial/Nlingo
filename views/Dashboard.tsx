import React, { useContext } from 'react';
import LessonProgress from '../components/LessonProgress';
import NavGrid from '../components/NavGrid';
import ThemeSelector from '../components/ThemeSelector';
import { View, RoadmapLesson } from '../types';
import { ThemeContext } from '../contexts';

interface DashboardProps {
    onViewChange: (view: View) => void;
    roadmap: RoadmapLesson[] | null;
    onStartLesson: (lesson: RoadmapLesson) => void;
    currentLesson: RoadmapLesson | null;
    progress: number;
    onAddMoreLessons: () => void;
    isGeneratingMoreLessons: boolean;
    hasCompletedLessonToday: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, roadmap, onStartLesson, currentLesson, progress, onAddMoreLessons, isGeneratingMoreLessons, hasCompletedLessonToday }) => {
    const { themeColors } = useContext(ThemeContext);
    
    return (
        <div className="pt-4 space-y-6 pb-6">
            <div className="mx-4 p-4 bg-slate-800 border border-slate-700 rounded-2xl text-center">
                <h3 className="font-bold text-slate-200">أنت تستخدم الخطة المجانية</h3>
                <p className="text-slate-400 text-sm mt-1 mb-3">يُسمح لك بدرس واحد فقط في اليوم.</p>
                <button
                    onClick={() => onViewChange(View.UPGRADE)}
                    className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${themeColors.bg} ${themeColors.bgHover}`}
                >
                    الترقية إلى Pro
                </button>
            </div>
            <LessonProgress 
                currentLesson={currentLesson}
                progress={progress}
                onStartLesson={onStartLesson}
                onAddMoreLessons={onAddMoreLessons}
                isGeneratingMoreLessons={isGeneratingMoreLessons}
                hasCompletedLessonToday={hasCompletedLessonToday}
            />
            <NavGrid onViewChange={onViewChange} />
            <div className="px-4">
              <ThemeSelector />
            </div>
        </div>
    );
};

export default Dashboard;