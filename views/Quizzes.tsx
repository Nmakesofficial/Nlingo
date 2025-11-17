import React, { useState, useContext } from 'react';
import { Quiz, Question } from '../types';
import { ThemeContext } from '../contexts';

interface QuizzesProps {
  quiz: Quiz | null;
  onBack: () => void;
}

const Quizzes: React.FC<QuizzesProps> = ({ quiz, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { themeColors } = useContext(ThemeContext);

  if (!quiz) {
    return (
      <div className="p-4 h-full flex flex-col">
        <header className="p-4 flex items-center bg-slate-800 border-b border-slate-700 flex-shrink-0 -mx-4 -mt-4 mb-4">
            <button onClick={onBack} className="ml-4 text-slate-400 hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-100">اختبارات</h1>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">لا يوجد اختبار محدد</h2>
            <p className="text-slate-400">أكمل درساً وقم بإنشاء اختبار لتحدي نفسك!</p>
        </div>
      </div>
    );
  }

  const currentQuestion: Question = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };
  
  const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
      setShowResults(false);
  }

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-slate-800 hover:bg-slate-700';
    }
    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-600';
    }
    if (index === selectedAnswer) {
      return 'bg-red-600';
    }
    return 'bg-slate-800 opacity-70';
  };

  if (showResults) {
      const percentage = Math.round((score / totalQuestions) * 100);
      return (
          <div className="p-4 h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold mb-2 text-slate-100">اكتمل الاختبار!</h2>
              <p className="text-slate-300 text-lg mb-6">نتيجتك النهائية</p>
              <div className={`w-40 h-40 rounded-full ${themeColors.bg} flex items-center justify-center text-white text-5xl font-bold mb-6`}>
                  {percentage}%
              </div>
              <p className="text-slate-400 mb-8">لقد أجبت على {score} من {totalQuestions} بشكل صحيح.</p>
              <div className="flex space-x-4">
                <button onClick={handleRestart} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg">
                    إعادة الاختبار
                </button>
                <button onClick={onBack} className={`${themeColors.bg} ${themeColors.bgHover} text-white font-bold py-3 px-6 rounded-lg`}>
                    العودة للوحة القيادة
                </button>
              </div>
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
        <h1 className="text-xl font-bold text-slate-100 truncate">{quiz.title}</h1>
      </header>
      <main className="flex-grow flex flex-col p-6">
        <div className="mb-4">
            <p className="text-slate-400">السؤال {currentQuestionIndex + 1} من {totalQuestions}</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                <div className={`${themeColors.bg} h-1.5 rounded-full`} style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
            </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-100 my-4">{currentQuestion.questionText}</h2>
        <div className="space-y-3 flex-grow">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full text-right p-4 rounded-lg transition-colors text-lg ${getButtonClass(index)}`}
            >
              {option.text}
            </button>
          ))}
        </div>
        {isAnswered && (
             <div className="mt-auto pt-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="font-bold text-slate-200">الشرح:</p>
                    <p className="text-slate-300">{currentQuestion.explanation}</p>
                </div>
                <button onClick={handleNext} className={`w-full font-bold py-3 px-4 rounded-lg mt-4 transition-colors ${themeColors.bg} ${themeColors.bgHover}`}>
                    {currentQuestionIndex < totalQuestions - 1 ? 'السؤال التالي' : 'عرض النتائج'}
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default Quizzes;
