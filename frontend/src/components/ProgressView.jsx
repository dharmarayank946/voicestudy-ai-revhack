import React, { useState, useEffect, useCallback } from 'react';
import { 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Target, 
  Info
} from 'lucide-react';
import { fetchExamReadiness, fetchQuizHistory } from '../services/api';

export default function ProgressView({ memories = [], stats = {}, setActiveTab, onSelectQuizTopic }) {
  const [readinessData, setReadinessData] = useState(null);
  const [quizHistory, setQuizHistory] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      const [rData, qData] = await Promise.all([
        fetchExamReadiness('default_student'),
        fetchQuizHistory('default_student', 10)
      ]);
      setReadinessData(rData);
      setQuizHistory(qData);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, memories]);

  const totalMemories = memories.length || stats.total_memories || 0;

  // Compute subject distribution from stored Qdrant memories
  const subjectMap = {};
  memories.forEach(m => {
    const s = m.subject || 'General Study';
    subjectMap[s] = (subjectMap[s] || 0) + 1;
  });

  const subjectItems = Object.keys(subjectMap).map((name) => ({
    name,
    count: subjectMap[name],
    pct: totalMemories > 0 ? Math.round((subjectMap[name] / totalMemories) * 100) : 0
  }));

  const readiness = readinessData?.readiness_score || 0;
  const isSufficient = readinessData?.has_sufficient_data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* View Header */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.3rem 0.85rem',
          borderRadius: '9999px',
          background: 'var(--bg-pill)',
          border: '1px solid var(--border-violet)',
          color: 'var(--brand-violet)',
          fontSize: '0.78rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          <TrendingUp size={14} /> Real Learning Analytics & Performance
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          Exam Readiness & Knowledge Retention
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Real analytics computed strictly from your stored Qdrant vector memories and backend quiz attempts.
        </p>
      </div>

      {/* 1. EXAM READINESS HERO CARD */}
      <div className="glass-card" style={{
        border: '1px solid var(--border-violet)',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(115, 87, 255, 0.05) 100%)',
        padding: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="var(--brand-violet)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Transparent Exam Readiness Score
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '580px', lineHeight: '1.5' }}>
              Formula-based estimation combining your quiz accuracy, syllabus topic coverage, and scheduled revision task completion.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            {isSufficient ? (
              <>
                <div style={{ fontSize: '2.8rem', fontWeight: '800', color: readiness >= 75 ? 'var(--accent-emerald)' : 'var(--brand-violet)', lineHeight: '1' }}>
                  {readiness}%
                </div>
                <span className={`badge ${readiness >= 75 ? 'badge-emerald' : 'badge-purple'}`} style={{ marginTop: '0.4rem' }}>
                  {readinessData?.status_label}
                </span>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: '600' }}>
                <AlertCircle size={18} />
                <span>Insufficient Data</span>
              </div>
            )}
          </div>
        </div>

        {/* Component Breakdown / Insufficient Data Banner */}
        {isSufficient ? (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Quiz Accuracy (40% Weight)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {readinessData.components.quiz_accuracy}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Average over {readinessData.total_attempts} attempts
                </span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Syllabus Coverage (30% Weight)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {readinessData.components.syllabus_coverage}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {totalMemories} notes in Qdrant store
                </span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Task Completion (30% Weight)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {readinessData.components.task_completion}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Scheduled revision tasks done
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} /> Calculation: {readinessData.formula_explanation}
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <AlertCircle size={16} color="var(--accent-amber)" />
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  Readiness Score Status: Insufficient Real Data
                </strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.55' }}>
                VoiceStudy AI calculates your exam readiness score strictly from verified metrics: <strong>(Quiz Accuracy &times; 40%) + (Syllabus Coverage &times; 30%) + (Task Completion &times; 30%)</strong>. To maintain strict academic integrity and avoid misleading progress, scores are never estimated or hardcoded with placeholder numbers until the prerequisites below are met.
              </p>
            </div>

            {/* Actionable Calibration Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Actionable Steps to Generate Your Score:
              </div>

              {/* Requirement 1: Exam Target */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.2rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: readinessData?.missing_data?.has_exam_target ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {readinessData?.missing_data?.has_exam_target ? <CheckCircle2 size={18} color="var(--accent-emerald)" /> : <Target size={18} color="var(--accent-amber)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      1. Target Exam & Date
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {readinessData?.missing_data?.has_exam_target ? 'Upcoming exam date configured' : 'Set your exam date and subject to establish timeline pacing'}
                    </div>
                  </div>
                </div>
                {setActiveTab && (
                  <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={readinessData?.missing_data?.has_exam_target ? 'btn-secondary' : 'btn-primary'}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  >
                    {readinessData?.missing_data?.has_exam_target ? 'Edit Target' : 'Set Exam Date'}
                  </button>
                )}
              </div>

              {/* Requirement 2: Practice Quizzes */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.2rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (readinessData?.missing_data?.quiz_attempts_count || 0) >= 2 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(readinessData?.missing_data?.quiz_attempts_count || 0) >= 2 ? <CheckCircle2 size={18} color="var(--accent-emerald)" /> : <HelpCircle size={18} color="var(--accent-amber)" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        2. Active Recall Quizzes ({readinessData?.missing_data?.quiz_attempts_count || 0}/2 Completed)
                      </span>
                      <span className={`badge ${(readinessData?.missing_data?.quiz_attempts_count || 0) >= 2 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                        {(readinessData?.missing_data?.quiz_attempts_count || 0) >= 2 ? 'Baseline Ready' : 'Need Practice'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Complete at least 2 practice quizzes to baseline your genuine retention accuracy
                    </div>
                  </div>
                </div>
                {setActiveTab && (
                  <button 
                    onClick={() => setActiveTab('quiz')} 
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  >
                    Take Practice Quiz
                  </button>
                )}
              </div>

              {/* Requirement 3: Stored Memories */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.2rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: totalMemories > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {totalMemories > 0 ? <CheckCircle2 size={18} color="var(--accent-emerald)" /> : <Brain size={18} color="var(--accent-cyan)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      3. Lecture Notes Indexed ({totalMemories} Notes in Store)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {totalMemories >= 3 ? 'Syllabus coverage baseline satisfied' : 'Save or dictate lecture notes to index your course syllabus in Qdrant'}
                    </div>
                  </div>
                </div>
                {setActiveTab && (
                  <button 
                    onClick={() => setActiveTab('study')} 
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  >
                    Add Study Notes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. OVERVIEW METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Active Subjects</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            {subjectItems.length}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--brand-violet)', marginTop: '0.25rem' }}>
            {subjectItems.slice(0, 3).map(s => s.name).join(', ') || 'None indexed yet'}
          </p>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Qdrant Vectors</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            {totalMemories}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} /> 1536-dim semantic embeddings
          </p>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Quiz Attempts</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            {quizHistory?.total_attempts || 0}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Average Accuracy: <strong style={{ color: 'var(--brand-violet)' }}>{quizHistory?.average_accuracy || 0}%</strong>
          </p>
        </div>
      </div>

      {/* 3. VERIFIED QUIZ HISTORY */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={18} color="var(--brand-violet)" /> Actual Quiz History (Saved in SQLite Vault)
        </h4>

        {(!quizHistory?.history || quizHistory.history.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              No quiz attempts completed yet. Generate a revision test to track your accuracy score over time.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quizHistory.history.map((h) => (
              <div 
                key={h.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {h.topic}
                  </h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Difficulty: <strong style={{ textTransform: 'capitalize' }}>{h.difficulty}</strong> • {new Date(h.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: h.percentage >= 70 ? 'var(--accent-emerald)' : 'var(--brand-violet)' }}>
                    {h.score} / {h.total_questions} ({h.percentage}%)
                  </span>
                  {setActiveTab && (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        if (onSelectQuizTopic) onSelectQuizTopic(h.topic);
                        setActiveTab('quiz');
                      }}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      Retake
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. SUBJECT COVERAGE BREAKDOWN */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--brand-violet)" /> Subject Coverage Breakdown
        </h4>

        {subjectItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              No study memories saved yet. Start a study session or dictate notes to view your subject coverage.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {subjectItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} Notes ({item.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: 'var(--brand-violet)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
