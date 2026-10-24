import React, { useMemo } from 'react';
import { View, RoadmapLesson } from '../types';
import { AppSettings } from '../settings';

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

const Icon = ({ name, size = 22 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h7"/></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
    quiz: <><path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h.01M12 7h4"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15m6-12v15"/></>,
    headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="3" y="13" width="5" height="8" rx="2"/><rect x="16" y="13" width="5" height="8" rx="2"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
};

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, roadmap, onStartLesson, currentLesson, progress, onAddMoreLessons, isGeneratingMoreLessons, hasCompletedLessonToday }) => {
  const completedCount = useMemo(() => roadmap?.filter(item => item.completed).length ?? 0, [roadmap]);
  const totalCount = roadmap?.length ?? 0;
  const firstName = 'مرحباً بعودتك';
  const quickActions = [
    { title: 'محادثة صوتية', subtitle: 'تحدّث بثقة', icon: 'mic', view: View.VOICE_CHAT, tone: 'mint' },
    { title: 'محادثة نصية', subtitle: 'تدرّب بالكتابة', icon: 'chat', view: View.TEXT_CHAT, tone: 'lavender' },
    { title: 'اختبر نفسك', subtitle: 'ثبّت ما تعلّمته', icon: 'quiz', view: View.QUIZZES, tone: 'peach' },
    { title: 'خارطة التعلّم', subtitle: 'خطوتك التالية', icon: 'map', view: View.ROADMAP, tone: 'blue' },
  ];

  return (
    <div className="nlingo-home px-5 pt-3 pb-32 space-y-7" dir="rtl">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-zinc-400 font-medium mb-1">{firstName} 👋</p>
          <h2 className="text-[29px] leading-tight font-black tracking-tight text-white">رحلتك مع اللغة<br/><span className="text-zinc-400">تبدأ بخطوة.</span></h2>
          <p className="text-sm text-zinc-500 mt-2">تعلّم قليلاً كل يوم، وتقدّم كثيراً.</p>
        </div>
        <div className="nlingo-avatar" aria-label="Nlingo AI"><span>N</span><i>✦</i></div>
      </section>

      {!AppSettings.isVipPlanEnabled && (
        <button onClick={() => onViewChange(View.UPGRADE)} className="nlingo-pro-banner w-full text-right rounded-2xl p-4 flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white"><Icon name="spark" size={23}/></div>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-white">ارتقِ بتجربة التعلّم</p>
            <p className="text-xs text-zinc-400 mt-1">افتح أدوات إضافية وواصل تقدّمك</p>
          </div>
          <span className="text-xs font-bold text-black bg-white rounded-full px-3 py-2">اكتشف <Icon name="arrow" size={13}/></span>
        </button>
      )}

      <section className="nlingo-progress-card rounded-[28px] p-5 relative overflow-hidden">
        <div className="absolute -left-7 -top-8 w-32 h-32 rounded-full border border-white/5" />
        <div className="absolute -left-1 top-3 w-20 h-20 rounded-full border border-white/5" />
        <div className="relative flex justify-between items-start gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-300 mb-3"><span className="w-1.5 h-1.5 rounded-full bg-lime-300"/> خطتك الشخصية</div>
            <h3 className="text-xl font-black text-white">{currentLesson ? 'درس جديد بانتظارك' : 'أحسنت! واصل التقدّم'}</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-[230px]">{currentLesson?.title || 'أكملت جميع الدروس المتاحة في خطتك الحالية.'}</p>
          </div>
          <div className="nlingo-ring" style={{ background: `conic-gradient(#d9ff7a ${progress * 3.6}deg, #3b3b3b 0deg)` }}><div><strong>{progress}%</strong><span>مكتمل</span></div></div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-zinc-400"><span>{completedCount} من {totalCount} درس</span><span>{hasCompletedLessonToday ? 'إنجاز اليوم ✓' : 'خطوة صغيرة اليوم'}</span></div>
        <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full rounded-full bg-lime-200 transition-all" style={{ width: `${progress}%` }}/></div>
        <button onClick={() => currentLesson ? onStartLesson(currentLesson) : onAddMoreLessons()} disabled={isGeneratingMoreLessons} className="nlingo-primary-btn mt-5 w-full rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-extrabold">
          {isGeneratingMoreLessons ? 'جارٍ تجهيز الدروس...' : currentLesson ? 'ابدأ التعلّم الآن' : 'أضف دروساً جديدة'} <Icon name="arrow" size={17}/>
        </button>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div><p className="text-[10px] text-zinc-500 font-bold tracking-[.18em] mb-1">YOUR DAILY TOOLS</p><h3 className="text-lg font-extrabold text-white">تدرّب بطريقتك</h3></div>
          <span className="text-[11px] text-zinc-500">اختر أسلوبك</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((item) => <button key={item.title} onClick={() => onViewChange(item.view)} className="nlingo-action-card text-right rounded-2xl p-4 min-h-[132px] flex flex-col justify-between">
            <div className={`nlingo-action-icon ${item.tone}`}><Icon name={item.icon} size={21}/></div>
            <div><p className="text-sm font-extrabold text-white">{item.title}</p><p className="text-[11px] text-zinc-500 mt-1">{item.subtitle}</p></div>
          </button>)}
        </div>
      </section>

      <section className="nlingo-study-card rounded-2xl p-4 flex items-center gap-4">
        <div className="nlingo-study-art"><Icon name="headphones" size={25}/><span className="study-page">PDF</span></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-extrabold text-white">تعلّم حتى دون إنترنت</p><p className="text-xs text-zinc-400 leading-relaxed mt-1">حمّل الدرس كملف PDF وصوت، ثم اقرأ واستمع معاً من هاتفك.</p><div className="flex gap-2 mt-2"><span className="nlingo-file-chip">PDF</span><span className="nlingo-file-chip">AUDIO</span><span className="nlingo-file-chip">OFFLINE</span></div></div>
      </section>

      <section className="pb-2">
        <div className="flex items-center justify-between mb-3"><h3 className="text-base font-extrabold text-white">تابع رحلتك</h3><button onClick={() => onViewChange(View.ROADMAP)} className="text-xs font-bold text-lime-200 flex items-center gap-1">كل الدروس <Icon name="arrow" size={13}/></button></div>
        <button onClick={() => currentLesson ? onStartLesson(currentLesson) : onViewChange(View.ROADMAP)} className="w-full flex items-center gap-3 rounded-2xl bg-[#171717] border border-white/[.07] p-3 text-right">
          <div className="w-12 h-12 rounded-xl bg-white/[.06] flex items-center justify-center text-zinc-200"><Icon name="book" size={22}/></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-zinc-100 truncate">{currentLesson?.title || 'استعرض خارطة التعلّم'}</p><p className="text-xs text-zinc-500 mt-1 truncate">{currentLesson?.description || 'اختر هدفك التالي وابدأ درساً جديداً'}</p></div>
          <span className="text-zinc-500"><Icon name="arrow" size={17}/></span>
        </button>
      </section>

      <footer className="text-center pt-2"><p className="text-[10px] text-zinc-600">صُنع بكل عناية بواسطة <strong className="text-zinc-400">Nmakes</strong></p><button onClick={() => onViewChange(View.TERMS)} className="text-[10px] text-zinc-600 underline mt-2">الشروط والخصوصية</button></footer>
    </div>
  );
};

export default Dashboard;
