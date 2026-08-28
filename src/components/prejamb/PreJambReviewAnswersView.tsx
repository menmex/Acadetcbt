import React, { useState } from 'react';
import {
  Bell,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { PreJambCompletedExamData } from './PreJambExamEngine';
import { PreJambQuestionItem, JAMB_SUBJECTS } from '../../data/jambQuestionsBank';

interface PreJambReviewAnswersViewProps {
  result: PreJambCompletedExamData;
  onBackToResults: () => void;
  onBackToDashboard: () => void;
}

export const PreJambReviewAnswersView: React.FC<PreJambReviewAnswersViewProps> = ({
  result,
  onBackToResults,
  onBackToDashboard,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(result.subjectIds[0] || 'mathematics');
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  const currentSubjectQuestions = result.questionsBySubject[activeSubjectId] || [];
  const currentSubjectAnswers = result.answersBySubject[activeSubjectId] || {};

  // Augment questions with status
  const evaluatedQuestions = currentSubjectQuestions.map((q, idx) => {
    const userChoice = currentSubjectAnswers[q.id];
    let status: 'correct' | 'wrong' | 'unanswered' = 'unanswered';
    if (userChoice) {
      status = userChoice === q.correctAnswer ? 'correct' : 'wrong';
    }
    return {
      question: q,
      originalIndex: idx,
      userChoice,
      status,
    };
  });

  // Filter list
  const filteredList = evaluatedQuestions.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const selectedItem = filteredList[selectedQuestionIndex] || filteredList[0] || evaluatedQuestions[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* ================= TOP HEADER ================= */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
            PJ
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-950 uppercase">
            PRE-JAMB ACADEMY CBT
          </span>
        </div>

        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </header>

      {/* ================= MAIN REVIEW CONTAINER ================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Title Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Review Answers
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {result.examTitle || 'Mock Exam - UTME'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToResults}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Results</span>
            </button>
          </div>
        </div>

        {/* Subject Switcher & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Subject Switcher (if multi-subject) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {result.subjectIds.map((sId) => {
              const meta = JAMB_SUBJECTS.find((s) => s.id === sId);
              const isActive = activeSubjectId === sId;
              return (
                <button
                  key={sId}
                  type="button"
                  onClick={() => {
                    setActiveSubjectId(sId);
                    setSelectedQuestionIndex(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {meta?.name || sId}
                </button>
              );
            })}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Filter by:</span>
            {(['all', 'correct', 'wrong', 'unanswered'] as const).map((fKey) => (
              <button
                key={fKey}
                type="button"
                onClick={() => {
                  setFilter(fKey);
                  setSelectedQuestionIndex(0);
                }}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filter === fKey
                    ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {fKey}
              </button>
            ))}
          </div>

        </div>

        {/* ================= 2-COLUMN REVIEW INTERFACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT QUESTION LIST (Col 1-4) ================= */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs max-h-[560px] overflow-y-auto space-y-1.5">
            {filteredList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No questions match this filter.
              </div>
            ) : (
              filteredList.map((item, idx) => {
                const isSelected = selectedItem?.question.id === item.question.id;
                
                let badgeClass = 'text-slate-400 bg-slate-50 border-slate-200';
                if (item.status === 'correct') {
                  badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
                } else if (item.status === 'wrong') {
                  badgeClass = 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
                }

                return (
                  <button
                    key={item.question.id}
                    type="button"
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">
                      Q{item.originalIndex + 1}
                    </span>

                    <span className={`text-[11px] px-2 py-0.5 rounded-md border capitalize ${badgeClass}`}>
                      {item.status}
                    </span>
                  </button>
                );
              })
            )}
          </aside>

          {/* ================= RIGHT QUESTION DETAIL CARD (Col 5-12) ================= */}
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {selectedItem ? (
              <>
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">
                    Question {selectedItem.originalIndex + 1}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${
                    selectedItem.status === 'correct'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedItem.status === 'wrong'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>

                {/* Question Statement */}
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {selectedItem.question.question}
                </div>

                {/* Options List with Visual Feedback */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Options
                  </span>

                  {(['A', 'B', 'C', 'D'] as const).map((optKey, idx) => {
                    const optText = selectedItem.question.options[idx];
                    const isUserPick = selectedItem.userChoice === optKey;
                    const isCorrectAnswer = selectedItem.question.correctAnswer === optKey;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    let marker = null;

                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold';
                      marker = <span className="text-emerald-700 font-bold text-xs ml-auto">✓ Correct</span>;
                    } else if (isUserPick && !isCorrectAnswer) {
                      optStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-bold';
                      marker = <span className="text-rose-700 font-bold text-xs ml-auto">✕ Your choice</span>;
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-all ${optStyle}`}
                      >
                        <span className="font-extrabold">{optKey}.</span>
                        <span>{optText}</span>
                        {marker}
                      </div>
                    );
                  })}
                </div>

                {/* Answer Summary Badge */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Your Answer:</span>
                    <span className={`px-2 py-0.5 rounded-md ${
                      selectedItem.userChoice === selectedItem.question.correctAnswer
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedItem.userChoice
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedItem.userChoice || 'None'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Correct Answer:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedItem.question.correctAnswer}
                    </span>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Explanation:</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedItem.question.explanation || 'Refer to the standard syllabus guidelines for this subject.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a question from the left sidebar to review its step-by-step solution.
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-start">
              <button
                type="button"
                onClick={onBackToResults}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back to Results
              </button>
            </div>

          </section>

        </div>

      </main>

    </div>
  );
};
