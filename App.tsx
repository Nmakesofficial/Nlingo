
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, UserPreferences, RoadmapLesson, Theme, Quiz } from './types';
import Dashboard from './views/Dashboard';
import VoiceChat from './views/VoiceChat';
import TextChat from './views/TextChat';
import Quizzes from './views/Quizzes';
import Roadmap from './views/Roadmap';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Onboarding from './views/Onboarding';
import { ThemeContext } from './contexts';
import { getTheme } from './theme';
import Lesson from './views/Lesson';
import Upgrade from './views/Upgrade';
import { generateMoreLessons } from './services/geminiService';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapLesson[] | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [theme, setThemeState] = useState<Theme>('indigo');
  const [activeLesson, setActiveLesson] = useState<RoadmapLesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [lessonContentCache, setLessonContentCache] = useState<Record<string, string>>({});
  const [isGeneratingMoreLessons, setIsGeneratingMoreLessons] = useState(false);
  const [hasCompletedLessonToday, setHasCompletedLessonToday] = useState(false);

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem('userPreferences');
      const storedRoadmap = localStorage.getItem('roadmap');

      if (storedPrefs && storedRoadmap) {
        const parsedPrefs: UserPreferences = JSON.parse(storedPrefs);
        setUserPreferences(parsedPrefs);
        setRoadmap(JSON.parse(storedRoadmap));
        setOnboardingCompleted(true);
        if (parsedPrefs.theme) {
            setThemeState(parsedPrefs.theme);
        }
        if (parsedPrefs.lastLessonCompletedDate === getTodayDateString()) {
            setHasCompletedLessonToday(true);
        }
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('roadmap');
    }
    setIsInitializing(false);
  }, []);
  
  const currentLesson = useMemo(() => {
    if (!roadmap) return null;
    return roadmap.find(lesson => !lesson.completed) || null;
  }, [roadmap]);

  const progress = useMemo(() => {
    if (!roadmap || roadmap.length === 0) return 0;
    const completedCount = roadmap.filter(l => l.completed).length;
    if (completedCount === roadmap.length) return 100;
    return Math.round((completedCount / roadmap.length) * 100);
  }, [roadmap]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLesson || !roadmap) return -1;
    return roadmap.findIndex(lesson => lesson.title === activeLesson.title);
  }, [activeLesson, roadmap]);

  const isNextLessonAccessible = useMemo(() => {
    if (!roadmap || activeLessonIndex < 0 || activeLessonIndex >= roadmap.length - 1) {
        return false;
    }
    const nextLesson = roadmap[activeLessonIndex + 1];
    if (nextLesson.completed || !hasCompletedLessonToday) {
        return true;
    }
    return false;
  }, [roadmap, activeLessonIndex, hasCompletedLessonToday]);


  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (userPreferences) {
        const updatedPrefs = { ...userPreferences, theme: newTheme };
        setUserPreferences(updatedPrefs);
        localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
    }
  }

  const handleOnboardingComplete = (preferences: UserPreferences, generatedRoadmap: RoadmapLesson[]) => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    localStorage.setItem('roadmap', JSON.stringify(generatedRoadmap));
    setUserPreferences(preferences);
    setRoadmap(generatedRoadmap);
    setOnboardingCompleted(true);
    setThemeState(preferences.theme);
  };

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);
  
  const handleStartLesson = (lesson: RoadmapLesson) => {
    setActiveLesson(lesson);
    setCurrentView(View.LESSON);
  };
  
  const handleLessonComplete = () => {
    if (!activeLesson || !roadmap) return;
    const updatedRoadmap = roadmap.map(lesson =>
      lesson.title === activeLesson.title ? { ...lesson, completed: true } : lesson
    );
    setRoadmap(updatedRoadmap);
    localStorage.setItem('roadmap', JSON.stringify(updatedRoadmap));
    
    const today = getTodayDateString();
    setHasCompletedLessonToday(true);
    if (userPreferences) {
        const updatedPrefs = { ...userPreferences, lastLessonCompletedDate: today };
        setUserPreferences(updatedPrefs);
        localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
    }

    setActiveLesson(null);
    setCurrentView(View.DASHBOARD);
  };

  const handleQuizGenerated = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView(View.QUIZZES);
  }
  
  const handleNextLesson = () => {
    if (!isNextLessonAccessible || !roadmap) return;
    const nextLesson = roadmap[activeLessonIndex + 1];
    setActiveLesson(nextLesson);
  };

  const handlePreviousLesson = () => {
      if (!roadmap || activeLessonIndex <= 0) return;
      const previousLesson = roadmap[activeLessonIndex - 1];
      setActiveLesson(previousLesson);
  };

  const handleAddMoreLessons = async () => {
      if (!userPreferences || !roadmap) return;
      setIsGeneratingMoreLessons(true);
      const newLessons = await generateMoreLessons(userPreferences, roadmap);
      if (newLessons.length > 0) {
          const updatedRoadmap = [...roadmap, ...newLessons];
          setRoadmap(updatedRoadmap);
          localStorage.setItem('roadmap', JSON.stringify(updatedRoadmap));
      } else {
          console.error("Failed to generate more lessons");
      }
      setIsGeneratingMoreLessons(false);
  };

  const renderView = () => {
     if (!userPreferences) {
        return <div className="text-center p-8">Loading preferences...</div>;
    }
    switch (currentView) {
      case View.VOICE_CHAT:
        return <VoiceChat onBack={() => handleViewChange(View.DASHBOARD)} currentLesson={currentLesson} preferences={userPreferences} contentCache={lessonContentCache} setLessonContentCache={setLessonContentCache} />;
      case View.TEXT_CHAT:
        return <TextChat onBack={() => handleViewChange(View.DASHBOARD)} currentLesson={currentLesson} preferences={userPreferences} contentCache={lessonContentCache} setLessonContentCache={setLessonContentCache} />;
      case View.QUIZZES:
        return <Quizzes quiz={activeQuiz} onBack={() => { setActiveQuiz(null); handleViewChange(View.DASHBOARD); }} />;
      case View.ROADMAP:
        return <Roadmap roadmap={roadmap} onBack={() => handleViewChange(View.DASHBOARD)} onStartLesson={handleStartLesson} hasCompletedLessonToday={hasCompletedLessonToday} />;
      case View.UPGRADE:
        return <Upgrade onBack={() => handleViewChange(View.DASHBOARD)} />;
      case View.LESSON:
          if (!activeLesson) return <Dashboard onViewChange={handleViewChange} roadmap={roadmap} onStartLesson={handleStartLesson} currentLesson={currentLesson} progress={progress} onAddMoreLessons={handleAddMoreLessons} isGeneratingMoreLessons={isGeneratingMoreLessons} hasCompletedLessonToday={hasCompletedLessonToday} />;
          return <Lesson
              lesson={activeLesson}
              preferences={userPreferences}
              onComplete={handleLessonComplete}
              onBack={() => { setActiveLesson(null); handleViewChange(View.DASHBOARD); }}
              onQuizGenerated={handleQuizGenerated}
              contentCache={lessonContentCache}
              setLessonContentCache={setLessonContentCache}
              onNextLesson={handleNextLesson}
              onPreviousLesson={handlePreviousLesson}
              isFirstLesson={activeLessonIndex === 0}
              isLastLesson={!isNextLessonAccessible}
          />
      case View.DASHBOARD:
      default:
        return <Dashboard 
            onViewChange={handleViewChange} 
            roadmap={roadmap} 
            onStartLesson={handleStartLesson}
            currentLesson={currentLesson}
            progress={progress}
            onAddMoreLessons={handleAddMoreLessons}
            isGeneratingMoreLessons={isGeneratingMoreLessons}
            hasCompletedLessonToday={hasCompletedLessonToday}
        />;
    }
  };

  const themeColors = useMemo(() => getTheme(theme), [theme]);
  const themeContextValue = { theme, setTheme, themeColors };

  const isSpecialView =
    currentView === View.TEXT_CHAT ||
    currentView === View.VOICE_CHAT ||
    currentView === View.ROADMAP ||
    currentView === View.LESSON ||
    currentView === View.QUIZZES ||
    currentView === View.UPGRADE;

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {isInitializing ? (
        null
      ) : !onboardingCompleted ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <div className="max-w-md mx-auto h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
          {!isSpecialView && <Header onViewChange={handleViewChange} />}
          <main className="flex-grow overflow-y-auto">
            {renderView()}
          </main>
          {!isSpecialView && <BottomNav currentView={currentView} onViewChange={handleViewChange} />}
        </div>
      )}
    </ThemeContext.Provider>
  );
};

export default App;
