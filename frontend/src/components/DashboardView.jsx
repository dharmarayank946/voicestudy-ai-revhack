import React, { useState } from 'react';
import { 
  Brain, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Cpu, 
  Volume2, 
  Layers, 
  Zap, 
  RotateCw,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import VoiceOrb from './VoiceOrb';
import ExamCountdownCard from './ExamCountdownCard';
import RevisionPlanWidget from './RevisionPlanWidget';
import { SUBJECT_CATEGORIES } from '../data/subjectLibrary';

export default function DashboardView({ 
  memories = [], 
  stats = {}, 
  onProcessInput, 
  isProcessing, 
  responseData, 
  setActiveTab,
  onResumeSession,
  onSelectSubject
}) {
  const [isPlayingDemoAudio, setIsPlayingDemoAudio] = useState(false);
  const [planReloadCount, setPlanReloadCount] = useState(0);

  const recentMemories = memories.slice(0, 4);
  const totalMemoriesCount = stats.total_memories !== undefined ? stats.total_memories : memories.length;
  const totalTopicsCount = stats.total_topics !== undefined ? stats.total_topics : (stats.topics_list?.length || (memories.length > 0 ? new Set(memories.map(m => m.topic)).size : 0));
  const latestMemory = memories.length > 0 ? memories[0] : null;

  const subjectsSubtitle = stats.subjects_list && stats.subjects_list.length > 0 
    ? stats.subjects_list.slice(0, 4).join(', ') 
    : (memories.length > 0 
        ? Array.from(new Set(memories.map(m => m.subject || 'General'))).slice(0, 4).join(', ')
        : 'No topics studied yet');

  const handleLaunchAITutor = () => {
    if (setActiveTab) {
      setActiveTab('study');
    }
  };

  const handleSubjectStudyClick = (subjectName, defaultTopic) => {
    if (onSelectSubject) {
      onSelectSubject(subjectName, defaultTopic);
    } else if (setActiveTab) {
      setActiveTab('study');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* =========================================================================
          1. CINEMATIC HERO SECTION
          ========================================================================= */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-glow-orb" />
        
        <div className="hero-content">
          <div className="hero-badge-pill">
            <Sparkles size={14} />
            <span>EYFI Hackathon 2026 • AI Education SaaS</span>
          </div>

          <h1 id="hero-title" className="hero-title">
            Turn Every Lecture Into <br />
            <span className="hero-title-gradient">Permanent Mastery</span>
          </h1>

          <p className="hero-tagline">
            Voice-first AI study companion powered by Lyzr Agent reasoning, Qdrant vector memory, and adaptive recall timetables. Speak or paste your notes, master concepts, and crush your semester exams.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn-hero-primary"
              onClick={() => setActiveTab && setActiveTab('study')}
              id="hero-start-studying-btn"
              aria-label="Start Studying with Voice and AI Agents"
            >
              <Zap size={18} />
              <span>Student Study</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn-hero-secondary"
              onClick={() => setActiveTab && setActiveTab('pricing')}
              aria-label="View Pricing & Plans"
              style={{ border: '1px solid var(--border-violet)', background: 'var(--bg-pill)', color: 'var(--brand-violet)', fontWeight: '700' }}
            >
              <Zap size={18} color="var(--brand-violet)" />
              <span>Plans (₹199/mo)</span>
            </button>

            <button 
              className="btn-hero-secondary"
              onClick={() => setActiveTab && setActiveTab('subjects')}
              aria-label="Explore Subject Library"
            >
              <GraduationCap size={18} color="var(--brand-violet)" />
              <span>Subject Library</span>
            </button>

            <button 
              className="btn-hero-secondary"
              onClick={() => setActiveTab && setActiveTab('memory')}
              aria-label="Explore Stored Memories"
            >
              <Brain size={18} color="var(--brand-violet)" />
              <span>Memory Vault</span>
            </button>
          </div>

          <div className="hero-pills-row">
            <span className="hero-pill-item">
              <Radio size={13} color="var(--accent-cyan)" /> Voice Ingestion (EN / KN)
            </span>
            <span className="hero-pill-item">
              <Brain size={13} color="var(--accent-emerald)" /> Qdrant 1536-dim Vectors
            </span>
            <span className="hero-pill-item">
              <Cpu size={13} color="var(--accent-violet)" /> Lyzr Multi-Agent Reasoning
            </span>
            <span className="hero-pill-item">
              <CheckCircle2 size={13} color="var(--accent-blue)" /> Active Recall Grounding
            </span>
          </div>
        </div>

        {/* Audio Waveform & AI Voice Orb Showcase */}
        <div className="cinematic-visualizer-card">
          <div className="visualizer-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isProcessing ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                boxShadow: isProcessing ? '0 0 10px var(--accent-amber)' : '0 0 10px var(--accent-emerald)'
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {isProcessing ? 'Agent Thinking & Vector Retrieval...' : 'Live Voice & Agent Intelligence Console'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn-secondary"
                onClick={() => setIsPlayingDemoAudio(!isPlayingDemoAudio)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
                aria-label="Toggle waveform frequency animation"
              >
                <Volume2 size={13} />
                <span>{isPlayingDemoAudio ? 'Audio Active' : 'Waveform Demo'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Audio Waveform Canvas Visualizer */}
          <div className="waveform-frequency-display" aria-hidden="true">
            {[24, 45, 18, 60, 32, 70, 50, 85, 40, 95, 65, 30, 80, 55, 90, 42, 68, 35, 78, 48, 88, 25, 58, 38].map((h, i) => (
              <div 
                key={i} 
                className="freq-bar" 
                style={{ 
                  height: isPlayingDemoAudio || isProcessing ? `${h}px` : `${Math.max(8, h * 0.35)}px`,
                  animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                  animationPlayState: isPlayingDemoAudio || isProcessing ? 'running' : 'paused'
                }} 
              />
            ))}
          </div>

          {/* Interactive Voice Orb */}
          <VoiceOrb 
            onProcessInput={onProcessInput}
            isProcessing={isProcessing}
            responseData={responseData}
          />
        </div>
      </section>


      {/* =========================================================================
          2. RESPONSE DISPLAY (WHEN ACTIVE)
          ========================================================================= */}
      {responseData && (
        <section 
          className="glass-card" 
          style={{ 
            borderColor: 'rgba(56, 189, 248, 0.4)', 
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)'
          }}
          aria-live="polite"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '0.85rem', 
            paddingBottom: '0.85rem', 
            borderBottom: '1px solid var(--border-subtle)', 
            flexWrap: 'wrap', 
            gap: '0.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-cyan">{responseData.agent_executed || 'AI Tutor'}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Intent: <strong style={{ color: 'var(--accent-emerald)' }}>{responseData.intent}</strong> • Subject: <strong>{responseData.orchestration?.subject || 'General'}</strong>
              </span>
            </div>
            {setActiveTab && (
              <button
                className="btn-secondary"
                onClick={() => setActiveTab('study')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
              >
                Open Full Workspace <ArrowRight size={13} />
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: '1.65', maxHeight: '200px', overflowY: 'auto' }}>
            {responseData.message}
          </div>
        </section>
      )}


      {/* =========================================================================
          2. EXAM TARGET COUNTDOWN & REVISION TIMETABLE
          ========================================================================= */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <ExamCountdownCard 
          onPlanGenerated={() => setPlanReloadCount(c => c + 1)}
          onSelectSubject={onSelectSubject}
          setActiveTab={setActiveTab}
        />
        <RevisionPlanWidget 
          reloadTrigger={planReloadCount}
          onSelectTopic={(t, s) => {
            if (onSelectSubject) onSelectSubject(s, t);
          }}
          setActiveTab={setActiveTab}
        />
      </section>

      {/* =========================================================================
          3. STUDENT STUDY COMMAND CENTER & QUICK ACCESS
          ========================================================================= */}
      <section aria-labelledby="dashboard-overview-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '0.35rem' }}>
              Student Hub
            </div>
            <h2 id="dashboard-overview-heading" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Student Study Dashboard
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Quick access to your study workspace, AI tutor, memory cards, and subject catalog
            </p>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="quick-action-strip">
          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('study')}
            id="qa-student-study-btn"
            aria-label="Open Student Study Interface"
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(115, 87, 255, 0.15)' }}>
              <BookOpen size={18} color="var(--brand-violet)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Student Study</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Launch AI study tutor</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={handleLaunchAITutor}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)' }}>
              <MessageSquare size={18} color="var(--accent-indigo)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>AI Tutor</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ask questions & explain</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('subjects')}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)' }}>
              <GraduationCap size={18} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Subject Library</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10 Academic Curricula</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('memory')}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)' }}>
              <Brain size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Memory Vault</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Search saved notes</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('quiz')}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)' }}>
              <HelpCircle size={18} color="var(--accent-violet)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Revision Quiz</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active recall testing</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('flashcards')}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)' }}>
              <RotateCw size={18} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Flashcards</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active recall study</div>
            </div>
          </button>

          <button 
            className="quick-action-btn"
            onClick={() => setActiveTab && setActiveTab('progress')}
          >
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)' }}>
              <Layers size={18} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Study Insights</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Analytics & coverage</div>
            </div>
          </button>
        </div>

        {/* Real Data KPI Counters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Stored Notes</span>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)' }}>
                <Brain size={20} color="var(--accent-cyan)" />
              </div>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {totalMemoriesCount}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="var(--accent-emerald)" /> Qdrant Vector Store
            </p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Topics</span>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)' }}>
                <BookOpen size={20} color="var(--accent-emerald)" />
              </div>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {totalTopicsCount}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {subjectsSubtitle}
            </p>
          </div>

          <div 
            className="glass-card glass-card-interactive" 
            onClick={() => setActiveTab && setActiveTab('quiz')}
            style={{ cursor: 'pointer' }}
            title="Click to launch AI Revision Quiz Generator"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Revision Ready</span>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)' }}>
                <HelpCircle size={20} color="var(--accent-violet)" />
              </div>
            </div>
            <h3 style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {totalTopicsCount > 0 ? `${totalTopicsCount * 3}+` : '0'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-violet)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Launch Active Recall &rarr;
            </p>
          </div>
        </div>

        {/* Continue Learning Card (Only shown when real previous session data exists and can be reopened) */}
        {latestMemory && (
          <div 
            className="glass-card" 
            style={{ 
              borderColor: 'rgba(79, 70, 229, 0.3)', 
              marginBottom: '1.75rem', 
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={22} color="var(--accent-indigo)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-indigo)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Continue Learning • Previous Study Session
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                    {latestMemory.subject || 'Course'}: {latestMemory.topic || 'Latest Concept'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '580px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    "{latestMemory.text}"
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => onResumeSession ? onResumeSession(latestMemory) : (setActiveTab && setActiveTab('study'))}
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
                >
                  Resume Studying &rarr;
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab && setActiveTab('quiz')}
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                >
                  Quiz on Topic
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Real Stored Study Notes Timeline */}
        <div className="glass-card" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Recent Stored Study Memories
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Semantic vector embeddings persisted in local Qdrant vector database
              </p>
            </div>
            {recentMemories.length > 0 && (
              <button 
                className="btn-secondary"
                onClick={() => setActiveTab && setActiveTab('memory')}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              >
                View All Memories <ArrowRight size={14} />
              </button>
            )}
          </div>

          {recentMemories.length === 0 ? (
            /* Useful Empty State for New Students */
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-input)', borderRadius: '14px', border: '1px dashed var(--border-subtle)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <Brain size={26} color="var(--accent-indigo)" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Welcome to your Student Learning Dashboard!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                You haven't recorded any lecture notes or study sessions yet. Turn your classes, meetings, or revision sessions into permanent knowledge:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: '720px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <Radio size={14} /> 1. Spoken Audio
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Speak into your microphone or paste raw lecture audio notes.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-indigo)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <GraduationCap size={14} /> 2. Subject Library
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Explore 50+ subjects across 10 academic disciplines tailored for revision.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <HelpCircle size={14} /> 3. Active Recall
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Generate grounded quizzes directly from your saved lecture notes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab && setActiveTab('study')}
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1.35rem' }}
                >
                  Create First Study Note &rarr;
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setActiveTab && setActiveTab('subjects')}
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1.15rem' }}
                >
                  Explore Subject Library
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {recentMemories.map((m, idx) => (
                <div 
                  key={m.id || idx} 
                  className="glass-card glass-card-interactive" 
                  style={{ padding: '1.15rem', background: 'var(--bg-input)', cursor: 'pointer' }} 
                  onClick={() => setActiveTab && setActiveTab('memory')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-cyan">{m.subject || 'General'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {m.date_display || 'Recent'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {m.topic || 'Study Topic'}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5', margin: 0 }}>
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* =========================================================================
          4. ACADEMIC SUBJECT LIBRARY SPOTLIGHT
          ========================================================================= */}
      <section aria-labelledby="subject-spotlight-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '0.35rem' }}>
              Course Directory
            </div>
            <h2 id="subject-spotlight-heading" style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Curricula & Subject Library
            </h2>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              10 primary academic disciplines supported by Lyzr AI reasoning and Qdrant vector memory
            </p>
          </div>

          <button 
            className="btn-secondary"
            onClick={() => setActiveTab && setActiveTab('subjects')}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem', gap: '0.4rem' }}
          >
            Browse All 50+ Subjects <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
          {SUBJECT_CATEGORIES.slice(0, 6).map((cat) => (
            <div 
              key={cat.id} 
              className="glass-card" 
              style={{ 
                padding: '1.25rem', 
                background: 'var(--bg-card)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '0.85rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {cat.name}
                  </h4>
                  <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {cat.subjects.length} Subjects
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
                  {cat.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {cat.subjects.slice(0, 3).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectStudyClick(sub.name, sub.defaultTopic)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Study ${sub.name}`}
                    >
                      {sub.name.length > 22 ? `${sub.name.slice(0, 20)}...` : sub.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn-secondary"
                onClick={() => setActiveTab && setActiveTab('subjects')}
                style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', width: '100%', justifyContent: 'center' }}
              >
                Explore Category &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>


      {/* =========================================================================
          5. HOW IT WORKS: 3-STEP TRANSFORMATION PIPELINE
          ========================================================================= */}
      <section aria-labelledby="pipeline-heading">
        <div className="section-header-block">
          <div className="badge badge-purple" style={{ marginBottom: '0.65rem' }}>
            Intelligent Study Architecture
          </div>
          <h2 id="pipeline-heading" className="section-title">
            How Lecture Audio Becomes Organized Knowledge
          </h2>
          <p className="section-subtitle">
            VoiceStudy AI transforms chaotic spoken words and continuous lecture streams into structured, searchable, and quiz-ready study materials.
          </p>
        </div>

        <div className="transformation-pipeline">
          {/* Step 1 */}
          <div className="pipeline-card" style={{ '--card-accent': '#38BDF8' }}>
            <div className="pipeline-step-badge">1</div>
            <div className="pipeline-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.12)' }}>
              <Radio size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Spoken Lecture Ingestion
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
              Streams spoken audio from device microphones. The voice adapter normalizes transcripts, cleans filler words, and prepares the text for AI analysis.
            </p>
            <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              <span className="badge badge-cyan">Web Speech Voice Ingestion</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="pipeline-card" style={{ '--card-accent': '#8B5CF6' }}>
            <div className="pipeline-step-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-violet)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>2</div>
            <div className="pipeline-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
              <Cpu size={24} color="var(--accent-violet)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Lyzr Multi-Agent Reasoning
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
              The Orchestrator Agent routes intent to specialized agents: Summarizer extracts core insights, Action Items logs tasks, and the Assistant synthesizes clean revision summaries.
            </p>
            <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              <code className="mono-font" style={{ color: 'var(--accent-violet)' }}>Lyzr Agent Studio V3 Chat</code>
            </div>
          </div>

          {/* Step 3 */}
          <div className="pipeline-card" style={{ '--card-accent': '#10B981' }}>
            <div className="pipeline-step-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>3</div>
            <div className="pipeline-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
              <Brain size={24} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Vector Memory & Active Recall
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1 }}>
              Notes are indexed in Qdrant with 1536-dimensional embeddings. The Quiz Agent grounds questions strictly on your real notes to eliminate AI hallucinations.
            </p>
            <div style={{ marginTop: '1.25rem', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              <code className="mono-font" style={{ color: 'var(--accent-emerald)' }}>Qdrant Vector DB (Cosine)</code>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          6. CINEMATIC FOOTER
          ========================================================================= */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--gradient-cyan-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="#040814" />
              </div>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>VoiceStudy AI</strong>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>RevHack 2026</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Meeting & Lecture Intelligence • HiDevs Community & AI House
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab && setActiveTab('study')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              Study Workspace
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('subjects')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              Subject Library
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('memory')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              Memory Vault
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('quiz')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              Active Recall Quiz
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('flashcards')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              Flashcards Deck
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('settings')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              System Health
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}