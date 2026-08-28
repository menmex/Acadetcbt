import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { PreJambAuthView } from './PreJambAuthView';
import { PreJambDashboardView } from './PreJambDashboardView';
import { PreJambSelectSubjectView } from './PreJambSelectSubjectView';
import { PreJambExamEngine, PreJambExamSessionPayload, PreJambCompletedExamData } from './PreJambExamEngine';
import { PreJambResultView } from './PreJambResultView';
import { PreJambReviewAnswersView } from './PreJambReviewAnswersView';
import { JAMB_SUBJECTS, JambSubjectMeta, PreJambQuestionItem } from '../../data/jambQuestionsBank';
import { PreJambStorageService, PreJambCandidate, PreJambExamResultRecord } from '../../services/prejambStorage';

interface PreJambAcademyAppProps {
  user?: UserProfile | null;
  onExitToMainApp?: () => void;
}

export const PreJambAcademyApp: React.FC<PreJambAcademyAppProps> = ({
  user: initialUser,
  onExitToMainApp,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (initialUser) return initialUser;
    const saved = localStorage.getItem('prejamb_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // Active view: 'auth' | 'dashboard' | 'select_subject' | 'exam' | 'result' | 'review'
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'select_subject' | 'exam' | 'result' | 'review'>(() => {
    return currentUser ? 'dashboard' : 'auth';
  });

  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [activeExamSession, setActiveExamSession] = useState<PreJambExamSessionPayload | null>(null);
  const [latestExamResult, setLatestExamResult] = useState<PreJambCompletedExamData | null>(() => {
    const saved = localStorage.getItem('prejamb_latest_result');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prejamb_user_session', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (latestExamResult) {
      localStorage.setItem('prejamb_latest_result', JSON.stringify(latestExamResult));
    }
  }, [latestExamResult]);

  // Handle successful sign in
  const handleSignInSuccess = (user: UserProfile) => {
    // Find or create candidate in Pre-JAMB database
    let existingCand = PreJambStorageService.findCandidateByRegOrEmail(user.email || user.name || '');
    if (!existingCand) {
      existingCand = PreJambStorageService.saveCandidate({
        id: `pj-cand-${Date.now()}`,
        regNumber: `2026/UTME/${Math.floor(10000 + Math.random() * 90000)}`,
        name: user.name || 'Candidate',
        email: user.email || 'candidate@prejambacademy.com',
        phone: user.phone || '+234 801 234 5678',
        targetUniversity: user.universityName || 'University of Ibadan (UI)',
        targetCourse: user.departmentName || 'Medicine & Surgery',
        utmeSubjects: ['use-of-english', 'mathematics', 'physics', 'chemistry'],
        subscriptionStatus: 'active',
        totalTestsTaken: 0,
        bestScore: 0,
        averageScore: 0,
        totalTimeSpentMinutes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setCurrentUser(user);
    setCurrentView('dashboard');
    setActiveNav('dashboard');
  };

  // Continue as Guest (default John Doe test candidate)
  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      id: `usr-guest-${Date.now()}`,
      name: 'John Doe',
      username: 'john_doe',
      email: 'john.doe@prejambacademy.com',
      phone: '+234 801 234 5678',
      role: 'student',
      authProvider: 'Email',
      universityId: 'uni-jamb',
      universityName: 'Pre-JAMB National Academy',
      departmentId: 'dept-utme',
      departmentName: 'General UTME Candidate',
      subscription: {
        isPremium: true,
        plan: 'Pre-JAMB Full Access',
        startDate: new Date().toISOString(),
        expiryDate: null,
        questionsAttemptedCount: 12,
        freeLimit: 9999,
      },
      bookmarks: [],
      createdDate: new Date().toISOString(),
      streakCount: 5,
      lastPracticeDate: new Date().toISOString(),
    };
    handleSignInSuccess(guestUser);
  };

  // Helper to build questions from PreJambStorageService
  const getExamQuestionsMap = (subjectIds: string[]): Record<string, PreJambQuestionItem[]> => {
    const map: Record<string, PreJambQuestionItem[]> = {};
    subjectIds.forEach((sId) => {
      const qCount = sId === 'use-of-english' ? 60 : 40;
      map[sId] = PreJambStorageService.generateExamQuestionsForSubject(sId, qCount);
    });
    return map;
  };

  // Launch Full 4-Subject Mock Exam
  const handleStartFullMockExam = () => {
    const cand = PreJambStorageService.findCandidateByRegOrEmail(currentUser?.email || currentUser?.name || '');
    const subjectIds = cand?.utmeSubjects && cand.utmeSubjects.length === 4
      ? cand.utmeSubjects
      : ['use-of-english', 'mathematics', 'physics', 'chemistry'];

    const mockQuestions = getExamQuestionsMap(subjectIds);

    const payload: PreJambExamSessionPayload = {
      examTitle: 'Mock Exam - UTME',
      isFullMock: true,
      subjectIds,
      questionsBySubject: mockQuestions,
      durationMinutes: 120, // 2 Hours Real UTME simulation
    };

    setActiveExamSession(payload);
    setCurrentView('exam');
  };

  // Launch Single Subject Practice Drill
  const handleSelectSubjectForPractice = (subject: JambSubjectMeta) => {
    const questions = getExamQuestionsMap([subject.id]);

    const payload: PreJambExamSessionPayload = {
      examTitle: `${subject.name} Practice Drill`,
      isFullMock: false,
      subjectIds: [subject.id],
      questionsBySubject: questions,
      durationMinutes: subject.timeMinutes || 40,
    };

    setActiveExamSession(payload);
    setCurrentView('exam');
  };

  // Exam Finish callback
  const handleFinishExam = (result: PreJambCompletedExamData) => {
    setLatestExamResult(result);

    // Persist completed exam to Pre-JAMB database
    const cand = PreJambStorageService.findCandidateByRegOrEmail(currentUser?.email || currentUser?.name || '');
    
    // Save record to PreJambStorageService
    const recordPayload: PreJambExamResultRecord = {
      id: `pj-res-${Date.now()}`,
      candidateId: cand?.id || currentUser?.id || 'pj-cand-guest',
      candidateName: cand?.name || currentUser?.name || 'Candidate',
      candidateRegNumber: cand?.regNumber || '2026/UTME/94821',
      examTitle: result.examTitle,
      isFullMock: result.isFullMock,
      subjectIds: result.subjectIds,
      totalQuestions: result.totalQuestions,
      totalScore: result.totalScore,
      percentage: result.percentage,
      utmeAggregate: result.isFullMock ? Math.round((result.totalScore / (result.totalQuestions || 1)) * 400) : Math.round(result.percentage * 4),
      timeUsedSeconds: result.timeUsedSeconds,
      subjectScores: result.subjectScores,
      answersBySubject: result.answersBySubject,
      markedForReview: { general: result.markedForReview },
      completedAt: result.completedAt || new Date().toISOString(),
    };

    PreJambStorageService.saveResult(recordPayload);
    setCurrentView('result');
  };

  // Handle Review Answers
  const handleGoToReview = (selectedRecord?: PreJambExamResultRecord) => {
    if (selectedRecord) {
      // Reconstruct completed exam data from record
      const subjectMap = getExamQuestionsMap(selectedRecord.subjectIds);
      const convertedResult: PreJambCompletedExamData = {
        examTitle: selectedRecord.examTitle,
        isFullMock: selectedRecord.isFullMock,
        subjectIds: selectedRecord.subjectIds,
        questionsBySubject: subjectMap,
        answersBySubject: (selectedRecord.answersBySubject as any) || {},
        markedForReview: (selectedRecord.markedForReview?.general as any) || {},
        timeUsedSeconds: selectedRecord.timeUsedSeconds,
        totalQuestions: selectedRecord.totalQuestions,
        totalScore: selectedRecord.totalScore,
        percentage: selectedRecord.percentage,
        subjectScores: selectedRecord.subjectScores,
        completedAt: selectedRecord.completedAt,
      };
      setLatestExamResult(convertedResult);
      setCurrentView('review');
      return;
    }

    if (!latestExamResult) {
      // Load most recent result from database
      const existingResults = PreJambStorageService.getResults();
      if (existingResults.length > 0) {
        handleGoToReview(existingResults[0]);
        return;
      }

      // Default sample fallback
      const sampleMock = getExamQuestionsMap(['use-of-english', 'mathematics', 'physics', 'chemistry']);
      const sampleResult: PreJambCompletedExamData = {
        examTitle: 'Mock Exam - UTME',
        isFullMock: true,
        subjectIds: ['use-of-english', 'mathematics', 'physics', 'chemistry'],
        questionsBySubject: sampleMock,
        answersBySubject: {
          'mathematics': {
            'jamb-mth-01': 'C',
            'jamb-mth-02': 'B',
            'jamb-mth-03': 'B',
            'jamb-mth-04': 'B',
            'jamb-mth-05': 'A',
          },
          'use-of-english': {
            'jamb-eng-01': 'A',
            'jamb-eng-02': 'B',
            'jamb-eng-03': 'B',
          },
        },
        markedForReview: {},
        timeUsedSeconds: 8130, // 02:15:30
        totalQuestions: 160,
        totalScore: 115,
        percentage: 72,
        subjectScores: {
          'use-of-english': { correct: 48, total: 60, percentage: 80 },
          'mathematics': { correct: 26, total: 40, percentage: 65 },
          'physics': { correct: 28, total: 40, percentage: 70 },
          'chemistry': { correct: 24, total: 40, percentage: 60 },
        },
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      };
      setLatestExamResult(sampleResult);
    }
    setCurrentView('review');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('prejamb_user_session');
    setCurrentUser(null);
    setCurrentView('auth');
  };

  // Handle Navigation from Sidebar
  const handleNavClick = (tabId: string) => {
    setActiveNav(tabId);
    if (tabId === 'dashboard') setCurrentView('dashboard');
    else if (tabId === 'practice') setCurrentView('select_subject');
    else if (tabId === 'mock_exams') handleStartFullMockExam();
    else if (tabId === 'results') {
      if (latestExamResult) setCurrentView('result');
      else handleGoToReview();
    } else if (tabId === 'review_answers') handleGoToReview();
  };

  // Screen 1: Auth / Sign In
  if (currentView === 'auth' || !currentUser) {
    return (
      <PreJambAuthView
        onSignInSuccess={handleSignInSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  // Screen 3: Select Subject
  if (currentView === 'select_subject') {
    return (
      <PreJambSelectSubjectView
        onBackToDashboard={() => setCurrentView('dashboard')}
        onSelectSubject={handleSelectSubjectForPractice}
      />
    );
  }

  // Screen 4: Real JAMB CBT Exam Engine
  if (currentView === 'exam' && activeExamSession) {
    return (
      <PreJambExamEngine
        session={activeExamSession}
        onFinishExam={handleFinishExam}
        onQuitExam={() => setCurrentView('dashboard')}
      />
    );
  }

  // Screen 5: Exam Result Summary
  if (currentView === 'result' && latestExamResult) {
    return (
      <PreJambResultView
        result={latestExamResult}
        onViewAnswersReview={() => setCurrentView('review')}
        onBackToDashboard={() => setCurrentView('dashboard')}
        onRetakeExam={handleStartFullMockExam}
      />
    );
  }

  // Screen 6: Review Answers
  if (currentView === 'review' && latestExamResult) {
    return (
      <PreJambReviewAnswersView
        result={latestExamResult}
        onBackToResults={() => setCurrentView('result')}
        onBackToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  // Screen 2: Dashboard (Default)
  return (
    <PreJambDashboardView
      user={currentUser}
      activeNav={activeNav}
      onNavigate={handleNavClick}
      onStartPractice={() => setCurrentView('select_subject')}
      onStartMockExam={handleStartFullMockExam}
      onReviewAnswers={handleGoToReview}
      onLogout={handleLogout}
    />
  );
};
