import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Search, 
  Trash2, 
  Plus, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  XCircle, 
  Copy, 
  Check, 
  HelpCircle, 
  Download,
  RotateCw 
} from 'lucide-react';
import { saveMemory, deleteMemory, searchMemories } from '../services/api';

export default function MemoryView({ 
  memories = [], 
  onRefreshMemories, 
  setActiveTab, 
  onSelectQuizTopic,
  initialSearchQuery = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null); // { id, topic }
  const [deleteError, setDeleteError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // New Note Form state
  const [newText, setNewText] = useState('');
  const [newSubject, setNewSubject] = useState('DBMS');
  const [newTopic, setNewTopic] = useState('Concurrency Control');

  // Synchronize global search from Navbar
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery.trim());
      setIsSearching(true);
      searchMemories(initialSearchQuery.trim(), 10, selectedSubject)
        .then(res => setSearchResults(res.results || []))
        .catch(err => setSearchError(err.message || 'Search failed'))
        .finally(() => setIsSearching(false));
    }
  }, [initialSearchQuery, selectedSubject]);

  // Dynamic Subject Pill List
  const defaultSubjects = ['All', 'DBMS', 'Computer Networks', 'Operating Systems', 'Mathematics'];
  const extractedSubjects = Array.from(new Set(memories.map(m => m.subject).filter(Boolean)));
  const subjects = Array.from(new Set([...defaultSubjects, ...extractedSubjects]));

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchMemories(searchQuery, 10, selectedSubject);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.message || 'Semantic search failed. Check backend connection.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError(null);
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newText.trim()) {
      setSaveError('Memory text content cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveMemory(newText.trim(), newSubject.trim() || 'General', newTopic.trim() || 'Study Topic', 'text_note');
      setNewText('');
      setShowAddModal(false);
      if (onRefreshMemories) onRefreshMemories();
    } catch (err) {
      setSaveError(err.message || 'Failed to save memory to Qdrant.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id, topic) => {
    setConfirmDeleteModal({ id, topic: topic || 'this study note' });
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!confirmDeleteModal) return;
    const { id } = confirmDeleteModal;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteMemory(id);
      if (searchResults) {
        setSearchResults(prev => prev ? prev.filter(m => m.id !== id) : null);
      }
      setConfirmDeleteModal(null);
      if (onRefreshMemories) onRefreshMemories();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete note from Qdrant.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyNote = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isSubjectMatch = (memorySubject, filterSubject) => {
    if (!filterSubject || filterSubject === 'All') return true;
    if (!memorySubject) return false;
    const mSub = memorySubject.toLowerCase().trim();
    const fSub = filterSubject.toLowerCase().trim();
    return mSub === fSub || mSub.includes(fSub) || fSub.includes(mSub);
  };

  const displayedMemories = searchResults !== null 
    ? (selectedSubject === 'All' ? searchResults : searchResults.filter(m => isSubjectMatch(m.subject, selectedSubject)))
    : memories.filter(m => isSubjectMatch(m.subject, selectedSubject));

  const handleExportAll = useCallback(() => {
    if (!displayedMemories || displayedMemories.length === 0) return;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString();
    const timeFormatted = now.toLocaleTimeString();
    const isoDate = now.toISOString().slice(0, 10);
    const content = `# VoiceStudy AI — Study Notes Export\n` +
      `Exported: ${dateFormatted} at ${timeFormatted}\n` +
      `Total Notes: ${displayedMemories.length}\n\n---\n\n` +
      displayedMemories.map((m, idx) => (
        `## ${idx + 1}. ${m.topic || 'Note'} [${m.subject || 'General'}]\n` +
        `**Date:** ${m.date_display || 'Recent'}\n\n` +
        `${m.text}\n\n`
      )).join('---\n\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VoiceStudy_Notes_Export_${isoDate}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [displayedMemories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={24} color="var(--accent-cyan)" /> Persistent Qdrant Vector Memory
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Study memories are embedded into 1536-dimensional vectors for semantic search & active recall
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {displayedMemories.length > 0 && (
            <>
              {setActiveTab && (
                <button 
                  className="btn-secondary" 
                  onClick={() => setActiveTab('flashcards')} 
                  style={{ gap: '0.4rem', fontSize: '0.85rem' }}
                  title="Practice all saved notes in Active Recall Flashcards"
                >
                  <RotateCw size={15} color="var(--accent-emerald)" /> Study Flashcards
                </button>
              )}
              <button className="btn-secondary" onClick={handleExportAll} style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
                <Download size={16} /> Export All (.md)
              </button>
            </>
          )}
          <button className="btn-primary" onClick={() => { setShowAddModal(!showAddModal); setSaveError(null); }}>
            <Plus size={18} /> Add Study Note
          </button>
        </div>
      </div>

      {/* Add Memory Form Modal */}
      {showAddModal && (
        <div className="glass-card" style={{ borderColor: 'var(--accent-cyan)', background: 'rgba(13, 18, 29, 0.95)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            + Create New Study Memory
          </h4>

          {saveError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Subject</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. DBMS"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Topic</label>
                <input
                  type="text"
                  className="custom-input"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Concurrency Control"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Study Notes / Text</label>
              <textarea
                className="custom-input"
                rows={3}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What did you study? Speak or write details here..."
                disabled={isSaving}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving to Qdrant...' : 'Save to Qdrant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Error Banner */}
      {searchError && (
        <div className="glass-card" style={{ background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.4)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem' }}>
          <AlertCircle size={18} />
          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{searchError}</span>
        </div>
      )}

      {/* Search and Subject Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Subject Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setSearchError(null);
                if (searchQuery.trim()) {
                  setIsSearching(true);
                  searchMemories(searchQuery.trim(), 10, sub)
                    .then(res => setSearchResults(res.results || []))
                    .catch(err => setSearchError(err.message || 'Search failed'))
                    .finally(() => setIsSearching(false));
                } else {
                  setSearchResults(null);
                }
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '20px',
                border: selectedSubject === sub ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: selectedSubject === sub ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedSubject === sub ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Semantic Search Box */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', minWidth: '340px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="custom-input"
              placeholder="Semantic vector search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '1rem', paddingRight: searchQuery ? '2.2rem' : '1rem', height: '38px', fontSize: '0.85rem', width: '100%' }}
              disabled={isSearching}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Clear search"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 1rem', height: '38px' }} disabled={isSearching}>
            {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </form>
      </div>

      {/* Active Search Banner */}
      {searchResults !== null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(0, 242, 254, 0.08)', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
          <span>Showing {searchResults.length} semantic search result(s) for "{searchQuery}"</span>
          <button onClick={handleClearSearch} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
            Show All Memories
          </button>
        </div>
      )}

      {/* Memories Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {displayedMemories.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <Brain size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ color: 'var(--text-secondary)' }}>
              {searchResults !== null ? `No memories found matching "${searchQuery}"` : 'No memories found matching your criteria'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {searchResults !== null ? 'Try a different search query or clear the filter.' : 'Add a new study memory or speak to record notes.'}
            </p>
            {searchResults !== null && (
              <button className="btn-secondary" onClick={handleClearSearch} style={{ marginTop: '1rem', gap: '0.5rem' }}>
                <XCircle size={16} /> Clear Search
              </button>
            )}
          </div>
        ) : (
          displayedMemories.map((m) => (
            <div key={m.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-cyan">{m.subject || 'General'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {setActiveTab && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectQuizTopic) onSelectQuizTopic(m.topic || m.subject);
                          setActiveTab('quiz');
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', gap: '0.3rem', border: '1px solid rgba(139, 92, 246, 0.4)', color: 'var(--accent-purple)' }}
                        title="Practice revision quiz on this note"
                      >
                        <HelpCircle size={12} /> Quiz
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('flashcards');
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', gap: '0.3rem', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--accent-emerald)' }}
                        title="Study this note in Active Recall Flashcard deck"
                      >
                        <RotateCw size={12} /> Card
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyNote(m.id, m.text);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Copy note text"
                  >
                    {copiedId === m.id ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} color="var(--text-muted)" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(m.id, m.topic);
                    }}
                    disabled={deletingId === m.id}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete memory"
                    aria-label="Delete study note"
                  >
                    <Trash2 size={14} color={deletingId === m.id ? 'var(--text-muted)' : 'var(--accent-rose)'} />
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {m.topic || 'Study Note'}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {m.text}
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> {m.date_display || 'Recently saved'}
                </span>
                {m.score && (
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>
                    Match: {Math.round(m.score * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Accessible In-App Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div 
          className="sidebar-backdrop" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1001 }}
          onClick={() => { if (!deletingId) setConfirmDeleteModal(null); }}
        >
          <div 
            className="glass-card" 
            style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-card-hover)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog" 
            aria-labelledby="delete-dialog-title" 
            aria-modal="true"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} color="var(--accent-rose)" />
              </div>
              <div>
                <h4 id="delete-dialog-title" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Delete Study Note
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qdrant Vector Deletion</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete <strong>"{confirmDeleteModal.topic}"</strong> from your saved study notebook? This cannot be undone.
            </p>

            {deleteError && (
              <div style={{ background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.35)', borderRadius: '8px', padding: '0.6rem 0.85rem', marginBottom: '1rem', color: 'var(--accent-rose)', fontSize: '0.82rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDeleteModal(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'var(--accent-rose)', color: '#FFFFFF', border: 'none' }}
                onClick={executeDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}