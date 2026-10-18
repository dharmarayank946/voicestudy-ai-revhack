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
  Radio,
  GraduationCap,
  Layers,
  CheckCircle2,
  Lock,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import VoiceOrb from './VoiceOrb';
import { SUBJECT_CATEGORIES } from '../data/subjectLibrary';

export default function HomeView({ 
  onProcessInput, 
  isProcessing, 
  responseData, 
  setActiveTab, 
  onSelectSubject,
  onResumeSession,
  memories = [],
  stats = {}
}) {
  const recentMemories = memories.slice(0, 4);
  const totalNotesCount = memories.length || stats.total_memories || 0;

  // Selected popular categories from subjectLibrary
  const featuredCategories = SUBJECT_CATEGORIES.slice(0, 3);

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      
      {/* =========================================================================
          1. HERO BANNER
          ========================================================================= */}
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
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
              <span>VoiceStudy AI &bull; Speak. Remember. Revise.</span>
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
              Voice-first AI study companion with persistent Qdrant vector memory, Lyzr multi-agent reasoning, automated revision timetables, and active recall practice.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="btn-hero-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.98rem',
                  padding: '0.85rem 1.6rem'
                }}
              >
                <LayoutDashboard size={18} />
                <span>Open Student Dashboard</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setActiveTab('study')}
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
                <BookOpen size={18} color="var(--brand-violet)" />
                <span>Student Study Tutor</span>
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

      {/* =========================================================================
          2. PLATFORM LIVE STATUS STRIP
          ========================================================================= */}
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
              {totalNotesCount} Notes Indexed
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
              Web Speech (EN / KN)
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
              Free Tier (Plus: &#8377;199/mo)
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. HOW VOICESTUDY AI HELPS STUDENTS LEARN (PEDAGOGICAL EXPLANATION)
          ========================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={14} /> Cognitive Architecture
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            How VoiceStudy AI Helps Students Learn
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '750px', lineHeight: '1.6' }}>
            Traditional studying suffers from passive reading and rapid memory decay. VoiceStudy AI combines three evidence-based active learning mechanisms to convert lecture content into permanent recall.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Pillar 1 */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={22} color="var(--accent-cyan)" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>Pillar 1</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Frictionless Capture</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Speak notes hands-free in English or Kannada, or paste raw lecture transcripts. The AI Orchestrator automatically cleans speech artifacts, extracts core technical concepts, and creates structured study digests.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Web Speech real-time voice input
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Bilingual transcription (English & Kannada)
              </span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--brand-violet)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(115, 87, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} color="var(--brand-violet)" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--brand-violet)', fontWeight: '700', textTransform: 'uppercase' }}>Pillar 2</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Grounded Vector Memory</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Every note is converted into 1536-dimensional semantic embeddings in Qdrant. When you ask questions, the Lyzr multi-agent tutor references <em>your exact course notes</em>, completely eliminating AI hallucinations.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Strict student UID tenant isolation
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Zero hallucination grounded answers
              </span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={22} color="var(--accent-emerald)" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase' }}>Pillar 3</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Active Recall & Timetables</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Passive re-reading creates an illusion of competence. VoiceStudy AI generates backend-evaluated multiple-choice quizzes and automatically schedules daily revision tasks based on your semester exam countdown.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Backend-graded active recall quizzes
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" /> Automated exam countdown timetable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. STUDY LIBRARY SHOWCASE
          ========================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
              marginBottom: '0.5rem'
            }}>
              <GraduationCap size={14} /> Curriculum Directory
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Study Library & Academic Curricula
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Over 50 standardized course syllabi ready for immediate grounded study, active recall quizzes, and flashcard review.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('materials')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
          >
            <span>Explore All Curricula</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {featuredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: cat.accentColor, textTransform: 'uppercase' }}>
                  {cat.subjects.length} Subjects
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  Syllabus Ready
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {cat.description}
                </p>
              </div>

              {/* Subject pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.subjects.slice(0, 4).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (onSelectSubject) {
                        onSelectSubject(sub.name, sub.defaultTopic);
                      } else {
                        setActiveTab('study');
                      }
                    }}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.28rem 0.6rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-violet)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (onSelectSubject) {
                    onSelectSubject(cat.subjects[0].name, cat.subjects[0].defaultTopic);
                  } else {
                    setActiveTab('study');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--brand-violet)',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: 'auto'
                }}
              >
                <span>Study {cat.subjects[0].name}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. RECENT STORED MEMORIES / STUDY VAULT
          ========================================================================= */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
              marginBottom: '0.5rem'
            }}>
              <Brain size={14} /> Persistent Knowledge
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Recent Stored Memories
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Lecture notes and audio summaries currently indexed in your Qdrant vector memory store.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('notes')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
          >
            <span>View Notes Vault ({totalNotesCount})</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {recentMemories.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.25rem'
          }}>
            {recentMemories.map((m, idx) => (
              <div 
                key={m.id || idx}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                    {m.subject || 'General'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                    {m.topic || 'Study Note'}
                  </h4>
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {m.text || m.content || 'Indexed memory content...'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onResumeSession) {
                      onResumeSession(m);
                    } else {
                      setActiveTab('study');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--brand-violet)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: 'auto'
                  }}
                >
                  <span>Study this memory</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(115, 87, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={26} color="var(--brand-violet)" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Your Study Memory Vault is Ready
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: 0 }}>
                Speak or paste your first lecture note in the study workspace. It will be indexed into Qdrant for semantic search and active recall quizzes.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('study')}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.3rem' }}
            >
              Create First Study Note
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          6. STUDY MEMORY ARCHITECTURE IN-DEPTH
          ========================================================================= */}
      <section style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '2rem 2.25rem',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--accent-cyan)',
              fontSize: '0.78rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              <Layers size={14} /> Dual-Store Architecture
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Study Memory: How Notes Persist and Stay Private
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '680px' }}>
              Unlike generic chatbots that forget context between tabs, VoiceStudy AI uses persistent storage tailored for students.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('memory')}
            className="btn-secondary"
            style={{ fontSize: '0.84rem', padding: '0.6rem 1.1rem' }}
          >
            Inspect Vector Memory
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Brain size={18} color="var(--brand-violet)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>1536-dim Qdrant Vectors</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Notes are encoded into vector space so you can query concepts by conceptual meaning (e.g., searching "deadlock avoidance" retrieves notes on Dijkstra's Banker's algorithm).
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Calendar size={18} color="var(--accent-emerald)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>SQLite Study Vault</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Stores exam countdown profiles, daily task checklists, quiz attempt histories, and honest performance readiness scores across browser restarts.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Tenant Isolation</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
              Every note and quiz is isolated by student UID (<code>default_student</code>). Your notes are never mixed with other users and are strictly confidential.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. DEDICATED WORKSPACES BANNER (MOVED OFF HOME TO DEDICATED PAGE)
          ========================================================================= */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(16, 21, 43, 0.8) 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        border: '1px solid rgba(115, 87, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Wand2 size={16} color="var(--brand-violet)" />
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--brand-violet)', textTransform: 'uppercase' }}>
              Dedicated AI Study Environments
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Explore All 8 Dedicated AI Workspaces
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Study Tutor, Voice Room, Lecture Analyzer, Active Recall Quiz, Revision Planner, Vector Memory Vault, Flashcards, and Curricula Library each live in their own dedicated workspace.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('workspaces')}
          className="btn-primary"
          style={{
            padding: '0.75rem 1.4rem',
            fontSize: '0.88rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Open Workspaces Hub</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* =========================================================================
          8. STUDENT PLUS &#8377;199/MONTH MONETIZATION BANNER
          ========================================================================= */}
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
            <span>STUDENT PLUS SUBSCRIPTION &bull; &#8377;199 / MONTH</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            Supercharge Your Semester Exam Prep
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
            Unlock 100 daily AI study queries, 25 adaptive quizzes/day, unlimited persistent Qdrant vector memory across semesters, automated revision timetables, and full lecture transcripts analyzer for less than the cost of a coffee.
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
