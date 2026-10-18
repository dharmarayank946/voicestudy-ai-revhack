import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  HelpCircle, 
  Brain, 
  Plus, 
  Info,
  Layers,
  GraduationCap,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { SUBJECT_CATEGORIES, getAllSubjects } from '../data/subjectLibrary';
import { uploadStudyMaterial } from '../services/api';

export default function SubjectLibraryView({ 
  onSelectSubject, 
  onSelectQuiz, 
  onFilterNotes, 
  setActiveTab 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSubject, setUploadSubject] = useState('Operating Systems');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [customSubjectsList, setCustomSubjectsList] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_custom_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allStandardSubjects = useMemo(() => getAllSubjects(), []);

  // Filtered subjects based on category and search query
  const filteredSubjects = useMemo(() => {
    let list = allStandardSubjects;

    // Append custom subjects if viewing 'all' or 'custom'
    if (customSubjectsList.length > 0) {
      const customFormatted = customSubjectsList.map(name => ({
        id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        categoryId: 'custom',
        categoryName: 'Custom Course',
        accentColor: 'var(--accent-indigo)',
        defaultTopic: 'Core Concepts & Lectures',
        isCustom: true
      }));

      if (selectedCategory === 'custom') {
        list = customFormatted;
      } else if (selectedCategory === 'all') {
        list = [...customFormatted, ...list];
      }
    }

    if (selectedCategory !== 'all' && selectedCategory !== 'custom') {
      list = list.filter(s => s.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.categoryName.toLowerCase().includes(q) ||
        (s.defaultTopic && s.defaultTopic.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allStandardSubjects, selectedCategory, searchQuery, customSubjectsList]);

  const handleAddCustomSubject = (e) => {
    if (e) e.preventDefault();
    const clean = customSubjectInput.trim();
    if (!clean) return;
    if (!customSubjectsList.includes(clean)) {
      const updated = [clean, ...customSubjectsList];
      setCustomSubjectsList(updated);
      try {
        localStorage.setItem('voicestudy_custom_subjects', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save custom subject:', err);
      }
    }
    setCustomSubjectInput('');
    // Optionally launch directly into study
    if (onSelectSubject) {
      onSelectSubject(clean, 'Core Concepts & Overview');
    }
  };

  const handleStudyClick = (subjectName, topic) => {
    if (onSelectSubject) {
      onSelectSubject(subjectName, topic || `${subjectName} Lecture`);
    } else if (setActiveTab) {
      setActiveTab('study');
    }
  };

  const handleQuizClick = (topic) => {
    if (onSelectQuiz) {
      onSelectQuiz(topic);
    } else if (setActiveTab) {
      setActiveTab('quiz');
    }
  };

  const handleNotesClick = (subjectName) => {
    if (onFilterNotes) {
      onFilterNotes(subjectName);
    } else if (setActiveTab) {
      setActiveTab('memory');
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Uploaded file exceeds maximum limit of 2MB.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setUploadNotice(null);
    try {
      const text = await file.text();
      const res = await uploadStudyMaterial(file.name, text, uploadSubject || 'General');
      setUploadNotice(res.message);
      setTimeout(() => setUploadNotice(null), 5000);
      setShowUploadModal(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload material.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Upload Notification Banner */}
      {uploadNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid var(--accent-emerald)',
          color: 'var(--accent-emerald)',
          fontWeight: '600',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={16} />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-cyan" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <GraduationCap size={14} /> Course Materials & Academic Catalog
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            My Materials & Course Library
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '640px' }}>
            Browse supported academic curricula or upload your syllabus & lecture notes to chunk directly into Qdrant vector memory.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
            style={{
              padding: '0 1rem',
              height: '38px',
              fontSize: '0.84rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Upload size={15} />
            <span>Upload Material (&le;2MB)</span>
          </button>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search subjects or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem', fontSize: '0.86rem', height: '38px' }}
              aria-label="Search academic subjects"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            animation: 'fadeIn 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="var(--brand-violet)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Upload Study Material
                </h3>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setUploadError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Upload your syllabus text, lecture notes, or markdown files (&le; 2MB). Our safe chunker embeds them into Qdrant for your personal AI study tutor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Target Subject</label>
              <input
                type="text"
                className="custom-input"
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                style={{ height: '38px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.75rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--bg-secondary)',
              cursor: 'pointer'
            }}>
              <FileText size={28} color="var(--brand-violet)" />
              <label style={{ cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', color: 'var(--brand-violet)' }}>
                {isUploading ? 'Chunking & Embedding into Qdrant...' : 'Choose File to Upload (.txt, .md, .json)'}
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv,.py"
                  onChange={handleUploadFile}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Max file size: 2MB • Embedded with strict UID isolation
              </span>
            </div>

            {uploadError && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Subject Bar */}
      <form 
        onSubmit={handleAddCustomSubject}
        className="glass-card" 
        style={{ 
          padding: '1rem 1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1rem',
          background: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} color="var(--accent-indigo)" />
          </div>
          <div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Studying an unlisted course or specialized topic?</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Add custom subjects anytime. VoiceStudy AI adapts reasoning and vector memories dynamically.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px', maxWidth: '440px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. Quantum Computing, Bioinformatics..."
            value={customSubjectInput}
            onChange={(e) => setCustomSubjectInput(e.target.value)}
            style={{ fontSize: '0.85rem' }}
            aria-label="Enter custom subject name"
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!customSubjectInput.trim()}
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', whiteSpace: 'nowrap' }}
          >
            Add & Study &rarr;
          </button>
        </div>
      </form>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '10px',
            border: selectedCategory === 'all' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
            background: selectedCategory === 'all' ? 'var(--accent-indigo)' : 'var(--bg-card)',
            color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: selectedCategory === 'all' ? '700' : '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'var(--shadow-card)',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={14} /> All Disciplines ({allStandardSubjects.length + customSubjectsList.length})
        </button>

        {customSubjectsList.length > 0 && (
          <button
            onClick={() => setSelectedCategory('custom')}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '10px',
              border: selectedCategory === 'custom' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              background: selectedCategory === 'custom' ? 'var(--accent-indigo)' : 'var(--bg-card)',
              color: selectedCategory === 'custom' ? '#FFFFFF' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: selectedCategory === 'custom' ? '700' : '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedCategory === 'custom' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'var(--shadow-card)',
              transition: 'all 0.15s ease'
            }}
          >
            My Custom Courses ({customSubjectsList.length})
          </button>
        )}

        {SUBJECT_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '10px',
                border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--accent-indigo)' : 'var(--bg-card)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'var(--shadow-card)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.name} ({cat.subjects.length})
            </button>
          );
        })}
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px dashed var(--border-subtle)' }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No subjects found matching "{searchQuery}"
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Try a different search term or add it as a custom subject above!
          </p>
          <button 
            className="btn-secondary"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredSubjects.map((sub) => (
            <div 
              key={sub.id} 
              className="glass-card glass-card-interactive"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                background: 'var(--bg-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span 
                    className="badge"
                    style={{ 
                      background: 'rgba(79, 70, 229, 0.08)', 
                      color: 'var(--accent-indigo)',
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                      fontSize: '0.72rem'
                    }}
                  >
                    {sub.categoryName}
                  </span>
                  {sub.popular && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                      Popular
                    </span>
                  )}
                  {sub.isCustom && (
                    <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                      Custom
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                  {sub.name}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Focus: <strong style={{ color: 'var(--text-secondary)' }}>{sub.defaultTopic || 'Core Principles'}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleStudyClick(sub.name, sub.defaultTopic)}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem 0.65rem', justifyContent: 'center' }}
                  title={`Start studying ${sub.name}`}
                >
                  <Sparkles size={13} /> Study Course
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleQuizClick(sub.defaultTopic || sub.name)}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}
                  title={`Generate revision quiz for ${sub.name}`}
                >
                  <HelpCircle size={13} color="var(--accent-purple)" /> Quiz
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleNotesClick(sub.name)}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.65rem' }}
                  title={`View saved notes for ${sub.name}`}
                >
                  <Brain size={13} color="var(--accent-cyan)" /> Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Truth and Grounding Notice */}
      <div 
        style={{
          padding: '1.1rem 1.35rem',
          borderRadius: '12px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6'
        }}
      >
        <Info size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>AI Curriculum Grounding Note:</strong> VoiceStudy AI leverages zero-shot multi-agent reasoning (Lyzr Agent Studio) and Qdrant 1536-dimensional vector embeddings across all academic disciplines. Quizzes and study notes are grounded strictly in the lecture material and verified notes you provide to eliminate AI hallucinations.
        </div>
      </div>

    </div>
  );
}
