import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, getDoc, query, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { sanitizeCircular, safeStringifyGlobal } from '../lib/safeJson';
import { PRE_JAMB_QUESTION_BANK, PreJambQuestionItem, JAMB_SUBJECTS, JambSubjectMeta } from '../data/jambQuestionsBank';

// Safe serialization helpers
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

export interface PreJambCandidate {
  id: string;
  regNumber: string;
  name: string;
  email: string;
  phone?: string;
  targetUniversity?: string;
  targetCourse?: string;
  utmeSubjects?: string[];
  subscriptionStatus?: 'active' | 'free' | 'expired';
  totalTestsTaken?: number;
  bestScore?: number;
  averageScore?: number;
  totalTimeSpentMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PreJambQuestionRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  examYear?: number;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreJambExamResultRecord {
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

export interface PreJambDatabaseStats {
  totalQuestions: number;
  totalCandidates: number;
  totalResults: number;
  totalMockExamsTaken: number;
  totalSubjects: number;
  averageScoreAggregate: number;
  highestAggregate: number;
  questionsPerSubject: Record<string, number>;
  latestSyncTimestamp: string;
}

// Local Storage Keys dedicated to the Pre-JAMB sidecar database
const STORAGE_KEYS = {
  QUESTIONS: 'prejamb_db_questions_v1',
  CANDIDATES: 'prejamb_db_candidates_v1',
  RESULTS: 'prejamb_db_results_v1',
  SUBJECTS: 'prejamb_db_subjects_v1',
  CONFIG: 'prejamb_db_config_v1',
};

export class PreJambStorageService {
  private static questionsCache: PreJambQuestionRecord[] | null = null;
  private static candidatesCache: PreJambCandidate[] | null = null;
  private static resultsCache: PreJambExamResultRecord[] | null = null;
  private static isInitialized = false;

  /**
   * Initializes the Pre-JAMB database from local storage or pre-populates default seed data
   */
  public static initDatabase(): void {
    if (this.isInitialized) return;

    try {
      // 1. Initialize Questions
      const savedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (savedQuestions) {
        this.questionsCache = JSON.parse(savedQuestions);
      } else {
        // Seed default authentic question bank
        const defaultQuestions: PreJambQuestionRecord[] = PRE_JAMB_QUESTION_BANK.map((q: PreJambQuestionItem) => ({
          id: q.id,
          subjectId: q.subjectId,
          subjectName: q.subjectName,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic || 'General Practice',
          difficulty: 'medium',
          examYear: q.year || 2024,
          source: 'Pre-JAMB Standard Question Bank',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        this.questionsCache = defaultQuestions;
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(defaultQuestions));
      }

      // 2. Initialize Candidates
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
          totalTestsTaken: 12,
          bestScore: 82,
          averageScore: 68,
          totalTimeSpentMinutes: 930,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.candidatesCache = [defaultCandidate];
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
      }

      // 3. Initialize Results
      const savedResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (savedResults) {
        this.resultsCache = JSON.parse(savedResults);
      } else {
        this.resultsCache = [];
        localStorage.setItem(STORAGE_KEYS.RESULTS, '[]');
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('PreJambStorageService init error:', err);
    }
  }

  // ==========================================
  // QUESTIONS MANAGEMENT
  // ==========================================

  public static getQuestions(filter?: string | { subjectId?: string; search?: string }): PreJambQuestionRecord[] {
    this.initDatabase();
    if (!this.questionsCache) return [];

    let list = [...this.questionsCache];

    if (typeof filter === 'string') {
      if (filter && filter !== 'all') {
        list = list.filter((q) => q.subjectId === filter);
      }
    } else if (filter && typeof filter === 'object') {
      if (filter.subjectId && filter.subjectId !== 'all') {
        list = list.filter((q) => q.subjectId === filter.subjectId);
      }
      if (filter.search && filter.search.trim()) {
        const queryClean = filter.search.trim().toLowerCase();
        list = list.filter(
          (q) =>
            q.question.toLowerCase().includes(queryClean) ||
            q.topic?.toLowerCase().includes(queryClean) ||
            q.subjectName?.toLowerCase().includes(queryClean)
        );
      }
    }

    return list;
  }

  public static getQuestionById(id: string): PreJambQuestionRecord | null {
    this.initDatabase();
    return this.questionsCache?.find((q) => q.id === id) || null;
  }

  public static saveQuestion(question: PreJambQuestionRecord): PreJambQuestionRecord {
    this.initDatabase();
    if (!this.questionsCache) this.questionsCache = [];

    const existingIndex = this.questionsCache.findIndex((q) => q.id === question.id);
    const updatedRecord: PreJambQuestionRecord = {
      ...question,
      updatedAt: new Date().toISOString(),
      createdAt: question.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.questionsCache[existingIndex] = updatedRecord;
    } else {
      this.questionsCache.unshift(updatedRecord);
    }

    // Persist to local storage
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));

    // Async sync to Firestore if configured
    this.syncDocToFirestore('prejamb_questions', updatedRecord.id, updatedRecord);

    return updatedRecord;
  }

  public static bulkSaveQuestions(questions: PreJambQuestionRecord[]): void {
    this.initDatabase();
    if (!this.questionsCache) this.questionsCache = [];

    const questionMap = new Map<string, PreJambQuestionRecord>();
    this.questionsCache.forEach((q) => questionMap.set(q.id, q));

    questions.forEach((q) => {
      questionMap.set(q.id, {
        ...q,
        updatedAt: new Date().toISOString(),
        createdAt: q.createdAt || new Date().toISOString(),
      });
    });

    this.questionsCache = Array.from(questionMap.values());
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));
  }

  public static deleteQuestion(id: string): boolean {
    this.initDatabase();
    if (!this.questionsCache) return false;

    const initialLength = this.questionsCache.length;
    this.questionsCache = this.questionsCache.filter((q) => q.id !== id);
    if (this.questionsCache.length !== initialLength) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, safeStringify(this.questionsCache));
      this.deleteDocFromFirestore('prejamb_questions', id);
      return true;
    }
    return false;
  }

  /**
   * Generates a randomized exam question set for a given subject from the database
   */
  public static generateExamQuestionsForSubject(subjectId: string, count: number): PreJambQuestionItem[] {
    this.initDatabase();
    const available = this.getQuestions(subjectId);
    if (available.length === 0) {
      // Fallback to static bank
      const staticQuestions = PRE_JAMB_QUESTION_BANK.filter((q) => q.subjectId === subjectId);
      return staticQuestions.slice(0, count);
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, available.length));

    // Pad if available count is less than requested count
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

  // ==========================================
  // CANDIDATES MANAGEMENT
  // ==========================================

  public static getCandidates(): PreJambCandidate[] {
    this.initDatabase();
    return this.candidatesCache ? [...this.candidatesCache] : [];
  }

  public static getCandidateById(id: string): PreJambCandidate | null {
    this.initDatabase();
    return this.candidatesCache?.find((c) => c.id === id) || null;
  }

  public static findCandidateByRegOrEmail(queryStr: string): PreJambCandidate | null {
    this.initDatabase();
    if (!this.candidatesCache || !queryStr) return null;
    const clean = queryStr.trim().toLowerCase();
    return this.candidatesCache.find(
      (c) =>
        c.regNumber.toLowerCase() === clean ||
        c.email.toLowerCase() === clean ||
        c.name.toLowerCase() === clean
    ) || null;
  }

  public static saveCandidate(candidate: PreJambCandidate): PreJambCandidate {
    this.initDatabase();
    if (!this.candidatesCache) this.candidatesCache = [];

    const existingIndex = this.candidatesCache.findIndex((c) => c.id === candidate.id);
    const updatedRecord: PreJambCandidate = {
      ...candidate,
      updatedAt: new Date().toISOString(),
      createdAt: candidate.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.candidatesCache[existingIndex] = updatedRecord;
    } else {
      this.candidatesCache.unshift(updatedRecord);
    }

    localStorage.setItem(STORAGE_KEYS.CANDIDATES, safeStringify(this.candidatesCache));
    this.syncDocToFirestore('prejamb_candidates', updatedRecord.id, updatedRecord);

    return updatedRecord;
  }

  // ==========================================
  // EXAM RESULTS MANAGEMENT
  // ==========================================

  public static getResults(candidateId?: string): PreJambExamResultRecord[] {
    this.initDatabase();
    if (!this.resultsCache) return [];
    if (candidateId) {
      return this.resultsCache.filter((r) => r.candidateId === candidateId);
    }
    return [...this.resultsCache];
  }

  public static saveResult(result: PreJambExamResultRecord): PreJambExamResultRecord {
    this.initDatabase();
    if (!this.resultsCache) this.resultsCache = [];

    const updatedRecord: PreJambExamResultRecord = {
      ...result,
      completedAt: result.completedAt || new Date().toISOString(),
    };

    this.resultsCache.unshift(updatedRecord);
    localStorage.setItem(STORAGE_KEYS.RESULTS, safeStringify(this.resultsCache));

    // Update candidate statistics automatically
    if (result.candidateId) {
      const candidate = this.getCandidateById(result.candidateId);
      if (candidate) {
        const candidateResults = this.getResults(result.candidateId);
        const totalTests = candidateResults.length;
        const totalPct = candidateResults.reduce((sum, r) => sum + r.percentage, 0);
        const avgScore = totalTests > 0 ? Math.round(totalPct / totalTests) : result.percentage;
        const bestScore = Math.max(candidate.bestScore || 0, result.percentage);
        const addedMinutes = Math.round((result.timeUsedSeconds || 0) / 60);

        this.saveCandidate({
          ...candidate,
          totalTestsTaken: totalTests,
          averageScore: avgScore,
          bestScore,
          totalTimeSpentMinutes: (candidate.totalTimeSpentMinutes || 0) + addedMinutes,
        });
      }
    }

    this.syncDocToFirestore('prejamb_results', updatedRecord.id, updatedRecord);
    return updatedRecord;
  }

  // ==========================================
  // STATS & DIAGNOSTICS
  // ==========================================

  public static getDatabaseStats(): PreJambDatabaseStats {
    this.initDatabase();
    const questions = this.getQuestions();
    const candidates = this.getCandidates();
    const results = this.getResults();

    const questionsPerSubject: Record<string, number> = {};
    JAMB_SUBJECTS.forEach((subj) => {
      questionsPerSubject[subj.id] = 0;
    });

    questions.forEach((q) => {
      questionsPerSubject[q.subjectId] = (questionsPerSubject[q.subjectId] || 0) + 1;
    });

    const aggregates = results.map((r) => r.utmeAggregate || Math.round(r.percentage * 4));
    const avgAggregate = aggregates.length > 0 ? Math.round(aggregates.reduce((a, b) => a + b, 0) / aggregates.length) : 248;
    const highestAggregate = aggregates.length > 0 ? Math.max(...aggregates) : 312;

    return {
      totalQuestions: questions.length,
      totalCandidates: candidates.length,
      totalResults: results.length,
      totalMockExamsTaken: results.length || 12,
      totalSubjects: JAMB_SUBJECTS.length,
      averageScoreAggregate: avgAggregate,
      highestAggregate: highestAggregate,
      questionsPerSubject,
      latestSyncTimestamp: new Date().toISOString(),
    };
  }

  public static getSubjects(): JambSubjectMeta[] {
    return JAMB_SUBJECTS;
  }

  public static getQuestionsCountBySubject(): Record<string, number> {
    const stats = this.getDatabaseStats();
    return stats.questionsPerSubject;
  }

  // ==========================================
  // EXPORT / IMPORT / RESET
  // ==========================================

  public static exportDatabaseJson(): string {
    return this.exportFullDatabaseSnapshot();
  }

  public static exportFullDatabaseSnapshot(): string {
    this.initDatabase();
    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      questions: this.getQuestions(),
      candidates: this.getCandidates(),
      results: this.getResults(),
      subjects: JAMB_SUBJECTS,
    };
    return safeStringify(snapshot, 2);
  }

  public static importDatabaseJson(jsonString: string): { success: boolean; message: string; count?: number } {
    return this.importDatabaseSnapshot(jsonString);
  }

  public static importDatabaseSnapshot(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.questions || !Array.isArray(data.questions)) {
        return { success: false, message: 'Invalid format: missing questions array' };
      }

      if (Array.isArray(data.questions)) {
        this.bulkSaveQuestions(data.questions);
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
        message: `Successfully imported database (${data.questions.length} questions loaded)`,
        count: data.questions.length,
      };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err?.message || 'Malformed JSON'}` };
    }
  }

  public static resetDatabaseToDefaults(): void {
    this.resetToDefaultSeeds();
  }

  public static resetToDefaultSeeds(): void {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
    this.questionsCache = null;
    this.candidatesCache = null;
    this.resultsCache = null;
    this.isInitialized = false;
    this.initDatabase();
  }

  // ==========================================
  // FIRESTORE ASYNC WRITER HELPERS
  // ==========================================

  private static async syncDocToFirestore(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      if (db) {
        const docRef = doc(db, collectionName, docId);
        const cleanPayload = safeClone(data);
        await setDoc(docRef, cleanPayload, { merge: true });
      }
    } catch (err) {
      console.warn(`[PreJambStorageService] Firestore background sync skipped for ${collectionName}/${docId}:`, err);
    }
  }

  private static async deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
    try {
      if (db) {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn(`[PreJambStorageService] Firestore delete skipped for ${collectionName}/${docId}:`, err);
    }
  }
}
