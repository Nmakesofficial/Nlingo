import { GoogleGenAI, Chat, Type } from "@google/genai";
import { UserPreferences, RoadmapLesson, Quiz } from '../types';

let ai: GoogleGenAI;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const generateRoadmap = async (preferences: UserPreferences): Promise<RoadmapLesson[]> => {
    const aiInstance = getAI();
    const prompt = `أنت خبير في تصميم مناهج اللغات. قم بإنشاء خارطة طريق تعليمية مخصصة للمستخدم الذي لغته الأم هي ${preferences.nativeLanguage} ويريد تعلم ${preferences.targetLanguage}. مستوى كفاءته الحالي هو ${preferences.level}.
يجب أن تكون خارطة الطريق عبارة عن قائمة من الدروس. لكل درس، قدم عنوانًا ووصفًا موجزًا للمحتوى.
بالنسبة لمستوى "مبتدئ"، ابدأ بالأساسيات المطلقة مثل الحروف الأبجدية، والتحيات الأساسية، والصوتيات البسيطة. على سبيل المثال، يمكن أن يكون الدرس الأول هو "الدرس 1: الحروف الأبجدية (A-E)".
يجب أن تكون الاستجابة باللغة العربية.`;

    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "عنوان الدرس"
                            },
                            description: {
                                type: Type.STRING,
                                description: "وصف موجز لمحتويات الدرس"
                            }
                        },
                        required: ["title", "description"],
                    }
                }
            }
        });

        const roadmapData = JSON.parse(response.text);
        return roadmapData.map((lesson: Omit<RoadmapLesson, 'completed'>) => ({ ...lesson, completed: false }));

    } catch (error) {
        console.error("Error generating roadmap:", error);
        return [
            { title: "حدث خطأ", description: "لم نتمكن من إنشاء خارطة طريقك. يرجى المحاولة مرة أخرى.", completed: false }
        ];
    }
};

export const generateMoreLessons = async (preferences: UserPreferences, existingRoadmap: RoadmapLesson[]): Promise<RoadmapLesson[]> => {
    const aiInstance = getAI();
    const lastLesson = existingRoadmap[existingRoadmap.length - 1];
    const prompt = `أنت خبير في تصميم مناهج اللغات. لقد أكمل المستخدم الدروس التالية:
${existingRoadmap.map(l => `- ${l.title}`).join('\n')}

آخر درس أكمله كان "${lastLesson.title}: ${lastLesson.description}".

بناءً على تفضيلاته (اللغة الأم: ${preferences.nativeLanguage}، اللغة المستهدفة: ${preferences.targetLanguage}، المستوى: ${preferences.level})، قم بإنشاء 5 دروس تالية جديدة تواصل مسيرته التعليمية بشكل منطقي.
يجب أن تكون الدروس أكثر تقدمًا من الدرس الأخير.
يجب أن تكون الاستجابة باللغة العربية وفي نفس تنسيق JSON السابق (مصفوفة من الكائنات، لكل كائن 'title' و 'description').`;

    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "عنوان الدرس"
                            },
                            description: {
                                type: Type.STRING,
                                description: "وصف موجز لمحتويات الدرس"
                            }
                        },
                        required: ["title", "description"],
                    }
                }
            }
        });

        const newLessonsData = JSON.parse(response.text);
        return newLessonsData.map((lesson: Omit<RoadmapLesson, 'completed'>) => ({ ...lesson, completed: false }));

    } catch (error) {
        console.error("Error generating more lessons:", error);
        return [];
    }
};


export const generateLessonContent = async (lesson: RoadmapLesson, preferences: UserPreferences): Promise<string> => {
    const aiInstance = getAI();
    const prompt = `أنت معلم لغة خبير. قم بإنشاء محتوى درس مفصل وتفاعلي للمستخدم.
- اللغة المستهدفة: ${preferences.targetLanguage}
- مستوى المستخدم: ${preferences.level}
- لغة المستخدم الأم: ${preferences.nativeLanguage}
- عنوان الدرس: "${lesson.title}"
- وصف الدرس: "${lesson.description}"

يجب أن يكون محتوى الدرس:
1.  **شاملًا وسهل الفهم**: اشرح المفاهيم بوضوح مع أمثلة.
2.  **بتنسيق Markdown**: استخدم العناوين والقوائم والنص الغامق والمائل لتنظيم المحتوى.
3.  **مكتوبًا باللغة العربية**: قم بتقديم الشرح باللغة العربية، ولكن استخدم اللغة المستهدفة (${preferences.targetLanguage}) في الأمثلة والعبارات الرئيسية.
4.  **تفاعليًا**: اختتم الدرس بتمرين صغير أو سؤالين لتشجيع المستخدم على تطبيق ما تعلمه.

ابدأ مباشرة بمحتوى الدرس.`;

    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating lesson content:", error);
        return "## خطأ\n\nعذرًا، لم نتمكن من تحميل محتوى هذا الدرس. يرجى المحاولة مرة أخرى.";
    }
};

export const generateQuiz = async (lesson: RoadmapLesson, lessonContent: string, preferences: UserPreferences): Promise<Quiz | null> => {
    const aiInstance = getAI();
    const prompt = `بناءً على محتوى الدرس التالي حول "${lesson.title}" لمستخدم يتعلم ${preferences.targetLanguage} ومستواه ${preferences.level}، قم بإنشاء اختبار قصير من 5 أسئلة متعددة الخيارات.

محتوى الدرس:
---
${lessonContent}
---

يجب أن تكون الأسئلة باللغة العربية لتقييم الفهم، بينما قد تحتوي الخيارات على كلمات أو عبارات من اللغة المستهدفة.
يجب أن يكون لكل سؤال 4 خيارات، وإجابة صحيحة واحدة، وشرح موجز للإجابة الصحيحة.`;

    try {
        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: `عنوان الاختبار، مثل "اختبار: ${lesson.title}"` },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    questionText: { type: Type.STRING, description: "نص السؤال" },
                                    options: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: { text: { type: Type.STRING } }
                                        }
                                    },
                                    correctAnswerIndex: { type: Type.INTEGER, description: "فهرس الإجابة الصحيحة (0-3)" },
                                    explanation: { type: Type.STRING, description: "شرح موجز للإجابة الصحيحة" }
                                },
                                required: ["questionText", "options", "correctAnswerIndex", "explanation"]
                            }
                        }
                    },
                    required: ["title", "questions"]
                }
            }
        });

        return JSON.parse(response.text) as Quiz;

    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

export const startChat = (currentLesson: RoadmapLesson | null): Chat => {
    const aiInstance = getAI();
    let systemInstruction = "أنت نلينجو، معلم لغة إنجليزية ذكاء اصطناعي ودود ومشجع. هدفك هو مساعدة المستخدمين على الممارسة والتعلم. اجعل ردودك موجزة وواضحة ومناسبة للمتعلمين من المستوى المبتدئين إلى المتوسط. اطرح أسئلة للحفاظ على استمرارية المحادثة. استخدم تنسيق Markdown عند الحاجة.";

    const storedPrefs = localStorage.getItem('userPreferences');
    if (storedPrefs) {
        const prefs: UserPreferences = JSON.parse(storedPrefs);
        systemInstruction = `أنت نلينجو، معلم ${prefs.targetLanguage} ذكاء اصطناعي ودود ومشجع. أنت تساعد متحدثًا لغته الأم ${prefs.nativeLanguage} ومستواه ${prefs.level} على التعلم. مهمتك هي التدريس والشرح بشكل أساسي باللغة الأم للمستخدم (${prefs.nativeLanguage}). استخدم اللغة المستهدفة (${prefs.targetLanguage}) فقط في الأمثلة، والمفردات، والعبارات التدريبية. هدفك هو تعليم القواعد والمفردات باستخدام لغة المستخدم الأم لضمان الفهم الكامل. اجعل ردودك موجزة وواضحة، واطرح أسئلة للحفاظ على استمرارية المحادثة. استخدم تنسيق Markdown عند الحاجة.`;
         if (currentLesson) {
            systemInstruction += `\n\nمهمتك الحالية هي مساعدة المستخدم في التدرب على وفهم الدرس الذي عنوانه "${currentLesson.title}"، والذي يغطي: ${currentLesson.description}. ركز المحادثة على هذا الموضوع، واشرح المفاهيم بلغة ${prefs.nativeLanguage} وقدم أمثلة وتمارين ذات صلة بلغة ${prefs.targetLanguage}.`;
        }
    }


    const chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
    return chat;
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "عذرًا، أواجه بعض الصعوبات الآن. يرجى المحاولة مرة أخرى لاحقًا.";
    }
};
