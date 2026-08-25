import { Question, DifficultyLevel, QuestionType, QuestionStatus } from '../types';

export interface ParseValidationResult {
  valid: Question[];
  errors: { row: number; error: string; rawSnippet?: string }[];
  duplicateCount: number;
}

export interface DefaultHierarchyOptions {
  universityId: string;
  facultyId?: string;
  departmentId?: string;
  level?: string;
  semester?: string;
  courseId: string;
  courseCode?: string;
  status?: QuestionStatus;
  difficulty?: DifficultyLevel;
}

/**
 * Standard CSV line parser supporting quoted fields and embedded commas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

/**
 * Normalizes header keys to standard names
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse CSV question file
 */
export function parseCSVQuestions(
  csvContent: string,
  defaults: DefaultHierarchyOptions,
  existingQuestions: Question[] = []
): ParseValidationResult {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { valid: [], errors: [{ row: 1, error: 'CSV file must have a header row and at least one question row' }], duplicateCount: 0 };
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map(normalizeHeader);

  // Map header indexes
  const colIndex = {
    id: headers.findIndex((h) => h === 'id' || h === 'questionid'),
    question: headers.findIndex((h) => h === 'question' || h === 'questiontext' || h === 'prompt' || h === 'text'),
    optionA: headers.findIndex((h) => h === 'optiona' || h === 'opta' || h === 'a'),
    optionB: headers.findIndex((h) => h === 'optionb' || h === 'optb' || h === 'b'),
    optionC: headers.findIndex((h) => h === 'optionc' || h === 'optc' || h === 'c'),
    optionD: headers.findIndex((h) => h === 'optiond' || h === 'optd' || h === 'd'),
    correctAnswer: headers.findIndex((h) => h === 'correctanswer' || h === 'correct' || h === 'answer' || h === 'ans' || h === 'key'),
    difficulty: headers.findIndex((h) => h === 'difficulty' || h === 'level'),
    explanation: headers.findIndex((h) => h === 'explanation' || h === 'solution' || h === 'reason'),
    courseCode: headers.findIndex((h) => h === 'coursecode' || h === 'course' || h === 'code'),
    status: headers.findIndex((h) => h === 'status'),
    type: headers.findIndex((h) => h === 'type' || h === 'questiontype'),
    diagramUrl: headers.findIndex((h) => h === 'diagramurl' || h === 'image' || h === 'diagram' || h === 'imageurl'),
  };

  if (colIndex.question === -1) {
    return {
      valid: [],
      errors: [{ row: 1, error: 'Missing required "Question" or "QuestionText" header column' }],
      duplicateCount: 0,
    };
  }

  const valid: Question[] = [];
  const errors: { row: number; error: string; rawSnippet?: string }[] = [];
  const existingTexts = new Set(existingQuestions.map((q) => q.question.trim().toLowerCase()));
  let duplicateCount = 0;

  const nowIso = new Date().toISOString();

  for (let r = 1; r < lines.length; r++) {
    const rowNumber = r + 1;
    const values = parseCSVLine(lines[r]);

    const qText = (colIndex.question >= 0 ? values[colIndex.question] : '').trim();
    if (!qText) {
      errors.push({ row: rowNumber, error: 'Question text is empty' });
      continue;
    }

    const optA = (colIndex.optionA >= 0 ? values[colIndex.optionA] : '').trim();
    const optB = (colIndex.optionB >= 0 ? values[colIndex.optionB] : '').trim();
    const optC = (colIndex.optionC >= 0 ? values[colIndex.optionC] : '').trim();
    const optD = (colIndex.optionD >= 0 ? values[colIndex.optionD] : '').trim();

    if (!optA || !optB) {
      errors.push({ row: rowNumber, error: 'Options A and B are required for each question', rawSnippet: qText.slice(0, 60) });
      continue;
    }

    let correct = (colIndex.correctAnswer >= 0 ? values[colIndex.correctAnswer] : 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      if (correct === '1' || correct === 'OPTION A') correct = 'A';
      else if (correct === '2' || correct === 'OPTION B') correct = 'B';
      else if (correct === '3' || correct === 'OPTION C') correct = 'C';
      else if (correct === '4' || correct === 'OPTION D') correct = 'D';
      else correct = 'A';
    }

    const diffRaw = (colIndex.difficulty >= 0 ? values[colIndex.difficulty] : '').trim();
    const difficulty: DifficultyLevel = (['Easy', 'Medium', 'Hard', 'Expert'].includes(diffRaw) ? diffRaw : defaults.difficulty || 'Medium') as DifficultyLevel;

    const explanation = (colIndex.explanation >= 0 ? values[colIndex.explanation] : '').trim();
    const courseCode = (colIndex.courseCode >= 0 ? values[colIndex.courseCode] : '').trim() || defaults.courseCode || 'GST101';
    const diagramUrl = (colIndex.diagramUrl >= 0 ? values[colIndex.diagramUrl] : '').trim();

    const qId = (colIndex.id >= 0 && values[colIndex.id] ? values[colIndex.id] : '') || `q-bulk-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`;

    if (existingTexts.has(qText.toLowerCase())) {
      duplicateCount++;
    }

    const questionItem: Question = {
      id: qId,
      question: qText,
      optionA: optA,
      optionB: optB,
      optionC: optC || 'None of the above',
      optionD: optD || 'All of the above',
      correctAnswer: correct,
      difficulty,
      explanation: explanation || undefined,
      diagramUrl: diagramUrl || undefined,
      universityId: defaults.universityId,
      facultyId: defaults.facultyId,
      departmentId: defaults.departmentId,
      level: defaults.level || '100 Level',
      semester: defaults.semester || 'First Semester',
      courseId: defaults.courseId,
      courseCode,
      source: 'Bulk Import',
      status: defaults.status || 'Published',
      createdDate: nowIso,
      updatedDate: nowIso,
      createdBy: 'Bulk Import Engine',
      versionNumber: 1,
      versionHistory: [],
    };

    valid.push(questionItem);
  }

  return { valid, errors, duplicateCount };
}

/**
 * Parse JSON array or wrapper object
 */
export function parseJSONQuestions(
  jsonContent: string,
  defaults: DefaultHierarchyOptions,
  existingQuestions: Question[] = []
): ParseValidationResult {
  let data: any;
  try {
    data = JSON.parse(jsonContent);
  } catch (err: any) {
    return { valid: [], errors: [{ row: 1, error: `Invalid JSON syntax: ${err.message}` }], duplicateCount: 0 };
  }

  const items = Array.isArray(data) ? data : Array.isArray(data.questions) ? data.questions : [];
  if (items.length === 0) {
    return { valid: [], errors: [{ row: 1, error: 'No questions array found in JSON file' }], duplicateCount: 0 };
  }

  const valid: Question[] = [];
  const errors: { row: number; error: string; rawSnippet?: string }[] = [];
  const existingTexts = new Set(existingQuestions.map((q) => q.question.trim().toLowerCase()));
  let duplicateCount = 0;

  const nowIso = new Date().toISOString();

  items.forEach((item: any, idx: number) => {
    const rowNumber = idx + 1;
    const qText = (item.question || item.questionText || item.prompt || '').trim();
    if (!qText) {
      errors.push({ row: rowNumber, error: 'Question text is empty' });
      return;
    }

    const optA = (item.optionA || item.optA || item.a || '').trim();
    const optB = (item.optionB || item.optB || item.b || '').trim();
    const optC = (item.optionC || item.optC || item.c || '').trim();
    const optD = (item.optionD || item.optD || item.d || '').trim();

    if (!optA || !optB) {
      errors.push({ row: rowNumber, error: 'Options A and B are required', rawSnippet: qText.slice(0, 60) });
      return;
    }

    let correct = (item.correctAnswer || item.correct || item.answer || item.ans || 'A').toString().trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      correct = 'A';
    }

    if (existingTexts.has(qText.toLowerCase())) {
      duplicateCount++;
    }

    const qItem: Question = {
      id: item.id || `q-json-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      question: qText,
      optionA: optA,
      optionB: optB,
      optionC: optC || 'None of the above',
      optionD: optD || 'All of the above',
      correctAnswer: correct,
      difficulty: (item.difficulty && ['Easy', 'Medium', 'Hard', 'Expert'].includes(item.difficulty) ? item.difficulty : defaults.difficulty || 'Medium') as DifficultyLevel,
      explanation: item.explanation || undefined,
      diagramUrl: item.diagramUrl || undefined,
      universityId: item.universityId || defaults.universityId,
      facultyId: item.facultyId || defaults.facultyId,
      departmentId: item.departmentId || defaults.departmentId,
      level: item.level || defaults.level || '100 Level',
      semester: item.semester || defaults.semester || 'First Semester',
      courseId: item.courseId || defaults.courseId,
      courseCode: item.courseCode || defaults.courseCode || 'GST101',
      source: item.source || 'Bulk JSON Import',
      status: item.status || defaults.status || 'Published',
      createdDate: item.createdDate || nowIso,
      updatedDate: nowIso,
      createdBy: item.createdBy || 'Bulk Import Engine',
      versionNumber: item.versionNumber || 1,
      versionHistory: item.versionHistory || [],
    };

    valid.push(qItem);
  });

  return { valid, errors, duplicateCount };
}

/**
 * Regex parser for past question text blocks (e.g. copied from Word/PDF/Past Questions)
 * Pattern:
 * 1. Question text here...
 * A. Option text
 * B. Option text
 * C. Option text
 * D. Option text
 * Answer: C (or Ans: C / Correct: C)
 * Explanation: ...
 */
export function parseTextExamQuestions(
  rawText: string,
  defaults: DefaultHierarchyOptions,
  existingQuestions: Question[] = []
): ParseValidationResult {
  const valid: Question[] = [];
  const errors: { row: number; error: string; rawSnippet?: string }[] = [];
  const existingTexts = new Set(existingQuestions.map((q) => q.question.trim().toLowerCase()));
  let duplicateCount = 0;

  // Split by question numbers: e.g. "1.", "Q1:", "[1]", "Question 1."
  const questionBlocks = rawText.split(/\n(?=(?:\d+[\.\)]|Q\d+[\.:]|Question\s+\d+[\.:]|\[\d+\]))\s*/i);

  const nowIso = new Date().toISOString();

  questionBlocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed || trimmed.length < 10) return;

    const rowNumber = idx + 1;

    // Strip leading number prefix
    const cleanBlock = trimmed.replace(/^(?:\d+[\.\)]|Q\d+[\.:]|Question\s+\d+[\.:]|\[\d+\])\s*/i, '');

    // Extract options: A, B, C, D
    const optMatchA = cleanBlock.match(/(?:^|\n)\s*(?:\(?[A]\)|[A][\.\)]|[A]:)\s*(.*?)(?=(?:\n\s*(?:\(?[B]\)|[B][\.\)]|[B]:)|$))/is);
    const optMatchB = cleanBlock.match(/(?:^|\n)\s*(?:\(?[B]\)|[B][\.\)]|[B]:)\s*(.*?)(?=(?:\n\s*(?:\(?[C]\)|[C][\.\)]|[C]:)|$))/is);
    const optMatchC = cleanBlock.match(/(?:^|\n)\s*(?:\(?[C]\)|[C][\.\)]|[C]:)\s*(.*?)(?=(?:\n\s*(?:\(?[D]\)|[D][\.\)]|[D]:)|$))/is);
    const optMatchD = cleanBlock.match(/(?:^|\n)\s*(?:\(?[D]\)|[D][\.\)]|[D]:)\s*(.*?)(?=(?:\n\s*(?:Ans(?:wer)?|Correct|Key|Exp(?:lanation)?|Solution)[\s\.:]|$))/is);

    // Extract answer
    const ansMatch = cleanBlock.match(/(?:Ans(?:wer)?|Correct(?:\s+Answer)?|Key)[\s\.:]*([A-D])/i);
    const expMatch = cleanBlock.match(/(?:Exp(?:lanation)?|Solution|Reason)[\s\.:]+(.*?)(?=\n\s*(?:\d+[\.\)]|Q\d+)|$)/is);

    // Question stem is everything before Option A
    const qStemMatch = cleanBlock.match(/^(.*?)(?=(?:\n\s*(?:\(?[A]\)|[A][\.\)]|[A]:)))/is);
    const qText = (qStemMatch ? qStemMatch[1] : cleanBlock.split('\n')[0]).trim();

    if (!qText) {
      errors.push({ row: rowNumber, error: 'Could not detect question stem', rawSnippet: trimmed.slice(0, 50) });
      return;
    }

    const optA = optMatchA ? optMatchA[1].trim() : '';
    const optB = optMatchB ? optMatchB[1].trim() : '';
    const optC = optMatchC ? optMatchC[1].trim() : '';
    const optD = optMatchD ? optMatchD[1].trim() : '';

    if (!optA || !optB) {
      errors.push({ row: rowNumber, error: 'Missing options A and B in question block', rawSnippet: qText.slice(0, 60) });
      return;
    }

    const correct = ansMatch ? ansMatch[1].toUpperCase() : 'A';
    const explanation = expMatch ? expMatch[1].trim() : undefined;

    if (existingTexts.has(qText.toLowerCase())) {
      duplicateCount++;
    }

    valid.push({
      id: `q-txt-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      question: qText,
      optionA: optA,
      optionB: optB,
      optionC: optC || 'None of the above',
      optionD: optD || 'All of the above',
      correctAnswer: correct,
      difficulty: defaults.difficulty || 'Medium',
      explanation,
      universityId: defaults.universityId,
      facultyId: defaults.facultyId,
      departmentId: defaults.departmentId,
      level: defaults.level || '100 Level',
      semester: defaults.semester || 'First Semester',
      courseId: defaults.courseId,
      courseCode: defaults.courseCode || 'GST101',
      source: 'Past Questions Text Import',
      status: defaults.status || 'Published',
      createdDate: nowIso,
      updatedDate: nowIso,
      createdBy: 'Text Question Importer',
      versionNumber: 1,
      versionHistory: [],
    });
  });

  return { valid, errors, duplicateCount };
}
