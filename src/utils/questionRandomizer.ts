import { Question, SEED_QUESTIONS } from '../types';

/**
 * Fisher-Yates (Knuth) Shuffle algorithm for unbiased random shuffling
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selects different random, non-repeated questions for a selected course.
 * Ensures no repeated questions in the same session.
 * Prioritizes questions that the user has not seen yet in this course.
 */
export function selectRandomQuestions(
  allQuestions: Question[],
  courseId: string,
  topicId: string = 'all',
  difficulty: string = 'all',
  count: number | 'unlimited' = 5,
  seenQuestionIds: string[] = [],
  hierarchyFilter?: {
    level?: string;
    semester?: string;
    departmentId?: string;
    facultyId?: string;
    universityId?: string;
  }
): { selected: Question[]; newlySeenIds: string[] } {
  const sourceQuestions = Array.isArray(allQuestions) ? allQuestions : [];

  // 1. Filter by status (allow Published, Active, or undefined)
  let pool = sourceQuestions.filter(
    (q) => !q.status || q.status.toLowerCase() === 'published' || q.status.toLowerCase() === 'active'
  );

  // 2. Filter strictly by course if specified
  if (courseId && courseId !== 'all') {
    const cleanTarget = courseId.trim().toLowerCase().replace(/\s+/g, '');
    pool = pool.filter((q) => {
      if (q.courseId === courseId) return true;
      if (q.courseCode && q.courseCode.trim().toLowerCase().replace(/\s+/g, '') === cleanTarget) return true;
      if (q.courseId && q.courseId.trim().toLowerCase().replace(/\s+/g, '') === cleanTarget) return true;
      return false;
    });
  }

  // 3. Filter strictly by semester if specified in hierarchy
  if (hierarchyFilter?.semester && hierarchyFilter.semester !== 'all') {
    const normSem = hierarchyFilter.semester.toLowerCase().includes('first') ? 'first' : 'second';
    pool = pool.filter((q) => {
      if (!q.semester) return true;
      const qSem = q.semester.toLowerCase().includes('first') ? 'first' : 'second';
      return qSem === normSem;
    });
  }

  // 4. Filter strictly by level if specified in hierarchy
  if (hierarchyFilter?.level && hierarchyFilter.level !== 'all') {
    const targetDigits = hierarchyFilter.level.replace(/\D/g, '');
    if (targetDigits) {
      pool = pool.filter((q) => {
        if (!q.level) return true;
        const qDigits = q.level.replace(/\D/g, '');
        return !qDigits || qDigits === targetDigits;
      });
    }
  }

  // 5. Filter strictly by department if specified
  if (hierarchyFilter?.departmentId && hierarchyFilter.departmentId !== 'all') {
    pool = pool.filter((q) => {
      if (!q.departmentId) return true;
      return q.departmentId === hierarchyFilter.departmentId;
    });
  }

  // 6. Filter strictly by faculty if specified
  if (hierarchyFilter?.facultyId && hierarchyFilter.facultyId !== 'all') {
    pool = pool.filter((q) => {
      if (!q.facultyId) return true;
      return q.facultyId === hierarchyFilter.facultyId;
    });
  }

  // 7. Filter by topic if specified
  if (topicId && topicId !== 'all') {
    pool = pool.filter((q) => q.topicId === topicId);
  }

  // 8. Filter by difficulty if specified
  if (difficulty && difficulty !== 'all') {
    pool = pool.filter((q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
  }

  // If filtered pool is empty, return empty (strict isolation: NEVER leak other courses' questions!)
  if (pool.length === 0) {
    return { selected: [], newlySeenIds: [] };
  }

  // 9. Strict Deduplication by ID and normalized question text
  const uniquePoolMap = new Map<string, Question>();
  pool.forEach((q) => {
    const key = q.id || q.question.trim().toLowerCase();
    if (!uniquePoolMap.has(key)) {
      uniquePoolMap.set(key, q);
    }
  });
  const uniquePool = Array.from(uniquePoolMap.values());

  const targetCount = count === 'unlimited' ? uniquePool.length : count;

  // 10. Separate unseen vs seen questions
  const seenSet = new Set(seenQuestionIds || []);
  const unseenPool = uniquePool.filter((q) => !seenSet.has(q.id));

  let candidatePool: Question[] = [];

  if (unseenPool.length >= targetCount) {
    // Sufficient unseen questions available
    candidatePool = shuffleArray(unseenPool).slice(0, targetCount);
  } else if (unseenPool.length > 0) {
    // Take all unseen questions + fill remaining count from shuffled seen pool
    const shuffledUnseen = shuffleArray(unseenPool);
    const seenPool = uniquePool.filter((q) => seenSet.has(q.id));
    const shuffledSeen = shuffleArray(seenPool);

    candidatePool = [...shuffledUnseen, ...shuffledSeen].slice(0, targetCount);
  } else {
    // All questions have been seen before: shuffle full unique pool completely
    candidatePool = shuffleArray(uniquePool).slice(0, targetCount);
  }

  // 11. Final pass to ensure absolutely ZERO duplicates in the returned session
  const finalSelected: Question[] = [];
  const selectedKeys = new Set<string>();

  for (const q of shuffleArray(candidatePool)) {
    const key = q.id || q.question.trim().toLowerCase();
    if (!selectedKeys.has(key)) {
      selectedKeys.add(key);
      finalSelected.push(q);
    }
    if (finalSelected.length >= targetCount) break;
  }

  const newlySeenIds = finalSelected.map((q) => q.id);

  return { selected: finalSelected, newlySeenIds };
}
