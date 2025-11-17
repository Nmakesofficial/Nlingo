
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Chat } from '@google/genai';
import { Message, RoadmapLesson, UserPreferences } from '../types';
import { startChat, sendMessage } from '../services/geminiService';
import { ThemeContext } from '../contexts';
import LessonModal from '../components/LessonModal';

interface TextChatProps {
  onBack: () => void;
  currentLesson: RoadmapLesson | null;
  preferences: UserPreferences | null;
  contentCache: Record<string, string>;
  setLessonContentCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TextChat: React.FC<TextChatProps> = ({ onBack, currentLesson, preferences, contentCache, setLessonContentCache }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useContext(ThemeContext);
  const [isLessonVisible, setIsLessonVisible] = useState(false);

  useEffect(() => {
    const initChat = () => {
      const chatSession = startChat(currentLesson);
      setChat(chatSession);
      setMessages([{ 
        role: 'model', 
        text: currentLesson 
          ? `مرحبًا! لنبدأ التدريب على درس اليوم: "${currentLesson.title}". هل أنت مستعد؟`
          : "مرحبًا! أنا نلينجو، معلمك اللغوي الذكاء الاصطناعي. ماذا تود أن تتدرب عليه اليوم؟" 
      }]);
    };
    initChat();
  }, [currentLesson]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const createMarkup = (markdown: string) => {
    // @ts-ignore
    const rawMarkup = marked.parse(markdown, { breaks: true });
    return { __html: rawMarkup };
  };

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const responseText = await sendMessage(chat, userInput);

    const modelMessage: Message = { role: 'model', text: responseText };
    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  }, [userInput, chat, isLoading]);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {isLessonVisible && currentLesson && preferences && (
        <LessonModal 
            lesson={currentLesson} 
            preferences={preferences}
            onClose={() => setIsLessonVisible(false)}
            contentCache={contentCache}
            setLessonContentCache={setLessonContentCache}
        />
      )}
      <header className="p-4 flex items-center bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <button onClick={onBack} className="ml-4 text-slate-400 hover:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-100">محادثة نصية</h1>
         {currentLesson && (
            <button onClick={() => setIsLessonVisible(true)} className="mr-auto text-slate-400 hover:text-slate-200 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </button>
        )}
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? `${themeColors.chatBubbleUser} text-white` : 'bg-slate-700 text-slate-200'}`}>
               <div
                className="prose prose-invert prose-p:my-0 prose-p:text-slate-200 prose-headings:text-slate-100 prose-strong:text-slate-100"
                dangerouslySetInnerHTML={createMarkup(msg.text)}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-200 rounded-2xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-2 flex-row-reverse">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب رسالتك..."
            className={`w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400 rounded-full py-2 px-4 focus:outline-none focus:ring-2 ${themeColors.accentFocus} focus:border-transparent`}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className={`${themeColors.bg} text-white rounded-full p-3 disabled:bg-slate-600 disabled:cursor-not-allowed ${themeColors.bgHover} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
