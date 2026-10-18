import React from 'react';
import { 
  LayoutDashboard,
  BookOpen, 
  Mic, 
  HelpCircle, 
  RotateCw, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Brain, 
  Wand2, 
  BarChart3, 
  Zap, 
  Settings, 
  LifeBuoy, 
  User, 
  Sparkles, 
  Radio, 
  X, 
  Sun, 
  Moon,
  Compass
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  healthData, 
  isOpen, 
  onClose, 
  theme, 
  onToggleTheme 
}) {
  const totalMemories = healthData?.vector_memory?.total_memories || 0;
  const qdrantConnected = healthData?.vector_memory?.status === 'connected';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'home', label: 'Home', icon: Compass },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'workspaces', label: 'AI Workspaces', icon: Wand2 },
      ]
    },
    {
      title: 'STUDY & PRACTICE',
      items: [
        { id: 'study', label: 'Student Study', icon: BookOpen },
        { id: 'voice', label: 'Voice Study Room', icon: Mic },
        { id: 'quiz', label: 'Quiz & Practice', icon: HelpCircle },
        { id: 'flashcards', label: 'Flashcards', icon: RotateCw },
        { id: 'revision', label: 'Revision Planner', icon: Calendar },
      ]
    },
    {
      title: 'KNOWLEDGE & INTELLIGENCE',
      items: [
        { id: 'notes', label: 'Smart Notes', icon: FileText, badge: totalMemories > 0 ? totalMemories : null },
        { id: 'materials', label: 'My Materials', icon: GraduationCap },
        { id: 'memory', label: 'AI Vector Memory', icon: Brain },
        { id: 'analyzer', label: 'AI Analyzer', icon: Wand2 },
        { id: 'progress', label: 'Progress & Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'ACCOUNT & PREFERENCES',
      items: [
        { id: 'pricing', label: 'Pricing & Plans', icon: Zap },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'help', label: 'Help & Guide', icon: LifeBuoy },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside 
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: '265px',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem 0.85rem',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
        aria-label="Main Navigation Sidebar"
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem 1.25rem 0.5rem' }}>
          <div 
            onClick={() => handleNavClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(115, 87, 255, 0.4)'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.18rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                VoiceStudy <span style={{ color: 'var(--brand-violet)' }}>AI</span>
              </h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>
                Speak. Remember. Revise.
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.25rem'
        }}>
          {navSections.map((section, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                padding: '0.25rem 0.75rem',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                // Handle alias match (materials -> subjects, notes -> memory)
                const isActive = activeTab === item.id || 
                  (item.id === 'materials' && activeTab === 'subjects') ||
                  (item.id === 'notes' && activeTab === 'notes');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.62rem 0.85rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? 'rgba(115, 87, 255, 0.14)' : 'transparent',
                      color: isActive ? 'var(--brand-violet)' : 'var(--text-secondary)',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(115, 87, 255, 0.06)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} color={isActive ? 'var(--brand-violet)' : 'var(--text-muted)'} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>

                    {item.badge !== undefined && item.badge !== null && (
                      <span className="badge badge-emerald" style={{ padding: '0.12rem 0.45rem', fontSize: '0.68rem', marginLeft: 'auto' }}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '20%',
                        bottom: '20%',
                        width: '3px',
                        borderRadius: '4px',
                        background: 'var(--brand-violet)'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Integration Badges & Theme Toggle Footer */}
        <div style={{
          marginTop: '0.75rem',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '0.85rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-card)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Brain size={13} color="var(--brand-violet)" /> Qdrant Vector
            </span>
            <span style={{ color: qdrantConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: '700' }}>
              ● {qdrantConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Radio size={13} color="var(--accent-emerald)" /> Omi Wearable
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem' }}>
              Receiver Ready
            </span>
          </div>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                marginTop: '0.25rem',
                transition: 'all 0.18s ease'
              }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {theme === 'light' ? <Sun size={13} color="var(--accent-indigo)" /> : <Moon size={13} color="var(--accent-cyan)" />}
                <span>{theme === 'light' ? 'Light Theme' : 'Dark Mode'}</span>
              </span>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Toggle
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
