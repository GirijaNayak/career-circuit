import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { CompanyComparePage } from './pages/CompanyComparePage';
import { PracticePage } from './pages/PracticePage';
import { AssessmentBriefingPage } from './pages/AssessmentBriefingPage';
import { AssessmentSimulatorPage } from './pages/AssessmentSimulatorPage';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage';
import { DrillsPage } from './pages/DrillsPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { InterviewPrepModulePage } from './pages/InterviewPrepModulePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PreparationPlanPage } from './pages/PreparationPlanPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { getPreferences, applyPreferencesToDOM } from './storage/localStorageService';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  useEffect(() => {
    // Initialize preferences on initial load
    const currentPrefs = getPreferences();
    applyPreferencesToDOM(currentPrefs);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/compare" element={<CompanyComparePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/:id/briefing" element={<AssessmentBriefingPage />} />
          <Route path="/practice/:id/session" element={<AssessmentSimulatorPage />} />
          <Route path="/practice/:id/results/:attemptId" element={<AssessmentResultsPage />} />
          <Route path="/practice/drills" element={<DrillsPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/interview-prep/:moduleKey" element={<InterviewPrepModulePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/plan" element={<PreparationPlanPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
