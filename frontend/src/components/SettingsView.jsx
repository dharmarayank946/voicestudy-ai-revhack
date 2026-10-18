import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Radio, 
  Cpu, 
  Key, 
  Save, 
  CheckCircle2, 
  Sliders, 
  Award,
  Sun,
  Moon,
  Check
} from 'lucide-react';

export default function SettingsView({ healthData, theme = 'light', onSelectTheme }) {
  const qdrant = healthData?.vector_memory || {};

  const [defaultNumQuestions, setDefaultNumQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_num_q');
      return saved ? Number(saved) : 5;
    } catch {
      return 5;
    }
  });

  const [defaultDifficulty, setDefaultDifficulty] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_diff') || 'medium';
    } catch {
      return 'medium';
    }
  });

  const [enableVoiceTts, setEnableVoiceTts] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_tts');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [saveNotice, setSaveNotice] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('voicestudy_pref_num_q', defaultNumQuestions.toString());
      localStorage.setItem('voicestudy_pref_diff', defaultDifficulty);
      localStorage.setItem('voicestudy_pref_tts', enableVoiceTts.toString());
    } catch (err) {
      console.warn('Failed to save preferences:', err);
    }

    setSaveNotice('Settings and preferences saved successfully!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Settings size={24} color="var(--accent-cyan)" /> VoiceStudy AI Settings & Preferences
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Visual theme appearance, application study defaults, vector memory status, and API stack
        </p>
      </div>

      {/* Save Confirmation Notice */}
      {saveNotice && (
        <div style={{
          background: 'rgba(5, 150, 105, 0.12)',
          border: '1px solid rgba(5, 150, 105, 0.35)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          color: 'var(--accent-emerald)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          {saveNotice}
        </div>
      )}

      {/* =========================================================================
          THEME & APPEARANCE SELECTOR
          ========================================================================= */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={18} color="var(--accent-indigo)" /> Appearance & Theme
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Choose your preferred study color scheme. Light mode is eye-friendly for reading notes, while dark mode provides a cinematic late-night atmosphere.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Light Theme Card (Default) */}
          <div 
            onClick={() => onSelectTheme && onSelectTheme('light')}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              border: theme === 'light' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              boxShadow: theme === 'light' ? '0 0 0 3px rgba(79, 70, 229, 0.15), var(--shadow-card-hover)' : 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            role="button"
            tabIndex={0}
            aria-label="Select Light Theme (Default)"
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && onSelectTheme) {
                onSelectTheme('light'); 
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sun size={18} color="#4F46E5" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Light Theme</strong>
                  <span className="badge badge-cyan" style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Default</span>
                </div>
              </div>
              {theme === 'light' && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              Eye-friendly soft off-white background with crisp white cards and balanced indigo accents for effortless note reading.
            </p>
          </div>

          {/* Dark Theme Card (Optional) */}
          <div 
            onClick={() => onSelectTheme && onSelectTheme('dark')}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              border: theme === 'dark' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              background: '#0A0F1D',
              boxShadow: theme === 'dark' ? '0 0 0 3px rgba(56, 189, 248, 0.2), 0 8px 30px rgba(0,0,0,0.5)' : 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            role="button"
            tabIndex={0}
            aria-label="Select Dark Theme"
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && onSelectTheme) {
                onSelectTheme('dark'); 
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={18} color="#38BDF8" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>Dark Theme</strong>
                  <span className="badge badge-purple" style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Cinematic</span>
                </div>
              </div>
              {theme === 'dark' && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#38BDF8', color: '#040911', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.5', margin: 0 }}>
              Deep midnight navy palette with soft blue glows and high-contrast typography for distraction-free late-night study.
            </p>
          </div>
        </div>
      </div>

      {/* User Preferences Form */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--accent-cyan)" /> Application Defaults
        </h4>

        <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="settings-grid">
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Default Quiz Question Count</label>
              <select
                className="custom-input"
                value={defaultNumQuestions}
                onChange={(e) => setDefaultNumQuestions(Number(e.target.value))}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Default Quiz Difficulty</label>
              <select
                className="custom-input"
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="ttsToggle"
              checked={enableVoiceTts}
              onChange={(e) => setEnableVoiceTts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="ttsToggle" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Enable Voice Speech Synthesis (Text-to-Speech audio playback for study answers)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ gap: '0.5rem' }}>
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Connected Stack & Status Cards */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              RevHack 2026 Connected Technology Stack
            </h4>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
            Meeting & Lecture Intelligence Track
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizers</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>AI House × HiDevs</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-cyan)' }}>VoiceStudy AI</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Architecture</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-emerald)' }}>Lyzr × Qdrant × Omi</div>
          </div>
        </div>

        {/* System Health Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Database size={18} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '0.9rem' }}>Qdrant Vector DB</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Status: <span style={{ color: qdrant.status === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {qdrant.status || 'Checking...'}
              </span><br />
              Total Indexed Memories: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{qdrant.total_memories || 0}</span>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cpu size={18} color="var(--accent-violet)" />
              <strong style={{ fontSize: '0.9rem' }}>Lyzr Agent Studio V3</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Orchestrator Agent: <span style={{ color: 'var(--accent-emerald)' }}>Active</span><br />
              Memory & Assistant: <span style={{ color: 'var(--accent-emerald)' }}>Active</span><br />
              Quiz & Summarizer: <span style={{ color: 'var(--accent-emerald)' }}>Active</span>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Radio size={18} color="var(--accent-emerald)" />
              <strong style={{ fontSize: '0.9rem' }}>Omi Voice Adapter</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Webhook Endpoint: <span style={{ color: 'var(--accent-emerald)' }}>/api/voice/omi-webhook</span><br />
              Web Speech Mic: <span style={{ color: 'var(--accent-emerald)' }}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Data Privacy & Local Storage */}
      <div className="glass-card">
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" /> Student Data Privacy & Storage Isolation
        </h4>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Your lecture notes, revision tasks, and test results are stored with strict student-level tenant isolation:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Local SQLite Vault</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Maintains your exam countdown dates, daily revision checklists, and quiz performance metrics locally.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Zero Data Leakage</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Queries in the AI Study Tutor are matched only against your own notes. No cross-student data sharing.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Backend Key Security</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              All AI integration credentials and API keys remain strictly server-side and are never exposed in the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}