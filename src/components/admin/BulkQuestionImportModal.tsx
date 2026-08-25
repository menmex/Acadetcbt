import React, { useState, useRef, useMemo } from 'react';
import {
  Question,
  University,
  Course,
  Faculty,
  Department,
  QuestionStatus,
  DifficultyLevel,
} from '../../types';
import {
  AcademicHierarchySelector,
  AcademicHierarchyValues,
} from '../common/AcademicHierarchySelector';
import {
  parseCSVQuestions,
  parseJSONQuestions,
  parseTextExamQuestions,
  ParseValidationResult,
} from '../../utils/questionParser';
import { StorageService, safeStringify } from '../../services/storage';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';

interface BulkQuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  universities: University[];
  faculties?: Faculty[];
  departments?: Department[];
  courses: Course[];
  existingQuestions: Question[];
  onImportComplete: (newQuestions: Question[]) => void;
}

export const BulkQuestionImportModal: React.FC<BulkQuestionImportModalProps> = ({
  isOpen,
  onClose,
  universities,
  faculties = [],
  departments = [],
  courses,
  existingQuestions,
  onImportComplete,
}) => {
  if (!isOpen) return null;

  // Import mode
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedContent, setPastedContent] = useState<string>('');
  const [fileFormat, setFileFormat] = useState<'csv' | 'json' | 'text'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hierarchy & Default Attributes
  const [hierarchy, setHierarchy] = useState<AcademicHierarchyValues>({
    universityId: universities[0]?.id || '',
    facultyId: '',
    departmentId: '',
    level: '100 Level',
    semester: 'First Semester',
    courseId: courses[0]?.id || '',
  });

  const [defaultStatus, setDefaultStatus] = useState<QuestionStatus>('Published');
  const [defaultDifficulty, setDefaultDifficulty] = useState<DifficultyLevel>('Medium');

  // Parsing & Preview
  const [validationResult, setValidationResult] = useState<ParseValidationResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [searchPreview, setSearchPreview] = useState('');

  // Upload Progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    uploadedCount: number;
    totalCount: number;
    percentage: number;
  }>({
    currentBatch: 0,
    totalBatches: 0,
    uploadedCount: 0,
    totalCount: 0,
    percentage: 0,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedCourseObj = useMemo(() => courses.find((c) => c.id === hierarchy.courseId), [courses, hierarchy.courseId]);

  // Read and parse file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const name = file.name.toLowerCase();
    let format: 'csv' | 'json' | 'text' = 'csv';
    if (name.endsWith('.json')) format = 'json';
    else if (name.endsWith('.txt') || name.endsWith('.docx') || name.endsWith('.md')) format = 'text';
    setFileFormat(format);

    setIsParsing(true);
    try {
      const text = await file.text();
      runParser(text, format);
    } catch (err: any) {
      alert(`Could not read file: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handlePasteChange = (text: string) => {
    setPastedContent(text);
  };

  const handleParsePasted = () => {
    if (!pastedContent.trim()) {
      alert('Please paste question content first.');
      return;
    }
    setIsParsing(true);
    try {
      runParser(pastedContent, fileFormat);
    } finally {
      setIsParsing(false);
    }
  };

  const runParser = (rawText: string, format: 'csv' | 'json' | 'text') => {
    const options = {
      universityId: hierarchy.universityId,
      facultyId: hierarchy.facultyId,
      departmentId: hierarchy.departmentId,
      level: hierarchy.level,
      semester: hierarchy.semester,
      courseId: hierarchy.courseId,
      courseCode: selectedCourseObj?.code || 'GST101',
      status: defaultStatus,
      difficulty: defaultDifficulty,
    };

    let res: ParseValidationResult;
    if (format === 'json') {
      res = parseJSONQuestions(rawText, options, existingQuestions);
    } else if (format === 'text') {
      res = parseTextExamQuestions(rawText, options, existingQuestions);
    } else {
      res = parseCSVQuestions(rawText, options, existingQuestions);
    }

    setValidationResult(res);
    setPreviewPage(1);
    setUploadError(null);
  };

  // Filtered Preview Questions
  const filteredPreview = useMemo(() => {
    if (!validationResult?.valid) return [];
    if (!searchPreview.trim()) return validationResult.valid;
    const q = searchPreview.toLowerCase();
    return validationResult.valid.filter(
      (item) => item.question.toLowerCase().includes(q) || item.optionA.toLowerCase().includes(q)
    );
  }, [validationResult, searchPreview]);

  const previewItemsPerPage = 10;
  const totalPreviewPages = Math.ceil(filteredPreview.length / previewItemsPerPage) || 1;
  const paginatedPreview = useMemo(() => {
    const start = (previewPage - 1) * previewItemsPerPage;
    return filteredPreview.slice(start, start + previewItemsPerPage);
  }, [filteredPreview, previewPage]);

  // Execute Chunked Upload to Database & State
  const handleExecuteUpload = async () => {
    if (!validationResult || validationResult.valid.length === 0) {
      alert('No valid questions to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const questionsToUpload = validationResult.valid;
    const batchSize = 150;
    const totalBatches = Math.ceil(questionsToUpload.length / batchSize);
    let uploadedCount = 0;

    try {
      for (let i = 0; i < totalBatches; i++) {
        const batch = questionsToUpload.slice(i * batchSize, (i + 1) * batchSize);
        setUploadProgress({
          currentBatch: i + 1,
          totalBatches,
          uploadedCount,
          totalCount: questionsToUpload.length,
          percentage: Math.round((uploadedCount / questionsToUpload.length) * 100),
        });

        const res = await fetch('/api/catalog/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: safeStringify({ questions: batch }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }

        uploadedCount += batch.length;
        setUploadProgress({
          currentBatch: i + 1,
          totalBatches,
          uploadedCount,
          totalCount: questionsToUpload.length,
          percentage: Math.round((uploadedCount / questionsToUpload.length) * 100),
        });
      }

      // Merge into local cache and dispatch events
      await StorageService.bulkAddQuestions(questionsToUpload);
      onImportComplete(questionsToUpload);

      alert(`Successfully uploaded ${questionsToUpload.length.toLocaleString()} questions to database! Total database capacity updated.`);
      onClose();
    } catch (err: any) {
      console.error('Bulk Upload Error:', err);
      setUploadError(`Upload interrupted: ${err.message}. ${uploadedCount} questions were saved before failure.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Enterprise Bulk Question Importer</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                  No 1,000 Limit
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Import thousands of questions directly into Supabase via CSV, JSON, or Past Question text dumps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-xs">
          {/* 1. Target Academic Destination */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                1. Target Academic Classification
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Applied to rows without specific courses
              </span>
            </div>
            <AcademicHierarchySelector
              values={hierarchy}
              onChange={setHierarchy}
              universities={universities}
              faculties={faculties}
              departments={departments}
              courses={courses}
              mode="form"
              layout="grid-3"
            />

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Default Initial Status</label>
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value as QuestionStatus)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"
                >
                  <option value="Published">Published (Immediate CBT Availability)</option>
                  <option value="Pending">Pending Review (Workflow Verification)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Default Difficulty</label>
                <select
                  value={defaultDifficulty}
                  onChange={(e) => setDefaultDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium (Standard)</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Format & Input Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Select Input Method & Format
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    inputMode === 'file' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    inputMode === 'paste' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Text / Code
                </button>
              </div>
            </div>

            {/* Format Selector Pills */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  fileFormat === 'csv'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>CSV Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFileFormat('json')}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  fileFormat === 'json'
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>JSON Array</span>
              </button>

              <button
                type="button"
                onClick={() => setFileFormat('text')}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  fileFormat === 'text'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Past Questions Text (1. A. B. C. D. Ans: A)</span>
              </button>
            </div>

            {/* Input View */}
            {inputMode === 'file' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.json,.txt,.doc,.docx"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/60 hover:bg-slate-950 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">
                      {selectedFile ? selectedFile.name : 'Click to select CSV, JSON, or Text file'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                        : 'Supports thousands of questions in a single upload without timeouts'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={pastedContent}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder={
                    fileFormat === 'csv'
                      ? 'Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Difficulty,Explanation\n"What is 2+2?","3","4","5","6","B","Easy","Basic arithmetic"'
                      : fileFormat === 'json'
                      ? '[\n  {\n    "question": "What is 2+2?",\n    "optionA": "3",\n    "optionB": "4",\n    "correctAnswer": "B"\n  }\n]'
                      : '1. What is the capital of Nigeria?\nA. Lagos\nB. Abuja\nC. Kano\nD. Port Harcourt\nAns: B\nExplanation: Abuja became capital in 1991.'
                  }
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleParsePasted}
                  disabled={isParsing || !pastedContent.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse Questions & Validate</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Validation Report & Data Grid Preview */}
          {validationResult && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validationResult.valid.length.toLocaleString()} Valid Questions</span>
                  </span>

                  {validationResult.duplicateCount > 0 && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{validationResult.duplicateCount} Duplicates with DB</span>
                    </span>
                  )}

                  {validationResult.errors.length > 0 && (
                    <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold rounded-lg flex items-center gap-1.5">
                      <X className="w-4 h-4" />
                      <span>{validationResult.errors.length} Syntax Warnings</span>
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Filter preview items..."
                  value={searchPreview}
                  onChange={(e) => { setSearchPreview(e.target.value); setPreviewPage(1); }}
                  className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-500 w-48"
                />
              </div>

              {/* Preview Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-12">#</th>
                      <th className="p-2.5">Question Prompt</th>
                      <th className="p-2.5">Options (A / B / C / D)</th>
                      <th className="p-2.5 w-16">Key</th>
                      <th className="p-2.5 w-20">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {paginatedPreview.map((q, idx) => {
                      const rowNum = (previewPage - 1) * previewItemsPerPage + idx + 1;
                      return (
                        <tr key={q.id || idx} className="hover:bg-slate-900/50">
                          <td className="p-2.5 text-slate-500 font-mono">{rowNum}</td>
                          <td className="p-2.5 font-medium text-white max-w-xs truncate">{q.question}</td>
                          <td className="p-2.5 text-slate-400 max-w-xs truncate">
                            A: {q.optionA} | B: {q.optionB} {q.optionC ? `| C: ${q.optionC}` : ''}
                          </td>
                          <td className="p-2.5 font-black text-amber-400">{q.correctAnswer}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                              {q.difficulty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Preview Pagination */}
              {totalPreviewPages > 1 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Showing {((previewPage - 1) * previewItemsPerPage) + 1} - {Math.min(previewPage * previewItemsPerPage, filteredPreview.length)} of {filteredPreview.length} questions
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      disabled={previewPage === 1}
                      className="p-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-white">Page {previewPage} / {totalPreviewPages}</span>
                    <button
                      type="button"
                      onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                      disabled={previewPage === totalPreviewPages}
                      className="p-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar & Status */}
          {isUploading && (
            <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-bold text-amber-300">
                <span>Streaming Batch {uploadProgress.currentBatch} of {uploadProgress.totalBatches}...</span>
                <span>{uploadProgress.uploadedCount} / {uploadProgress.totalCount} Questions ({uploadProgress.percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteUpload}
            disabled={isUploading || !validationResult || validationResult.valid.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading to Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  Commit {validationResult ? `${validationResult.valid.length.toLocaleString()} Questions` : 'Questions'} to Database
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
