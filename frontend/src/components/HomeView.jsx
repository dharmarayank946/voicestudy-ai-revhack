import React from 'react';
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
  Radio
} from 'lucide-react';
import VoiceOrb from './VoiceOrb';

export default function HomeView({ 
  onProcessInput, 
  isProcessing, 
  responseData, 
  setActiveTab, 
  _onSelectSubject,
  memories = [],
  stats = {}
}) {
  const featureCards = [
    {
      id: 'study',
      title: 'AI Study Tutor',
      desc: 'Conversational grounded explanations powered by Lyzr agent reasoning and your lecture notes.',
      icon: BookOpen,
      badge: 'Grounded Q&A',
      accent: 'var(--brand-violet)'
    },
    {
      id: 'voice',
      title: 'Voice Study Room',
      desc: 'Hands-free voice learning with English & Kannada speech recognition and spoken audio feedback.',
      icon: Mic,
      badge: 'Dual Language',
      accent: 'var(--accent-emerald)'
    },
    {
      id: 'quiz',
      title: 'Active Recall Quiz',
      desc: 'Generate targeted multiple-choice practice quizzes evaluated on the backend to isolate weak areas.',
      icon: HelpCircle,
      badge: 'Backend Graded',
      accent: 'var(--accent-cyan)'
    },
    {
      id: 'revision',
      title: 'Revision Planner',
      desc: 'Personalized daily revision timetable synced to your university exam countdown.',
      icon: Calendar,
      badge: 'Auto Scheduled',
      accent: 'var(--accent-indigo)'
    },
    {
      id: 'analyzer',
      title: 'AI Lecture Analyzer',
      desc: 'Transform raw lecture transcripts into structured digests, concept breakdowns, and action items.',
      icon: Wand2,
      badge: 'Lecture Digest',
      accent: 'var(--brand-violet)'
    },
    {
      id: 'memory',
      title: 'AI Vector Memory',
      desc: 'Persistent 1536-dimensional Qdrant vector memory with strict student tenant isolation.',
      icon: Brain,
      badge: '1536-Dim Qdrant',
      accent: 'var(--accent-amber)'
    }
  ];

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(16, 21, 43, 0.95) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(115, 87, 255, 0.15) 100%)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        border: '1px solid rgba(115, 87, 255, 0.25)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(16, 21, 43, 0.3)'
      }}>
        {/* Glow ambient background elements */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(115, 87, 255, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              background: 'rgba(115, 87, 255, 0.15)',
              border: '1px solid rgba(115, 87, 255, 0.35)',
              color: 'var(--brand-violet)',
              fontSize: '0.82rem',
              fontWeight: '700',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={14} color="var(--brand-violet)" />
              <span>VoiceStudy AI • Speak. Remember. Revise.</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: '1.18',
              margin: '0 0 1rem 0'
            }}>
              Turn Lecture Notes Into <span style={{ color: 'var(--brand-violet)', textShadow: '0 0 25px rgba(115, 87, 255, 0.4)' }}>Permanent Knowledge.</span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: '1.6',
              margin: '0 0 1.75rem 0'
            }}>
              Voice-first AI study platform with persistent Qdrant vector memory, Lyzr multi-agent reasoning, automated revision timetables, and active recall practice.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('study')}
                className="btn-hero-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.98rem',
                  padding: '0.85rem 1.75rem'
                }}
              >
                <span>Launch AI Study Tutor</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Mic size={18} color="var(--brand-violet)" />
                <span>Open Voice Study Room</span>
              </button>
            </div>
          </div>

          {/* Quick Voice Interaction Orb Teaser */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(16, 21, 43, 0.7)',
            padding: '1.75rem',
            borderRadius: '20px',
            border: '1px solid rgba(115, 87, 255, 0.3)',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(12px)',
            minWidth: '260px'
          }}>
            <VoiceOrb
              onProcessInput={onProcessInput}
              isProcessing={isProcessing}
              responseData={responseData}
            />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '0.75rem', fontWeight: '500' }}>
              Click orb to speak or ask questions
            </span>
          </div>
        </div>
      </section>

      {/* Real Platform Status Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(115, 87, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={22} color="var(--brand-violet)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Qdrant Vector Store</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {memories.length || stats.total_memories || 0} Notes Indexed
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="var(--accent-emerald)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Lyzr Multi-Agent</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              4 Agents Coordinated
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Voice Ingestion</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Omi + Web Speech (EN / KN)
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="var(--accent-amber)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>SaaS Plan Tier</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Free Tier (Student Plus: ₹199)
            </div>
          </div>
        </div>
      </div>

      {/* Main SaaS Platform Feature Hub */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Complete AI Study Workspaces
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Select a specialized study workspace designed for every phase of exam preparation.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-secondary"
            style={{ fontSize: '0.84rem', padding: '0.55rem 1rem' }}
          >
            Open Student Dashboard →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--brand-violet)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(115, 87, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} color={card.accent} />
                  </div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {card.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-violet)', fontWeight: '600', fontSize: '0.85rem', marginTop: 'auto' }}>
                  <span>Open workspace</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Plus ₹199/Month Monetization Banner */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(115, 87, 255, 0.12) 0%, rgba(16, 21, 43, 0.05) 100%)',
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        border: '1px solid rgba(115, 87, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
            <Zap size={14} color="var(--brand-violet)" />
            <span>STUDENT PLUS SUBSCRIPTION • ₹199 / MONTH</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            Supercharge Your Semester Exam Prep
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Unlock 100 daily AI study queries, 25 quizzes/day, unlimited persistent Qdrant vector memory, automated revision timetables, and full readiness analytics for less than the cost of a coffee.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pricing')}
          className="btn-primary"
          style={{
            padding: '0.85rem 1.6rem',
            fontSize: '0.95rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>View Pricing & Upgrade Plans</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
