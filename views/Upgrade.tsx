import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts';

interface UpgradeProps {
  onBack: () => void;
}

const Upgrade: React.FC<UpgradeProps> = ({ onBack }) => {
  const { themeColors } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipient = 'nmakesofficial@gmail.com';
    const subject = encodeURIComponent('طلب ترقية إلى Nlingo Pro');
    const body = encodeURIComponent(
`مرحباً، أود الترقية إلى Nlingo Pro.

تفاصيلي:
الاسم: ${name}
البريد الإلكتروني: ${email}
رقم الهاتف: ${phone}
`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <header className="p-4 flex items-center bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <button onClick={onBack} className="ml-4 text-slate-400 hover:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-100">الترقية إلى Pro</h1>
      </header>
      <main className="flex-grow overflow-y-auto p-6 flex flex-col items-center">
        <div className={`w-full max-w-sm bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-700`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100">Nlingo Pro</h2>
            <p className={`text-4xl font-extrabold my-4 ${themeColors.accent}`}>{`5,000 ج.س`}</p>
            <p className="text-slate-400">شهريًا</p>
          </div>
          <ul className="space-y-3 text-slate-300 my-8 text-right">
            <li className="flex items-center">
              <svg className={`w-6 h-6 ml-3 ${themeColors.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>وقت محادثة غير محدود</span>
            </li>
            <li className="flex items-center">
              <svg className={`w-6 h-6 ml-3 ${themeColors.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>ميزات تعلم متقدمة</span>
            </li>
            <li className="flex items-center">
              <svg className={`w-6 h-6 ml-3 ${themeColors.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>دعم مميز عبر البريد الإلكتروني</span>
            </li>
          </ul>

          {submitted ? (
            <div className="text-center bg-green-900/50 border border-green-700 rounded-lg p-4">
                <h3 className="font-bold text-green-300">شكرًا لك!</h3>
                <p className="text-green-400">لقد تم تجهيز طلبك في برنامج البريد الإلكتروني. الرجاء إرساله لإكمال الترقية.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">الاسم</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="الاسم الكامل" className={`w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 ${themeColors.accentFocus}`} />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="البريد الإلكتروني" className={`w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 ${themeColors.accentFocus}`} />
              </div>
              <div>
                <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="رقم الهاتف" className={`w-full bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-400 rounded-lg p-3 focus:outline-none focus:ring-2 ${themeColors.accentFocus}`} />
              </div>
              <button type="submit" className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${themeColors.bg} ${themeColors.bgHover}`}>
                إرسال طلب الترقية
              </button>
            </form>
          )}
        </div>
      </main>
      <footer className="p-4 text-center text-slate-500 text-sm">
        Nlingo made by Nmakes
      </footer>
    </div>
  );
};

export default Upgrade;