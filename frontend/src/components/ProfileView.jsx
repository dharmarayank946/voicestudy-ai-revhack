import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Zap, 
  Languages, 
  Shield, 
  Clock, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { fetchUsageStatus, fetchExamProfile } from '../services/api';

export default function ProfileView({ setActiveTab }) {
  const [usageData, setUsageData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student profile state
  const [studentName, setStudentName] = useState(() => localStorage.getItem('voicestudy_student_name') || 'Scholar');
  const [collegeName, setCollegeName] = useState(() => localStorage.getItem('voicestudy_college_name') || 'Engineering College, Bengaluru');
  const [studentEmail, setStudentEmail] = useState(() => localStorage.getItem('voicestudy_student_email') || 'student@college.edu');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadInfo() {
      try {
        const [uRes, pRes] = await Promise.all([
          fetchUsageStatus('default_student'),
          fetchExamProfile('default_student')
        ]);
        setUsageData(uRes);
        if (pRes?.has_profile) {
          setProfileData(pRes.profile);
        }
      } catch (err) {
        console.warn('Failed to load profile info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('voicestudy_student_name', studentName);
    localStorage.setItem('voicestudy_college_name', collegeName);
    localStorage.setItem('voicestudy_student_email', studentEmail);
    setIsEditing(false);
  };

  const planTier = usageData?.plan_tier || 'free';
  const limits = usageData?.limits || {
    max_daily_study_queries: 15,
    max_daily_quizzes: 5,
    study_queries_remaining: 15,
    quizzes_remaining: 5
  };

  const queriesUsed = limits.max_daily_study_queries - limits.study_queries_remaining;
  const queriesPct = Math.min(100, Math.round((queriesUsed / limits.max_daily_study_queries) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <User size={14} color="var(--brand-violet)" />
          <span>STUDENT ACCOUNT & PROFILE</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          Student Profile
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
          Manage your university details, academic targets, and subscription status.
        </p>
      </div>

      {/* Grid: Profile Card & Plan Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Details Card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-violet) 0%, var(--brand-navy) 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem'
              }}>
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {studentName}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Student ID: default_student
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Name</label>
                <input
                  type="text"
                  className="custom-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ height: '38px', fontSize: '0.88rem', marginTop: '0.25rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>College / University</label>
                <input
                  type="text"
                  className="custom-input"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  style={{ height: '38px', fontSize: '0.88rem', marginTop: '0.25rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email</label>
                <input
                  type="email"
                  className="custom-input"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  style={{ height: '38px', fontSize: '0.88rem', marginTop: '0.25rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '38px', marginTop: '0.5rem', fontSize: '0.88rem' }}>
                Save Profile
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>College / University</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{collegeName}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Email Address</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{studentEmail}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Target Academic Exam</span>
                <span style={{ fontWeight: '600', color: 'var(--brand-violet)' }}>
                  {profileData?.exam_title || 'Operating Systems End-Sem'} ({profileData?.target_subject || 'Operating Systems'})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Plan & Quota Card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} color="var(--brand-violet)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Subscription Plan
              </h3>
            </div>
            <span className={planTier === 'student_plus' ? 'badge badge-emerald' : 'badge badge-indigo'} style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {planTier === 'student_plus' ? 'STUDENT PLUS (₹199)' : 'FREE PLAN'}
            </span>
          </div>

          {/* Daily Quota Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Daily Study Queries:</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                {queriesUsed} / {limits.max_daily_study_queries} used
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: `${queriesPct}%`,
                height: '100%',
                background: queriesPct > 80 ? 'var(--accent-rose)' : 'var(--brand-violet)',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {limits.study_queries_remaining} queries remaining today
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={14} color="var(--accent-emerald)" />
              <span>Practice Quizzes Remaining Today: <strong>{limits.quizzes_remaining}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={14} color="var(--accent-emerald)" />
              <span>Qdrant 1536-Dim Vector Memory: <strong>Active</strong></span>
            </div>
          </div>

          {planTier !== 'student_plus' && (
            <button
              onClick={() => setActiveTab('pricing')}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: 'auto'
              }}
            >
              <span>Upgrade to Student Plus (₹199/mo)</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
