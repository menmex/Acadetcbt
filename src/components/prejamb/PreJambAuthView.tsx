import React, { useState } from 'react';
import { CheckCircle2, Headphones, Lock, Mail, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface PreJambAuthViewProps {
  onSignInSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
  onSwitchToRegister?: () => void;
}

export const PreJambAuthView: React.FC<PreJambAuthViewProps> = ({
  onSignInSuccess,
  onContinueAsGuest,
  onSwitchToRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        username: identifier.toLowerCase().replace(/\s+/g, '_'),
        email: identifier.includes('@') ? identifier : `${identifier}@prejambacademy.com`,
        phone: '+234 801 234 5678',
        role: 'student',
        authProvider: 'Email',
        universityId: 'uni-jamb',
        universityName: 'Pre-JAMB National Academy',
        departmentId: 'dept-utme',
        departmentName: 'General UTME Candidate',
        subscription: {
          isPremium: true,
          plan: 'Pre-JAMB Full Access',
          startDate: new Date().toISOString(),
          expiryDate: null,
          questionsAttemptedCount: 12,
          freeLimit: 9999,
        },
        bookmarks: [],
        createdDate: new Date().toISOString(),
        streakCount: 5,
        lastPracticeDate: new Date().toISOString(),
      };
      onSignInSuccess(authenticatedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-200/80 min-h-[580px]">
        
        {/* ================= LEFT FOREST GREEN BRAND PANEL ================= */}
        <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            {/* Crest Emblem */}
            <div className="w-32 h-32 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                <circle cx="100" cy="100" r="92" fill="#064e3b" stroke="#047857" strokeWidth="4" />
                <circle cx="100" cy="100" r="82" fill="#044e3a" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                <defs>
                  <path id="crestPath" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
                  <linearGradient id="crestFlame" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                </defs>
                <text fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="2.5">
                  <textPath href="#crestPath" startOffset="50%" textAnchor="middle">
                    PRE-JAMB ACADET
                  </textPath>
                </text>
                <path d="M 32 95 L 34 100 L 39 100 L 35 103 L 37 108 L 32 105 L 27 108 L 29 103 L 25 100 L 30 100 Z" fill="#fbbf24" />
                <path d="M 168 95 L 170 100 L 175 100 L 171 103 L 173 108 L 168 105 L 163 108 L 165 103 L 161 100 L 166 100 Z" fill="#fbbf24" />
                <circle cx="100" cy="100" r="62" fill="#022c22" stroke="#34d399" strokeWidth="2" />
                <path d="M 75 75 Q 100 68 125 75 Q 125 110 100 128 Q 75 110 75 75 Z" fill="#065f46" stroke="#6ee7b7" strokeWidth="1.5" />
                <path d="M 85 85 Q 92 80 105 82 Q 115 88 112 100 Q 108 112 100 115 Q 90 110 86 100 Z" fill="#047857" opacity="0.9" />
                <path d="M 100 64 C 95 72 94 77 96 82 C 98 86 100 87 100 90 C 100 87 102 86 104 82 C 106 77 105 72 100 64 Z" fill="url(#crestFlame)" />
                <path d="M 96 90 L 104 90 L 102 108 L 98 108 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.5" />
                <rect x="94" y="88" width="12" height="3" rx="1.5" fill="#d1d5db" />
                <text x="100" y="122" fill="#a7f3d0" fontSize="8.5" fontWeight="bold" textAnchor="middle" letterSpacing="1">JAMB</text>
              </svg>
              <div className="absolute -bottom-2 w-full flex flex-col items-center">
                <div className="bg-emerald-950 text-white border border-emerald-400 px-3 py-0.5 rounded-md shadow-md text-[10px] font-black tracking-wider">
                  CBT TEST
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-emerald-200/90 font-medium">
                Sign in to continue your practice
              </p>
            </div>

            {/* Benefit Checklist */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-emerald-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Practice Smart.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Track Progress.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-100 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Excel in JAMB.</span>
              </div>
            </div>
          </div>

          {/* Footer Contact */}
          <div className="pt-8 border-t border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300/80">
            <Headphones className="w-4 h-4" />
            <span>Need help? support@prejambacademy.com</span>
          </div>
        </div>

        {/* ================= RIGHT SIGN IN FORM ================= */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">
                Sign in
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Access your account
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Email / Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email or Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or username"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact support@prejambacademy.com or use guest mode to continue immediately.')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 hover:shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Guest Practice Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue in Guest Mode (No Sign In)</span>
                </button>
              </div>

            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500">
                New here?{' '}
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
