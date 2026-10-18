import React, { useState } from 'react';
import { 
  HelpCircle, 
  Mic, 
  Brain, 
  Sparkles, 
  Radio, 
  Keyboard, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';

export default function HelpView({ setActiveTab }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  const voiceCommands = [
    {
      trigger: 'Remember that [fact / concept]...',
      intent: 'REMEMBER',
      effect: 'Embeds your spoken note as a 1536-dimensional vector into Qdrant for semantic recall.',
      sample: '"Remember that in DBMS, Strict 2PL prevents cascading aborts by holding exclusive locks until commit."'
    },
    {
      trigger: 'Explain [concept] / What is [term]?',
      intent: 'EXPLAIN',
      effect: 'Queries Qdrant for your past notes, grounds context, and generates a tutor explanation via Lyzr.',
      sample: '"Explain how LRU page replacement algorithm differs from FIFO."'
    },
    {
      trigger: 'Quiz me on [topic] / Give me questions on...',
      intent: 'QUIZ',
      effect: 'Synthesizes an active recall 5-question multiple-choice practice quiz with backend evaluation.',
      sample: '"Quiz me on Concurrency Control protocols in Database Systems."'
    },
    {
      trigger: 'Summarize what I studied / Lecture digest...',
      intent: 'SUMMARIZE',
      effect: 'Coordinates the Summarizer Agent to produce an overview, definition list, and revision takeaways.',
      sample: '"Summarize what I studied about Operating Systems Virtual Memory."'
    },
    {
      trigger: 'Extract action items / What are the tasks?',
      intent: 'ACTION_ITEMS',
      effect: 'Extracts assigned tasks, owners, and deadlines into a structured markdown table without hallucination.',
      sample: '"Extract action items from my project meeting transcript."'
    }
  ];

  const faqs = [
    {
      q: 'How does VoiceStudy AI prevent AI hallucinations?',
      a: 'Unlike generic ChatGPT prompts, VoiceStudy AI uses Retrieval-Augmented Generation (RAG) backed by Qdrant. When you ask a question, the backend performs vector similarity search over your own lecture notes and passes the retrieved excerpts to Lyzr agents. Answers are strictly grounded in your syllabus.'
    },
    {
      q: 'How do I connect a physical Omi Wearable device?',
      a: 'In the official Omi Mobile App, navigate to Settings -> Integrations -> Webhook URL. Enter your public VoiceStudy AI webhook endpoint: https://<your-host>/omi/conversation?uid=default_student. Spoken notes from your wearable are transmitted directly into Qdrant.'
    },
    {
      q: 'What happens if the Lyzr API experiences network latency?',
      a: 'VoiceStudy AI enforces an aggressive 3.0-second timeout. If the cloud API experiences network lag, our defensive framework automatically fails over to an offline curated knowledge engine in under 10 milliseconds, ensuring your study flow is never blocked.'
    },
    {
      q: 'What are the limits on the Free Plan versus Student Plus?',
      a: 'The Free Plan includes 15 study queries and 5 quizzes daily with basic note storage. Student Plus (₹199/month) elevates this to 100 queries and 25 quizzes daily, unlimited persistent vector memory, automated revision timetables, and full readiness analytics.'
    },
    {
      q: 'Can I permanently delete a memory note?',
      a: 'Yes. VoiceStudy AI respects student privacy with real "Forget Memory" functionality. Deleting a note issues a real point deletion directly to the Qdrant vector database via DELETE /api/memory/{id}.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <HelpCircle size={14} color="var(--brand-violet)" />
          <span>HELP & STUDENT USER GUIDE</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          VoiceStudy AI Help Center
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
          Learn voice commands, connect wearable hardware, and understand how your AI study engine works.
        </p>
      </div>

      {/* Voice Commands Cheat Sheet */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          <Mic size={18} color="var(--brand-violet)" />
          <span>Voice Commands Cheat Sheet</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {voiceCommands.map((cmd, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {cmd.trigger}
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                  {cmd.intent}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                {cmd.effect}
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-violet)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                Example: {cmd.sample}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Explained Simply */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          <Brain size={18} color="var(--accent-emerald)" />
          <span>How VoiceStudy AI Works Under the Hood</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--brand-violet)', marginBottom: '0.35rem' }}>
              1. Voice Ingestion
            </div>
            Spoken notes in English or Kannada are captured via browser microphone or Omi wearable webhooks in &lt;50ms.
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>
              2. Qdrant Vector Storage
            </div>
            Your study notes are transformed into 1536-dimensional vectors for semantic similarity retrieval with strict UID isolation.
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
              3. Lyzr Multi-Agent Reasoning
            </div>
            Specialized Orchestrator, Study Assistant, Summarizer, and Quiz agents synthesize grounded answers and practice questions.
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>
              4. SQLite Study Vault
            </div>
            Tracks your exam countdown, schedules daily revision tasks, logs verified quiz scores, and isolates weak topics.
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          <ShieldCheck size={18} color="var(--accent-cyan)" />
          <span>Frequently Asked Questions & Reliability</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '0.95rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} color="var(--brand-violet)" /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 1.15rem 1rem 1.15rem',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.55',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
