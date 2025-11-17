import React, { useContext } from 'react';
import { ThemeContext } from '../contexts';
import { RoadmapLesson } from '../types';

interface LessonProgressProps {
    currentLesson: RoadmapLesson | null;
    progress: number;
    onStartLesson: (lesson: RoadmapLesson) => void;
    onAddMoreLessons: () => void;
    isGeneratingMoreLessons: boolean;
    hasCompletedLessonToday: boolean;
}

const LessonProgress: React.FC<LessonProgressProps> = ({ currentLesson, progress, onStartLesson, onAddMoreLessons, isGeneratingMoreLessons, hasCompletedLessonToday }) => {
  const { themeColors } = useContext(ThemeContext);

  const handleStart = () => {
    if (currentLesson) {
        onStartLesson(currentLesson);
    }
  }

  if (hasCompletedLessonToday && progress < 100) {
      return (
          <div className="bg-slate-800 rounded-2xl shadow-sm p-5 mx-4 text-center">
              <h2 className="text-2xl font-bold text-slate-100">أحسنت!</h2>
              <p className="text-slate-400 mt-1 mb-4">لقد أكملت درس اليوم. عد غداً لمواصلة التعلم!</p>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div
                      className={`${themeColors.bg} h-2.5 rounded-full`}
                      style={{ width: `${progress}%` }}
                  ></div>
              </div>
              <p className="text-sm text-slate-400 mt-2 text-right">التقدم الإجمالي: {progress}%</p>
          </div>
      );
  }

  if (!currentLesson && progress === 100) {
      return (
          <div className="bg-slate-800 rounded-2xl shadow-sm p-5 mx-4 text-center">
              <h2 className="text-2xl font-bold text-slate-100">تهانينا!</h2>
              <p className="text-slate-400 mt-1 mb-4">لقد أكملت جميع الدروس في خطتك الحالية.</p>
              <button
                  onClick={onAddMoreLessons}
                  disabled={isGeneratingMoreLessons}
                  className={`w-full font-bold py-3 px-4 rounded-lg mt-4 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center ${themeColors.bg} ${themeColors.bgHover}`}
              >
                  {isGeneratingMoreLessons ? 'جاري إنشاء المزيد...' : 'إنشاء المزيد من الدروس'}
              </button>
          </div>
      );
  }

  return (
    <div className="bg-slate-800 rounded-2xl shadow-sm p-5 mx-4">
      <button onClick={handleStart} disabled={!currentLesson} className="w-full text-right disabled:cursor-not-allowed">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-bold text-slate-100">{currentLesson?.title || 'لا يوجد درس تالٍ'}</h2>
          <span className={`text-sm font-semibold ${themeColors.accent}`}>{progress}%</span>
        </div>
        <p className="text-slate-400 mb-4">{currentLesson?.description || 'لقد أكملت جميع الدروس المتاحة.'}</p>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className={`${themeColors.bg} h-2.5 rounded-full`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-2">انقر لبدء الدرس</p>
      </button>
    </div>
  );
};

export default LessonProgress;