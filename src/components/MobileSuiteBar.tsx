import React, { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  FolderDown,
  Menu,
  X,
  Smartphone,
  Download,
  Award,
  Users,
  BarChart3,
  Bookmark,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Sparkles,
  Flame,
  FileText,
  CreditCard,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';
import { getEffectiveStreak } from '../utils/streak';
import brandLogo from '../assets/images/exact_acadet_cbt_logo_1786225425882.jpg';

interface MobileSuiteBarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'register' | 'login' | 'admin' | 'forgot') => void;
  onOpenSubscribe: () => void;
  onOpenInstallModal: () => void;
  onOpenEditProfile?: () => void;
  onOpenAbout?: () => void;
  onOpenFeaturesPdf?: () => void;
  onLogout: () => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const MobileSuiteBar: React.FC<MobileSuiteBarProps> = ({
  currentUser,
  activeTab,
  onNavigate,
  onOpenAuth,
  onOpenSubscribe,
  onOpenInstallModal,
  onOpenEditProfile,
  onOpenAbout,
  onOpenFeaturesPdf,
  onLogout,
  themeMode,
  onToggleTheme,
}) => {
  const [suiteMenuOpen, setSuiteMenuOpen] = useState(false);
  const isLoggedIn = !!currentUser;
  const isStudent = currentUser?.role === 'student';
  const isAdmin = currentUser?.role === 'admin';
  const streakData = currentUser ? getEffectiveStreak(currentUser) : null;

  return (
    <>
      {/* Bottom Floating Mobile Suite Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors duration-200 ${
          themeMode === 'light'
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
            : 'bg-slate-950/95 border-slate-800/90 text-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]'
        }`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
        id="mobile-suite-bottom-bar"
      >
        <div className="max-w-md mx-auto px-2 py-1.5 grid grid-cols-5 gap-1 items-center justify-around">
          
          {/* Tab 1: Home / Dashboard */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate(isAdmin ? 'admin' : 'dashboard');
              } else {
                onNavigate('landing');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' || activeTab === 'landing' || activeTab === 'admin'
                ? themeMode === 'light'
                  ? 'text-indigo-600 font-bold'
                  : 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-nav-tab-home"
          >
            <div className="relative p-1">
              <LayoutDashboard className="w-5 h-5" />
              {(activeTab === 'dashboard' || activeTab === 'landing' || activeTab === 'admin') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap">
              {isAdmin ? 'Admin' : isLoggedIn ? 'Dashboard' : 'Home'}
            </span>
          </button>

          {/* Tab 2: Practice */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('practice');
              } else {
                onOpenAuth('login');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'practice'
                ? themeMode === 'light'
                  ? 'text-indigo-600 font-bold'
                  : 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-nav-tab-practice"
          >
            <div className="relative p-1">
              <Zap className="w-5 h-5" />
              {activeTab === 'practice' && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap">Practice</span>
          </button>

          {/* Tab 3: Mock CBT / Pre-JAMB (Center Highlight) */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('mock_cbt');
              } else {
                onNavigate('pre_jamb');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'mock_cbt' || activeTab === 'pre_jamb'
                ? themeMode === 'light'
                  ? 'text-emerald-600 font-bold'
                  : 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-nav-tab-mock"
          >
            <div className="relative p-1">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              {(activeTab === 'mock_cbt' || activeTab === 'pre_jamb') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap font-medium text-emerald-400">
              Mock CBT
            </span>
          </button>

          {/* Tab 4: Materials */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('materials');
              } else {
                onOpenAuth('login');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'materials'
                ? themeMode === 'light'
                  ? 'text-indigo-600 font-bold'
                  : 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="mobile-nav-tab-materials"
          >
            <div className="relative p-1">
              <FolderDown className="w-5 h-5" />
              {activeTab === 'materials' && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap">Materials</span>
          </button>

          {/* Tab 5: Suite Menu (Opens Full Mobile Suite Drawer) */}
          <button
            onClick={() => setSuiteMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
            id="mobile-nav-tab-suite-menu"
          >
            <div className="relative p-1">
              <Menu className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <span className="text-[10px] tracking-tight whitespace-nowrap">Suite Menu</span>
          </button>

        </div>
      </nav>

      {/* Full-Screen Mobile Suite Menu Drawer / Sheet */}
      {suiteMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in"
          id="mobile-suite-drawer-overlay"
        >
          <div
            className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 custom-scrollbar"
            id="mobile-suite-drawer-content"
          >
            {/* Header / Grab Handle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center overflow-hidden">
                  <img
                    src={brandLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Acadet Mobile Suite</h3>
                  <p className="text-[10px] text-slate-400">Fast Examination & Learning Hub</p>
                </div>
              </div>

              <button
                onClick={() => setSuiteMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                id="close-mobile-suite-drawer"
              >
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            {/* High-Priority Download / Install Mobile App Banner Button */}
            <button
              onClick={() => {
                setSuiteMenuOpen(false);
                onOpenInstallModal();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-between transition-all cursor-pointer"
              id="mobile-drawer-install-app-btn"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-white">Download & Install Mobile App</p>
                  <p className="text-[10px] text-indigo-100 font-normal">Add to Home Screen for Offline CBT</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-white animate-bounce" />
            </button>

            {/* Quick Toggle Controls Grid (Day/Night Mode & Streak) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleTheme();
                }}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
                id="mobile-drawer-theme-toggle"
              >
                <div className="flex items-center gap-2">
                  {themeMode === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{themeMode === 'light' ? 'Day Mode' : 'Night Mode'}</span>
                </div>
                <span className="text-[10px] text-slate-400">Switch</span>
              </button>

              {streakData && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{streakData.streak} Day Streak</span>
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                Learning & Competition
              </span>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('pre_jamb');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-emerald-300 font-bold flex items-center gap-2.5"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>🏆 Pre-JAMB CBT Academy</span>
              </button>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('leaderboard');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-amber-300 font-bold flex items-center gap-2.5"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Student Leaderboard</span>
              </button>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('community');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-indigo-300 font-bold flex items-center gap-2.5"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Learning Community</span>
              </button>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('performance');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2.5"
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Performance Analytics</span>
              </button>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('bookmarks');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center gap-2.5"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Saved Bookmarks</span>
              </button>

              <button
                onClick={() => {
                  setSuiteMenuOpen(false);
                  onNavigate('founder');
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/10 text-amber-300 font-bold flex items-center gap-2.5"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>🏆 Founder: Menmex</span>
              </button>
            </div>

            {/* Account & Profile Operations */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {currentUser.role}
                    </span>
                  </div>

                  {isStudent && onOpenEditProfile && (
                    <button
                      onClick={() => {
                        setSuiteMenuOpen(false);
                        onOpenEditProfile();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>Edit Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSuiteMenuOpen(false);
                      onOpenSubscribe();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-indigo-300 flex items-center gap-2 font-semibold"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Subscription Plans & Upgrade</span>
                  </button>

                  {onOpenFeaturesPdf && (
                    <button
                      onClick={() => {
                        setSuiteMenuOpen(false);
                        onOpenFeaturesPdf();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-indigo-300 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Download Features PDF</span>
                    </button>
                  )}

                  {onOpenAbout && (
                    <button
                      onClick={() => {
                        setSuiteMenuOpen(false);
                        onOpenAbout();
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>About Acadet CBT MASTER</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSuiteMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-rose-950/40 text-xs text-rose-400 font-bold flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Account</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSuiteMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 text-center cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setSuiteMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl text-center shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
