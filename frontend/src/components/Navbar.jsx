import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  Sun, 
  Moon, 
  HelpCircle, 
  User, 
  Zap 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab,
  onQuickSearch, 
  onToggleMobileMenu, 
  theme = 'light', 
  onToggleTheme 
}) {
  const [query, setQuery] = useState('');

  const titles = {
    home: 'Platform Overview',
    dashboard: 'Student Command Center',
    study: 'AI Study Tutor Workspace',
    voice: 'Immersive Voice Study Room',
    materials: 'My Materials & Course Library',
    subjects: 'My Materials & Course Library',
    notes: 'Smart Notes Notebook',
    quiz: 'Active Recall Practice Quiz',
    flashcards: 'Active Recall Flashcards',
    revision: 'Smart Revision Planner',
    memory: 'AI Vector Memory Inspector',
    analyzer: 'AI Lecture Analyzer',
    progress: 'Study Progress & Analytics',
    pricing: 'Subscription & Plans',
    settings: 'System Configuration',
    help: 'Student Help & Guide',
    profile: 'Student Profile & Goals'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onQuickSearch) {
      onQuickSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <header style={{
      padding: '0.85rem 1.5rem',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-navbar)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.015em' }}>
            {titles[activeTab] || 'VoiceStudy AI'}
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>
            Lyzr Multi-Agent • Qdrant Vector Memory • Omi Voice Layer • Study Vault
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', maxWidth: '520px', justifyContent: 'flex-end' }}>
        {/* Quick Search */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <input
            type="text"
            className="custom-input"
            placeholder="Search notes or concepts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.82rem' }}
            aria-label="Search study memories"
          />
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </form>

        {/* Upgrade Quick Button */}
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('pricing')}
            className="btn-primary"
            style={{
              height: '36px',
              padding: '0 0.75rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderRadius: '8px',
              flexShrink: 0
            }}
            title="View Student Plus Plan (₹199/month)"
          >
            <Zap size={14} />
            <span>₹199 Plus</span>
          </button>
        )}

        {/* Help Quick Icon */}
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('help')}
            className="btn-secondary"
            style={{
              height: '36px',
              width: '36px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              flexShrink: 0
            }}
            title="Help & Student Guide"
            aria-label="Open Help and Guide"
          >
            <HelpCircle size={16} />
          </button>
        )}

        {/* Profile Quick Icon */}
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('profile')}
            className="btn-secondary"
            style={{
              height: '36px',
              width: '36px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              flexShrink: 0
            }}
            title="Student Profile"
            aria-label="Open Student Profile"
          >
            <User size={16} />
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="btn-secondary"
            style={{
              height: '36px',
              width: '36px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              flexShrink: 0
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
          >
            {theme === 'light' ? <Moon size={15} color="var(--brand-violet)" /> : <Sun size={15} color="var(--accent-amber)" />}
          </button>
        )}
      </div>
    </header>
  );
}
