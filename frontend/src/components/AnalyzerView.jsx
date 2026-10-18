import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  ListTodo, 
  Copy, 
  Check, 
  BookmarkPlus, 
  AlertCircle
} from 'lucide-react';
import { analyzeTranscript, saveMemory } from '../services/api';

const SAMPLE_TRANSCRIPTS = {
  os_paging: {
    title: 'Operating Systems — Virtual Memory & Paging Lecture',
    subject: 'Operating Systems',
    text: `Professor lecture on Virtual Memory management:
Today we covered paging and why virtual memory is essential for process isolation and multiprogramming.
Paging divides physical memory into fixed-size blocks called frames and logical memory into blocks called pages.
When a process references a page not currently in main memory, the MMU triggers a Page Fault interrupt. The operating system handles this by fetching the missing page from backing store disk.
Page replacement algorithms: FIFO is simple but suffers from Belady's Anomaly where adding more frames causes more page faults. LRU (Least Recently Used) is widely used and does not suffer from Belady's Anomaly because it belongs to the stack algorithm family.
Action items for students:
1. Complete assignment 4 on LRU simulation by Friday 5 PM (assigned to individual students).
2. Review page table entry protection bits before next Monday's lab.`
  },
  dbms_locking: {
    title: 'DBMS — Concurrency Control & Two-Phase Locking',
    subject: 'DBMS',
    text: `Database Systems class on Concurrency Control:
In transaction processing, the ACID properties guarantee database consistency. Two-Phase Locking (2PL) is a concurrency control protocol that guarantees conflict serializability.
2PL has two phases: Growing Phase (locks may be acquired but not released) and Shrinking Phase (locks may be released but not acquired).
Basic 2PL does not prevent cascading aborts. Strict 2PL solves this by holding all exclusive (X) locks until the transaction commits or aborts. Rigorous 2PL holds both shared and exclusive locks until commit.
Action items:
1. Review the differences between Conflict Serializability and View Serializability for the mid-sem quiz on Wednesday.
2. Submit problem set 3 on Deadlock Detection algorithms by next Thursday.`
  }
};

export default function AnalyzerView({ _setActiveTab, onSelectQuizTopic }) {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPTS.os_paging.text);
  const [subject, setSubject] = useState(SAMPLE_TRANSCRIPTS.os_paging.subject);
  const [analysisType, setAnalysisType] = useState('all'); // 'all', 'summary', 'action_items'
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!transcript.trim()) {
      setError('Please provide or paste a lecture transcript to analyze.');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setSavedSuccess(false);

    try {
      const data = await analyzeTranscript(transcript.trim(), analysisType, subject);
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check backend connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (key) => {
    const sample = SAMPLE_TRANSCRIPTS[key];
    if (sample) {
      setTranscript(sample.text);
      setSubject(sample.subject);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleCopy = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleSaveToNotes = async () => {
    if (!analysisResult) return;
    setIsSaving(true);
    try {
      const textToSave = `${analysisResult.summary || ''}\n\n${analysisResult.action_items || ''}`.trim() || transcript.slice(0, 500);
      await saveMemory(
        textToSave,
        subject || 'General Study',
        `Analyzed Digest: ${subject}`,
        'lecture_summary'
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert(`Failed to save note: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <Wand2 size={14} color="var(--brand-violet)" />
          <span>MEETING & LECTURE INTELLIGENCE</span>
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          AI Lecture Analyzer
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
          Transform raw lecture transcripts into structured concept digests, exam takeaways, and action items without hallucination.
        </p>
      </div>

      {/* Input Workspace */}
      <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sample presets strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <Sparkles size={15} color="var(--brand-violet)" />
            <span>Load Curated Sample:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleLoadSample('os_paging')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              OS Virtual Memory Lecture
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('dbms_locking')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              DBMS Concurrency Control
            </button>
          </div>
        </div>

        {/* Textarea for transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Lecture / Audio Transcript
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {transcript.length} characters
            </span>
          </div>
          <textarea
            className="custom-input"
            rows={7}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your professor's lecture notes, recorded class transcript, or meeting notes here..."
            style={{ fontSize: '0.88rem', lineHeight: '1.55', resize: 'vertical' }}
          />
        </div>

        {/* Controls row: Subject, Mode, and Run button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Subject Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>Subject:</span>
              <input
                type="text"
                className="custom-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                style={{ height: '36px', fontSize: '0.82rem', width: '180px' }}
              />
            </div>

            {/* Analysis Mode Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>Extract:</span>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="custom-input"
                style={{ height: '36px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
              >
                <option value="all">Full Analysis (Digest + Action Items)</option>
                <option value="summary">Lecture Digest & Definitions only</option>
                <option value="action_items">Action Items & Deadlines Table only</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '700'
            }}
          >
            <Wand2 size={17} />
            <span>{isAnalyzing ? 'Analyzing with Lyzr...' : 'Analyze Lecture'}</span>
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid var(--accent-rose)',
            color: 'var(--accent-rose)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Output Results */}
      {analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
          {/* Action bar on result */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.78rem' }}>
                ● Analysis Verified by {analysisResult.agent_executed}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Processed {analysisResult.transcript_length} characters
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={handleSaveToNotes}
                disabled={isSaving || savedSuccess}
                className="btn-secondary"
                style={{
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <BookmarkPlus size={15} color={savedSuccess ? 'var(--accent-emerald)' : 'var(--brand-violet)'} />
                <span>{savedSuccess ? 'Saved to Smart Notes!' : isSaving ? 'Saving...' : 'Save to Smart Notes'}</span>
              </button>

              {onSelectQuizTopic && (
                <button
                  onClick={() => onSelectQuizTopic(subject)}
                  className="btn-primary"
                  style={{
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Sparkles size={15} />
                  <span>Generate Quiz from Digest</span>
                </button>
              )}
            </div>
          </div>

          {/* Key terms chips */}
          {analysisResult.key_terms && analysisResult.key_terms.length > 0 && (
            <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                Extracted Key Concepts:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {analysisResult.key_terms.map((term, i) => (
                  <span key={i} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Structured Summary Digest */}
          {analysisResult.summary && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  <FileText size={18} color="var(--brand-violet)" />
                  <span>Structured Lecture Digest</span>
                </div>
                <button
                  onClick={() => handleCopy(analysisResult.summary, 'summary')}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedSection === 'summary' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                  <span>{copiedSection === 'summary' ? 'Copied' : 'Copy Digest'}</span>
                </button>
              </div>

              <div style={{
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                lineHeight: '1.65',
                whiteSpace: 'pre-line'
              }}>
                {analysisResult.summary}
              </div>
            </div>
          )}

          {/* Extracted Action Items & Deadlines */}
          {analysisResult.action_items && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  <ListTodo size={18} color="var(--accent-emerald)" />
                  <span>Action Items, Deadlines & Decisions</span>
                </div>
                <button
                  onClick={() => handleCopy(analysisResult.action_items, 'actions')}
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copiedSection === 'actions' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                  <span>{copiedSection === 'actions' ? 'Copied' : 'Copy Tasks'}</span>
                </button>
              </div>

              <div style={{
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                lineHeight: '1.65',
                whiteSpace: 'pre-line'
              }}>
                {analysisResult.action_items}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
