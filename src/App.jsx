import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Intro from './components/Intro';
import LoginPage from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import FocusScan from './pages/FocusScan';
import Reader from './pages/Reader';
import DyslexiaGame from './pages/DyslexiaGame';
import DyslexiaDashboard from './pages/DyslexiaDashboard';
import ADHDDashboard from './pages/ADHDDashboard';
import FocusFlow from './pages/FocusFlow';
import SyllableSlasher from './pages/SyllableSlasher';
import PeripheralVisionGame from './pages/PeripheralVisionGame';

import { ThemeProvider } from './components/ThemeContext';
import ProjectPage from './pages/ProjectPage';
import TestResults from './pages/TestResults';
import SignUp from './pages/SignUp';

const LandingWrapper = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!introComplete && (
          <Intro onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {/* Show Project Page after Intro */}
      {introComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <ProjectPage />
        </motion.div>
      )}
    </>
  );
};


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingWrapper />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus-scan" element={<FocusScan />} />
          <Route path="/test-results" element={<TestResults />} />
          <Route path="/reader" element={<Reader />} />
          <Route path="/dyslexia-game" element={<DyslexiaGame />} />
          <Route path="/dyslexia-dashboard" element={<DyslexiaDashboard />} />
          <Route path="/adhd-dashboard" element={<ADHDDashboard />} />
          <Route path="/focus-flow" element={<FocusFlow />} />
          <Route path="/syllable-slasher" element={<SyllableSlasher />} />
          <Route path="/peripheral-vision" element={<PeripheralVisionGame />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
