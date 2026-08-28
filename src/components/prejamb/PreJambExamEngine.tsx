import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';
import { PreJambQuestionItem, JAMB_SUBJECTS } from '../../data/jambQuestionsBank';

export interface PreJambExamSessionPayload {
  examTitle: string;
  isFullMock: boolean;
  subjectIds: string[];
  questionsBySubject: Record<string, PreJambQuestionItem[]>;
  durationMinutes: number;
}

export interface PreJambCompletedExamData {
  examTitle: string;
  isFullMock: boolean;
  subjectIds: string[];
  questionsBySubject: Record<string, PreJambQuestionItem[]>;
  answersBySubject: Record<string, Record<string, 'A' | 'B' | 'C' | 'D'>>;
  markedForReview: Record<string, boolean>;
  timeUsedSeconds: number;
  totalQuestions: number;
  totalScore: number;
  percentage: number;
  subjectScores: Record<string, { correct: number; total: number; percentage: number }>;
  completedAt: string;
}

interface PreJambExamEngineProps {
  session: PreJambExamSessionPayload;
  onFinishExam: (result: PreJambCompletedExamData) => void;
  onQuitExam: () => void;
}

export const PreJambExamEngine: React.FC<PreJambExamEngineProps> = ({
  session,
  onFinishExam,
  onQuitExam,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(session.subjectIds[0] || 'mathematics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // Answers state: { [subjectId]: { [questionId]: 'A' | 'B' | 'C' | 'D' } }
  const [answers, setAnswers] = useState<Record<string, Record<string, 'A' | 'B' | 'C' | 'D'>>>(() => {
    const init: Record<string, Record<string, 'A' | 'B' | 'C' | 'D'>> = {};
    session.subjectIds.forEach((id) => {
      init[id] = {};
    });
    return init;
  });

  // Marked for review: { [questionId]: boolean }
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});

  // Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(session.durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showKeyShortcutsModal, setShowKeyShortcutsModal] = useState<boolean>(false);

  // Active Subject Questions
  const currentSubjectQuestions = session.questionsBySubject[activeSubjectId] || [];
  const currentQuestion = currentSubjectQuestions[currentQuestionIndex];

  // Format Timer HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Final Submission
  const handleFinalSubmission = useCallback(() => {
    let totalScore = 0;
    let totalQuestionsCount = 0;
    const subjectScores: Record<string, { correct: number; total: number; percentage: number }> = {};

    session.subjectIds.forEach((subjId) => {
      const qList = session.questionsBySubject[subjId] || [];
      const userSubjAnswers = answers[subjId] || {};
      let subjCorrect = 0;

      qList.forEach((q) => {
        totalQuestionsCount += 1;
        if (userSubjAnswers[q.id] === q.correctAnswer) {
          subjCorrect += 1;
          totalScore += 1;
        }
      });

      const pct = qList.length > 0 ? Math.round((subjCorrect / qList.length) * 100) : 0;
      subjectScores[subjId] = {
        correct: subjCorrect,
        total: qList.length,
        percentage: pct,
      };
    });

    const percentage = totalQuestionsCount > 0 ? Math.round((totalScore / totalQuestionsCount) * 100) : 0;
    const timeUsed = session.durationMinutes * 60 - secondsRemaining;

    const resultData: PreJambCompletedExamData = {
      examTitle: session.examTitle,
      isFullMock: session.isFullMock,
      subjectIds: session.subjectIds,
      questionsBySubject: session.questionsBySubject,
      answersBySubject: answers,
      markedForReview: markedQuestions,
      timeUsedSeconds: Math.max(timeUsed, 1),
      totalQuestions: totalQuestionsCount,
      totalScore,
      percentage,
      subjectScores,
      completedAt: new Date().toISOString(),
    };

    onFinishExam(resultData);
  }, [session, answers, markedQuestions, secondsRemaining, onFinishExam]);

  // Timer Tick
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmission();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, handleFinalSubmission]);

  // Handle Option Select
  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [activeSubjectId]: {
        ...(prev[activeSubjectId] || {}),
        [currentQuestion.id]: opt,
      },
    }));
  };

  // Toggle Mark For Review
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  // Navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const currentSubjIndex = session.subjectIds.indexOf(activeSubjectId);
      if (currentSubjIndex < session.subjectIds.length - 1) {
        setActiveSubjectId(session.subjectIds[currentSubjIndex + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      const currentSubjIndex = session.subjectIds.indexOf(activeSubjectId);
      if (currentSubjIndex > 0) {
        const prevSubj = session.subjectIds[currentSubjIndex - 1];
        setActiveSubjectId(prevSubj);
        setCurrentQuestionIndex((session.questionsBySubject[prevSubj]?.length || 1) - 1);
      }
    }
  };

  // Real JAMB 8-Key Keyboard Navigation (A, B, C, D, N, P, S, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key as 'A' | 'B' | 'C' | 'D');
      } else if (key === 'N') {
        handleNextQuestion();
      } else if (key === 'P') {
        handlePrevQuestion();
      } else if (key === 'R') {
        toggleMarkForReview();
      } else if (key === 'S') {
        setShowSubmitModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubjectId, currentQuestionIndex, currentQuestion]);

  // Count total answered vs unanswered for submit modal
  let totalAnsweredCount = 0;
  let totalTotalCount = 0;
  session.subjectIds.forEach((sId) => {
    const qList = session.questionsBySubject[sId] || [];
    const ans = answers[sId] || {};
    totalTotalCount += qList.length;
    qList.forEach((q) => {
      if (ans[q.id]) totalAnsweredCount++;
    });
  });

  const selectedAnswer = currentQuestion ? answers[activeSubjectId]?.[currentQuestion.id] : undefined;
  const isMarked = currentQuestion ? !!markedQuestions[currentQuestion.id] : false;
  const isTimeUrgent = secondsRemaining < 300;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 select-none">
      
      {/* ================= TOP HEADER ================= */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
            PJ
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-950 uppercase">
            PRE-JAMB ACADEMY CBT
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowKeyShortcutsModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>8-Key Shortcuts (A,B,C,D,N,P,S,R)</span>
          </button>
          
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= SUB-HEADER (SUBJECT TABS, TIME, FINISH) ================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Subject Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {session.subjectIds.map((sId) => {
            const subjMeta = JAMB_SUBJECTS.find((s) => s.id === sId);
            const isActive = activeSubjectId === sId;
            const sQuestions = session.questionsBySubject[sId] || [];
            const sAnswers = answers[sId] || {};
            const answeredInSubject = Object.keys(sAnswers).length;

            return (
              <button
                key={sId}
                type="button"
                onClick={() => {
                  setActiveSubjectId(sId);
                  setCurrentQuestionIndex(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-950 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>Subject: {subjMeta?.name || sId}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {answeredInSubject}/{sQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timer & Finish Exam Button */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
            isTimeUrgent
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <Clock className={`w-4 h-4 ${isTimeUrgent ? 'text-rose-600' : 'text-slate-500'}`} />
            <span>Time Left: <span className="font-extrabold">{formatTime(secondsRemaining)}</span></span>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            id="btn-finish-exam"
          >
            Finish Exam
          </button>
        </div>

      </div>

      {/* ================= MAIN EXAM BODY (2-COLUMN GRID) ================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT QUESTION PANE (Col 1-8) ================= */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[480px]">
          
          <div className="space-y-6">
            
            {/* Question Index Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs sm:text-sm font-black text-slate-700">
                Question {currentQuestionIndex + 1} of {currentSubjectQuestions.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {JAMB_SUBJECTS.find((s) => s.id === activeSubjectId)?.name}
              </span>
            </div>

            {/* Question Text */}
            {currentQuestion ? (
              <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-sans">
                {currentQuestion.question}
              </div>
            ) : (
              <div className="text-sm text-slate-400">Loading question...</div>
            )}

            {/* Option Radio Buttons (A, B, C, D) */}
            {currentQuestion && (
              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((optKey, idx) => {
                  const optText = currentQuestion.options[idx] || `Option ${optKey}`;
                  const isSelected = selectedAnswer === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(optKey)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {/* Radio Circle */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-slate-400 bg-white'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="text-xs sm:text-sm font-medium">
                        <span className="font-bold mr-1.5">{optKey}.</span>
                        <span>{optText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mark for Review Checkbox */}
            <div className="pt-2">
              <label
                onClick={toggleMarkForReview}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isMarked}
                  onChange={() => {}}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Mark for Review</span>
              </label>
            </div>

          </div>

          {/* Bottom Previous & Next Action Buttons */}
          <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0 && session.subjectIds.indexOf(activeSubjectId) === 0}
              className="px-6 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-7 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Next
            </button>
          </div>

        </section>

        {/* ================= RIGHT QUESTION PALETTE PANE (Col 9-12) ================= */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Question Palette
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any question number to jump directly
            </p>
          </div>

          {/* Palette Grid (1 to 40/60) */}
          <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {currentSubjectQuestions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const hasAnswer = !!answers[activeSubjectId]?.[q.id];
              const isQuestionMarked = !!markedQuestions[q.id];

              let boxClass = 'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
              if (isCurrent) {
                boxClass = 'bg-emerald-950 text-white border-emerald-950 ring-2 ring-emerald-600';
              } else if (isQuestionMarked) {
                boxClass = 'bg-amber-300 text-amber-950 border-amber-400 font-black';
              } else if (hasAnswer) {
                boxClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${boxClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[11px] font-semibold text-slate-600">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-950 border border-emerald-950" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-300 border border-amber-400" />
                <span>Marked</span>
              </div>
            </div>
          </div>

        </aside>

      </main>

      {/* ================= SUBMISSION CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-center">
            
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Send className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                Submit & Finish Exam?
              </h3>
              <p className="text-xs text-slate-500">
                You have answered <span className="font-bold text-emerald-800">{totalAnsweredCount}</span> of <span className="font-bold text-slate-800">{totalTotalCount}</span> questions.
              </p>
            </div>

            {totalAnsweredCount < totalTotalCount && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-left">
                ⚠️ You still have <strong>{totalTotalCount - totalAnsweredCount} unanswered questions</strong>. Once submitted, your scores will be graded immediately.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Return to Exam
              </button>

              <button
                type="button"
                onClick={handleFinalSubmission}
                className="py-2.5 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 8-KEY SHORTCUTS MODAL ================= */}
      {showKeyShortcutsModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 border-b pb-2">
              ⌨️ Authentic JAMB 8-Key Navigation
            </h3>
            <p className="text-xs text-slate-500">
              The official JAMB CBT examination software uses standard 8-key navigation. You can use your physical keyboard to navigate:
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-mono font-bold bg-white px-2 py-0.5 border rounded">A, B, C, D</span>
                <span>Select corresponding option</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-mono font-bold bg-white px-2 py-0.5 border rounded">N</span>
                <span>Move to Next question</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-mono font-bold bg-white px-2 py-0.5 border rounded">P</span>
                <span>Move to Previous question</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-mono font-bold bg-white px-2 py-0.5 border rounded">R</span>
                <span>Mark for Review / Reverse</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-mono font-bold bg-white px-2 py-0.5 border rounded">S</span>
                <span>Submit & Finish Exam</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowKeyShortcutsModal(false)}
                className="w-full py-2.5 bg-emerald-950 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Got It, Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
