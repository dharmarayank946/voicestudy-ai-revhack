import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Languages, 
  Radio, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  Brain, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import VoiceOrb from './VoiceOrb';
// OmiStatusCard removed from student view
import { speechService } from '../services/speech';

export default function VoiceStudyView({ 
  onProcessInput, 
  isProcessing, 
  responseData, 
  setActiveTab,
  onSelectQuizTopic
}) {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    speechService.setLanguage(selectedLang);
  }, [selectedLang]);

  // When new responseData arrives, add to conversation history and speak if TTS enabled
  useEffect(() => {
    if (responseData) {
      const userText = responseData.voice_meta?.transcript || 'Voice Question';
      const aiMessage = responseData.message || 'Response processed.';
      
      setConversationHistory(prev => [
        {
          id: Date.now(),
          user: userText,
          assistant: aiMessage,
          intent: responseData.intent,
          agent: responseData.agent_executed,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

      if (ttsEnabled && aiMessage) {
        // Strip markdown headings or tables for clean audio speech
        const cleanSpeech = aiMessage.replace(/[#*`|_-]/g, ' ').slice(0, 300);
        speechService.speak(cleanSpeech);
      }
    }
  }, [responseData, ttsEnabled]);

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setIsListening(true);
      speechService.startListening(
        (finalText) => {
          setIsListening(false);
          setInterimTranscript('');
          if (finalText && finalText.trim() && onProcessInput) {
            onProcessInput(finalText.trim(), 'web_speech');
          }
        },
        (interim) => {
          setInterimTranscript(interim);
        },
        (error) => {
          console.warn('Speech recognition error:', error);
          setIsListening(false);
          setInterimTranscript('');
        }
      );
    }
  };

  const handleQuickPrompt = (promptText) => {
    if (onProcessInput) {
      onProcessInput(promptText, 'web_speech');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-violet)', fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <Radio size={14} color="var(--brand-violet)" />
            <span>IMMERSIVE VOICE STUDY ROOM</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Hands-Free Voice Study
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Speak naturally in English or Kannada. Your voice notes are embedded into Qdrant and retrieved by Lyzr agents.
          </p>
        </div>

        {/* Speech Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-card)', padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <Languages size={15} color="var(--brand-violet)" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none'
              }}
              aria-label="Select speech recognition language"
            >
              <option value="en-US">English (US/India)</option>
              <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
            </select>
          </div>

          {/* TTS Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              borderRadius: '10px'
            }}
            title={ttsEnabled ? 'Disable spoken audio playback' : 'Enable spoken audio playback'}
          >
            {ttsEnabled ? <Volume2 size={15} color="var(--accent-emerald)" /> : <VolumeX size={15} color="var(--text-muted)" />}
            <span>Voice Audio: {ttsEnabled ? 'ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Voice Experience */}
      <div className="card" style={{
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(115, 87, 255, 0.05) 100%)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background element */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(115, 87, 255, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '600px' }}>
          {/* Animated Voice Orb */}
          <VoiceOrb
            onProcessInput={onProcessInput}
            isProcessing={isProcessing}
            responseData={responseData}
          />

          {/* Real-time live microphone toggle button */}
          <button
            onClick={handleToggleListening}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.9rem 2rem',
              borderRadius: '999px',
              border: 'none',
              background: isListening ? 'var(--accent-rose)' : 'var(--brand-violet)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 25px rgba(244, 63, 94, 0.5)' : '0 0 25px rgba(115, 87, 255, 0.4)',
              transition: 'all 0.25s ease'
            }}
          >
            {isListening ? <Square size={18} fill="#FFFFFF" /> : <Mic size={20} />}
            <span>{isListening ? 'Stop Listening' : 'Click to Speak'}</span>
          </button>

          {/* Interim transcript feedback */}
          {interimTranscript && (
            <div style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(115, 87, 255, 0.1)',
              border: '1px solid rgba(115, 87, 255, 0.25)',
              color: 'var(--brand-violet)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease'
            }}>
              "{interimTranscript}"
            </div>
          )}

          {/* Quick Voice Prompt Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', width: '100%' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Quick Voice Prompts to Try:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {[
                'Remember that in DBMS, Strict 2PL prevents cascading aborts.',
                'Explain Two-Phase Locking and Strict 2PL.',
                'Quiz me on Operating Systems Virtual Memory.',
                'Summarize what I studied recently.'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(sample)}
                  disabled={isProcessing}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.35rem 0.75rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.18s ease'
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
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Conversation Feed & Omi Wearable Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Live Conversation Stream */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <Sparkles size={17} color="var(--brand-violet)" />
              <span>Voice Session Stream</span>
            </div>
            {conversationHistory.length > 0 && (
              <button
                onClick={() => setConversationHistory([])}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {conversationHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Mic size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '500' }}>
                No spoken interactions yet in this session.
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem' }}>
                Click the microphone button above or choose a sample prompt.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {conversationHistory.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                      {entry.intent || 'VOICE'} • {entry.agent || 'Study Assistant'}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{entry.time}</span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    You: "{entry.user}"
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {entry.assistant}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Voice Room Guide Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Radio size={18} color="var(--accent-emerald)" />
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Voice Room Features</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Live Recognition:</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Kannada Support:</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>kn-IN Enabled</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Vector Grounding:</span>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Qdrant 1536-dim</span>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Speak naturally into your device microphone. VoiceStudy AI transcribes, indexes, and speaks back explanations in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
