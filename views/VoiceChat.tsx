
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { RoadmapLesson, UserPreferences, VoiceChatConnectionState } from '../types';
import LessonModal from '../components/LessonModal';
import { ThemeContext } from '../contexts';
import { MicrophoneIcon, StopIcon, WaveformIcon } from '../components/Icons';

// Helper functions for audio processing
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface VoiceChatProps {
  onBack: () => void;
  currentLesson: RoadmapLesson | null;
  preferences: UserPreferences | null;
  contentCache: Record<string, string>;
  setLessonContentCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onBack, currentLesson, preferences, contentCache, setLessonContentCache }) => {
  const [isLessonVisible, setIsLessonVisible] = useState(false);
  const [connectionState, setConnectionState] = useState<VoiceChatConnectionState>('DISCONNECTED');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const { themeColors } = useContext(ThemeContext);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const disconnect = async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (error) {
            console.error("Error closing session:", error);
        }
        sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        await outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
    }
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    setConnectionState('DISCONNECTED');
    setIsModelSpeaking(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    if (!preferences || connectionState !== 'DISCONNECTED') return;

    setConnectionState('CONNECTING');
    try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // FIX: Cast window to any to access webkitAudioContext for older browser compatibility.
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        let systemInstruction = `أنت نلينجو، معلم ${preferences.targetLanguage} صوتي ودود. أنت تتحدث مع شخص لغته الأم ${preferences.nativeLanguage} ومستواه ${preferences.level}. مهمتك هي التدريس والشرح بشكل أساسي باللغة الأم للمستخدم (${preferences.nativeLanguage}). استخدم اللغة المستهدفة (${preferences.targetLanguage}) فقط في الأمثلة، والمفردات، والعبارات التدريبية. هدفك هو تعليم القواعد والمفردات باستخدام لغة المستخدم الأم لضمان الفهم الكامل. اجعل ردودك الصوتية قصيرة وواضحة، واطرح أسئلة لتشجيع المحادثة.`;
        if (currentLesson) {
             systemInstruction += `\n\nركز محادثة اليوم على هذا الدرس: "${currentLesson.title}" (${currentLesson.description}). اشرح محتوى الدرس بلغة ${preferences.nativeLanguage} وقدم أمثلة وتمارين بلغة ${preferences.targetLanguage}.`;
        }
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
                systemInstruction,
            },
            callbacks: {
                onopen: async () => {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    micStreamRef.current = stream;
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionPromiseRef.current) {
                           sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    setConnectionState('CONNECTED');
                },
                onmessage: async (message: LiveServerMessage) => {
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        setIsModelSpeaking(true);
                        const outputCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => {
                            outputSourcesRef.current.delete(source);
                            if (outputSourcesRef.current.size === 0) {
                                setIsModelSpeaking(false);
                            }
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                    if (message.serverContent?.interrupted) {
                        outputSourcesRef.current.forEach(source => source.stop());
                        outputSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setIsModelSpeaking(false);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Session error:', e);
                    setConnectionState('ERROR');
                    disconnect();
                },
                onclose: () => {
                    disconnect();
                },
            },
        });
    } catch (error) {
        console.error("Failed to connect:", error);
        setConnectionState('ERROR');
        await disconnect();
    }
  };

  const handleToggleConnection = () => {
    if (connectionState === 'CONNECTED' || connectionState === 'CONNECTING') {
      disconnect();
    } else {
      connect();
    }
  };

  const getStatusText = () => {
    switch(connectionState) {
        case 'CONNECTED':
            return isModelSpeaking ? 'نلينجو يتحدث...' : 'يستمع...';
        case 'CONNECTING':
            return 'جارٍ الاتصال...';
        case 'ERROR':
            return 'حدث خطأ';
        case 'DISCONNECTED':
        default:
            return 'انقر لبدء المحادثة';
    }
  }
  
  return (
    <div className="h-full flex flex-col">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-100">محادثة صوتية</h1>
             {currentLesson && (
                <button onClick={() => setIsLessonVisible(true)} className="mr-auto text-slate-400 hover:text-slate-200 p-2 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </button>
            )}
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <div className="relative flex items-center justify-center w-56 h-56">
                {isModelSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <WaveformIcon className="w-56 h-auto text-slate-600 animate-pulse" />
                    </div>
                )}
                <button
                    onClick={handleToggleConnection}
                    disabled={connectionState === 'CONNECTING'}
                    className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50
                        ${connectionState === 'CONNECTED' ? 'bg-rose-600 hover:bg-rose-700' : `${themeColors.bg} ${themeColors.bgHover}`}`}
                >
                    {connectionState === 'CONNECTED' ? 
                        <StopIcon className="w-20 h-20 text-white" /> : 
                        <MicrophoneIcon className="w-20 h-20 text-white" />
                    }
                </button>
            </div>
             <p className="text-slate-300 text-lg mt-8 h-6">{getStatusText()}</p>
             {connectionState === 'ERROR' && (
                 <button onClick={connect} className="mt-4 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg">حاول مرة أخرى</button>
             )}
        </main>
    </div>
  );
};

export default VoiceChat;
