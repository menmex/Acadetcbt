import React from 'react';
import {
  Target,
  Monitor,
  TrendingUp,
  ShieldCheck,
  Tv,
  Clock,
  ClipboardCheck,
  Award,
  Sparkles,
  Play
} from 'lucide-react';

interface PreJambCbtCardProps {
  onStartTest?: () => void;
  onStartGuestMode?: () => void;
  onExploreFullMock?: () => void;
  className?: string;
}

export const PreJambCbtCard: React.FC<PreJambCbtCardProps> = ({
  onStartTest,
  onStartGuestMode,
  onExploreFullMock,
  className = '',
}) => {
  const handleGuestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartGuestMode) {
      onStartGuestMode();
    } else if (onStartTest) {
      onStartTest();
    }
  };

  return (
    <div
      className={`relative w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-800 select-none transition-all duration-300 hover:shadow-emerald-500/10 ${className}`}
      id="pre-jamb-cbt-featured-card"
    >
      {/* Decorative Dot Matrix Grid Top Left & Right */}
      <div className="absolute top-4 left-4 grid grid-cols-3 gap-1 opacity-30 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-emerald-900" />
        ))}
      </div>
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-20 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-emerald-900" />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="pt-8 px-6 sm:px-10 pb-6 flex flex-col items-center text-center">
        
        {/* ================= OFFICIAL VECTOR SEAL / EMBLEM ================= */}
        <div className="relative mb-5 group cursor-pointer" onClick={handleGuestClick}>
          <div className="w-36 h-36 sm:w-40 sm:h-40 relative flex items-center justify-center">
            {/* Outer Circular Ring with Laurel Wreath */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
              {/* Outer Laurel / Star Circle */}
              <circle cx="100" cy="100" r="92" fill="#064e3b" stroke="#047857" strokeWidth="4" />
              <circle cx="100" cy="100" r="82" fill="#044e3a" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
              
              {/* Circular Path for Curved Text */}
              <defs>
                <path
                  id="textPath-top"
                  d="M 28 100 A 72 72 0 0 1 172 100"
                  fill="none"
                />
                <linearGradient id="torchFlame" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              {/* Top Curved Text */}
              <text fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="2.5">
                <textPath href="#textPath-top" startOffset="50%" textAnchor="middle">
                  PRE-JAMB ACADET
                </textPath>
              </text>

              {/* Stars on Left & Right */}
              <path d="M 32 95 L 34 100 L 39 100 L 35 103 L 37 108 L 32 105 L 27 108 L 29 103 L 25 100 L 30 100 Z" fill="#fbbf24" />
              <path d="M 168 95 L 170 100 L 175 100 L 171 103 L 173 108 L 168 105 L 163 108 L 165 103 L 161 100 L 166 100 Z" fill="#fbbf24" />

              {/* Inner White Shield with Green Laurel and Flame */}
              <circle cx="100" cy="100" r="62" fill="#022c22" stroke="#34d399" strokeWidth="2" />
              
              {/* Shield Outline in Center */}
              <path
                d="M 75 75 Q 100 68 125 75 Q 125 110 100 128 Q 75 110 75 75 Z"
                fill="#065f46"
                stroke="#6ee7b7"
                strokeWidth="1.5"
              />

              {/* Nigeria Map Outline Silhouette (stylized) */}
              <path
                d="M 85 85 Q 92 80 105 82 Q 115 88 112 100 Q 108 112 100 115 Q 90 110 86 100 Z"
                fill="#047857"
                opacity="0.9"
              />

              {/* Central Torch / Flame */}
              <path
                d="M 100 64 C 95 72 94 77 96 82 C 98 86 100 87 100 90 C 100 87 102 86 104 82 C 106 77 105 72 100 64 Z"
                fill="url(#torchFlame)"
              />
              {/* Torch Handle */}
              <path d="M 96 90 L 104 90 L 102 108 L 98 108 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
              <rect x="94" y="88" width="12" height="3" rx="1.5" fill="#d1d5db" />

              {/* Small "JAMB" Sub-text */}
              <text x="100" y="122" fill="#a7f3d0" fontSize="8.5" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                JAMB
              </text>
            </svg>

            {/* Bottom Ribbon Banner: "CBT TEST" */}
            <div className="absolute -bottom-2 w-full flex flex-col items-center">
              <div className="relative bg-emerald-950 text-white border-2 border-emerald-400 px-6 py-1.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-widest text-emerald-100">
                  CBT TEST
                </span>
              </div>
              <div className="text-[8px] font-black tracking-wider text-emerald-900 uppercase mt-1">
                PREPARE • PRACTICE • EXCEL
              </div>
            </div>
          </div>
        </div>

        {/* ================= TITLE & SUBTITLE ================= */}
        <div className="space-y-0.5 mt-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 uppercase font-sans">
            PRE-JAMB ACADEMY
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-emerald-600 uppercase">
            CBT TEST
          </h1>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
        </div>

        {/* ================= 4 FEATURE CARDS GRID ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6">
          
          {/* Feature 1 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">
              PRACTICE SMART
            </span>
          </div>

          {/* Feature 2 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
              <Monitor className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">
              CBT EXPERIENCE
            </span>
          </div>

          {/* Feature 3 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">
              TRACK PROGRESS
            </span>
          </div>

          {/* Feature 4 */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight">
              EXAM READY
            </span>
          </div>

        </div>

        {/* ================= PRIMARY FUNCTIONAL CTA BUTTON ================= */}
        <button
          type="button"
          onClick={handleGuestClick}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-2xl shadow-xl shadow-emerald-700/30 hover:shadow-emerald-600/50 border border-emerald-400/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3.5 group"
          id="btn-start-cbt-guest-mode"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wide text-white flex items-center gap-1.5">
              <span>START CBT TEST (GUEST MODE)</span>
              <Play className="w-3.5 h-3.5 fill-current opacity-80" />
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-100/90 font-medium">
              Begin Practice Without Registration
            </div>
          </div>
        </button>

      </div>

      {/* ================= BOTTOM GREEN WAVE BANNER ================= */}
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white px-6 sm:px-8 py-5 border-t border-emerald-800 relative">
        {/* Subtle curved top accent */}
        <div className="absolute -top-3 left-0 right-0 h-4 bg-emerald-900 rounded-t-[50%] pointer-events-none"></div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
          
          <div className="flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-emerald-100">
              SECURE & RELIABLE
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-emerald-100">
              TIMED EXAMS
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-emerald-100">
              INSTANT RESULTS
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-tight text-emerald-100">
              BETTER TOMORROW
            </span>
          </div>

        </div>

        {/* Center Star & Motto */}
        <div className="pt-2 border-t border-emerald-800/80 flex flex-col items-center text-center">
          <span className="text-amber-400 text-xs mb-0.5">★</span>
          <p className="text-xs italic text-emerald-200/90 font-serif">
            Prepare Today, Excel Tomorrow
          </p>
        </div>
      </div>

    </div>
  );
};
