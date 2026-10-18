import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Mic, 
  HelpCircle, 
  Calendar, 
  Brain, 
  Wand2, 
  ArrowRight, 
  Zap, 
  GraduationCap,
  RotateCw,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function WorkspacesView({ setActiveTab, onSelectSubject }) {
  const [searchQuery, setSearchQuery] = useState('');

  const workspaces = [
    {
      id: 'study',
      title: 'AI Study Tutor Workspace',
      badge: 'Grounded Assistant',
      desc: 'Conversational grounded explanations powered by Lyzr agent multi-step reasoning. References your indexed lecture notes to eliminate hallucinations.',
      icon: BookOpen,
      accent: 'var(--brand-violet)',
      action: 'Launch Study Tutor',
      capabilities: [
        'Grounded answers from student notes',
        'Formula & derivation step-by-step guidance',
        'Follow-up conversational questions',
        'Automatic note summarization'
      ]
    },
    {
      id: 'voice',
      title: 'Voice Study Room',
      badge: 'Dual Language',
      desc: 'Hands-free voice learning with English and Kannada speech recognition. Dictate lecture summaries or speak questions out loud.',
      icon: Mic,
      accent: 'var(--accent-emerald)',
      action: 'Open Voice Room',
      capabilities: [
        'Web Speech live voice recognition',
        'Bilingual support (English & Kannada)',
        'Spoken audio synthesis readout',
        'Hands-free study mode'
      ]
    },
    {
      id: 'analyzer',
      title: 'AI Lecture & Meeting Analyzer',
      badge: 'Lecture Digest',
      desc: 'Transform raw, disorganized lecture transcripts into structured summaries, key concept breakdowns, action items, and exam takeaways.',
      icon: Wand2,
      accent: 'var(--brand-violet)',
      action: 'Open Analyzer',
      capabilities: [
        'Executive summary generation',
        'Action item and deadline extraction',
        'Technical keyword breakdown',
        'One-click save to Notes Vault'
      ]
    },
    {
      id: 'quiz',
      title: 'Active Recall Practice Quiz',
      badge: 'Backend Graded',
      desc: 'Generate targeted 5-question multiple-choice practice quizzes evaluated strictly on the backend to diagnose weak knowledge areas.',
      icon: HelpCircle,
      accent: 'var(--accent-cyan)',
      action: 'Start Practice Quiz',
      capabilities: [
        'Custom subject and topic generation',
        'Instant scoring with detailed rationales',
        'Weak topic diagnostic detection',
        'Syncs to Exam Readiness score'
      ]
    },
    {
      id: 'revision',
      title: 'Automated Revision Planner',
      badge: 'Auto Scheduled',
      desc: 'Personalized daily revision timetable calculated against your university exam countdown, confidence ratings, and daily study hours.',
      icon: Calendar,
      accent: 'var(--accent-indigo)',
      action: 'Open Timetable',
      capabilities: [
        'Exam date countdown tracker',
        'Adaptive daily task scheduling',
        'One-click task completion toggle',
        'Direct link from task to Study Tutor'
      ]
    },
    {
      id: 'memory',
      title: 'AI Vector Memory Vault',
      badge: '1536-Dim Qdrant',
      desc: 'Persistent 1536-dimensional Qdrant vector memory with strict student tenant isolation. Search notes by meaning, not just keywords.',
      icon: Brain,
      accent: 'var(--accent-amber)',
      action: 'Inspect Memory Vault',
      capabilities: [
        '1536-dimensional semantic search',
        'Tenant isolation by student UID',
        'Persistent SQLite study vault',
        'Subject and topic taxonomy tagging'
      ]
    },
    {
      id: 'materials',
      title: 'Academic Subject Library',
      badge: '10 Curricula',
      desc: 'Comprehensive curriculum directory covering Computer Science, Engineering, Sciences, Mathematics, Commerce, and Competitive Exams.',
      icon: GraduationCap,
      accent: 'var(--accent-cyan)',
      action: 'Explore Subjects',
      capabilities: [
        '10 primary academic departments',
        'Over 50 standardized course syllabi',
        'Direct study and quiz launch',
        'Topic-level syllabus benchmarks'
      ]
    },
    {
      id: 'flashcards',
      title: 'Active Recall Flashcards',
      badge: 'Interactive Review',
      desc: 'Flip-card active recall interface generated from your lecture notes and quiz questions for rapid pre-exam memory reinforcement.',
      icon: RotateCw,
      accent: 'var(--accent-emerald)',
      action: 'Review Flashcards',
      capabilities: [
        '3D card flip animation',
        'Question on front, answer on back',
        'Shuffle and mastery sorting',
        'Grounded in your notes'
      ]
    }
  ];

  const filtered = workspaces.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 21, 43, 0.95) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(115, 87, 255, 0.15) 100%)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        border: '1px solid rgba(115, 87, 255, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '9999px',
          background: 'rgba(115, 87, 255, 0.18)',
          border: '1px solid rgba(115, 87, 255, 0.35)',
          color: 'var(--brand-violet)',
          fontSize: '0.78rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          <Sparkles size={14} /> Dedicated AI Workspaces Directory
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800', color: '#FFFFFF', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
          Complete AI Study Workspaces
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '680px', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
          Explore specialized AI study environments built for every phase of learning: lecture capture, transcript analysis, grounded explanation, active recall testing, and exam preparation.
        </p>

        {/* Search bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(16, 21, 43, 0.75)',
          border: '1px solid rgba(115, 87, 255, 0.35)',
          borderRadius: '14px',
          padding: '0.65rem 1rem',
          maxWidth: '520px'
        }}>
          <Search size={18} color="var(--brand-violet)" />
          <input
            type="text"
            placeholder="Search workspaces by feature or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Grid of Dedicated Workspaces */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {filtered.map((ws) => {
          const Icon = ws.icon;
          return (
            <div
              key={ws.id}
              className="card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-violet)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(115, 87, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={ws.accent} />
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
                  {ws.badge}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  {ws.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  {ws.desc}
                </p>
              </div>

              {/* Key Capabilities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Core Capabilities
                </span>
                {ws.capabilities.map((cap, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab(ws.id)}
                className="btn-primary"
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}
              >
                <span>{ws.action}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
