import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Layers, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  BookmarkPlus, 
  HelpCircle, 
  RotateCcw, 
  AlertCircle,
  Mic,
  Square,
  RotateCw,
  GraduationCap,
  X,
  Upload,
  Languages
} from 'lucide-react';
import { speechService } from '../services/speech';
import { processStudyRequest, saveMemory, uploadStudyMaterial } from '../services/api';
// OmiStatusCard removed from student view

export default function StudyView({ 
  setActiveTab, 
  onSelectQuizTopic,
  initialSubject = 'All',
  initialSession = null,
  onClearResumeSession,
  onOpenSubjectLibrary
}) {
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US'); // 'en-US' or 'kn-IN'
  const [responseData, setResponseData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'All');
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [resumedSession, setResumedSession] = useState(initialSession || null);
  
  // File upload & action states
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [studyQuizAnswers, setStudyQuizAnswers] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialSubject && initialSubject !== 'All') {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    if (initialSession) {
      setResumedSession(initialSession);
      if (initialSession.subject) {
        setSelectedSubject(initialSession.subject);
      }
      if (initialSession.topic) {
        setInputVal(`Continue studying: ${initialSession.topic}`);
      }
    }
  }, [initialSession]);

  const standardPills = ['All', 'DBMS', 'Operating Systems', 'Networks', 'Calculus', 'Physics', 'Pharmacology', 'Financial Accounting', 'General Aptitude'];
  const displaySubjects = standardPills.includes(selectedSubject) 
    ? standardPills 
    : (selectedSubject && selectedSubject !== 'All' ? ['All', selectedSubject, ...standardPills.filter(s => s !== 'All')] : standardPills);

  const sampleQueries = [
    { label: 'Science', query: 'How does photosynthesis work in green plants?' },
    { label: 'Networks', query: 'Compare TCP vs UDP transport layer protocols.' },
    { label: 'DBMS', query: 'How does Strict Two-Phase Locking prevent cascading aborts?' },
    { label: 'Python', query: 'Explain Python functions, variable scope, and return values.' },
    { label: 'Software Eng', query: 'What are the SOLID design principles in software engineering?' },
    { label: 'Meeting Intel', query: 'Summarize our project meeting and extract all action items, owners, and deadlines.' },
  ];

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setValidationError(null);
      speechService.startListening({
        lang: speechLang,
        onResult: ({ final, interim }) => {
          const current = final || interim;
          if (current) {
            setInputVal(prev => {
              if (final) return (prev ? prev.trim() + ' ' : '') + final.trim();
              return prev;
            });
          }
        },
        onError: (err) => {
          console.warn('Speech recognition error in StudyView:', err);
          setIsListening(false);
          setValidationError(`Microphone input unavailable for ${speechLang === 'kn-IN' ? 'Kannada' : 'English'}. You can type or paste notes.`);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setValidationError('Uploaded file exceeds maximum limit of 2MB.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);
    setUploadNotice(null);
    try {
      const text = await file.text();
      const res = await uploadStudyMaterial(file.name, text, selectedSubject !== 'All' ? selectedSubject : 'General');
      setUploadNotice(res.message);
      setTimeout(() => setUploadNotice(null), 5000);
    } catch (err) {
      setValidationError(err.message || 'Failed to process file upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (queryText = inputVal) => {
    const textToSend = typeof queryText === 'string' ? queryText : inputVal;
    if (!textToSend || !textToSend.trim()) {
      setValidationError('Please enter a question or lecture notes to proceed.');
      return;
    }

    if (isProcessing) return;

    setValidationError(null);
    setIsProcessing(true);
    setResponseData(null);
    setSavedToNotes(false);
    setCopied(false);
    setStudyQuizAnswers({});

    const newHistory = [...conversationHistory, { role: 'user', content: textToSend.trim() }];

    try {
      const subjectParam = selectedSubject !== 'All' ? selectedSubject : null;
      const data = await processStudyRequest(textToSend.trim(), 'text_fallback', subjectParam, null, newHistory);
      setResponseData(data);
      setLastFailedPrompt(null);
      const assistantMessage = data.message || '';
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: assistantMessage }
      ]);

      if (speakerEnabled && assistantMessage) {
        speechService.speak(assistantMessage);
      }
    } catch (err) {
      console.error('Study API call failed:', err);
      setLastFailedPrompt(textToSend.trim());
      setResponseData({
        agent_executed: 'Error Handler',
        intent: 'ERROR',
        message: err.message || 'Unable to connect to backend server. Please verify the backend is running on port 8000.',
        response_type: 'error',
        orchestration: { subject: selectedSubject !== 'All' ? selectedSubject : 'General', topic: 'Request Error' }
      });
    } finally {
      setIsProcessing(false);
      setInputVal('');
    }
  };

  const handleSaveToNotes = async () => {
    if (!responseData || !responseData.message || saveLoading) return;
    setSaveLoading(true);
    try {
      const subject = responseData.orchestration?.subject || (selectedSubject !== 'All' ? selectedSubject : 'General');
      const topic = responseData.orchestration?.topic || 'Study Note';
      await saveMemory(responseData.message, subject, topic, 'study_note');
      setSavedToNotes(true);
      setTimeout(() => setSavedToNotes(false), 3500);
    } catch (err) {
      alert('Failed to save to notes: ' + (err.message || 'Unknown error'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!responseData?.message) return;
    navigator.clipboard.writeText(responseData.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!responseData?.message) return;
    const topic = (responseData.orchestration?.topic || 'Study_Note').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `VoiceStudy_${topic}.md`;
    const content = `# ${responseData.orchestration?.topic || 'Study Note'}\n\n` +
      `**Subject:** ${responseData.orchestration?.subject || 'General'}\n` +
      `**Agent Executed:** ${responseData.agent_executed || 'AI Tutor'}\n` +
      `**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n` +
      `${responseData.message}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearContext = () => {
    setConversationHistory([]);
    setResponseData(null);
    speechService.stopSpeaking();
  };

  // Helper to render formatted markdown nicely
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '0.5rem' }} />;
      
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '1.25rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            {trimmed.replace('## ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--accent-blue)', marginTop: '1rem', marginBottom: '0.4rem' }}>
            {trimmed.replace('### ', '')}
          </h4>
        );
      }

      if (trimmed.startsWith('> ')) {
        const quoteContent = trimmed.replace(/^>\s+/, '');
        return (
          <div key={idx} style={{ margin: '0.6rem 0', padding: '0.65rem 0.95rem', background: 'rgba(56, 189, 248, 0.08)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '0 8px 8px 0', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            {renderBoldText(quoteContent)}
          </div>
        );
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.replace(/^[-*]\s+/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>•</span>
            <div style={{ flex: 1 }}>{renderBoldText(content)}</div>
          </div>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const num = trimmed.match(/^(\d+\.)/)[1];
        const content = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{num}</span>
            <div style={{ flex: 1 }}>{renderBoldText(content)}</div>
          </div>
        );
      }

      return (
        <p key={idx} style={{ marginBottom: '0.6rem', lineHeight: '1.65' }}>
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  const renderBoldText = (str) => {
    // Parse bold **text** and inline `code`
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="mono-font" style={{ padding: '0.15rem 0.4rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', color: 'var(--accent-cyan)', fontSize: '0.85em' }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="study-workspace-grid">
      
      {/* Main Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Input Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Study Workspace</h3>
            </div>
            
            {conversationHistory.length > 0 && (
              <button
                className="btn-secondary"
                onClick={handleClearContext}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', gap: '0.35rem' }}
                title="Start a new conversation context"
              >
                <RefreshCw size={13} /> Clear Context ({conversationHistory.length / 2 | 0} turns)
              </button>
            )}
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              marginBottom: '0.75rem',
              color: 'var(--accent-amber)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Upload Success Banner */}
          {uploadNotice && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '10px',
              padding: '0.65rem 0.95rem',
              marginBottom: '0.75rem',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={16} />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* Speech Listening Live Indicator */}
          {isListening && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.55rem 0.85rem',
              background: 'rgba(115, 87, 255, 0.12)',
              border: '1px solid rgba(115, 87, 255, 0.35)',
              borderRadius: '10px',
              marginBottom: '0.75rem',
              fontSize: '0.82rem',
              color: 'var(--brand-violet)'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-violet)', boxShadow: '0 0 8px var(--brand-violet)' }} />
              <span>Listening in <strong>{speechLang === 'kn-IN' ? 'Kannada (kn-IN)' : 'English (en-US)'}</strong>... Speak your query clearly.</span>
            </div>
          )}

          {/* Resumed Session Alert */}
          {resumedSession && (
            <div style={{
              background: 'rgba(115, 87, 255, 0.08)',
              border: '1px solid rgba(115, 87, 255, 0.25)',
              borderRadius: '10px',
              padding: '0.65rem 0.95rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Sparkles size={16} color="var(--brand-violet)" />
                <div style={{ fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--brand-violet)', fontWeight: '700' }}>Resumed Session:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{resumedSession.subject || 'Course'}</strong> —{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{resumedSession.topic || 'Previous Topic'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumedSession(null);
                  if (onClearResumeSession) onClearResumeSession();
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Dismiss resumed session context"
              >
                <X size={14} /> Clear
              </button>
            </div>
          )}

          {/* Hidden File Input for Safe Notes Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.md,.json,.csv"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="custom-input"
              placeholder='Ask any question or paste notes e.g. "Strict 2PL protocols" or "Explain in Kannada"'
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isProcessing}
              style={{ flex: 1, minWidth: '220px' }}
            />

            <button
              type="button"
              className="btn-secondary"
              onClick={toggleListening}
              disabled={isProcessing}
              title={isListening ? "Stop speech dictation" : `Dictate in ${speechLang === 'kn-IN' ? 'Kannada' : 'English'}`}
              style={{
                padding: '0.75rem',
                background: isListening ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-secondary-btn)',
                borderColor: isListening ? 'var(--accent-rose)' : 'var(--border-subtle)'
              }}
              aria-label={isListening ? "Stop speech dictation" : "Dictate via microphone"}
            >
              {isListening ? <Square size={18} color="var(--accent-rose)" /> : <Mic size={18} color="var(--brand-violet)" />}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSpeechLang(prev => prev === 'en-US' ? 'kn-IN' : 'en-US')}
              title={`Toggle speech recognition: currently ${speechLang === 'en-US' ? 'English' : 'Kannada'}`}
              style={{ padding: '0.75rem', fontSize: '0.8rem', gap: '0.35rem', color: speechLang === 'kn-IN' ? 'var(--brand-violet)' : 'var(--text-secondary)' }}
            >
              <Languages size={17} color={speechLang === 'kn-IN' ? 'var(--brand-violet)' : 'var(--text-muted)'} />
              <span>{speechLang === 'en-US' ? 'EN' : 'KN'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isProcessing}
              title="Upload study material (.txt, .md, .json) into Qdrant vector memory"
              style={{ padding: '0.75rem', fontSize: '0.82rem', gap: '0.35rem' }}
            >
              <Upload size={17} color="var(--brand-violet)" />
              <span>{isUploading ? 'Indexing...' : 'Upload'}</span>
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={!inputVal.trim() || isProcessing}
              style={{ whiteSpace: 'nowrap', gap: '0.4rem' }}
            >
              {isProcessing ? <Sparkles size={18} className="spin" /> : <Send size={18} />} Send
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const nextState = !speakerEnabled;
                setSpeakerEnabled(nextState);
                if (!nextState) speechService.stopSpeaking();
              }}
              title={speakerEnabled ? "Mute Spoken Answer" : "Enable Spoken Answer"}
              style={{ padding: '0.75rem' }}
            >
              {speakerEnabled ? <Volume2 size={18} color="var(--accent-emerald)" /> : <VolumeX size={18} color="var(--text-muted)" />}
            </button>
          </form>

          {/* Subject Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Focus Subject:</span>
            {displaySubjects.map((sub) => (
              <button
                key={sub}
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '16px',
                  border: selectedSubject === sub ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: selectedSubject === sub ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-input)',
                  color: selectedSubject === sub ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  fontWeight: selectedSubject === sub ? '700' : '500',
                  fontSize: '0.74rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.6 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {sub}
              </button>
            ))}

            {onOpenSubjectLibrary && (
              <button
                type="button"
                onClick={onOpenSubjectLibrary}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  border: '1px dashed var(--accent-indigo)',
                  background: 'rgba(79, 70, 229, 0.06)',
                  color: 'var(--accent-indigo)',
                  fontWeight: '600',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Browse full 50+ subject library across 10 academic curricula"
              >
                <GraduationCap size={13} /> 50+ Subject Library &rarr;
              </button>
            )}
          </div>

          {/* Subject Preset Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {sampleQueries.map((item, i) => (
              <button
                key={i}
                className="btn-secondary"
                disabled={isProcessing}
                onClick={() => handleSend(item.query)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>[{item.label}]</span> {item.query.slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        {/* Agent Response Card */}
        {responseData && (
          <div className="glass-card" style={{ borderColor: responseData.response_type === 'error' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(0, 242, 254, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Cpu size={20} color={responseData.response_type === 'error' ? 'var(--accent-rose)' : 'var(--accent-cyan)'} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    Agent: <span style={{ color: responseData.response_type === 'error' ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>{responseData.agent_executed}</span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Intent: <strong style={{ color: responseData.response_type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{responseData.intent}</strong> • Subject: <strong>{responseData.orchestration?.subject || 'General'}</strong> • Topic: {responseData.orchestration?.topic || 'General'}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge ${responseData.response_type === 'error' ? 'badge-amber' : 'badge-cyan'}`}>
                  {responseData.response_type}
                </span>

                {responseData.response_type !== 'error' && (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={handleSaveToNotes}
                      disabled={saveLoading || savedToNotes}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                      title="Save this answer to Qdrant vector memory notes"
                    >
                      {savedToNotes ? (
                        <>
                          <CheckCircle size={14} color="var(--accent-emerald)" />
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Saved!</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={14} color="var(--accent-cyan)" />
                          <span>{saveLoading ? 'Saving...' : 'Save to Notes'}</span>
                        </>
                      )}
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={handleCopyAnswer}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                      title="Copy formatted answer to clipboard"
                    >
                      {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} color="var(--text-muted)" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={handleDownloadMarkdown}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                      title="Download as Markdown file"
                    >
                      <Download size={14} color="var(--text-muted)" />
                      <span>Export .md</span>
                    </button>

                    {setActiveTab && (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          const topic = responseData.orchestration?.topic || responseData.orchestration?.subject || 'Recent Studies';
                          if (onSelectQuizTopic) onSelectQuizTopic(topic);
                          setActiveTab('quiz');
                        }}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                        title="Practice interactive quiz on this topic"
                      >
                        <HelpCircle size={14} color="var(--accent-purple)" />
                        <span style={{ color: 'var(--accent-purple)' }}>Quiz on Topic</span>
                      </button>
                    )}

                    {setActiveTab && (
                      <button
                        className="btn-secondary"
                        onClick={() => setActiveTab('flashcards')}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                        title="Review notes in Flashcard deck"
                      >
                        <RotateCw size={14} color="var(--accent-emerald)" />
                        <span style={{ color: 'var(--accent-emerald)' }}>Flashcards</span>
                      </button>
                    )}

                    <button
                      className="btn-secondary"
                      onClick={() => speechService.speak(responseData.message)}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                      title="Replay Spoken Answer"
                    >
                      <Volume2 size={14} color="var(--accent-cyan)" /> Speak
                    </button>
                  </>
                )}

                {responseData.response_type === 'error' && lastFailedPrompt && (
                  <button
                    className="btn-primary"
                    onClick={() => handleSend(lastFailedPrompt)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.4rem' }}
                  >
                    <RotateCcw size={14} /> Retry Request
                  </button>
                )}
              </div>
            </div>

            {/* Response Message Body */}
            <div style={{ fontSize: '0.95rem', color: responseData.response_type === 'error' ? 'var(--accent-rose)' : 'var(--text-primary)', lineHeight: '1.6' }}>
              {renderFormattedText(responseData.message)}
            </div>

            {/* Display Retrieved Study Memories if present */}
            {responseData.retrieved_memories && responseData.retrieved_memories.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={14} /> Retrieved Notebook Memories ({responseData.retrieved_memories.length})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {responseData.retrieved_memories.map((m, idx) => (
                    <div key={idx} style={{ padding: '0.6rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--accent-emerald)' }}>[{m.subject || 'General'} - {m.topic || 'Note'}]</span>: {m.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Quiz view if response type is quiz */}
            {responseData.response_type === 'quiz' && responseData.data?.questions && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-purple)' }}>
                    Generated Revision Questions:
                  </h5>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Tap an option to test your knowledge
                  </span>
                </div>

                {responseData.data.questions.map((q, qIdx) => {
                  const selectedOpt = studyQuizAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;

                  return (
                    <div key={qIdx} className="glass-card" style={{ background: 'rgba(10, 16, 26, 0.7)', padding: '1rem' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                        Q{qIdx + 1}. {q.question}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {q.options?.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correct_answer;
                          const isOptionSelected = selectedOpt === optIdx;

                          let bg = 'rgba(255, 255, 255, 0.03)';
                          let border = 'var(--border-subtle)';
                          let textColor = 'var(--text-secondary)';

                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              bg = 'rgba(16, 185, 129, 0.2)';
                              border = 'rgba(16, 185, 129, 0.5)';
                              textColor = 'var(--accent-emerald)';
                            } else if (isOptionSelected && !isOptionCorrect) {
                              bg = 'rgba(244, 63, 94, 0.2)';
                              border = 'rgba(244, 63, 94, 0.5)';
                              textColor = 'var(--accent-rose)';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setStudyQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                background: bg,
                                border: `1px solid ${border}`,
                                fontSize: '0.82rem',
                                color: textColor,
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt} {hasAnswered && isOptionCorrect && ' ✓'}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && q.explanation && (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '2px solid var(--accent-cyan)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--accent-cyan)' }}>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Mic size={18} color="var(--brand-violet)" />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Voice & Audio Assistant</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Microphone Input:</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Web Speech Ready</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Supported Languages:</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>EN (India/US) & KN (Kannada)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Speech Synthesis:</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>Active Read-Aloud</span>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Speak notes hands-free or dictate lecture questions. Answers are retrieved directly from your indexed notes.
            </p>
          </div>
        </div>

        <div className="glass-card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} color="var(--accent-cyan)" /> Conversational AI Pipeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>1. Real-time Transcript</div>
              <div style={{ color: 'var(--text-muted)' }}>Captures spoken words directly without altering query</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ fontWeight: '600', color: 'var(--accent-purple)' }}>2. Orchestrator Reasoning</div>
              <div style={{ color: 'var(--text-muted)' }}>Identifies subject, topic & intent with history context</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)' }}>
              <div style={{ fontWeight: '600', color: 'var(--accent-emerald)' }}>3. AI Study Assistant</div>
              <div style={{ color: 'var(--text-muted)' }}>Executes intelligent study assistant agent</div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid var(--accent-amber)' }}>
              <div style={{ fontWeight: '600', color: 'var(--accent-amber)' }}>4. Natural Speech Synthesis</div>
              <div style={{ color: 'var(--text-muted)' }}>Clean text-to-speech with stop & voice controls</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
