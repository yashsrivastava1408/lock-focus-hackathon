import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Intro from './components/Intro';
import { ThemeProvider } from './components/ThemeContext';
import ScrollToTop from './components/ScrollToTop';

// Lazy Load Pages
const LoginPage = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const FocusScan = React.lazy(() => import('./pages/FocusScan'));
const TestResults = React.lazy(() => import('./pages/TestResults'));
const Reader = React.lazy(() => import('./pages/Reader'));
const AdaptivePdfReader = React.lazy(() => import('./pages/AdaptivePdfReader'));
const FocusFlow = React.lazy(() => import('./pages/FocusFlow'));
const PeriQuestGame = React.lazy(() => import('./pages/PeriQuestGame'));
const TimeBlindnessGame = React.lazy(() => import('./pages/TimeBlindnessGame'));
const ColorMatchGame = React.lazy(() => import('./pages/ColorMatchGame'));
const BalloonPopGame = React.lazy(() => import('./pages/BalloonPopGame'));
const ZenDrive = React.lazy(() => import('./pages/ZenDrive'));
const DownloadPage = React.lazy(() => import('./pages/Download'));
const DyslexiaDashboard = React.lazy(() => import('./pages/DyslexiaDashboard'));
const ADHDDashboard = React.lazy(() => import('./pages/ADHDDashboard'));
const StressDashboard = React.lazy(() => import('./pages/StressDashboard'));
const DyslexiaGame = React.lazy(() => import('./pages/DyslexiaGame'));
const SyllableSlasher = React.lazy(() => import('./pages/SyllableSlasher'));
const PeripheralVisionGame = React.lazy(() => import('./pages/PeripheralVisionGame'));
const ProjectPage = React.lazy(() => import('./pages/ProjectPage'));
const ChatbotPage = React.lazy(() => import('./pages/ChatbotPage'));

const LandingWrapper = () => {
  const [introComplete, setIntroComplete] = useState(() => {
    return sessionStorage.getItem('introSeen') === 'true';
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('introSeen', 'true');
    setIntroComplete(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!introComplete && (
          <Intro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {introComplete && (
        <Navigate to="/dashboard" replace />
      )}
    </>
  );
};


function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <React.Suspense fallback={
          <div className="min-h-screen bg-[#050a1a] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="text-blue-400 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Neural Interface Loading...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingWrapper />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/focus-scan" element={<FocusScan />} />
            <Route path="/test-results" element={<TestResults />} />
            <Route path="/reader" element={<Reader />} />
            <Route path="/adaptive-reader" element={<AdaptivePdfReader />} />
            <Route path="/dyslexia-game" element={<DyslexiaGame />} />
            <Route path="/dyslexia-dashboard" element={<DyslexiaDashboard />} />
            <Route path="/adhd-dashboard" element={<ADHDDashboard />} />
            <Route path="/focus-flow" element={<FocusFlow />} />
            <Route path="/syllable-slasher" element={<SyllableSlasher />} />
            <Route path="/peripheral-vision" element={<PeriQuestGame />} />
            <Route path="/peripheral-vision-info" element={<PeripheralVisionGame />} />
            <Route path="/time-blindness" element={<TimeBlindnessGame />} />
            <Route path="/stress-dashboard" element={<StressDashboard />} />
            <Route path="/color-match" element={<ColorMatchGame />} />
            <Route path="/balloon-pop" element={<BalloonPopGame />} />
            <Route path="/zen-drive" element={<ZenDrive />} />
            <Route path="/adhd-chatbot" element={<ChatbotPage />} />
          </Routes>
        </React.Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
