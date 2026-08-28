import React from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Trophy,
  Award
} from 'lucide-react';
import { PreJambCompletedExamData } from './PreJambExamEngine';
import { JAMB_SUBJECTS } from '../../data/jambQuestionsBank';

interface PreJambResultViewProps {
  result: PreJambCompletedExamData;
  onViewAnswersReview: () => void;
  onBackToDashboard: () => void;
  onRetakeExam: () => void;
}

export const PreJambResultView: React.FC<PreJambResultViewProps> = ({
  result,
  onViewAnswersReview,
  onBackToDashboard,
  onRetakeExam,
}) => {
  // Count stats
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;

  result.subjectIds.forEach((sId) => {
    const qList = result.questionsBySubject[sId] || [];
    const ans = result.answersBySubject[sId] || {};

    qList.forEach((q) => {
      const userChoice = ans[q.id];
      if (!userChoice) {
        totalUnanswered++;
      } else if (userChoice === q.correctAnswer) {
        totalCorrect++;
      } else {
        totalWrong++;
      }
    });
  });

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Approximate 400-scale UTME mark
  const utmeAggregate = Math.round((result.totalScore / (result.totalQuestions || 1)) * 400);

  const getScoreRemark = (pct: number) => {
    if (pct >= 75) return 'Excellent Performance! You are well positioned for top national merit.';
    if (pct >= 60) return 'Good Job! You have performed better than ' + pct + '% of candidates.';
    if (pct >= 45) return 'Fair Attempt. Targeted practice in weak areas will boost your score.';
    return 'Needs Improvement. Focus on foundational concepts and past question revisions.';
  };

  const getProgressBarColor = (pct: number) => {
    if (pct >= 70) return 'bg-emerald-600';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

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

      {/* ================= MAIN RESULT CONTAINER ================= */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Title Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {result.examTitle || 'Mock Exam - UTME'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Completed on {new Date(result.completedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </p>
        </div>

        {/* Score & Metric Showcase Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-100 pb-8">
            
            {/* Left Big Score Badge (Col 1-5) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Score
              </span>
              <div className="text-5xl sm:text-6xl font-black text-slate-900 mt-2">
                {result.percentage}%
              </div>
              <div className="text-sm font-extrabold text-emerald-800 mt-1">
                {utmeAggregate} / 400 UTME Aggregate
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-3 max-w-xs leading-relaxed">
                {getScoreRemark(result.percentage)}
              </p>
            </div>

            {/* Right Metric Details Table (Col 6-12) */}
            <div className="md:col-span-7 space-y-3.5 divide-y divide-slate-100">
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <span className="text-slate-600 font-medium">Total Questions</span>
                <span className="font-bold text-slate-900">{result.totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm pt-3">
                <span className="text-slate-600 font-medium">Correct Answers</span>
                <span className="font-bold text-emerald-600">{totalCorrect}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm pt-3">
                <span className="text-slate-600 font-medium">Wrong Answers</span>
                <span className="font-bold text-rose-600">{totalWrong}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm pt-3">
                <span className="text-slate-600 font-medium">Unanswered</span>
                <span className="font-bold text-slate-600">{totalUnanswered}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm pt-3">
                <span className="text-slate-600 font-medium">Time Taken</span>
                <span className="font-mono font-bold text-slate-900">{formatTime(result.timeUsedSeconds)}</span>
              </div>
            </div>

          </div>

          {/* Subject Performance Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Subject Performance
            </h3>

            <div className="space-y-4">
              {result.subjectIds.map((sId) => {
                const sMeta = JAMB_SUBJECTS.find((s) => s.id === sId);
                const sScore = result.subjectScores[sId] || { correct: 0, total: 40, percentage: 0 };
                const barColor = getProgressBarColor(sScore.percentage);

                return (
                  <div key={sId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{sMeta?.name || sId}</span>
                      <span className="text-slate-600">
                        {sScore.correct}/{sScore.total} ({sScore.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${sScore.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onViewAnswersReview}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Answers Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

        </div>

      </main>

    </div>
  );
};
