import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  BookOpen,
  RotateCw
} from 'lucide-react';
import ExamCountdownCard from './ExamCountdownCard';
import RevisionPlanWidget from './RevisionPlanWidget';

export default function RevisionPlannerView({ 
  setActiveTab, 
  onSelectTopic,
  onSelectSubject 
}) {
  const [reloadKey, setReloadKey] = useState(0);

  const handlePlanGenerated = (planData) => {
    // Trigger widget reload when new plan is created
    setReloadKey(prev => prev + 1);
  };

  const handleQuickStudyTopic = (topic, subject) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    }
    if (onSelectSubject && subject) {
      onSelectSubject(subject, topic);
    }
    if (setActiveTab) {
      setActiveTab('study');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <Calendar size={14} color="var(--brand-violet)" />
          <span>EXAM SUCCESS TIMETABLE</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          Smart Revision Planner
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
          Automatically structures your remaining days until university finals into manageable active recall tasks.
        </p>
      </div>

      {/* Target Exam Countdown Card */}
      <ExamCountdownCard
        onPlanGenerated={handlePlanGenerated}
        onSelectSubject={onSelectSubject}
        setActiveTab={setActiveTab}
      />

      {/* Revision Plan Schedule Widget */}
      <RevisionPlanWidget
        reloadTrigger={reloadKey}
        onSelectTopic={handleQuickStudyTopic}
        setActiveTab={setActiveTab}
      />

      {/* Spaced Repetition Methodology Card */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(115, 87, 255, 0.05) 100%)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
          <Sparkles size={18} color="var(--brand-violet)" />
          <span>How VoiceStudy AI Revision Scheduling Works</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--brand-violet)', marginBottom: '0.35rem' }}>
              1. Spaced Interval Spreading
            </div>
            Syllabus topics are distributed across your remaining days to prevent last-minute cramming and optimize long-term memory consolidation.
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>
              2. Weak Topic Prioritization
            </div>
            Questions missed during Active Recall Practice Quizzes are automatically promoted into upcoming revision intervals.
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
              3. Exam Readiness Tracking
            </div>
            Completing daily tasks directly elevates your verified Exam Readiness Score in the Study Analytics workspace.
          </div>
        </div>
      </div>
    </div>
  );
}
