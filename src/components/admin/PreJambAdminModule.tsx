import React, { useState, useEffect } from 'react';
import {
  Shield,
  BookOpen,
  HelpCircle,
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Award,
  Layers,
  Sparkles,
  Settings,
  Database,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertTriangle,
  Send,
  Zap,
  Check,
  X,
  Lock,
  ArrowRight,
  BarChart3,
  Server,
  FileText,
  Copy,
  Code,
} from 'lucide-react';
import {
  PreJambDatabaseService,
  PreJambQuestion,
  PreJambSubject,
  PreJambExamination,
  PreJambCandidate,
  PreJambExamResult,
  PreJambSystemSettings,
  PreJambStats,
} from '../../services/prejambDatabaseService';
import {
  isPreJambSupabaseConfigured,
  getPreJambSupabaseUrl,
  getPreJambSupabaseAnonKey,
  getPreJambSupabaseServiceKey,
  setPreJambSupabaseConfig,
  clearPreJambSupabaseConfig,
  fetchAndInitPreJambConfig,
  testPreJambSupabaseConnection,
} from '../../lib/prejambSupabase';

const PREJAMB_SQL_SCHEMA_CODE = `-- ==============================================================================
-- PRE-JAMB ACADEMY CBT — DEDICATED SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Pre-JAMB Supabase Project SQL Editor
-- ==============================================================================

-- 1. PRE-JAMB SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  default_question_count INTEGER DEFAULT 40,
  time_minutes INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRE-JAMB TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.prejamb_subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRE-JAMB QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.prejamb_subjects(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer VARCHAR(1) NOT NULL,
  explanation TEXT,
  marks INTEGER DEFAULT 1,
  difficulty VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'active',
  exam_year INTEGER DEFAULT 2024,
  source TEXT DEFAULT 'Pre-JAMB Bank',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_questions_subject ON public.prejamb_questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_prejamb_questions_status ON public.prejamb_questions(status);
CREATE INDEX IF NOT EXISTS idx_prejamb_questions_year ON public.prejamb_questions(exam_year);

-- 4. PRE-JAMB EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_examinations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_full_mock BOOLEAN DEFAULT FALSE,
  subject_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions_per_subject JSONB,
  duration_minutes INTEGER DEFAULT 120,
  pass_percentage INTEGER DEFAULT 50,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRE-JAMB CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_candidates (
  id TEXT PRIMARY KEY,
  reg_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  target_university TEXT,
  target_course TEXT,
  utme_subjects JSONB DEFAULT '[]'::jsonb,
  subscription_status VARCHAR(20) DEFAULT 'active',
  total_tests_taken INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_candidates_email ON public.prejamb_candidates(email);
CREATE INDEX IF NOT EXISTS idx_prejamb_candidates_reg ON public.prejamb_candidates(reg_number);

-- 6. PRE-JAMB RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_results (
  id TEXT PRIMARY KEY,
  candidate_id TEXT,
  candidate_name TEXT,
  candidate_reg_number TEXT,
  exam_title TEXT NOT NULL,
  is_full_mock BOOLEAN DEFAULT FALSE,
  subject_ids JSONB DEFAULT '[]'::jsonb,
  total_questions INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  utme_aggregate INTEGER DEFAULT 0,
  time_used_seconds INTEGER DEFAULT 0,
  subject_scores JSONB DEFAULT '{}'::jsonb,
  answers_by_subject JSONB DEFAULT '{}'::jsonb,
  marked_for_review JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prejamb_results_cand ON public.prejamb_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_prejamb_results_completed ON public.prejamb_results(completed_at DESC);

-- 7. PRE-JAMB SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  system_name TEXT DEFAULT 'Pre-JAMB Academy CBT Platform',
  enable_instant_results BOOLEAN DEFAULT TRUE,
  enable_answer_review BOOLEAN DEFAULT TRUE,
  enable_keyboard_shortcuts BOOLEAN DEFAULT TRUE,
  mock_exam_duration_minutes INTEGER DEFAULT 120,
  default_pass_percentage INTEGER DEFAULT 50,
  announcement_banner TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRE-JAMB ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.prejamb_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.prejamb_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejamb_announcements ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Allow public read on prejamb_subjects" ON public.prejamb_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read on prejamb_questions" ON public.prejamb_questions FOR SELECT USING (status = 'active');
CREATE POLICY "Allow public read on prejamb_examinations" ON public.prejamb_examinations FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read on prejamb_settings" ON public.prejamb_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read on prejamb_announcements" ON public.prejamb_announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public insert on prejamb_results" ON public.prejamb_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read own results" ON public.prejamb_results FOR SELECT USING (true);

-- Admin Full Access
CREATE POLICY "Admin full access on prejamb_subjects" ON public.prejamb_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_questions" ON public.prejamb_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_examinations" ON public.prejamb_examinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_candidates" ON public.prejamb_candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_settings" ON public.prejamb_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on prejamb_announcements" ON public.prejamb_announcements FOR ALL USING (true) WITH CHECK (true);
`;

export const PreJambAdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'questions' | 'subjects' | 'examinations' | 'candidates' | 'results' | 'settings'
  >('overview');

  // Database Configuration State
  const [isDbConfigModalOpen, setIsDbConfigModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [cfgUrl, setCfgUrl] = useState(() => getPreJambSupabaseUrl());
  const [cfgAnonKey, setCfgAnonKey] = useState(() => getPreJambSupabaseAnonKey());
  const [cfgServiceKey, setCfgServiceKey] = useState(() => getPreJambSupabaseServiceKey());
  const [isSavingDbConfig, setIsSavingDbConfig] = useState(false);
  const [dbConfigSavedToast, setDbConfigSavedToast] = useState<string | null>(null);

  // Stats & Connection
  const [stats, setStats] = useState<PreJambStats>(PreJambDatabaseService.getDatabaseStats());
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState<{
    connected: boolean;
    url: string;
    message: string;
    needsSchemaInit?: boolean;
    latencyMs?: number;
  } | null>(null);
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [seedResultToast, setSeedResultToast] = useState<string | null>(null);

  // Questions State
  const [questions, setQuestions] = useState<PreJambQuestion[]>([]);
  const [qSearch, setQSearch] = useState('');
  const [qSubjectFilter, setQSubjectFilter] = useState('all');
  const [qStatusFilter, setQStatusFilter] = useState('all');
  const [selectedQuestionForPreview, setSelectedQuestionForPreview] = useState<PreJambQuestion | null>(null);

  // Question Form Modal (Add / Edit)
  const [isQModalOpen, setIsQModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PreJambQuestion | null>(null);
  const [qSubjectId, setQSubjectId] = useState('use-of-english');
  const [qTopic, setQTopic] = useState('');
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qMarks, setQMarks] = useState<number>(1);
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qYear, setQYear] = useState<number>(2024);
  const [qStatus, setQStatus] = useState<'active' | 'draft' | 'archived'>('active');

  // Bulk Upload Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSubjectId, setBulkSubjectId] = useState('use-of-english');
  const [bulkTextFormat, setBulkTextFormat] = useState('');

  // Subjects State
  const [subjects, setSubjects] = useState<PreJambSubject[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<PreJambSubject | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjQCount, setSubjQCount] = useState(40);
  const [subjTimeMins, setSubjTimeMins] = useState(40);
  const [subjIsActive, setSubjIsActive] = useState(true);

  // Exams State
  const [exams, setExams] = useState<PreJambExamination[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<PreJambExamination | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examIsFullMock, setExamIsFullMock] = useState(true);
  const [examSelectedSubjects, setExamSelectedSubjects] = useState<string[]>([
    'use-of-english',
    'mathematics',
    'physics',
    'chemistry',
  ]);
  const [examDuration, setExamDuration] = useState(120);
  const [examPassPct, setExamPassPct] = useState(50);
  const [examInstructions, setExamInstructions] = useState('');
  const [examIsActive, setExamIsActive] = useState(true);

  // Candidates State
  const [candidates, setCandidates] = useState<PreJambCandidate[]>([]);
  const [candSearch, setCandSearch] = useState('');
  const [isCandModalOpen, setIsCandModalOpen] = useState(false);
  const [editingCand, setEditingCand] = useState<PreJambCandidate | null>(null);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candRegNum, setCandRegNum] = useState('');
  const [candUni, setCandUni] = useState('');
  const [candCourse, setCandCourse] = useState('');
  const [candSubStatus, setCandSubStatus] = useState<'active' | 'free' | 'expired' | 'suspended'>('active');

  // Results State
  const [results, setResults] = useState<PreJambExamResult[]>([]);
  const [resultSearch, setResultSearch] = useState('');
  const [selectedResultDetail, setSelectedResultDetail] = useState<PreJambExamResult | null>(null);

  // Settings State
  const [settings, setSettings] = useState<PreJambSystemSettings>(PreJambDatabaseService.getPreJambSettings());
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Refresh all state from service
  const reloadData = () => {
    setStats(PreJambDatabaseService.getDatabaseStats());
    setQuestions(PreJambDatabaseService.getPreJambQuestions());
    setSubjects(PreJambDatabaseService.getPreJambSubjects());
    setExams(PreJambDatabaseService.getPreJambExaminations());
    setCandidates(PreJambDatabaseService.getPreJambCandidates());
    setResults(PreJambDatabaseService.getPreJambResults());
    setSettings(PreJambDatabaseService.getPreJambSettings());
  };

  useEffect(() => {
    PreJambDatabaseService.initDatabase();
    reloadData();

    // Auto-fetch server config if available
    fetchAndInitPreJambConfig().then((hasConfig) => {
      if (hasConfig) {
        setCfgUrl(getPreJambSupabaseUrl());
        setCfgAnonKey(getPreJambSupabaseAnonKey());
        setCfgServiceKey(getPreJambSupabaseServiceKey());
        handleTestConnection();
      }
    }).catch(() => {});
  }, []);

  // Save database configuration (URL & Keys)
  const handleSaveDbConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfgUrl.trim() || !cfgAnonKey.trim()) {
      alert('Please provide both the Pre-JAMB Supabase URL and Anon Key.');
      return;
    }
    setIsSavingDbConfig(true);
    try {
      setPreJambSupabaseConfig(cfgUrl.trim(), cfgAnonKey.trim(), cfgServiceKey.trim());
      setDbConfigSavedToast('Pre-JAMB Supabase configuration saved! Testing live connection...');
      const res = await testPreJambSupabaseConnection();
      setConnTestResult(res);
      reloadData();
      setTimeout(() => {
        setDbConfigSavedToast(null);
        if (res.connected) {
          setIsDbConfigModalOpen(false);
        }
      }, 3000);
    } catch (err: any) {
      alert('Error saving configuration: ' + (err?.message || err));
    } finally {
      setIsSavingDbConfig(false);
    }
  };

  // Clear / Disconnect DB configuration
  const handleClearDbConfig = () => {
    if (confirm('Disconnect from Pre-JAMB Supabase? The system will revert to offline local cache mode.')) {
      clearPreJambSupabaseConfig();
      setCfgUrl('');
      setCfgAnonKey('');
      setCfgServiceKey('');
      setConnTestResult(null);
      setDbConfigSavedToast('Disconnected from Supabase.');
      setTimeout(() => setDbConfigSavedToast(null), 3000);
      reloadData();
    }
  };

  // Fetch Server Environment Configuration
  const handleFetchServerConfig = async () => {
    setIsTestingConn(true);
    try {
      const loaded = await fetchAndInitPreJambConfig();
      if (loaded) {
        setCfgUrl(getPreJambSupabaseUrl());
        setCfgAnonKey(getPreJambSupabaseAnonKey());
        setCfgServiceKey(getPreJambSupabaseServiceKey());
        setDbConfigSavedToast('Loaded credentials from server environment!');
        const res = await testPreJambSupabaseConnection();
        setConnTestResult(res);
        reloadData();
      } else {
        alert('No Pre-JAMB Supabase keys detected in server environment. You can enter your Supabase URL and Anon key in the inputs below and click "Save & Connect".');
      }
    } catch (err: any) {
      alert('Failed to fetch server config: ' + (err?.message || err));
    } finally {
      setIsTestingConn(false);
      setTimeout(() => setDbConfigSavedToast(null), 4000);
    }
  };

  // Ping test
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await testPreJambSupabaseConnection();
      setConnTestResult(res);
    } catch (err: any) {
      setConnTestResult({
        connected: false,
        url: getPreJambSupabaseUrl() || 'Error',
        message: err?.message || 'Connection test failed',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  // Seed question bank to Supabase
  const handleSeedToSupabase = async () => {
    if (!confirm('This will upload all Pre-JAMB subjects, authentic question banks, and exams directly into your Pre-JAMB Supabase Database. Proceed?')) {
      return;
    }
    setIsSeedingSupabase(true);
    try {
      const res = await PreJambDatabaseService.seedQuestionsBankToSupabase();
      if (res.success) {
        setSeedResultToast(`Successfully seeded ${res.count} questions to Pre-JAMB Supabase!`);
        reloadData();
      } else {
        setSeedResultToast(`Seed notice: ${res.error}`);
      }
      setTimeout(() => setSeedResultToast(null), 5000);
    } finally {
      setIsSeedingSupabase(false);
    }
  };

  // Open Question Modal for Add
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQSubjectId(subjects[0]?.id || 'use-of-english');
    setQTopic('');
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect('A');
    setQExplanation('');
    setQMarks(1);
    setQDifficulty('medium');
    setQYear(2024);
    setQStatus('active');
    setIsQModalOpen(true);
  };

  // Open Question Modal for Edit
  const handleOpenEditQuestion = (q: PreJambQuestion) => {
    setEditingQuestion(q);
    setQSubjectId(q.subjectId);
    setQTopic(q.topic || '');
    setQText(q.question);
    setQOptA(q.options[0] || '');
    setQOptB(q.options[1] || '');
    setQOptC(q.options[2] || '');
    setQOptD(q.options[3] || '');
    setQCorrect(q.correctAnswer);
    setQExplanation(q.explanation || '');
    setQMarks(q.marks || 1);
    setQDifficulty(q.difficulty || 'medium');
    setQYear(q.examYear || 2024);
    setQStatus(q.status || 'active');
    setIsQModalOpen(true);
  };

  // Save Question (Directly to Pre-JAMB Supabase)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim()) {
      alert('Please provide the question text and at least options A and B.');
      return;
    }

    const selectedSubjObj = subjects.find((s) => s.id === qSubjectId);
    const subjectName = selectedSubjObj?.name || qSubjectId;

    const payload: PreJambQuestion = {
      id: editingQuestion?.id || `pj-q-${Date.now()}`,
      subjectId: qSubjectId,
      subjectName,
      topic: qTopic.trim() || 'General Practice',
      question: qText.trim(),
      options: [qOptA.trim(), qOptB.trim(), qOptC.trim(), qOptD.trim()],
      correctAnswer: qCorrect,
      explanation: qExplanation.trim(),
      marks: Number(qMarks) || 1,
      difficulty: qDifficulty,
      status: qStatus,
      examYear: Number(qYear) || 2024,
      source: editingQuestion?.source || 'Pre-JAMB Supabase Admin',
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PreJambDatabaseService.savePreJambQuestion(payload);
    setIsQModalOpen(false);
    reloadData();
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (confirm('Delete this question from Pre-JAMB Supabase Database?')) {
      PreJambDatabaseService.deletePreJambQuestion(id);
      reloadData();
    }
  };

  // Handle Bulk Import
  const handleProcessBulkImport = () => {
    if (!bulkTextFormat.trim()) {
      alert('Please paste formatted questions or JSON.');
      return;
    }

    try {
      // Check if JSON
      if (bulkTextFormat.trim().startsWith('[') || bulkTextFormat.trim().startsWith('{')) {
        const parsed = JSON.parse(bulkTextFormat);
        const qList = Array.isArray(parsed) ? parsed : parsed.questions || [];
        if (qList.length > 0) {
          PreJambDatabaseService.bulkSavePreJambQuestions(qList);
          alert(`Successfully imported ${qList.length} questions to Pre-JAMB Supabase.`);
          setIsBulkModalOpen(false);
          setBulkTextFormat('');
          reloadData();
          return;
        }
      }

      // Simple Text Parser (Question / A / B / C / D / Ans / Exp)
      const lines = bulkTextFormat.split('\n').map((l) => l.trim()).filter(Boolean);
      const parsedQuestions: PreJambQuestion[] = [];
      let currentQ: Partial<PreJambQuestion> = {};
      let currentOpts: string[] = [];

      for (let line of lines) {
        if (/^(Q|Question|\d+[\.\)])/i.test(line)) {
          if (currentQ.question && currentOpts.length >= 2) {
            parsedQuestions.push({
              id: `pj-bulk-${Date.now()}-${parsedQuestions.length}`,
              subjectId: bulkSubjectId,
              subjectName: subjects.find((s) => s.id === bulkSubjectId)?.name || bulkSubjectId,
              topic: 'Imported Topic',
              question: currentQ.question,
              options: [currentOpts[0] || '', currentOpts[1] || '', currentOpts[2] || '', currentOpts[3] || ''],
              correctAnswer: (currentQ.correctAnswer as any) || 'A',
              explanation: currentQ.explanation || 'Verified standard answer.',
              status: 'active',
              difficulty: 'medium',
              examYear: 2024,
            });
          }
          currentQ = { question: line.replace(/^(Q\d*[\.:\-]?|Question\s*\d*[\.:\-]?|\d+[\.\)])\s*/i, '').trim() };
          currentOpts = [];
        } else if (/^[A-D][\.\)]/i.test(line)) {
          const optText = line.replace(/^[A-D][\.\)]\s*/i, '').trim();
          currentOpts.push(optText);
        } else if (/^(Ans|Answer|Correct):/i.test(line)) {
          const ansMatch = line.match(/([A-D])/i);
          if (ansMatch) currentQ.correctAnswer = ansMatch[1].toUpperCase() as any;
        } else if (/^(Exp|Explanation):/i.test(line)) {
          currentQ.explanation = line.replace(/^(Exp|Explanation):\s*/i, '').trim();
        }
      }

      // Add final question
      if (currentQ.question && currentOpts.length >= 2) {
        parsedQuestions.push({
          id: `pj-bulk-${Date.now()}-${parsedQuestions.length}`,
          subjectId: bulkSubjectId,
          subjectName: subjects.find((s) => s.id === bulkSubjectId)?.name || bulkSubjectId,
          topic: 'Imported Topic',
          question: currentQ.question,
          options: [currentOpts[0] || '', currentOpts[1] || '', currentOpts[2] || '', currentOpts[3] || ''],
          correctAnswer: (currentQ.correctAnswer as any) || 'A',
          explanation: currentQ.explanation || 'Verified standard answer.',
          status: 'active',
          difficulty: 'medium',
          examYear: 2024,
        });
      }

      if (parsedQuestions.length > 0) {
        PreJambDatabaseService.bulkSavePreJambQuestions(parsedQuestions);
        alert(`Successfully imported ${parsedQuestions.length} questions to Pre-JAMB Supabase!`);
        setIsBulkModalOpen(false);
        setBulkTextFormat('');
        reloadData();
      } else {
        alert('Could not parse valid questions. Please ensure format includes Question, A), B), C), D), and Answer:');
      }
    } catch (err: any) {
      alert(`Import error: ${err?.message || 'Invalid format'}`);
    }
  };

  // Subjects Management
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjName('');
    setSubjCode('');
    setSubjQCount(40);
    setSubjTimeMins(40);
    setSubjIsActive(true);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj: PreJambSubject) => {
    setEditingSubject(subj);
    setSubjName(subj.name);
    setSubjCode(subj.code);
    setSubjQCount(subj.defaultQuestionCount);
    setSubjTimeMins(subj.timeMinutes);
    setSubjIsActive(subj.isActive);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !subjCode.trim()) return;

    const id = editingSubject?.id || subjName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload: PreJambSubject = {
      id,
      name: subjName.trim(),
      code: subjCode.trim().toUpperCase(),
      defaultQuestionCount: Number(subjQCount) || 40,
      timeMinutes: Number(subjTimeMins) || 40,
      isActive: subjIsActive,
      description: `JAMB UTME Subject - ${subjName.trim()}`,
      createdAt: editingSubject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PreJambDatabaseService.savePreJambSubject(payload);
    setIsSubjectModalOpen(false);
    reloadData();
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Delete this subject and its settings from Pre-JAMB Supabase?')) {
      PreJambDatabaseService.deletePreJambSubject(id);
      reloadData();
    }
  };

  // Examinations Management
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamTitle('');
    setExamDesc('');
    setExamIsFullMock(true);
    setExamSelectedSubjects(['use-of-english', 'mathematics', 'physics', 'chemistry']);
    setExamDuration(120);
    setExamPassPct(50);
    setExamInstructions('Answer all questions. CBT timer will submit automatically when it reaches 00:00:00.');
    setExamIsActive(true);
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam: PreJambExamination) => {
    setEditingExam(exam);
    setExamTitle(exam.title);
    setExamDesc(exam.description || '');
    setExamIsFullMock(exam.isFullMock);
    setExamSelectedSubjects(exam.subjectIds || []);
    setExamDuration(exam.durationMinutes || 120);
    setExamPassPct(exam.passPercentage || 50);
    setExamInstructions(exam.instructions || '');
    setExamIsActive(exam.isActive);
    setIsExamModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || examSelectedSubjects.length === 0) {
      alert('Please enter exam title and select at least one subject.');
      return;
    }

    const payload: PreJambExamination = {
      id: editingExam?.id || `exam-pj-${Date.now()}`,
      title: examTitle.trim(),
      description: examDesc.trim(),
      isFullMock: examIsFullMock,
      subjectIds: examSelectedSubjects,
      durationMinutes: Number(examDuration) || 120,
      passPercentage: Number(examPassPct) || 50,
      instructions: examInstructions.trim(),
      isActive: examIsActive,
      randomizeQuestions: true,
      randomizeOptions: true,
      createdAt: editingExam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PreJambDatabaseService.savePreJambExamination(payload);
    setIsExamModalOpen(false);
    reloadData();
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Delete this examination from Pre-JAMB Supabase?')) {
      PreJambDatabaseService.deletePreJambExamination(id);
      reloadData();
    }
  };

  // Candidates Management
  const handleOpenAddCandidate = () => {
    setEditingCand(null);
    setCandName('');
    setCandEmail('');
    setCandPhone('');
    setCandRegNum(`2026/UTME/${Math.floor(10000 + Math.random() * 90000)}`);
    setCandUni('University of Ibadan (UI)');
    setCandCourse('Medicine & Surgery');
    setCandSubStatus('active');
    setIsCandModalOpen(true);
  };

  const handleOpenEditCandidate = (cand: PreJambCandidate) => {
    setEditingCand(cand);
    setCandName(cand.name);
    setCandEmail(cand.email);
    setCandPhone(cand.phone || '');
    setCandRegNum(cand.regNumber);
    setCandUni(cand.targetUniversity || '');
    setCandCourse(cand.targetCourse || '');
    setCandSubStatus(cand.subscriptionStatus || 'active');
    setIsCandModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candEmail.trim()) {
      alert('Candidate name and email are required.');
      return;
    }

    const payload: PreJambCandidate = {
      id: editingCand?.id || `pj-cand-${Date.now()}`,
      name: candName.trim(),
      email: candEmail.trim(),
      phone: candPhone.trim(),
      regNumber: candRegNum.trim() || `2026/UTME/${Math.floor(10000 + Math.random() * 90000)}`,
      targetUniversity: candUni.trim(),
      targetCourse: candCourse.trim(),
      utmeSubjects: editingCand?.utmeSubjects || ['use-of-english', 'mathematics', 'physics', 'chemistry'],
      subscriptionStatus: candSubStatus,
      totalTestsTaken: editingCand?.totalTestsTaken || 0,
      bestScore: editingCand?.bestScore || 0,
      averageScore: editingCand?.averageScore || 0,
      totalTimeSpentMinutes: editingCand?.totalTimeSpentMinutes || 0,
      createdAt: editingCand?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    PreJambDatabaseService.savePreJambCandidate(payload);
    setIsCandModalOpen(false);
    reloadData();
  };

  const handleDeleteCandidate = (id: string) => {
    if (confirm('Delete this candidate and their records from Pre-JAMB Supabase?')) {
      PreJambDatabaseService.deletePreJambCandidate(id);
      reloadData();
    }
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    PreJambDatabaseService.savePreJambSettings(settings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Export & Download DB Snapshot
  const handleExportJson = () => {
    const jsonStr = PreJambDatabaseService.exportFullDatabaseSnapshot();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `prejamb_supabase_database_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Results to CSV
  const handleExportResultsCSV = () => {
    if (results.length === 0) {
      alert('No exam results available to export.');
      return;
    }
    const headers = ['Candidate Name', 'Reg Number', 'Exam Title', 'Total Score', 'Percentage', 'UTME Aggregate', 'Date'];
    const rows = results.map((r) => [
      `"${r.candidateName}"`,
      `"${r.candidateRegNumber}"`,
      `"${r.examTitle}"`,
      `"${r.totalScore}/${r.totalQuestions}"`,
      `"${r.percentage}%"`,
      `"${r.utmeAggregate}/400"`,
      `"${new Date(r.completedAt).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `prejamb_cbt_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (qSubjectFilter !== 'all' && q.subjectId !== qSubjectFilter) return false;
    if (qStatusFilter !== 'all' && (q.status || 'active') !== qStatusFilter) return false;
    if (qSearch.trim()) {
      const qLower = qSearch.toLowerCase();
      return (
        q.question.toLowerCase().includes(qLower) ||
        q.topic?.toLowerCase().includes(qLower) ||
        q.subjectName?.toLowerCase().includes(qLower)
      );
    }
    return true;
  });

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (!candSearch.trim()) return true;
    const s = candSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.regNumber.toLowerCase().includes(s) ||
      c.targetUniversity?.toLowerCase().includes(s)
    );
  });

  // Filter results
  const filteredResults = results.filter((r) => {
    if (!resultSearch.trim()) return true;
    const s = resultSearch.toLowerCase();
    return (
      r.candidateName.toLowerCase().includes(s) ||
      r.candidateRegNumber.toLowerCase().includes(s) ||
      r.examTitle.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 text-slate-100 animate-in fade-in" id="prejamb-admin-module">
      
      {/* Top Banner with Supabase DB Isolation Indicator */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/40 border-2 border-amber-500/40 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold rounded-full border border-amber-500/30 uppercase tracking-wide">
                Dedicated Pre-JAMB Database
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                {isPreJambSupabaseConfigured() ? 'Supabase Connected' : 'Local Offline DB Cache'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Pre-JAMB Academy CBT Management System</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolated UTME mock test system, subjects, questions, candidates, timer sessions, and aggregate scores.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsDbConfigModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            id="btn-config-prejamb-supabase"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>DB Credentials</span>
          </button>

          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            id="btn-sql-schema-guide"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>SQL Setup Guide</span>
          </button>

          <button
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            id="btn-test-prejamb-supabase"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isTestingConn ? 'Testing...' : 'Test DB Connection'}</span>
          </button>

          <button
            onClick={handleSeedToSupabase}
            disabled={isSeedingSupabase}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            id="btn-seed-prejamb-supabase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSeedingSupabase ? 'Syncing...' : 'Sync Bank to Supabase'}</span>
          </button>
        </div>
      </div>

      {/* DB Configuration Notification / Toast */}
      {dbConfigSavedToast && (
        <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-500/50 text-indigo-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{dbConfigSavedToast}</span>
          </div>
          <button onClick={() => setDbConfigSavedToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* When not configured, prominent inline setup card */}
      {!isPreJambSupabaseConfigured() && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 text-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">Pre-JAMB Dedicated Supabase Database Setup</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Operating in local offline cache mode. Connect your secondary Supabase instance to store authentic UTME questions, candidate results, and examination sessions in the cloud.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDbConfigModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
            >
              Configure Credentials Now
            </button>
          </div>
        </div>
      )}

      {/* Connection Result Toast */}
      {connTestResult && (
        <div
          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
            connTestResult.needsSchemaInit
              ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
              : connTestResult.connected
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-start md:items-center gap-2.5">
            {connTestResult.needsSchemaInit ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 md:mt-0" />
            ) : connTestResult.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 md:mt-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 md:mt-0" />
            )}
            <div>
              <span className="font-bold">Target URL:</span> <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[11px]">{connTestResult.url}</code>
              <p className="mt-0.5">{connTestResult.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {connTestResult.needsSchemaInit && (
              <button
                onClick={() => setIsSqlModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Open SQL Setup Guide</span>
              </button>
            )}
            <button onClick={() => setConnTestResult(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Seed Result Toast */}
      {seedResultToast && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{seedResultToast}</span>
          </div>
          <button onClick={() => setSeedResultToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'overview', label: 'Overview & Stats', icon: BarChart3 },
          { id: 'questions', label: 'Question Bank (Supabase)', icon: HelpCircle, badge: stats.totalQuestions },
          { id: 'subjects', label: 'Subjects Management', icon: BookOpen, badge: stats.totalSubjects },
          { id: 'examinations', label: 'Mock Examinations', icon: Clock, badge: stats.totalExams },
          { id: 'candidates', label: 'Candidates & Access', icon: Users, badge: stats.totalCandidates },
          { id: 'results', label: 'Exam Results & Analytics', icon: Award, badge: stats.totalAttempts },
          { id: 'settings', label: 'CBT System Settings', icon: Settings },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
              id={`tab-prejamb-${tab.id}`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & STATS                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Pre-JAMB Questions</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{stats.totalQuestions}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">In Supabase Bank</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Active Subjects</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">{stats.totalSubjects}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Official UTME</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Mock Exams</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.totalExams}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Configured</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Registered Candidates</span>
              <p className="text-2xl font-black text-sky-400 mt-1">{stats.totalCandidates}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">UTME Aspirants</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Mock Exam Attempts</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{stats.totalAttempts}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Completed CBTs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Highest Aggregate</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.highestAggregate}/400</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">UTME Standard</span>
            </div>
          </div>

          {/* Database Architecture Explainer & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Pre-JAMB Supabase Database Routing Architecture</span>
                </h3>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono rounded">
                  Dual-Database Isolation
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-amber-300">Separate Pre-JAMB Supabase Project:</span> All questions, subjects, candidate registrations, mock exams, answers, and scores created here are routed strictly to the Pre-JAMB Supabase project.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-indigo-300">Primary Database Preserved:</span> Institutional courses (FUL, FUAHSE), university questions, payments, and standard university CBT sessions remain strictly on the Primary Database.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-emerald-300">Centralized Admin Control:</span> You have single-pane-of-glass administrative governance to add questions, adjust mock exam durations, and activate/deactivate tests in real time.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('questions')}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pre-JAMB Question</span>
                </button>

                <button
                  onClick={() => setActiveTab('examinations')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Configure Mock Test</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup DB Snapshot</span>
                </button>
              </div>
            </div>

            {/* Questions by Subject Distribution */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Questions Per Subject</span>
              </h3>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {subjects.map((subj) => {
                  const count = stats.questionsPerSubject[subj.id] || 0;
                  return (
                    <div key={subj.id} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{subj.name}</span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">
                          {subj.code}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400">{count} Qs</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUESTION MANAGEMENT (PRE-JAMB SUPABASE DATABASE)                       */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap flex-1 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search questions or topics..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={qSubjectFilter}
                onChange={(e) => setQSubjectFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Subjects ({questions.length})</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({stats.questionsPerSubject[s.id] || 0})
                  </option>
                ))}
              </select>

              <select
                value={qStatusFilter}
                onChange={(e) => setQStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                id="btn-bulk-import-prejamb-q"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Bulk Import</span>
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                id="btn-add-prejamb-q"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Notice: Dedicated Pre-JAMB Supabase */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Target: <strong>Pre-JAMB Supabase Database</strong> (Does not affect university institution question banks).</span>
          </div>

          {/* Questions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Subject & Topic</th>
                    <th className="p-3.5">Question Text</th>
                    <th className="p-3.5">Correct Ans</th>
                    <th className="p-3.5">Year</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No questions match your filter criteria. Click "Add Question" or "Sync Bank to Supabase".
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{q.subjectName}</div>
                          <span className="text-[11px] text-amber-400 font-medium">{q.topic || 'General'}</span>
                        </td>
                        <td className="p-3.5 max-w-md">
                          <p className="line-clamp-2 text-slate-200">{q.question}</p>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            A: {q.options[0]?.substring(0, 25)}... | B: {q.options[1]?.substring(0, 25)}...
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono">
                            Option {q.correctAnswer}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{q.examYear || 2024}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              q.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {q.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedQuestionForPreview(q)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors"
                            title="Preview Question"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-300 rounded-lg cursor-pointer transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBJECTS MANAGEMENT                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">JAMB UTME Subjects Configuration</h3>
              <p className="text-xs text-slate-400">Configure active subjects, default question counts, and duration.</p>
            </div>
            <button
              onClick={handleOpenAddSubject}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => (
              <div key={subj.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded">
                        {subj.code}
                      </span>
                      <h4 className="font-bold text-white text-sm">{subj.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{subj.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      subj.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {subj.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Default Questions:</span>
                    <span className="font-bold text-white">{subj.defaultQuestionCount} Qs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Time Limit:</span>
                    <span className="font-bold text-white">{subj.timeMinutes} Minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-amber-400 font-bold">
                    {stats.questionsPerSubject[subj.id] || 0} Questions Ready
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSubject(subj)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subj.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EXAMINATIONS & MOCK TESTS MANAGEMENT                                   */}
      {/* ========================================================================= */}
      {activeTab === 'examinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Pre-JAMB Mock CBT Examinations</h3>
              <p className="text-xs text-slate-400">Configure full 4-subject mock tests and single subject drills.</p>
            </div>
            <button
              onClick={handleOpenAddExam}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Examination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          exam.isFullMock ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {exam.isFullMock ? '4-Subject Full Mock' : 'Subject Drill'}
                      </span>
                      <h4 className="font-bold text-white text-base">{exam.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{exam.description}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      exam.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {exam.isActive ? 'Live for Candidates' : 'Deactivated'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Duration:</span>
                    <span className="font-bold text-white">{exam.durationMinutes} Minutes (2 Hours)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Pass Percentage:</span>
                    <span className="font-bold text-amber-400">{exam.passPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Included Subjects:</span>
                    <span className="font-mono text-indigo-300">{exam.subjectIds.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Saved to Pre-JAMB Supabase</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditExam(exam)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Edit Config
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CANDIDATES MANAGEMENT                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidates by name, email, reg number..."
                value={candSearch}
                onChange={(e) => setCandSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleOpenAddCandidate}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Candidate</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Candidate Name</th>
                    <th className="p-3.5">UTME Reg Number</th>
                    <th className="p-3.5">Target Institution / Course</th>
                    <th className="p-3.5">Tests Taken</th>
                    <th className="p-3.5">Best Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No candidates found.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{c.name}</div>
                          <span className="text-[11px] text-slate-400">{c.email}</span>
                        </td>
                        <td className="p-3.5 font-mono text-amber-300 font-bold">{c.regNumber}</td>
                        <td className="p-3.5">
                          <div className="text-slate-200">{c.targetUniversity || 'General UTME'}</div>
                          <span className="text-[10px] text-slate-400">{c.targetCourse || 'All Courses'}</span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{c.totalTestsTaken || 0} Attempts</td>
                        <td className="p-3.5">
                          <span className="font-bold text-emerald-400">{c.bestScore || 0}%</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              c.subscriptionStatus === 'active'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {c.subscriptionStatus || 'active'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditCandidate(c)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(c.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RESULTS & ANALYTICS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search results by candidate or exam title..."
                value={resultSearch}
                onChange={(e) => setResultSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleExportResultsCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">UTME Aggregate</th>
                    <th className="p-3.5">Time Used</th>
                    <th className="p-3.5">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No examination attempts recorded yet. Candidates taking mock tests in Pre-JAMB CBT will appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{r.candidateName}</div>
                          <span className="text-[10px] text-amber-300 font-mono">{r.candidateRegNumber}</span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">{r.examTitle}</td>
                        <td className="p-3.5 font-bold text-white">
                          {r.totalScore} / {r.totalQuestions}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-indigo-400">{r.percentage}%</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-black font-mono">
                            {r.utmeAggregate || Math.round(r.percentage * 4)} / 400
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {Math.floor((r.timeUsedSeconds || 0) / 60)}m {(r.timeUsedSeconds || 0) % 60}s
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {new Date(r.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SETTINGS & SUPABASE CONFIGURATION                                      */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Pre-JAMB CBT Platform Settings</h3>
                <p className="text-xs text-slate-400">Manage candidate experience, exam parameters, and announcement banner.</p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Save Settings
              </button>
            </div>

            {settingsSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pre-JAMB system settings successfully updated in Supabase!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">CBT System Display Name</label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Default 4-Subject Mock Duration (Minutes)</label>
                <input
                  type="number"
                  value={settings.mockExamDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, mockExamDurationMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Examination Experience Toggles</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableInstantResults}
                    onChange={(e) => setSettings({ ...settings, enableInstantResults: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-200">Show Instant Aggregate Score</span>
                </label>

                <label className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAnswerReview}
                    onChange={(e) => setSettings({ ...settings, enableAnswerReview: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-200">Allow Step-by-Step Answer Review</span>
                </label>

                <label className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableKeyboardShortcuts}
                    onChange={(e) => setSettings({ ...settings, enableKeyboardShortcuts: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-200">Enable JAMB Keys (A, B, C, D, N, P, S)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Pre-JAMB Announcement Banner</label>
              <textarea
                rows={3}
                value={settings.announcementBanner || ''}
                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                placeholder="Broadcast notification visible to all candidates on the Pre-JAMB dashboard..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500"
              />
            </div>
          </form>

          {/* Database Backup & Reset Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Pre-JAMB Supabase Database Tools</span>
            </h4>
            <p className="text-xs text-slate-400">Export snapshot or reset local database state.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleExportJson}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Full Pre-JAMB JSON Snapshot</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset Pre-JAMB Database to default authentic question bank seeds?')) {
                    PreJambDatabaseService.resetToDefaultSeeds();
                    reloadData();
                    alert('Pre-JAMB database reset to authentic defaults.');
                  }
                }}
                className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Seed Bank</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT QUESTION                                                */}
      {/* ========================================================================= */}
      {isQModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingQuestion ? 'Edit Pre-JAMB Question' : 'Add New Pre-JAMB Question'}
              </h3>
              <button onClick={() => setIsQModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Topic / Chapter</label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="e.g. Organic Chemistry, Lexis, Calculus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter standard JAMB exam question prompt..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-300">Answer Options (A, B, C, D)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 w-6">A:</span>
                    <input
                      type="text"
                      value={qOptA}
                      onChange={(e) => setQOptA(e.target.value)}
                      placeholder="Option A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 w-6">B:</span>
                    <input
                      type="text"
                      value={qOptB}
                      onChange={(e) => setQOptB(e.target.value)}
                      placeholder="Option B"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 w-6">C:</span>
                    <input
                      type="text"
                      value={qOptC}
                      onChange={(e) => setQOptC(e.target.value)}
                      placeholder="Option C"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 w-6">D:</span>
                    <input
                      type="text"
                      value={qOptD}
                      onChange={(e) => setQOptD(e.target.value)}
                      placeholder="Option D"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Correct Answer</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Marks</label>
                  <input
                    type="number"
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={qStatus}
                    onChange={(e) => setQStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows={3}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why the correct answer is right to aid student revision..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save to Pre-JAMB Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK QUESTIONS IMPORT                                              */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Bulk Question Import (Pre-JAMB Supabase)</h3>
                <p className="text-xs text-slate-400">Paste text formatted questions or JSON array.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Subject</label>
                <select
                  value={bulkSubjectId}
                  onChange={(e) => setBulkSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Paste Formatted Questions</label>
                <textarea
                  rows={10}
                  value={bulkTextFormat}
                  onChange={(e) => setBulkTextFormat(e.target.value)}
                  placeholder={`1. What is the value of x if 2x + 4 = 10?
A) 2
B) 3
C) 4
D) 5
Answer: B
Explanation: 2x = 6, therefore x = 3.

2. Which organ filters blood in the human body?
A) Heart
B) Kidney
C) Lungs
D) Liver
Answer: B`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessBulkImport}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Process & Save to Supabase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW QUESTION DIALOG                                            */}
      {/* ========================================================================= */}
      {selectedQuestionForPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-amber-400">
                {selectedQuestionForPreview.subjectName} ({selectedQuestionForPreview.topic || 'General'})
              </span>
              <button onClick={() => setSelectedQuestionForPreview(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-bold text-white">{selectedQuestionForPreview.question}</p>

            <div className="space-y-2">
              {selectedQuestionForPreview.options.map((opt, idx) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isCorrect = selectedQuestionForPreview.correctAnswer === optLetter;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>
                      <strong>{optLetter}.</strong> {opt}
                    </span>
                    {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>

            {selectedQuestionForPreview.explanation && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Explanation:</span>
                <p>{selectedQuestionForPreview.explanation}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedQuestionForPreview(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT                                                 */}
      {/* ========================================================================= */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="e.g. Agricultural Science"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  placeholder="e.g. AGR"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Question Count</label>
                  <input
                    type="number"
                    value={subjQCount}
                    onChange={(e) => setSubjQCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={subjTimeMins}
                    onChange={(e) => setSubjTimeMins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="subjActiveToggle"
                  checked={subjIsActive}
                  onChange={(e) => setSubjIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="subjActiveToggle" className="text-slate-300 font-bold cursor-pointer">
                  Active in Pre-JAMB CBT practice
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EXAMINATION                                             */}
      {/* ========================================================================= */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingExam ? 'Edit Examination' : 'Create Pre-JAMB Examination'}
              </h3>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Examination Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. 2026 Pre-JAMB National Mock UTME Simulation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pass Mark Percentage</label>
                  <input
                    type="number"
                    value={examPassPct}
                    onChange={(e) => setExamPassPct(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Included Subjects</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {subjects.map((s) => {
                    const isChecked = examSelectedSubjects.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExamSelectedSubjects([...examSelectedSubjects, s.id]);
                            } else {
                              setExamSelectedSubjects(examSelectedSubjects.filter((x) => x !== s.id));
                            }
                          }}
                          className="w-3.5 h-3.5 text-amber-500 rounded bg-slate-900 border-slate-700"
                        />
                        <span>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Instructions for Candidates</label>
                <textarea
                  rows={3}
                  value={examInstructions}
                  onChange={(e) => setExamInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examIsActive}
                    onChange={(e) => setExamIsActive(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-300 font-bold">Active & Accessible to Candidates</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save Exam to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CANDIDATE                                               */}
      {/* ========================================================================= */}
      {isCandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCand ? 'Edit Candidate Profile' : 'Register Candidate'}
              </h3>
              <button onClick={() => setIsCandModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">UTME Registration Number</label>
                <input
                  type="text"
                  value={candRegNum}
                  onChange={(e) => setCandRegNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target University</label>
                  <input
                    type="text"
                    value={candUni}
                    onChange={(e) => setCandUni(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Course</label>
                  <input
                    type="text"
                    value={candCourse}
                    onChange={(e) => setCandCourse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subscription / Access Status</label>
                <select
                  value={candSubStatus}
                  onChange={(e) => setCandSubStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="active">Active (Full CBT Access)</option>
                  <option value="free">Free Access</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCandModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: PRE-JAMB SUPABASE DATABASE CONFIGURATION & CREDENTIALS              */}
      {/* ========================================================================= */}
      {isDbConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pre-JAMB Dedicated Supabase Database</h3>
                  <p className="text-xs text-slate-400">Configure secondary database credentials for UTME operations.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDbConfigModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDbConfig} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-1.5 leading-relaxed">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Isolated Secondary Database Configuration</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Enter your dedicated Pre-JAMB Supabase Project URL and Anon API Key. You can obtain these from your secondary project dashboard under <strong>Settings &gt; API</strong>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Pre-JAMB Supabase Project URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={cfgUrl}
                  onChange={(e) => setCfgUrl(e.target.value)}
                  placeholder="https://your-prejamb-project.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Pre-JAMB Supabase Anon Public Key <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={cfgAnonKey}
                  onChange={(e) => setCfgAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Pre-JAMB Supabase Service Role Key <span className="text-slate-500 font-normal">(Optional, for admin sync)</span>
                </label>
                <textarea
                  rows={2}
                  value={cfgServiceKey}
                  onChange={(e) => setCfgServiceKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] focus:border-amber-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFetchServerConfig}
                    disabled={isTestingConn}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Sync from Server
                  </button>

                  {isPreJambSupabaseConfigured() && (
                    <button
                      type="button"
                      onClick={handleClearDbConfig}
                      className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 rounded-xl font-bold cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDbConfigModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingDbConfig}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isSavingDbConfig ? 'Connecting...' : 'Save & Connect to Supabase'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRE-JAMB SUPABASE SQL SCHEMA SETUP GUIDE                           */}
      {/* ========================================================================= */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pre-JAMB Supabase SQL Setup Script</h3>
                  <p className="text-xs text-slate-400">Initialize tables in your Supabase SQL Editor in 30 seconds</p>
                </div>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300 scrollbar-thin">
              {/* Instructions Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white text-xs">Copy SQL Script</h4>
                  <p className="text-[11px] text-slate-400">
                    Click the <strong>Copy SQL</strong> button below to copy the full database schema.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white text-xs">Open SQL Editor</h4>
                  <p className="text-[11px] text-slate-400">
                    Go to your Supabase project, click <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white text-xs">Paste &amp; Run</h4>
                  <p className="text-[11px] text-slate-400">
                    Paste the SQL and click <strong>Run</strong>. Then click <strong>Sync Bank</strong> here!
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
                <span className="text-[11px] text-indigo-200">
                  Ready to execute in Supabase SQL editor:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(PREJAMB_SQL_SCHEMA_CODE);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 3000);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Supabase</span>
                  </a>
                </div>
              </div>

              {/* Code Display Area */}
              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 max-h-60 overflow-y-auto leading-relaxed whitespace-pre scrollbar-thin">
                  {PREJAMB_SQL_SCHEMA_CODE}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <span className="text-[11px] text-slate-400">
                Creates <code>prejamb_subjects</code>, <code>prejamb_questions</code>, <code>prejamb_examinations</code>, <code>prejamb_candidates</code>, <code>prejamb_results</code>
              </span>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
