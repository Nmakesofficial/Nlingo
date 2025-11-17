import React, { useState, useContext } from 'react';
import { LANGUAGES, TARGET_LANGUAGES, LEVELS } from '../constants';
import { UserPreferences, RoadmapLesson, Theme } from '../types';
import { generateRoadmap } from '../services/geminiService';
import ThemeSelector from '../components/ThemeSelector';
import { ThemeContext } from '../contexts';

interface OnboardingProps {
    onComplete: (preferences: UserPreferences, roadmap: RoadmapLesson[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [nativeLanguage, setNativeLanguage] = useState(LANGUAGES[0].value);
    const [targetLanguage, setTargetLanguage] = useState(TARGET_LANGUAGES[0].value);
    const [level, setLevel] = useState(LEVELS[0].value);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { theme, themeColors } = useContext(ThemeContext);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        const preferences: UserPreferences = { nativeLanguage, targetLanguage, level, theme };
        try {
            const roadmap = await generateRoadmap(preferences);
            if(roadmap.length > 0 && roadmap[0].title !== "حدث خطأ") {
                onComplete(preferences, roadmap);
            } else {
                setError("لم نتمكن من إنشاء خطتك التعليمية. يرجى المحاولة مرة أخرى.");
                setIsLoading(false);
            }
        } catch (e) {
            setError("حدث خطأ غير متوقع. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center p-6 bg-slate-900 text-slate-200">
            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl font-bold text-slate-100 mb-2">أهلاً بك في Nlingo</h1>
                <p className="text-slate-400 mb-8">لنقم بإعداد خطتك التعليمية الشخصية.</p>

                <div className="space-y-6 text-right">
                    <div>
                        <label htmlFor="native-lang" className="block mb-2 font-semibold text-slate-300">لغتك الأم</label>
                        <select
                            id="native-lang"
                            value={nativeLanguage}
                            onChange={(e) => setNativeLanguage(e.target.value)}
                            className={`w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 ${themeColors.accentFocus}`}
                        >
                            {LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="target-lang" className="block mb-2 font-semibold text-slate-300">اللغة التي تود تعلمها</label>
                        <select
                            id="target-lang"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                             className={`w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 ${themeColors.accentFocus}`}
                        >
                            {TARGET_LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-slate-300">مستواك الحالي</label>
                        <div className="grid grid-cols-3 gap-2">
                            {LEVELS.map(lvl => (
                                <button
                                    key={lvl.value}
                                    onClick={() => setLevel(lvl.value)}
                                    className={`p-3 rounded-lg font-semibold transition-colors ${level === lvl.value ? themeColors.activeButton : 'bg-slate-800 hover:bg-slate-700'}`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="text-center">
                        <ThemeSelector />
                    </div>
                </div>

                {error && <p className="text-red-400 mt-4">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full font-bold py-3 px-4 rounded-lg mt-10 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center ${themeColors.bg} ${themeColors.bgHover}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري إنشاء خطتك...
                        </>
                    ) : (
                        'لنبدأ!'
                    )}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
