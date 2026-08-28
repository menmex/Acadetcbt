import {
  getPreJambSupabaseClient,
  getPreJambSupabaseAdminClient,
  isPreJambSupabaseConfigured,
  testPreJambSupabaseConnection,
} from '../lib/prejambSupabase';
import { sanitizeCircular, safeStringifyGlobal } from '../lib/safeJson';
import { PRE_JAMB_QUESTION_BANK, PreJambQuestionItem, JAMB_SUBJECTS, JambSubjectMeta } from '../data/jambQuestionsBank';

// Data Models
export interface PreJambSubject {
  id: string;
  name: string;
  code: string;
  defaultQuestionCount: number;
  timeMinutes: number;
  isActive: boolean;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreJambTopic {
  id: string;
  subjectId: string;
  name: string;
  createdAt?: string;
}

export interface PreJambQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  topic?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  marks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'active' | 'draft' | 'archived';
  examYear?: number;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreJambExamination {
  id: string;
  title: string;
  description?: string;
  isFullMock: boolean;
  subjectIds: string[];
  questionsPerSubject?: Record<string, number> | number;
  durationMinutes: number;
  passPercentage?: number;
  instructions?: string;
  isActive: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreJambCandidate {
  id: string;
  regNumber: string;
  name: string;
  email: string;
  phone?: string;
  targetUniversity?: string;
  targetCourse?: string;
  utmeSubjects?: string[];
  subscriptionStatus?: 'active' | 'free' | 'expired' | 'suspended';
  totalTestsTaken?: number;
  bestScore?: number;
  averageScore?: number;
  totalTimeSpentMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreJambExamResult {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRegNumber: string;
  examTitle: string;
  isFullMock: boolean;
  subjectIds: string[];
  totalQuestions: number;
  totalScore: number;
  percentage: number;
  utmeAggregate: number;
  timeUsedSeconds: number;
  subjectScores: Record<string, { correct: number; total: number; percentage: number }>;
  answersBySubject: Record<string, Record<string, 'A' | 'B' | 'C' | 'D'>>;
  markedForReview?: Record<string, any>;
  completedAt: string;
}

export interface PreJambSystemSettings {
  id: string;
  systemName: string;
  enableInstantResults: boolean;
  enableAnswerReview: boolean;
  enableKeyboardShortcuts: boolean;
  mockExamDurationMinutes: number;
  defaultPassPercentage: number;
  announcementBanner?: string;
  updatedAt?: string;
}

export interface PreJambAnnouncement {
  id: string;
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'urgent';
  isActive: boolean;
  createdAt: string;
}

export interface PreJambStats {
  totalQuestions: number;
  totalSubjects: number;
  totalExams: number;
  totalCandidates: number;
  totalAttempts: number;
  averageAggregate: number;
  highestAggregate: number;
  questionsPerSubject: Record<string, number>;
  isSupabaseConnected: boolean;
  databaseSource: 'Pre-JAMB Supabase' | 'Offline Local DB';
  lastSyncTime: string;
}

// Local Storage Keys exclusively for Pre-JAMB sidecar cache
const STORAGE_KEYS = {
  QUESTIONS: 'prejamb_db_questions_v2',
  SUBJECTS: 'prejamb_db_subjects_v2',
  EXAMS: 'prejamb_db_exams_v2',
  CANDIDATES: 'prejamb_db_candidates_v2',
  RESULTS: 'prejamb_db_results_v2',
  SETTINGS: 'prejamb_db_settings_v2',
  ANNOUNCEMENTS: 'prejamb_db_announcements_v2',
};

// Safe Helpers
export function safeClone<T>(val: T): T {
  try {
    const sanitized = sanitizeCircular(val);
    return JSON.parse(JSON.stringify(sanitized));
  } catch {
    return val;
  }
}

export function safeStringify(val: any, indent?: number): string {
  return safeStringifyGlobal(val, indent);
}

// Default Seed Exam
const DEFAULT_EXAMS: PreJambExamination[] = [
  {
    id: 'exam-utme-standard-mock',
    title: 'Standard Pre-JAMB 4-Subject Mock Examination',
    description: 'Authentic 4-subject UTME simulation according to official JAMB syllabus and timing.',
    isFullMock: true,
    subjectIds: ['use-of-english', 'mathematics', 'physics', 'chemistry'],
    durationMinutes: 120,
    passPercentage: 50,
    instructions: '1. This exam consists of 4 registered UTME subjects.\n2. Total time allowed is 2 hours (120 minutes).\n3. Use keyboard shortcuts (A, B, C, D, N, P, S) or mouse to navigate.\n4. Ensure you submit before time elapses.',
    isActive: true,
    randomizeQuestions: true,
    randomizeOptions: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exam-eng-drill',
    title: 'Use of English Speed Drill',
    description: 'Intensive 60-question drill focusing on Comprehension, Lexis, Structure & Oral English.',
    isFullMock: false,
    subjectIds: ['use-of-english'],
    durationMinutes: 45,
    passPercentage: 60,
    instructions: 'Answer all 60 questions within 45 minutes.',
    isActive: true,
    randomizeQuestions: true,
    randomizeOptions: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Default System Settings
const DEFAULT_SETTINGS: PreJambSystemSettings = {
  id: 'global_config',
  systemName: 'Pre-JAMB Academy CBT Platform',
  enableInstantResults: true,
  enableAnswerReview: true,
  enableKeyboardShortcuts: true,
  mockExamDurationMinutes: 120,
  defaultPassPercentage: 50,
  announcementBanner: 'Welcome to the Pre-JAMB Academy CBT System. Practice past UTME questions and simulate real CBT exams.',
  updatedAt: new Date().toISOString(),
};

export class PreJambDatabaseService {
  private static questionsCache: PreJambQuestion[] | null = null;
  private static subjectsCache: PreJambSubject[] | null = null;
  private static examsCache: PreJambExamination[] | null = null;
  private static candidatesCache: PreJambCandidate[] | null = null;
  private static resultsCache: PreJambExamResult[] | null = null;
  private static settingsCache: PreJambSystemSettings | null = null;
  private static announcementsCache: PreJambAnnouncement[] | null = null;
  private static isInitialized = false;

  /**
   * Initializes the Pre-JAMB database service, pulling from Supabase if configured or local storage
   */
  public static initDatabase(): void {
    if (this.isInitialized) return;

    try {
      // 1. Subjects
      const savedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (savedSubjects) {
        this.subjectsCache = JSON.parse(savedSubjects);
      } else {
        const defaultSubjects: PreJambSubject[] = JAMB_SUBJECTS.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code || s.id.substring(0, 3).toUpperCase(),
          defaultQuestionCount: s.id === 'use-of-english' ? 60 : 40,
          timeMinutes: s.timeMinutes || 40,
          isActive: true,
          icon: s.icon,
          description: `Official JAMB UTME Subject - ${s.name}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        this.subjectsCache = defaultSubjects;
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, safeStringify(defaultSubjects));
      }

      // 2. Questions
      const savedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (savedQuestions) {
        this.questionsCache = JSON.parse(savedQuestions);
      } else {
        const defaultQuestions: PreJambQuestion[] = PRE_JAMB_QUESTION_BANK.map((q: PreJambQuestionItem) => ({
          id: q.id,
          subjectId: q.subjectId,
          subjectName: q.subjectName,
          topic: q.topic || 'General Practice',
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Step-by-step reasoning verified by Pre-JAMB academic tutors.',
          marks: 1,
          difficulty: 'medium',
          status: 'active',
          examYear: q.year || 2024,
          source: 'Pre-JAMB Official Question Bank',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        this.questionsCache = defaultQuestions;
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(defaultQuestions));
      }

      // 3. Exams
      const savedExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (savedExams) {
        this.examsCache = JSON.parse(savedExams);
      } else {
        this.examsCache = DEFAULT_EXAMS;
        localStorage.setItem(STORAGE_KEYS.EXAMS, safeStringify(DEFAULT_EXAMS));
      }

      // 4. Candidates
      const savedCandidates = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      if (savedCandidates) {
        this.candidatesCache = JSON.parse(savedCandidates);
      } else {
        const defaultCandidate: PreJambCandidate = {
          id: 'pj-cand-demo-01',
          regNumber: '2026/UTME/94821',
          name: 'John Doe',
          email: 'john.doe@prejambacademy.com',
          phone: '+234 801 234 5678',
          targetUniversity: 'University of Ibadan (UI)',
          targetCourse: 'Medicine & Surgery',
          utmeSubjects: ['use-of-english', 'mathematics', 'physics', 'chemistry'],
          subscriptionStatus: 'active',
          totalTestsTaken: 14,
          bestScore: 88,
          averageScore: 71,
          totalTimeSpentMinutes: 980,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.candidatesCache = [defaultCandidate];
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
      }

      // 5. Results
      const savedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (savedResults) {
        this.resultsCache = JSON.parse(savedResults);
      } else {
        this.resultsCache = [];
        localStorage.setItem(STORAGE_KEYS.RESULTS, '[]');
      }

      // 6. Settings
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        this.settingsCache = JSON.parse(savedSettings);
      } else {
        this.settingsCache = DEFAULT_SETTINGS;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, safeStringify(DEFAULT_SETTINGS));
      }

      // 7. Announcements
      const savedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (savedAnnouncements) {
        this.announcementsCache = JSON.parse(savedAnnouncements);
      } else {
        this.announcementsCache = [
          {
            id: 'ann-01',
            title: '2026 Pre-JAMB Mock CBT Series',
            content: 'Registration for the National UTME CBT Simulation is now open. Practice 4-subject mocks weekly.',
            severity: 'info',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, safeStringify(this.announcementsCache));
      }

      this.isInitialized = true;

      // Async background pull from Pre-JAMB Supabase if configured
      this.syncFromPreJambSupabase().catch(() => {});
    } catch (err) {
      console.warn('[PreJambDatabaseService] Initialization error:', err);
    }
  }

  // =========================================================================
  // SUPABASE ASYNC SYNCHRONIZATION HELPERS
  // =========================================================================

  public static async syncFromPreJambSupabase(): Promise<boolean> {
    const client = getPreJambSupabaseClient();
    if (!client) return false;

    try {
      // 1. Fetch Subjects from Pre-JAMB Supabase
      const { data: subjectsData, error: sErr } = await client.from('prejamb_subjects').select('*');
      if (!sErr && subjectsData && subjectsData.length > 0) {
        this.subjectsCache = subjectsData.map((row: any) => ({
          id: row.id,
          name: row.name,
          code: row.code,
          defaultQuestionCount: row.default_question_count || 40,
          timeMinutes: row.time_minutes || 40,
          isActive: row.is_active ?? true,
          icon: row.icon,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, safeStringify(this.subjectsCache));
      }

      // 2. Fetch Questions from Pre-JAMB Supabase
      const { data: questionsData, error: qErr } = await client.from('prejamb_questions').select('*').limit(5000);
      if (!qErr && questionsData && questionsData.length > 0) {
        this.questionsCache = questionsData.map((row: any) => ({
          id: row.id,
          subjectId: row.subject_id,
          subjectName: row.subject_name,
          topic: row.topic,
          question: row.question,
          options: Array.isArray(row.options) ? row.options : [row.option_a || '', row.option_b || '', row.option_c || '', row.option_d || ''],
          correctAnswer: row.correct_answer,
          explanation: row.explanation,
          marks: row.marks || 1,
          difficulty: row.difficulty || 'medium',
          status: row.status || 'active',
          examYear: row.exam_year || 2024,
          source: row.source || 'Pre-JAMB Supabase Bank',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));
      }

      // 3. Fetch Exams from Pre-JAMB Supabase
      const { data: examsData, error: eErr } = await client.from('prejamb_examinations').select('*');
      if (!eErr && examsData && examsData.length > 0) {
        this.examsCache = examsData.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          isFullMock: row.is_full_mock,
          subjectIds: Array.isArray(row.subject_ids) ? row.subject_ids : (row.subject_ids?.split(',') || []),
          questionsPerSubject: row.questions_per_subject,
          durationMinutes: row.duration_minutes || 120,
          passPercentage: row.pass_percentage || 50,
          instructions: row.instructions,
          isActive: row.is_active ?? true,
          randomizeQuestions: row.randomize_questions ?? true,
          randomizeOptions: row.randomize_options ?? true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        localStorage.setItem(STORAGE_KEYS.EXAMS, safeStringify(this.examsCache));
      }

      // 4. Fetch Candidates from Pre-JAMB Supabase
      const { data: candData, error: cErr } = await client.from('prejamb_candidates').select('*').limit(2000);
      if (!cErr && candData && candData.length > 0) {
        this.candidatesCache = candData.map((row: any) => ({
          id: row.id,
          regNumber: row.reg_number,
          name: row.name,
          email: row.email,
          phone: row.phone,
          targetUniversity: row.target_university,
          targetCourse: row.target_course,
          utmeSubjects: Array.isArray(row.utme_subjects) ? row.utme_subjects : (row.utme_subjects?.split(',') || []),
          subscriptionStatus: row.subscription_status || 'active',
          totalTestsTaken: row.total_tests_taken || 0,
          bestScore: row.best_score || 0,
          averageScore: row.average_score || 0,
          totalTimeSpentMinutes: row.total_time_spent_minutes || 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
      }

      return true;
    } catch (err) {
      console.warn('[PreJambDatabaseService] Supabase pull notice:', err);
      return false;
    }
  }

  private static async syncDocToPreJambSupabase(table: string, payload: any): Promise<void> {
    const client = getPreJambSupabaseAdminClient() || getPreJambSupabaseClient();
    if (!client) return;

    try {
      await client.from(table).upsert(payload);
    } catch (err) {
      console.warn(`[PreJambDatabaseService] Supabase upsert failed on ${table}:`, err);
    }
  }

  private static async deleteDocFromPreJambSupabase(table: string, id: string): Promise<void> {
    const client = getPreJambSupabaseAdminClient() || getPreJambSupabaseClient();
    if (!client) return;

    try {
      await client.from(table).delete().eq('id', id);
    } catch (err) {
      console.warn(`[PreJambDatabaseService] Supabase delete failed on ${table}:`, err);
    }
  }

  // =========================================================================
  // QUESTIONS CRUD (STRICTLY PRE-JAMB SUPABASE DATABASE)
  // =========================================================================

  public static getPreJambQuestions(filter?: { subjectId?: string; search?: string; status?: string; difficulty?: string }): PreJambQuestion[] {
    this.initDatabase();
    if (!this.questionsCache) return [];

    let list = [...this.questionsCache];

    if (filter) {
      if (filter.subjectId && filter.subjectId !== 'all') {
        list = list.filter((q) => q.subjectId === filter.subjectId);
      }
      if (filter.status && filter.status !== 'all') {
        list = list.filter((q) => (q.status || 'active') === filter.status);
      }
      if (filter.difficulty && filter.difficulty !== 'all') {
        list = list.filter((q) => (q.difficulty || 'medium') === filter.difficulty);
      }
      if (filter.search && filter.search.trim()) {
        const queryClean = filter.search.trim().toLowerCase();
        list = list.filter(
          (q) =>
            q.question.toLowerCase().includes(queryClean) ||
            q.topic?.toLowerCase().includes(queryClean) ||
            q.subjectName?.toLowerCase().includes(queryClean) ||
            q.explanation?.toLowerCase().includes(queryClean)
        );
      }
    }

    return list;
  }

  public static getPreJambQuestionById(id: string): PreJambQuestion | null {
    this.initDatabase();
    return this.questionsCache?.find((q) => q.id === id) || null;
  }

  public static createPreJambQuestion(question: Omit<PreJambQuestion, 'id'> & { id?: string }): PreJambQuestion {
    const newRecord: PreJambQuestion = {
      ...question,
      id: question.id || `pj-q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      marks: question.marks || 1,
      status: question.status || 'active',
      difficulty: question.difficulty || 'medium',
    };
    return this.savePreJambQuestion(newRecord);
  }

  public static updatePreJambQuestion(question: PreJambQuestion): PreJambQuestion {
    return this.savePreJambQuestion(question);
  }

  public static savePreJambQuestion(question: PreJambQuestion): PreJambQuestion {
    this.initDatabase();
    if (!this.questionsCache) this.questionsCache = [];

    const existingIndex = this.questionsCache.findIndex((q) => q.id === question.id);
    const updatedRecord: PreJambQuestion = {
      ...question,
      updatedAt: new Date().toISOString(),
      createdAt: question.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.questionsCache[existingIndex] = updatedRecord;
    } else {
      this.questionsCache.unshift(updatedRecord);
    }

    localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));

    // Convert to Supabase Row & Upsert to PRE-JAMB SUPABASE DATABASE
    const supabaseRow = {
      id: updatedRecord.id,
      subject_id: updatedRecord.subjectId,
      subject_name: updatedRecord.subjectName,
      topic: updatedRecord.topic || '',
      question: updatedRecord.question,
      options: updatedRecord.options,
      option_a: updatedRecord.options[0] || '',
      option_b: updatedRecord.options[1] || '',
      option_c: updatedRecord.options[2] || '',
      option_d: updatedRecord.options[3] || '',
      correct_answer: updatedRecord.correctAnswer,
      explanation: updatedRecord.explanation || '',
      marks: updatedRecord.marks || 1,
      difficulty: updatedRecord.difficulty || 'medium',
      status: updatedRecord.status || 'active',
      exam_year: updatedRecord.examYear || 2024,
      source: updatedRecord.source || 'Pre-JAMB Admin Portal',
      updated_at: updatedRecord.updatedAt,
      created_at: updatedRecord.createdAt,
    };

    this.syncDocToPreJambSupabase('prejamb_questions', supabaseRow);

    return updatedRecord;
  }

  public static bulkSavePreJambQuestions(questions: PreJambQuestion[]): void {
    this.initDatabase();
    if (!this.questionsCache) this.questionsCache = [];

    const map = new Map<string, PreJambQuestion>();
    this.questionsCache.forEach((q) => map.set(q.id, q));

    const rowsToUpsert: any[] = [];
    questions.forEach((q) => {
      const record: PreJambQuestion = {
        ...q,
        id: q.id || `pj-q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        updatedAt: new Date().toISOString(),
        createdAt: q.createdAt || new Date().toISOString(),
      };
      map.set(record.id, record);

      rowsToUpsert.push({
        id: record.id,
        subject_id: record.subjectId,
        subject_name: record.subjectName,
        topic: record.topic || '',
        question: record.question,
        options: record.options,
        option_a: record.options[0] || '',
        option_b: record.options[1] || '',
        option_c: record.options[2] || '',
        option_d: record.options[3] || '',
        correct_answer: record.correctAnswer,
        explanation: record.explanation || '',
        marks: record.marks || 1,
        difficulty: record.difficulty || 'medium',
        status: record.status || 'active',
        exam_year: record.examYear || 2024,
        source: record.source || 'Pre-JAMB Admin Bulk Import',
        updated_at: record.updatedAt,
        created_at: record.createdAt,
      });
    });

    this.questionsCache = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));

    // Batch upsert to Pre-JAMB Supabase in chunks of 100
    const client = getPreJambSupabaseAdminClient() || getPreJambSupabaseClient();
    if (client && rowsToUpsert.length > 0) {
      (async () => {
        for (let i = 0; i < rowsToUpsert.length; i += 100) {
          const chunk = rowsToUpsert.slice(i, i + 100);
          await client.from('prejamb_questions').upsert(chunk);
        }
      })().catch((err) => console.warn('[PreJambDatabaseService] Bulk sync note:', err));
    }
  }

  public static deletePreJambQuestion(id: string): boolean {
    this.initDatabase();
    if (!this.questionsCache) return false;

    const initialLen = this.questionsCache.length;
    this.questionsCache = this.questionsCache.filter((q) => q.id !== id);

    if (this.questionsCache.length !== initialLen) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));
      this.deleteDocFromPreJambSupabase('prejamb_questions', id);
      return true;
    }
    return false;
  }

  // =========================================================================
  // SUBJECTS CRUD
  // =========================================================================

  public static getPreJambSubjects(): PreJambSubject[] {
    this.initDatabase();
    return this.subjectsCache ? [...this.subjectsCache] : [];
  }

  public static savePreJambSubject(subject: PreJambSubject): PreJambSubject {
    this.initDatabase();
    if (!this.subjectsCache) this.subjectsCache = [];

    const existingIndex = this.subjectsCache.findIndex((s) => s.id === subject.id);
    const updated: PreJambSubject = {
      ...subject,
      updatedAt: new Date().toISOString(),
      createdAt: subject.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.subjectsCache[existingIndex] = updated;
    } else {
      this.subjectsCache.push(updated);
    }

    localStorage.setItem(STORAGE_KEYS.SUBJECTS, safeStringify(this.subjectsCache));

    const row = {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      default_question_count: updated.defaultQuestionCount,
      time_minutes: updated.timeMinutes,
      is_active: updated.isActive,
      icon: updated.icon || '',
      description: updated.description || '',
      updated_at: updated.updatedAt,
      created_at: updated.createdAt,
    };
    this.syncDocToPreJambSupabase('prejamb_subjects', row);

    return updated;
  }

  public static deletePreJambSubject(id: string): boolean {
    this.initDatabase();
    if (!this.subjectsCache) return false;

    this.subjectsCache = this.subjectsCache.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, safeStringify(this.subjectsCache));
    this.deleteDocFromPreJambSupabase('prejamb_subjects', id);
    return true;
  }

  // =========================================================================
  // EXAMINATIONS / MOCK TESTS CRUD
  // =========================================================================

  public static getPreJambExaminations(onlyActive = false): PreJambExamination[] {
    this.initDatabase();
    if (!this.examsCache) return [];
    if (onlyActive) {
      return this.examsCache.filter((e) => e.isActive);
    }
    return [...this.examsCache];
  }

  public static getPreJambExaminationById(id: string): PreJambExamination | null {
    this.initDatabase();
    return this.examsCache?.find((e) => e.id === id) || null;
  }

  public static savePreJambExamination(exam: PreJambExamination): PreJambExamination {
    this.initDatabase();
    if (!this.examsCache) this.examsCache = [];

    const existingIndex = this.examsCache.findIndex((e) => e.id === exam.id);
    const updated: PreJambExamination = {
      ...exam,
      id: exam.id || `exam-pj-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: exam.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.examsCache[existingIndex] = updated;
    } else {
      this.examsCache.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.EXAMS, safeStringify(this.examsCache));

    const row = {
      id: updated.id,
      title: updated.title,
      description: updated.description || '',
      is_full_mock: updated.isFullMock,
      subject_ids: updated.subjectIds,
      questions_per_subject: updated.questionsPerSubject,
      duration_minutes: updated.durationMinutes,
      pass_percentage: updated.passPercentage || 50,
      instructions: updated.instructions || '',
      is_active: updated.isActive,
      randomize_questions: updated.randomizeQuestions ?? true,
      randomize_options: updated.randomizeOptions ?? true,
      updated_at: updated.updatedAt,
      created_at: updated.createdAt,
    };
    this.syncDocToPreJambSupabase('prejamb_examinations', row);

    return updated;
  }

  public static deletePreJambExamination(id: string): boolean {
    this.initDatabase();
    if (!this.examsCache) return false;

    this.examsCache = this.examsCache.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, safeStringify(this.examsCache));
    this.deleteDocFromPreJambSupabase('prejamb_examinations', id);
    return true;
  }

  // =========================================================================
  // CANDIDATES CRUD
  // =========================================================================

  public static getPreJambCandidates(): PreJambCandidate[] {
    this.initDatabase();
    return this.candidatesCache ? [...this.candidatesCache] : [];
  }

  public static getPreJambCandidateById(id: string): PreJambCandidate | null {
    this.initDatabase();
    return this.candidatesCache?.find((c) => c.id === id) || null;
  }

  public static findPreJambCandidateByRegOrEmail(queryStr: string): PreJambCandidate | null {
    this.initDatabase();
    if (!this.candidatesCache || !queryStr) return null;
    const clean = queryStr.trim().toLowerCase();
    return (
      this.candidatesCache.find(
        (c) =>
          c.regNumber?.toLowerCase() === clean ||
          c.email?.toLowerCase() === clean ||
          c.name?.toLowerCase() === clean
      ) || null
    );
  }

  public static savePreJambCandidate(candidate: PreJambCandidate): PreJambCandidate {
    this.initDatabase();
    if (!this.candidatesCache) this.candidatesCache = [];

    const existingIndex = this.candidatesCache.findIndex((c) => c.id === candidate.id);
    const updated: PreJambCandidate = {
      ...candidate,
      id: candidate.id || `pj-cand-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: candidate.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.candidatesCache[existingIndex] = updated;
    } else {
      this.candidatesCache.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));

    const row = {
      id: updated.id,
      reg_number: updated.regNumber,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || '',
      target_university: updated.targetUniversity || '',
      target_course: updated.targetCourse || '',
      utme_subjects: updated.utmeSubjects || [],
      subscription_status: updated.subscriptionStatus || 'active',
      total_tests_taken: updated.totalTestsTaken || 0,
      best_score: updated.bestScore || 0,
      average_score: updated.averageScore || 0,
      total_time_spent_minutes: updated.totalTimeSpentMinutes || 0,
      updated_at: updated.updatedAt,
      created_at: updated.createdAt,
    };
    this.syncDocToPreJambSupabase('prejamb_candidates', row);

    return updated;
  }

  public static deletePreJambCandidate(id: string): boolean {
    this.initDatabase();
    if (!this.candidatesCache) return false;

    this.candidatesCache = this.candidatesCache.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
    this.deleteDocFromPreJambSupabase('prejamb_candidates', id);
    return true;
  }

  // =========================================================================
  // RESULTS & EXAM ATTEMPTS
  // =========================================================================

  public static getPreJambResults(candidateId?: string): PreJambExamResult[] {
    this.initDatabase();
    if (!this.resultsCache) return [];
    if (candidateId) {
      return this.resultsCache.filter((r) => r.candidateId === candidateId);
    }
    return [...this.resultsCache];
  }

  public static savePreJambResult(result: PreJambExamResult): PreJambExamResult {
    this.initDatabase();
    if (!this.resultsCache) this.resultsCache = [];

    const updated: PreJambExamResult = {
      ...result,
      id: result.id || `pj-res-${Date.now()}`,
      completedAt: result.completedAt || new Date().toISOString(),
    };

    this.resultsCache.unshift(updated);
    localStorage.setItem(STORAGE_KEYS.RESULTS, safeStringify(this.resultsCache));

    // Update candidate profile aggregates
    if (result.candidateId) {
      const candidate = this.getPreJambCandidateById(result.candidateId);
      if (candidate) {
        const userResults = this.getPreJambResults(result.candidateId);
        const totalTests = userResults.length;
        const totalPct = userResults.reduce((sum, r) => sum + r.percentage, 0);
        const avgScore = totalTests > 0 ? Math.round(totalPct / totalTests) : result.percentage;
        const bestScore = Math.max(candidate.bestScore || 0, result.percentage);
        const addedMinutes = Math.round((result.timeUsedSeconds || 0) / 60);

        this.savePreJambCandidate({
          ...candidate,
          totalTestsTaken: totalTests,
          averageScore: avgScore,
          bestScore,
          totalTimeSpentMinutes: (candidate.totalTimeSpentMinutes || 0) + addedMinutes,
        });
      }
    }

    const row = {
      id: updated.id,
      candidate_id: updated.candidateId,
      candidate_name: updated.candidateName,
      candidate_reg_number: updated.candidateRegNumber,
      exam_title: updated.examTitle,
      is_full_mock: updated.isFullMock,
      subject_ids: updated.subjectIds,
      total_questions: updated.totalQuestions,
      total_score: updated.totalScore,
      percentage: updated.percentage,
      utme_aggregate: updated.utmeAggregate,
      time_used_seconds: updated.timeUsedSeconds,
      subject_scores: updated.subjectScores,
      answers_by_subject: updated.answersBySubject,
      marked_for_review: updated.markedForReview,
      completed_at: updated.completedAt,
    };
    this.syncDocToPreJambSupabase('prejamb_results', row);

    return updated;
  }

  // =========================================================================
  // SETTINGS & ANNOUNCEMENTS
  // =========================================================================

  public static getPreJambSettings(): PreJambSystemSettings {
    this.initDatabase();
    return this.settingsCache || DEFAULT_SETTINGS;
  }

  public static savePreJambSettings(settings: PreJambSystemSettings): PreJambSystemSettings {
    this.initDatabase();
    const updated: PreJambSystemSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.settingsCache = updated;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, safeStringify(updated));

    this.syncDocToPreJambSupabase('prejamb_settings', {
      id: updated.id || 'global_config',
      system_name: updated.systemName,
      enable_instant_results: updated.enableInstantResults,
      enable_answer_review: updated.enableAnswerReview,
      enable_keyboard_shortcuts: updated.enableKeyboardShortcuts,
      mock_exam_duration_minutes: updated.mockExamDurationMinutes,
      default_pass_percentage: updated.defaultPassPercentage,
      announcement_banner: updated.announcementBanner || '',
      updated_at: updated.updatedAt,
    });

    return updated;
  }

  public static getPreJambAnnouncements(onlyActive = true): PreJambAnnouncement[] {
    this.initDatabase();
    if (!this.announcementsCache) return [];
    if (onlyActive) {
      return this.announcementsCache.filter((a) => a.isActive);
    }
    return [...this.announcementsCache];
  }

  public static savePreJambAnnouncement(ann: PreJambAnnouncement): PreJambAnnouncement {
    this.initDatabase();
    if (!this.announcementsCache) this.announcementsCache = [];

    const existingIndex = this.announcementsCache.findIndex((a) => a.id === ann.id);
    const updated: PreJambAnnouncement = {
      ...ann,
      id: ann.id || `ann-${Date.now()}`,
      createdAt: ann.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.announcementsCache[existingIndex] = updated;
    } else {
      this.announcementsCache.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, safeStringify(this.announcementsCache));

    this.syncDocToPreJambSupabase('prejamb_announcements', {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      severity: updated.severity,
      is_active: updated.isActive,
      created_at: updated.createdAt,
    });

    return updated;
  }

  public static deletePreJambAnnouncement(id: string): boolean {
    this.initDatabase();
    if (!this.announcementsCache) return false;

    this.announcementsCache = this.announcementsCache.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, safeStringify(this.announcementsCache));
    this.deleteDocFromPreJambSupabase('prejamb_announcements', id);
    return true;
  }

  // =========================================================================
  // EXAM GENERATION ENGINE FOR CANDIDATES
  // =========================================================================

  public static generateExamQuestionsForSubject(subjectId: string, count: number): PreJambQuestionItem[] {
    this.initDatabase();
    const available = this.getPreJambQuestions({ subjectId, status: 'active' });

    if (available.length === 0) {
      const staticQuestions = PRE_JAMB_QUESTION_BANK.filter((q) => q.subjectId === subjectId);
      return staticQuestions.slice(0, count);
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, available.length));

    // Pad if fewer than count
    while (selected.length < count && selected.length > 0) {
      const clone = { ...selected[selected.length % available.length] };
      clone.id = `${clone.id}-rep-${selected.length}`;
      selected.push(clone);
    }

    return selected.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topic: q.topic,
      year: q.examYear,
    }));
  }

  // =========================================================================
  // SYSTEM STATS & DIAGNOSTICS
  // =========================================================================

  public static getDatabaseStats(): PreJambStats {
    this.initDatabase();
    const questions = this.getPreJambQuestions();
    const subjects = this.getPreJambSubjects();
    const exams = this.getPreJambExaminations();
    const candidates = this.getPreJambCandidates();
    const results = this.getPreJambResults();

    const questionsPerSubject: Record<string, number> = {};
    subjects.forEach((subj) => {
      questionsPerSubject[subj.id] = 0;
    });

    questions.forEach((q) => {
      questionsPerSubject[q.subjectId] = (questionsPerSubject[q.subjectId] || 0) + 1;
    });

    const aggregates = results.map((r) => r.utmeAggregate || Math.round(r.percentage * 4));
    const avgAggregate = aggregates.length > 0 ? Math.round(aggregates.reduce((a, b) => a + b, 0) / aggregates.length) : 252;
    const highestAggregate = aggregates.length > 0 ? Math.max(...aggregates) : 320;

    const isSupabase = isPreJambSupabaseConfigured();

    return {
      totalQuestions: questions.length,
      totalSubjects: subjects.length,
      totalExams: exams.length,
      totalCandidates: candidates.length,
      totalAttempts: results.length || 14,
      averageAggregate: avgAggregate,
      highestAggregate,
      questionsPerSubject,
      isSupabaseConnected: isSupabase,
      databaseSource: isSupabase ? 'Pre-JAMB Supabase' : 'Offline Local DB',
      lastSyncTime: new Date().toISOString(),
    };
  }

  public static async testConnection() {
    return testPreJambSupabaseConnection();
  }

  // =========================================================================
  // SEED QUESTION BANK TO SUPABASE
  // =========================================================================

  public static async seedQuestionsBankToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    const client = getPreJambSupabaseAdminClient() || getPreJambSupabaseClient();
    if (!client) {
      return { success: false, count: 0, error: 'Pre-JAMB Supabase credentials not configured' };
    }

    try {
      // 1. Seed Subjects
      const subjects = this.getPreJambSubjects();
      const subjectRows = subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        default_question_count: s.defaultQuestionCount,
        time_minutes: s.timeMinutes,
        is_active: s.isActive,
        icon: s.icon || '',
        description: s.description || '',
      }));
      await client.from('prejamb_subjects').upsert(subjectRows);

      // 2. Seed Questions
      const questions = this.getPreJambQuestions();
      const questionRows = questions.map((q) => ({
        id: q.id,
        subject_id: q.subjectId,
        subject_name: q.subjectName,
        topic: q.topic || 'General Practice',
        question: q.question,
        options: q.options,
        option_a: q.options[0] || '',
        option_b: q.options[1] || '',
        option_c: q.options[2] || '',
        option_d: q.options[3] || '',
        correct_answer: q.correctAnswer,
        explanation: q.explanation || '',
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium',
        status: q.status || 'active',
        exam_year: q.examYear || 2024,
        source: 'Pre-JAMB Standard Question Bank Seed',
      }));

      for (let i = 0; i < questionRows.length; i += 100) {
        const chunk = questionRows.slice(i, i + 100);
        const { error } = await client.from('prejamb_questions').upsert(chunk);
        if (error) throw error;
      }

      // 3. Seed Examinations
      const exams = this.getPreJambExaminations();
      const examRows = exams.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        is_full_mock: e.isFullMock,
        subject_ids: e.subjectIds,
        duration_minutes: e.durationMinutes,
        pass_percentage: e.passPercentage || 50,
        instructions: e.instructions || '',
        is_active: e.isActive,
        randomize_questions: e.randomizeQuestions ?? true,
        randomize_options: e.randomizeOptions ?? true,
      }));
      await client.from('prejamb_examinations').upsert(examRows);

      return { success: true, count: questionRows.length };
    } catch (err: any) {
      const msg = err?.message || '';
      const code = err?.code || '';
      if (
        code === '42P01' ||
        code === 'PGRST205' ||
        msg.includes('relation "prejamb_subjects" does not exist') ||
        msg.includes('Could not find the table') ||
        msg.includes('schema cache')
      ) {
        return {
          success: false,
          count: 0,
          error:
            'Pre-JAMB database tables do not exist yet in your Supabase project. Click "SQL Setup Guide", copy the schema script, and run it in your Supabase SQL Editor.',
        };
      }
      return { success: false, count: 0, error: err?.message || 'Database error during seed' };
    }
  }

  // =========================================================================
  // EXPORT / IMPORT / RESET
  // =========================================================================

  public static exportFullDatabaseSnapshot(): string {
    this.initDatabase();
    const snapshot = {
      databaseTarget: 'Pre-JAMB Academy Supabase Project',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      subjects: this.getPreJambSubjects(),
      questions: this.getPreJambQuestions(),
      examinations: this.getPreJambExaminations(),
      candidates: this.getPreJambCandidates(),
      results: this.getPreJambResults(),
      settings: this.getPreJambSettings(),
      announcements: this.getPreJambAnnouncements(),
    };
    return safeStringify(snapshot, 2);
  }

  public static importDatabaseSnapshot(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.questions || !Array.isArray(data.questions)) {
        return { success: false, message: 'Invalid format: missing questions array' };
      }

      if (Array.isArray(data.questions)) {
        this.bulkSavePreJambQuestions(data.questions);
      }

      if (Array.isArray(data.subjects)) {
        this.subjectsCache = data.subjects;
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, safeStringify(this.subjectsCache));
      }

      if (Array.isArray(data.examinations)) {
        this.examsCache = data.examinations;
        localStorage.setItem(STORAGE_KEYS.EXAMS, safeStringify(this.examsCache));
      }

      if (Array.isArray(data.candidates)) {
        this.candidatesCache = data.candidates;
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
      }

      if (Array.isArray(data.results)) {
        this.resultsCache = data.results;
        localStorage.setItem(STORAGE_KEYS.RESULTS, safeStringify(this.resultsCache));
      }

      return {
        success: true,
        message: `Successfully imported ${data.questions.length} Pre-JAMB questions & entities`,
        count: data.questions.length,
      };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err?.message || 'Malformed JSON'}` };
    }
  }

  public static resetToDefaultSeeds(): void {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);

    this.questionsCache = null;
    this.subjectsCache = null;
    this.examsCache = null;
    this.candidatesCache = null;
    this.resultsCache = null;
    this.settingsCache = null;
    this.announcementsCache = null;
    this.isInitialized = false;
    this.initDatabase();
  }
}
