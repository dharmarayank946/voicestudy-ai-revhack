import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import StudyView from './components/StudyView';
import VoiceStudyView from './components/VoiceStudyView';
import SubjectLibraryView from './components/SubjectLibraryView';
import MemoryView from './components/MemoryView';
import AIMemoryView from './components/AIMemoryView';
import QuizView from './components/QuizView';
import FlashcardsView from './components/FlashcardsView';
import RevisionPlannerView from './components/RevisionPlannerView';
import AnalyzerView from './components/AnalyzerView';
import ProgressView from './components/ProgressView';
import PricingView from './components/PricingView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import ProfileView from './components/ProfileView';
import WorkspacesView from './components/WorkspacesView';
import { fetchHealth, getRecentMemories, processStudyRequest } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [healthData, setHealthData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [memoryStats, setMemoryStats] = useState({ total_memories: 0, total_topics: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeResumeSession, setActiveResumeSession] = useState(null);
  const [latestQuizData, setLatestQuizData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Default theme is eye-friendly 'light'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('voicestudy_theme', theme);
    } catch (err) {
      console.warn('Failed to save theme setting:', err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const loadData = async () => {
    try {
      const hData = await fetchHealth();
      setHealthData(hData);
      
      const mData = await getRecentMemories(50);
      if (mData.memories) {
        setMemories(mData.memories);
        setMemoryStats({
          total_memories: mData.total_count || mData.memories.length,
          total_topics: mData.topics?.length || 3
        });
      }
    } catch (err) {
      console.warn('Failed to load initial backend data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Periodic status refresh
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleProcessInput = async (transcript, source = 'web_speech', history = null) => {
    setIsProcessing(true);
    setResponseData(null);
    try {
      const result = await processStudyRequest(transcript, source, null, null, history);
      setResponseData(result);
      
      showToast(`Intent [${result.intent}] processed by ${result.agent_executed}`);

      if (result.intent === 'REMEMBER' || result.response_type === 'memory_saved') {
        loadData();
      }
      return result;
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickSearch = (query) => {
    setGlobalSearchQuery(query);
    setActiveTab('notes');
  };

  const handleSelectSubject = (subjectName, defaultTopic) => {
    setSelectedSubject(subjectName);
    setActiveResumeSession(null);
    if (defaultTopic) {
      setSelectedQuizTopic(defaultTopic);
    }
    setActiveTab('study');
  };

  const handleResumeSession = (memory) => {
    if (!memory) return;
    setActiveResumeSession(memory);
    if (memory.subject) {
      setSelectedSubject(memory.subject);
    }
    setActiveTab('study');
  };

  const handleSubjectQuiz = (topic) => {
    if (topic) {
      setSelectedQuizTopic(topic);
    }
    setActiveTab('quiz');
  };

  const handleSubjectFilterNotes = (subjectName) => {
    setGlobalSearchQuery(subjectName);
    setActiveTab('notes');
  };

  const handleSelectStudyTopic = (topicName) => {
    setSelectedSubject(topicName);
    setSelectedQuizTopic(topicName);
    setActiveTab('study');
  };

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: notification.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          color: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.88rem',
          boxShadow: 'var(--shadow-card-hover)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthData={healthData} 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main App Content Area */}
      <div className="main-content">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onQuickSearch={handleQuickSearch} 
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="view-content">
          {activeTab === 'home' && (
            <HomeView
              onProcessInput={handleProcessInput}
              isProcessing={isProcessing}
              responseData={responseData}
              setActiveTab={setActiveTab}
              onSelectSubject={handleSelectSubject}
              onResumeSession={handleResumeSession}
              memories={memories}
              stats={memoryStats}
            />
          )}

          {activeTab === 'workspaces' && (
            <WorkspacesView
              setActiveTab={setActiveTab}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              memories={memories}
              stats={memoryStats}
              onProcessInput={handleProcessInput}
              isProcessing={isProcessing}
              responseData={responseData}
              setActiveTab={setActiveTab}
              onResumeSession={handleResumeSession}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {activeTab === 'study' && (
            <StudyView
              onProcessInput={handleProcessInput}
              isProcessing={isProcessing}
              responseData={responseData}
              setActiveTab={setActiveTab}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
              initialSubject={selectedSubject}
              initialSession={activeResumeSession}
              onClearResumeSession={() => setActiveResumeSession(null)}
              onOpenSubjectLibrary={() => setActiveTab('materials')}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceStudyView
              onProcessInput={handleProcessInput}
              isProcessing={isProcessing}
              responseData={responseData}
              setActiveTab={setActiveTab}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
            />
          )}

          {(activeTab === 'materials' || activeTab === 'subjects') && (
            <SubjectLibraryView
              onSelectSubject={handleSelectSubject}
              onSelectQuiz={handleSubjectQuiz}
              onFilterNotes={handleSubjectFilterNotes}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'notes' && (
            <MemoryView
              memories={memories}
              onRefreshMemories={loadData}
              setActiveTab={setActiveTab}
              initialSearchQuery={globalSearchQuery}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              initialTopic={selectedQuizTopic}
              onQuizGenerated={setLatestQuizData}
              setActiveTab={setActiveTab}
              onSelectStudyTopic={handleSelectStudyTopic}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              memories={memories}
              quizData={latestQuizData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'revision' && (
            <RevisionPlannerView
              setActiveTab={setActiveTab}
              onSelectTopic={handleSelectStudyTopic}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {activeTab === 'memory' && (
            <AIMemoryView
              memories={memories}
              onRefreshMemories={loadData}
              setActiveTab={setActiveTab}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
            />
          )}

          {activeTab === 'analyzer' && (
            <AnalyzerView
              setActiveTab={setActiveTab}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              memories={memories}
              stats={memoryStats}
              setActiveTab={setActiveTab}
              onSelectQuizTopic={(topic) => {
                setSelectedQuizTopic(topic);
                setActiveTab('quiz');
              }}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingView
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              healthData={healthData}
              theme={theme}
              onSelectTheme={setTheme}
            />
          )}

          {activeTab === 'help' && (
            <HelpView
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}
