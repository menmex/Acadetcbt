import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  Award,
  Layers,
  Sparkles,
  Check,
  X,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { PreJambStorageService, PreJambQuestionRecord, PreJambCandidate, PreJambExamResultRecord, PreJambDatabaseStats } from '../../services/prejambStorage';
import { JAMB_SUBJECTS, JambSubjectMeta } from '../../data/jambQuestionsBank';

interface PreJambDatabaseManagerViewProps {
  onClose: () => void;
  onQuestionsUpdated?: () => void;
}

export const PreJambDatabaseManagerView: React.FC<PreJambDatabaseManagerViewProps> = ({
  onClose,
  onQuestionsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'candidates' | 'results' | 'backup'>('overview');
  const [stats, setStats] = useState<PreJambDatabaseStats>(() => PreJambStorageService.getDatabaseStats());
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [questionsList, setQuestionsList] = useState<PreJambQuestionRecord[]>([]);
  const [candidatesList, setCandidatesList] = useState<PreJambCandidate[]>([]);
  const [resultsList, setResultsList] = useState<PreJambExamResultRecord[]>([]);

  // Modal / Form state for Add/Edit Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<PreJambQuestionRecord> | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    setStats(PreJambStorageService.getDatabaseStats());
    setQuestionsList(PreJambStorageService.getQuestions({ subjectId: selectedSubject, search: searchQuery }));
    setCandidatesList(PreJambStorageService.getCandidates());
    setResultsList(PreJambStorageService.getResults());
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject, searchQuery]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question from the Pre-JAMB database?')) {
      PreJambStorageService.deleteQuestion(id);
      loadData();
      showNotification('success', 'Question deleted successfully.');
      onQuestionsUpdated?.();
    }
  };

  // Handle Save Question (Add or Edit)
  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!editingQuestion.question || !editingQuestion.subjectId || !editingQuestion.correctAnswer) {
      showNotification('error', 'Please fill out all required question fields.');
      return;
    }

    const subjectObj = JAMB_SUBJECTS.find((s) => s.id === editingQuestion.subjectId);
    const resolvedOptions: [string, string, string, string] = [
      editingQuestion.options?.[0] || '',
      editingQuestion.options?.[1] || '',
      editingQuestion.options?.[2] || '',
      editingQuestion.options?.[3] || '',
    ];

    const payload: PreJambQuestionRecord = {
      id: editingQuestion.id || `pj-q-${Date.now()}`,
      subjectId: editingQuestion.subjectId,
      subjectName: subjectObj?.name || 'General Subject',
      question: editingQuestion.question,
      options: resolvedOptions,
      correctAnswer: editingQuestion.correctAnswer as any,
      explanation: editingQuestion.explanation || '',
      topic: editingQuestion.topic || 'General UTME',
      difficulty: editingQuestion.difficulty || 'medium',
      examYear: editingQuestion.examYear || 2024,
      source: editingQuestion.source || 'Pre-JAMB Question Bank',
    };

    PreJambStorageService.saveQuestion(payload);
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    loadData();
    showNotification('success', editingQuestion.id ? 'Question updated.' : 'New UTME question added.');
    onQuestionsUpdated?.();
  };

  // Handle Export
  const handleExportJson = () => {
    const jsonStr = PreJambStorageService.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prejamb-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'Pre-JAMB Database exported successfully.');
  };

  // Handle Import
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = PreJambStorageService.importDatabaseJson(content);
      if (res.success) {
        loadData();
        showNotification('success', res.message);
        onQuestionsUpdated?.();
      } else {
        showNotification('error', res.message);
      }
    };
    reader.readAsText(file);
  };

  // Handle Reset
  const handleResetDatabase = () => {
    if (window.confirm('⚠️ WARNING: This will reset the Pre-JAMB database to default curated UTME past questions and initial candidates. Continue?')) {
      PreJambStorageService.resetDatabaseToDefaults();
      loadData();
      showNotification('success', 'Pre-JAMB Database has been reset to defaults.');
      onQuestionsUpdated?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Pre-JAMB Academy Database</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  Isolated CBT Store
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                Independent schema & repository for UTME questions, candidate profiles, and mock exam metrics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications Toast */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* ================= TAB NAVIGATION ================= */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-slate-50 py-2">
          {[
            { id: 'overview', label: 'Database Overview', icon: Database },
            { id: 'questions', label: `Question Bank (${stats.totalQuestions})`, icon: BookOpen },
            { id: 'candidates', label: `Candidates (${stats.totalCandidates})`, icon: Users },
            { id: 'results', label: `Mock Exam Records (${stats.totalMockExamsTaken})`, icon: Award },
            { id: 'backup', label: 'Backup & Restore', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-950 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB BODY ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    UTME Questions
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                    {stats.totalQuestions}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">Across {JAMB_SUBJECTS.length} Subjects</p>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                    Registered Candidates
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                    {stats.totalCandidates}
                  </div>
                  <p className="text-[11px] text-indigo-700 font-medium">With UTME combos</p>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Completed Mocks
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950">
                    {stats.totalMockExamsTaken}
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium">Full & Drill Sessions</p>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                    Avg. UTME Aggregate
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-950">
                    {stats.averageScoreAggregate} <span className="text-xs font-normal text-slate-500">/ 400</span>
                  </div>
                  <p className="text-[11px] text-blue-700 font-medium">Top: {stats.highestAggregate}/400</p>
                </div>
              </div>

              {/* Subject Breakdown Matrix */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Questions Distribution by Subject</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('questions')}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Manage Questions →
                  </button>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {JAMB_SUBJECTS.map((s) => {
                    const count = stats.questionsPerSubject[s.id] || 0;
                    return (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-800">{s.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{s.code} • {s.timeMinutes} mins</div>
                        </div>
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-900 shadow-2xs">
                          {count} Qs
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Database Schema & Isolation Notice */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-800" />
                  <span>Isolated Data Storage Architecture</span>
                </div>
                <p className="leading-relaxed">
                  Pre-JAMB Academy CBT operates with its own self-contained database schemas (`prejamb_questions`, `prejamb_candidates`, `prejamb_results`), keeping UTME examinations, 400-mark scaling, and national syllabus questions decoupled from the institutional semester CBT tables.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QUESTIONS REPOSITORY */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-700"
                    />
                  </div>

                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700"
                  >
                    <option value="all">All Subjects</option>
                    {JAMB_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion({
                      subjectId: selectedSubject !== 'all' ? selectedSubject : 'use-of-english',
                      options: ['', '', '', ''],
                      correctAnswer: 'A',
                      difficulty: 'medium',
                      examYear: 2024,
                    });
                    setIsQuestionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Question</span>
                </button>
              </div>

              {/* Questions List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                  {questionsList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No questions found matching your filter criteria.
                    </div>
                  ) : (
                    questionsList.map((q, idx) => (
                      <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {q.subjectId}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {q.topic || 'General'}
                            </span>
                            {q.examYear && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                                {q.examYear} UTME
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                            {q.question}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                            {q.options?.map((opt, oIdx) => {
                              const letter = ['A', 'B', 'C', 'D'][oIdx];
                              const isCorrect = q.correctAnswer === letter;
                              return (
                                <div
                                  key={letter}
                                  className={`px-2 py-1 rounded-md text-[11px] ${
                                    isCorrect ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' : 'bg-slate-50'
                                  }`}
                                >
                                  <span className="font-bold mr-1">{letter}.</span> {opt}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                              <span className="font-bold">Explanation:</span> {q.explanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestion(q);
                              setIsQuestionModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CANDIDATES DATABASE */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Candidate</th>
                        <th className="p-3.5">Reg Number</th>
                        <th className="p-3.5">Target Institution & Course</th>
                        <th className="p-3.5">UTME Combination</th>
                        <th className="p-3.5">Tests</th>
                        <th className="p-3.5">Best Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {candidatesList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <div className="text-[11px] text-slate-400">{c.email}</div>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-700">
                            {c.regNumber}
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-800 font-semibold">{c.targetCourse}</div>
                            <div className="text-[11px] text-slate-500">{c.targetUniversity}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {c.utmeSubjects?.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                                  {s.replace('use-of-', '').replace('-in-english', '')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {c.totalTestsTaken}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              {c.bestScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOCK EXAM RECORDS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Exam Title</th>
                        <th className="p-3.5">Candidate</th>
                        <th className="p-3.5">Score %</th>
                        <th className="p-3.5">UTME Mark</th>
                        <th className="p-3.5">Time Taken</th>
                        <th className="p-3.5">Completed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {resultsList.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{r.examTitle}</div>
                            <div className="text-[11px] text-slate-400">{r.totalQuestions} Questions</div>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">
                            {r.candidateName || 'Candidate'}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                              r.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.percentage}%
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-black text-emerald-950">
                            {r.utmeAggregate || Math.round(r.percentage * 4)} / 400
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">
                            {Math.floor(r.timeUsedSeconds / 60)}m {r.timeUsedSeconds % 60}s
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(r.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Export Card */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Export Pre-JAMB Database</h3>
                      <p className="text-xs text-slate-500">Download complete question banks, candidates, and exam history</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Saves a structured JSON snapshot containing all questions, subject configurations, candidate registries, and student mock results.
                  </p>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Database JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Import Pre-JAMB Backup</h3>
                      <p className="text-xs text-slate-500">Restore or bulk import custom UTME questions and candidate lists</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select a previously exported JSON backup file to restore or synchronize questions across environments.
                  </p>

                  <label className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>Choose JSON Backup File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonFile}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Danger Zone: Reset Database */}
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Reset Database to Defaults</span>
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Re-seeds all official UTME question sets across English, Math, Physics, Chemistry, Biology, Economics, and Government.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  Reset Pre-JAMB DB
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= ADD / EDIT QUESTION MODAL ================= */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingQuestion.id ? 'Edit UTME Question' : 'Add New UTME Question'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsQuestionModalOpen(false);
                  setEditingQuestion(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionForm} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Subject</label>
                  <select
                    value={editingQuestion.subjectId || 'use-of-english'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subjectId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {JAMB_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Topic</label>
                  <input
                    type="text"
                    value={editingQuestion.topic || ''}
                    placeholder="e.g. Quadratic Equations"
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question || ''}
                  placeholder="Enter the full question text..."
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">Options</label>
                {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                  const currVal = editingQuestion.options?.[idx] || '';
                  return (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-slate-500 text-center">{letter}.</span>
                      <input
                        type="text"
                        placeholder={`Option ${letter}`}
                        value={currVal}
                        onChange={(e) => {
                          const currentOpts = editingQuestion.options || ['', '', '', ''];
                          const opts: [string, string, string, string] = [
                            idx === 0 ? e.target.value : currentOpts[0] || '',
                            idx === 1 ? e.target.value : currentOpts[1] || '',
                            idx === 2 ? e.target.value : currentOpts[2] || '',
                            idx === 3 ? e.target.value : currentOpts[3] || '',
                          ];
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Correct Answer</label>
                  <select
                    value={editingQuestion.correctAnswer || 'A'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Exam Year</label>
                  <input
                    type="number"
                    value={editingQuestion.examYear || 2024}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, examYear: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  placeholder="Explain why the answer is correct for candidate review..."
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
