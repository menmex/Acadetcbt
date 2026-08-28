import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart2,
  FileCheck,
  Zap,
  User,
  Settings,
  LogOut,
  Bell,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  FileText,
  ChevronDown,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types';
import { PreJambStorageService, PreJambCandidate, PreJambExamResultRecord } from '../../services/prejambStorage';
import { JAMB_SUBJECTS } from '../../data/jambQuestionsBank';

interface PreJambDashboardViewProps {
  user: UserProfile;
  activeNav: string;
  onNavigate: (tab: string) => void;
  onStartPractice: () => void;
  onStartMockExam: () => void;
  onReviewAnswers: (result?: PreJambExamResultRecord) => void;
  onLogout: () => void;
}

export const PreJambDashboardView: React.FC<PreJambDashboardViewProps> = ({
  user,
  activeNav,
  onNavigate,
  onStartPractice,
  onStartMockExam,
  onReviewAnswers,
  onLogout,
}) => {
  const [dbStats, setDbStats] = useState(() => PreJambStorageService.getDatabaseStats());
  const [candidateProfile, setCandidateProfile] = useState<PreJambCandidate | null>(() => {
    return PreJambStorageService.findCandidateByRegOrEmail(user.email || user.name || '') || null;
  });
  const [recentExams, setRecentExams] = useState<PreJambExamResultRecord[]>(() => {
    return PreJambStorageService.getResults(candidateProfile?.id);
  });

  useEffect(() => {
    const stats = PreJambStorageService.getDatabaseStats();
    setDbStats(stats);
    const cand = PreJambStorageService.findCandidateByRegOrEmail(user.email || user.name || '');
    if (cand) setCandidateProfile(cand);
    const exList = PreJambStorageService.getResults(cand?.id);
    setRecentExams(exList);
  }, [user]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice Drills', icon: BookOpen, action: onStartPractice },
    { id: 'mock_exams', label: 'Mock Exams (UTME)', icon: Trophy, action: onStartMockExam },
    { id: 'results', label: 'Score History', icon: BarChart2 },
    { id: 'review_answers', label: 'Review Answers', icon: FileCheck, action: () => onReviewAnswers() },
    { id: 'performance', label: 'Syllabus Coverage', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const totalTests = candidateProfile?.totalTestsTaken ?? (recentExams.length || 12);
  const avgScore = candidateProfile?.averageScore ?? (recentExams.length > 0 ? Math.round(recentExams.reduce((a, b) => a + b.percentage, 0) / recentExams.length) : 68);
  const bestScore = candidateProfile?.bestScore ?? (recentExams.length > 0 ? Math.max(...recentExams.map(r => r.percentage)) : 82);
  const totalMinutes = candidateProfile?.totalTimeSpentMinutes ?? 930;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* ================= TOP HEADER BAR ================= */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
            PJ
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-950 uppercase block">
              PRE-JAMB ACADEMY CBT
            </span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider hidden sm:block">
              Dedicated Database • {dbStats.totalQuestions} Questions Available
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-xs font-bold text-slate-700">
                {user.name || 'John Doe'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 hidden md:flex shrink-0">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (item.action ? item.action() : onNavigate(item.id))}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Database & Candidate Mini Status */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-700" />
                  <span>DB Status</span>
                </span>
                <span className="text-emerald-700 font-extrabold">Online</span>
              </div>
              <p className="text-slate-500 font-medium">
                {dbStats.totalQuestions} Questions • {dbStats.totalCandidates} Candidates
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD BODY ================= */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl mx-auto w-full space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Welcome back, <span className="font-bold text-slate-800">{user.name?.split(' ')[0] || 'John'}</span>! Keep practicing and improve your score every day.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStartMockExam}
                className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-emerald-300" />
                <span>Take Full Mock Exam</span>
              </button>
            </div>
          </div>

          {/* 4 Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tests Taken
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalTests}
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Average Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-800">
                {avgScore}%
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Best Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {bestScore}%
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Time Spent
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {hours}h {mins}m
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Quick Action 1: Practice by Subject */}
              <div
                onClick={onStartPractice}
                className="p-5 bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Practice by Subject
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Start practicing specific topics & past questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Quick Action 2: Mock Exam */}
              <div
                onClick={onStartMockExam}
                className="p-5 bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Mock Exam
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Take a full length authentic 4-subject timed test
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Launch CBT Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Quick Action 3: Review Answers */}
              <div
                onClick={() => onReviewAnswers()}
                className="p-5 bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Review Answers
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check your previous attempts & step-by-step solutions
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Review Submissions</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>

          {/* Recent Activity from Dedicated Pre-JAMB Database */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Pre-JAMB Test Activity
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {recentExams.length} records in Database
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {recentExams.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No mock exams taken yet. Launch your first practice drill above!
                </div>
              ) : (
                recentExams.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onReviewAnswers(act)}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {act.examTitle}
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Scored {act.percentage}% • {act.utmeAggregate || Math.round(act.percentage * 4)}/400 Aggregate
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(act.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {recentExams.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onReviewAnswers()}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  View all activity & step-by-step solutions
                </button>
              </div>
            )}
          </div>

        </main>

      </div>
    </div>
  );
};
