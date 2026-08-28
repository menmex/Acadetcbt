import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Landmark,
  TrendingUp,
  BookMarked,
  Building2,
  Cross,
  CheckCircle2,
  Play,
  Database
} from 'lucide-react';
import { JAMB_SUBJECTS, JambSubjectMeta } from '../../data/jambQuestionsBank';
import { PreJambStorageService } from '../../services/prejambStorage';

interface PreJambSelectSubjectViewProps {
  onBackToDashboard: () => void;
  onSelectSubject: (subject: JambSubjectMeta) => void;
}

export const PreJambSelectSubjectView: React.FC<PreJambSelectSubjectViewProps> = ({
  onBackToDashboard,
  onSelectSubject,
}) => {
  const [subjectsList, setSubjectsList] = useState<JambSubjectMeta[]>(() => PreJambStorageService.getSubjects());
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>(() => PreJambStorageService.getQuestionsCountBySubject());

  useEffect(() => {
    setSubjectsList(PreJambStorageService.getSubjects());
    setQuestionCounts(PreJambStorageService.getQuestionsCountBySubject());
  }, []);

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return BookOpen;
      case 'Calculator':
        return Calculator;
      case 'Atom':
        return Atom;
      case 'FlaskConical':
        return FlaskConical;
      case 'Leaf':
        return Leaf;
      case 'Landmark':
        return Landmark;
      case 'TrendingUp':
        return TrendingUp;
      case 'BookMarked':
        return BookMarked;
      case 'Building2':
        return Building2;
      case 'Cross':
        return Cross;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* ================= TOP HEADER ================= */}
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
              Subject Catalog Database
            </span>
          </div>
        </div>

        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Breadcrumb Navigator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span>&gt;</span>
          <span className="hover:text-emerald-800 cursor-pointer">Practice</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-bold">Select Subject</span>
        </div>

        {/* Header Heading */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Select Subject
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Choose a subject to start practicing with authentic questions from the Pre-JAMB database
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {subjectsList.map((subj) => {
            const Icon = getSubjectIcon(subj.icon);
            const liveCount = questionCounts[subj.id] || subj.questionCount || 40;
            return (
              <div
                key={subj.id}
                className="p-6 bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between items-center text-center space-y-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 text-emerald-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-50 transition-all shadow-xs">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {subj.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {liveCount} in Database
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      • {subj.timeMinutes} mins
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSubject(subj)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-emerald-950 hover:text-white border border-slate-300 hover:border-emerald-950 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:bg-emerald-950 group-hover:text-white"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Practice Drill</span>
                </button>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
};
