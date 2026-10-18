import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  X, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { fetchUsageStatus, registerUpgradeInterest } from '../services/api';

export default function PricingView({ setActiveTab }) {
  const [usage, setUsage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('student_plus');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadUsage = useCallback(async () => {
    try {
      const u = await fetchUsageStatus('default_student');
      setUsage(u);
    } catch (err) {
      console.warn('Failed to fetch usage status:', err);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const handleOpenUpgrade = (planKey = 'student_plus') => {
    setSelectedPlan(planKey);
    setShowModal(true);
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const handleRegisterLead = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubmitError('Please enter a valid student email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await registerUpgradeInterest(email, name, college, selectedPlan, notes, 'default_student');
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setEmail('');
        setName('');
        setCollege('');
        setNotes('');
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const freeLimits = usage?.limits || {
    max_daily_study_queries: 15,
    max_daily_quizzes: 5,
    study_queries_remaining: 15,
    quizzes_remaining: 5
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.95rem',
          borderRadius: '9999px',
          background: 'var(--bg-pill)',
          border: '1px solid var(--border-violet)',
          color: 'var(--brand-violet)',
          fontSize: '0.78rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          <Sparkles size={14} /> EYFI 2026 Revenue & Subscription Model
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Transparent, Student-First Pricing
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Start revising for free with daily AI assistance. Upgrade to Student Plus for unlimited high-frequency exam sprint revision and deep vector memory retention.
        </p>
      </div>

      {/* Live Usage Status Bar */}
      {usage && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-violet)', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                Active Plan: <strong style={{ color: 'var(--brand-violet)' }}>{usage.plan_tier === 'student_plus' ? 'Student Plus' : 'Free Tier'}</strong>
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '0.2rem' }}>
                Daily Quota: {freeLimits.study_queries_remaining} / {freeLimits.max_daily_study_queries} questions remaining • {freeLimits.quizzes_remaining} / {freeLimits.max_daily_quizzes} quizzes left
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Estimated AI Token Cost: <strong>${(usage.estimated_cost_usd || 0).toFixed(4)} USD</strong>
              </span>
              {usage.plan_tier !== 'student_plus' && (
                <button 
                  className="btn-primary" 
                  onClick={() => handleOpenUpgrade('student_plus')}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Zap size={14} /> Upgrade to Plus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* FREE TIER CARD */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>Free Tier</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Daily revision fundamentals</p>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>Always Free</span>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹0</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>forever</span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span><strong>15 AI Study Questions</strong> per day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span><strong>5 Adaptive Quizzes</strong> per day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Qdrant vector memory storage (up to 50 notes)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Web Speech voice input & read-aloud</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Basic Exam countdown & task tracking</span>
              </div>
            </div>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => setActiveTab('study')}
            style={{ width: '100%', marginTop: '2rem', padding: '0.85rem' }}
          >
            Current Active Plan
          </button>
        </div>

        {/* STUDENT PLUS CARD (FEATURED) */}
        <div className="glass-card" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          borderColor: 'var(--brand-violet)',
          boxShadow: '0 8px 32px rgba(115, 87, 255, 0.22)',
          position: 'relative',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(115, 87, 255, 0.05) 100%)'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--brand-violet)',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: '800',
            letterSpacing: '0.04em',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            textTransform: 'uppercase'
          }}>
            Most Popular
          </div>

          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Student Plus <Sparkles size={18} color="var(--brand-violet)" />
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Comprehensive exam revision toolkit</p>
            </div>

            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--brand-violet)' }}>₹199</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>/ month</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', marginLeft: '0.75rem', fontWeight: '700' }}>
                Save 40% vs Tutors
              </span>
            </div>

            <div style={{ height: '1px', background: 'rgba(115, 87, 255, 0.2)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>100 AI Study Questions</strong> / day (Grounded multi-agent reasoning)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>25 Active Recall Quizzes</strong> / day (Detailed rationales & diagnostics)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>Unlimited Qdrant Vector Memory</strong> (Permanent semester retention)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>Automated Revision Timetable</strong> & Exam Countdown Tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>Lecture Intelligence Analyzer</strong> (Transcript digests & action items)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
                <Check size={16} color="var(--brand-violet)" />
                <span><strong>Bilingual Voice Recognition</strong> (English & Kannada live speech)</span>
              </div>

              {/* Planned Features Clearly Labeled */}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Roadmap Features (In Active Development):
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Planned</span>
                  <span>Omi Wearable Live Bluetooth Streaming Adapter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Planned</span>
                  <span>Kannada Spoken Audio Synthesis (TTS Voice)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Planned</span>
                  <span>Multi-Student Peer Study Groups & Shared Decks</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => handleOpenUpgrade('student_plus')}
            style={{ width: '100%', marginTop: '2rem', padding: '0.85rem', gap: '0.5rem' }}
          >
            <Zap size={16} /> Upgrade to Student Plus <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Revenue Opportunity & Unit Economics Breakdown (For EYFI Judges) */}
      <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--brand-violet)" /> Revenue Opportunity & Business Model (EYFI Hackathon)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Target Customer</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>College Students in India</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              40M+ undergraduate engineering, science, and commerce students facing semester exams without personal tutors.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Unit Economics</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>&gt; 90% Gross Margin</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Average active user generates ~80k tokens/mo (~$0.012 or ₹1.00 USD). At ₹199/month, gross margins comfortably exceed 90%.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Acquisition Funnel</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>Campus Ambassador Model</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Peer-to-peer distribution in college study groups. Free tier acts as an organic hook; exam countdown triggers conversion.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-pill)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          <strong>Honest Disclosure:</strong> Payment gateway integration (Razorpay/Stripe) is scheduled for the upcoming production rollout. Current registrations join our priority early-access queue with grandfathered pricing.
        </div>
      </div>

      {/* Upgrade Interest Modal */}
      {showModal && (
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
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Join Student Plus Priority Access
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Lock in ₹199/month early-adopter pricing
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={24} color="var(--accent-emerald)" />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>You're on the Priority List!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  We've saved your interest in SQLite study vault. You'll receive early access benefits as soon as billing activates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submitError && (
                  <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', color: 'var(--accent-rose)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={15} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    College Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="custom-input"
                    placeholder="e.g. rohan@rvce.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Rohan Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    College / University Name
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. RV College of Engineering, Bengaluru"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Primary Revision Focus
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Operating Systems & DBMS Sem 5 Finals"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  💳 Payment processing is coming soon. No credit card will be charged today.
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Priority Access (₹199/mo)'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
