import React, { useState } from 'react';
import { 
  Brain, 
  Search, 
  Trash2, 
  Database, 
  Lock, 
  Copy, 
  Check, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { searchMemories, deleteMemory } from '../services/api';

export default function AIMemoryView({ 
  memories = [], 
  onRefreshMemories, 
  onSelectQuizTopic 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const displayedMemories = searchResults !== null ? searchResults : memories;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchMemories(searchQuery.trim(), 15);
      setSearchResults(res.results || []);
    } catch (err) {
      console.warn('Vector search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory from Qdrant vector storage? This permanently removes the 1536-dimensional vector point.')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteMemory(id);
      if (onRefreshMemories) onRefreshMemories();
      if (searchResults) {
        setSearchResults(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <Database size={14} color="var(--brand-violet)" />
            <span>QDRANT VECTOR DATABASE INSPECTOR</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            AI Vector Memory
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Inspect persistent 1536-dimensional semantic embeddings, collection topology, and tenant isolation.
          </p>
        </div>

        {onRefreshMemories && (
          <button
            onClick={onRefreshMemories}
            className="btn-secondary"
            style={{ fontSize: '0.84rem', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} />
            <span>Refresh Vector Store</span>
          </button>
        )}
      </div>

      {/* Vector Database Architecture Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Collection Name</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>study_memories</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--brand-violet)', marginTop: '0.35rem' }}>Qdrant Vector Engine</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Vector Dimension</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>1536 Dimensions</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>text-embedding-3-small</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Distance Metric</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Cosine Similarity</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginTop: '0.35rem' }}>Threshold: 0.70 score</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tenant Isolation</span>
            <Lock size={14} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Strict UID Filter</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Multi-Tenant Segregated</div>
        </div>
      </div>

      {/* Semantic Vector Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="custom-input"
              placeholder="Search via semantic vector similarity (e.g. 'How does Strict 2PL prevent cascading aborts?')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.88rem' }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSearching}
            style={{ padding: '0 1.25rem', height: '42px', fontSize: '0.88rem' }}
          >
            {isSearching ? 'Vector Searching...' : 'Vector Search'}
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="btn-secondary"
              style={{ padding: '0 1rem', height: '42px', fontSize: '0.88rem' }}
            >
              Show All ({memories.length})
            </button>
          )}
        </form>
      </div>

      {/* Memory Point List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          <span>
            {searchResults !== null 
              ? `Found ${searchResults.length} semantically relevant vector points` 
              : `Total Indexed Vector Points: ${memories.length}`}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Click note to quiz or study
          </span>
        </div>

        {displayedMemories.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Brain size={38} style={{ margin: '0 auto 0.75rem auto', opacity: 0.35 }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
              No Vector Points Found
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchResults !== null 
                ? 'Try a broader semantic query or clear the vector search filter.' 
                : 'Speak in the Voice Study room or use Smart Notes to store your first vector memory.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {displayedMemories.map((mem) => (
              <div
                key={mem.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                      {mem.subject || 'General'}
                    </span>
                    {mem.topic && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                        {mem.topic}
                      </span>
                    )}
                  </div>

                  {mem.score !== undefined && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      Score: {mem.score.toFixed(3)}
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.55',
                  margin: 0,
                  flex: 1
                }}>
                  {mem.text}
                </p>

                {/* Point ID & Metadata */}
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span title={mem.id}>ID: {mem.id.slice(0, 10)}...</span>
                  <span>{mem.created_at ? new Date(mem.created_at).toLocaleDateString() : 'Active'}</span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleCopy(mem.text, mem.id)}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Copy note text"
                    >
                      {copiedId === mem.id ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                      <span>{copiedId === mem.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    {onSelectQuizTopic && (
                      <button
                        onClick={() => onSelectQuizTopic(mem.topic || mem.subject)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Generate revision quiz for this topic"
                      >
                        <HelpCircle size={13} color="var(--brand-violet)" />
                        <span>Quiz</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(mem.id)}
                    disabled={deletingId === mem.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '0.35rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Permanently remove from Qdrant vector database"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
