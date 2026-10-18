import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Target, 
  Edit3, 
  Sparkles, 
  X,
  ArrowRight
} from 'lucide-react';
import { fetchExamProfile, saveExamProfile, generateRevisionPlan } from '../services/api';

export default function ExamCountdownCard({ onPlanGenerated, onSelectSubject, setActiveTab }) {
  const [profileData, setProfileData] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [subject, setSubject] = useState('Operating Systems');
  const [examTitle, setExamTitle] = useState('Operating Systems End-Sem');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 18);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState(2.5);
  const [confidence, setConfidence] = useState(3);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchExamProfile();
      if (data?.has_profile) {
        setProfileData(data.profile);
        setSubject(data.profile.target_subject);
        setExamTitle(data.profile.exam_title);
        setExamDate(data.profile.exam_date.split('T')[0]);
        setDailyHours(data.profile.daily_study_hours || 2.5);
        setConfidence(data.profile.confidence_level || 3);
      }
    } catch (err) {
      console.warn('Failed to load exam profile:', err);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await saveExamProfile(subject, examTitle, examDate, dailyHours, confidence);
      setProfileData(res.profile);
      setShowSetupModal(false);
      // Auto generate revision tasks for this exam
      const planRes = await generateRevisionPlan(subject);
      if (onPlanGenerated) onPlanGenerated(planRes);
    } catch (err) {
      alert('Failed to save exam profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenLoading(true);
    try {
      const planRes = await generateRevisionPlan(profileData?.target_subject || subject);
      if (onPlanGenerated) onPlanGenerated(planRes);
    } catch (err) {
      alert('Failed to generate revision plan: ' + err.message);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <>
      <div className="glass-card" style={{
        border: '1px solid var(--border-violet)',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(115, 87, 255, 0.04) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(115, 87, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-violet)'
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {profileData ? profileData.exam_title : 'Set Your Next Exam Target'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Target Subject: <strong style={{ color: 'var(--brand-violet)' }}>{profileData ? profileData.target_subject : 'Not Configured'}</strong>
              </p>
            </div>
          </div>

          <button
            className="btn-secondary"
            onClick={() => setShowSetupModal(true)}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <Edit3 size={14} /> {profileData ? 'Edit Target' : 'Configure Exam'}
          </button>
        </div>

        {profileData ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            {/* Days Left Tile */}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Time Remaining</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--brand-violet)', lineHeight: '1.1', marginTop: '0.2rem' }}>
                {profileData.days_remaining} <span style={{ fontSize: '1rem', fontWeight: '600' }}>days</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Exam Date: {new Date(profileData.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Daily Hours Target */}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Daily Commitment</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1', marginTop: '0.2rem' }}>
                {profileData.daily_study_hours} <span style={{ fontSize: '1rem', fontWeight: '600' }}>hrs/day</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                Recommended Pace
              </span>
            </div>

            {/* Confidence Level */}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Confidence Index</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: profileData.confidence_level >= 4 ? 'var(--accent-emerald)' : 'var(--accent-amber)', lineHeight: '1.1', marginTop: '0.2rem' }}>
                {profileData.confidence_level} / 5
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {profileData.confidence_level >= 4 ? 'High Confidence' : profileData.confidence_level === 3 ? 'Moderate' : 'Needs Reinforcement'}
              </span>
            </div>

            {/* Action CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                className="btn-primary" 
                onClick={handleGeneratePlan}
                disabled={genLoading}
                style={{ padding: '0.75rem 1rem', fontSize: '0.88rem', gap: '0.4rem' }}
              >
                <Sparkles size={16} /> {genLoading ? 'Regenerating...' : 'Refresh Revision Plan'}
              </button>
              {setActiveTab && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (onSelectSubject) onSelectSubject(profileData.target_subject);
                    setActiveTab('study');
                  }}
                  style={{ padding: '0.65rem 1rem', fontSize: '0.82rem', gap: '0.35rem' }}
                >
                  <Target size={14} /> Open Study Workspace <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Enter your upcoming exam date and subject to automatically generate a tailored daily revision schedule with countdown milestones.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => setShowSetupModal(true)}
              style={{ padding: '0.7rem 1.5rem' }}
            >
              <Target size={16} /> Set Up Exam Target
            </button>
          </div>
        )}
      </div>

      {/* Setup / Edit Modal */}
      {showSetupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-backdrop)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Configure Exam Target
              </h3>
              <button onClick={() => setShowSetupModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Target Subject *
                </label>
                <input
                  type="text"
                  required
                  className="custom-input"
                  placeholder="e.g. Operating Systems, DBMS, Networks"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Exam Title / Description
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Semester 5 OS Finals"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  className="custom-input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Daily Hours
                  </label>
                  <select 
                    className="custom-input"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  >
                    <option value={1.0}>1.0 Hour</option>
                    <option value={2.0}>2.0 Hours</option>
                    <option value={2.5}>2.5 Hours</option>
                    <option value={3.0}>3.0 Hours</option>
                    <option value={4.0}>4.0 Hours</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Current Confidence
                  </label>
                  <select 
                    className="custom-input"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                  >
                    <option value={1}>1 - Beginner / Low</option>
                    <option value={2}>2 - Basic Concepts</option>
                    <option value={3}>3 - Moderate (Average)</option>
                    <option value={4}>4 - Confident</option>
                    <option value={5}>5 - Exam Ready</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                {loading ? 'Saving...' : 'Save & Generate Revision Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
