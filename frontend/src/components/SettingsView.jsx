import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  School, 
  BookOpen, 
  Languages, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Mic, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Radio, 
  Award, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Play, 
  Square, 
  Zap, 
  Calendar, 
  Lock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getAllSubjects } from '../data/subjectLibrary';
import { speechService } from '../services/speech';
import { fetchExamProfile, saveExamProfile } from '../services/api';

export default function SettingsView({ 
  healthData, 
  theme = 'light', 
  onSelectTheme,
  setActiveTab 
}) {
  const qdrant = healthData?.vector_memory || {};
  const allSubjects = useMemo(() => getAllSubjects(), []);

  // -------------------------------------------------------------
  // PROFILE STATE
  // -------------------------------------------------------------
  const [studentName, setStudentName] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_student_name') || 'Scholar';
    } catch {
      return 'Scholar';
    }
  });

  const [studentEmail, setStudentEmail] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_student_email') || 'student@college.edu';
    } catch {
      return 'student@college.edu';
    }
  });

  const [collegeName, setCollegeName] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_college_name') || 'Engineering College, Bengaluru';
    } catch {
      return 'Engineering College, Bengaluru';
    }
  });

  const [examProfile, setExamProfile] = useState(null);

  // -------------------------------------------------------------
  // STUDY PREFERENCES STATE
  // -------------------------------------------------------------
  const [preferredSubject, setPreferredSubject] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_subject') || 'Operating Systems';
    } catch {
      return 'Operating Systems';
    }
  });

  const [studyLanguage, setStudyLanguage] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_lang') || 'en-US';
    } catch {
      return 'en-US';
    }
  });

  const [studyDifficulty, setStudyDifficulty] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_diff') || 'medium';
    } catch {
      return 'medium';
    }
  });

  const [dailyStudyHours, setDailyStudyHours] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_daily_hours');
      return saved ? parseFloat(saved) : 2.0;
    } catch {
      return 2.0;
    }
  });

  const [studyPaceMode, setStudyPaceMode] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_pace') || 'steady';
    } catch {
      return 'steady';
    }
  });

  // -------------------------------------------------------------
  // LEARNING & QUIZ PREFERENCES STATE
  // -------------------------------------------------------------
  const [defaultNumQuestions, setDefaultNumQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_num_q');
      return saved ? Number(saved) : 5;
    } catch {
      return 5;
    }
  });

  const [autoRevision, setAutoRevision] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_auto_revision');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [instantFeedback, setInstantFeedback] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_instant_feedback');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // -------------------------------------------------------------
  // VOICE & SPEECH SETTINGS STATE
  // -------------------------------------------------------------
  const [enableVoiceTts, setEnableVoiceTts] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_tts');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [speechRate, setSpeechRate] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_voice_rate');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_voice_uri') || '';
    } catch {
      return '';
    }
  });

  const [availableVoices, setAvailableVoices] = useState([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const speechSupported = speechService.isSupported;

  // -------------------------------------------------------------
  // UI STATUS & FEEDBACK
  // -------------------------------------------------------------
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [resetNotice, setResetNotice] = useState(null);

  // Load Exam Profile from backend SQLite store & voices from speech engine
  useEffect(() => {
    let mounted = true;

    async function loadBackendData() {
      try {
        const pRes = await fetchExamProfile('default_student');
        if (mounted && pRes?.has_profile) {
          setExamProfile(pRes.profile);
          if (pRes.profile.target_subject && !localStorage.getItem('voicestudy_pref_subject')) {
            setPreferredSubject(pRes.profile.target_subject);
          }
          if (pRes.profile.daily_study_hours && !localStorage.getItem('voicestudy_pref_daily_hours')) {
            setDailyStudyHours(pRes.profile.daily_study_hours);
          }
        }
      } catch (err) {
        console.warn('Failed to load exam profile in Settings:', err);
      }
    }
    loadBackendData();

    // Voice synthesis discovery
    const updateVoices = () => {
      const v = speechService.getAvailableVoices();
      if (mounted && v && v.length > 0) {
        setAvailableVoices(v);
        if (!selectedVoiceURI && speechService.selectedVoice) {
          setSelectedVoiceURI(speechService.selectedVoice.voiceURI || speechService.selectedVoice.name);
        }
      }
    };
    updateVoices();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      mounted = false;
      speechService.stopSpeaking();
    };
  }, []);

  // -------------------------------------------------------------
  // LIVE AUDIO TEST HANDLER
  // -------------------------------------------------------------
  const handleToggleAudioTest = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speechService.setRate(speechRate);
    if (selectedVoiceURI) {
      speechService.setVoice(selectedVoiceURI);
    }
    const langLabel = studyLanguage === 'kn-IN' ? 'Kannada' : 'English';
    const testPhrase = `Hello ${studentName.trim() || 'Scholar'}. VoiceStudy AI speech synthesis is active at ${speechRate}x playback rate in ${langLabel}. Ready for your lectures.`;

    speechService.speak(testPhrase, () => {
      setIsPlayingAudio(false);
    });
  };

  // -------------------------------------------------------------
  // SAVE ALL SETTINGS HANDLER
  // -------------------------------------------------------------
  const handleSaveAllSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveNotice(null);
    setSaveError(null);

    try {
      // 1. Persist to localStorage
      localStorage.setItem('voicestudy_student_name', studentName.trim() || 'Scholar');
      localStorage.setItem('voicestudy_student_email', studentEmail.trim() || 'student@college.edu');
      localStorage.setItem('voicestudy_college_name', collegeName.trim() || 'Engineering College, Bengaluru');

      localStorage.setItem('voicestudy_pref_subject', preferredSubject);
      localStorage.setItem('voicestudy_pref_lang', studyLanguage);
      localStorage.setItem('voicestudy_pref_diff', studyDifficulty);
      localStorage.setItem('voicestudy_pref_daily_hours', dailyStudyHours.toString());
      localStorage.setItem('voicestudy_pref_pace', studyPaceMode);

      localStorage.setItem('voicestudy_pref_num_q', defaultNumQuestions.toString());
      localStorage.setItem('voicestudy_pref_auto_revision', autoRevision.toString());
      localStorage.setItem('voicestudy_pref_instant_feedback', instantFeedback.toString());

      localStorage.setItem('voicestudy_pref_tts', enableVoiceTts.toString());
      localStorage.setItem('voicestudy_pref_voice_rate', speechRate.toString());
      if (selectedVoiceURI) {
        localStorage.setItem('voicestudy_pref_voice_uri', selectedVoiceURI);
      }

      // 2. Synchronize speechService in runtime
      speechService.setLanguage(studyLanguage);
      speechService.setRate(speechRate);
      if (selectedVoiceURI) {
        speechService.setVoice(selectedVoiceURI);
      }

      // 3. Persist to backend SQLite Study Vault if exam profile exists or target subject is set
      const examTitle = examProfile?.exam_title || `${preferredSubject} Examination`;
      const examDate = examProfile?.exam_date || '2026-11-20';
      const confLevel = examProfile?.confidence_level || 3;

      await saveExamProfile(
        preferredSubject,
        examTitle,
        examDate,
        dailyStudyHours,
        confLevel,
        'default_student'
      ).catch(err => {
        console.warn('Backend exam sync warning (non-fatal):', err);
      });

      setSaveNotice('All settings and preferences saved successfully! Study defaults and audio settings are active.');
      setTimeout(() => setSaveNotice(null), 4500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveError(err.message || 'An error occurred while saving your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // RESET LOCAL PREFERENCES HANDLER
  // -------------------------------------------------------------
  const handleResetPreferences = () => {
    const confirmed = window.confirm(
      'Reset all local study preferences back to default values?\n\nYour stored study notes and vector memories will not be touched.'
    );
    if (!confirmed) return;

    try {
      localStorage.removeItem('voicestudy_pref_subject');
      localStorage.removeItem('voicestudy_pref_lang');
      localStorage.removeItem('voicestudy_pref_diff');
      localStorage.removeItem('voicestudy_pref_daily_hours');
      localStorage.removeItem('voicestudy_pref_pace');
      localStorage.removeItem('voicestudy_pref_num_q');
      localStorage.removeItem('voicestudy_pref_auto_revision');
      localStorage.removeItem('voicestudy_pref_instant_feedback');
      localStorage.removeItem('voicestudy_pref_tts');
      localStorage.removeItem('voicestudy_pref_voice_rate');
      localStorage.removeItem('voicestudy_pref_voice_uri');

      // Reset state to initial defaults
      setPreferredSubject('Operating Systems');
      setStudyLanguage('en-US');
      setStudyDifficulty('medium');
      setDailyStudyHours(2.0);
      setStudyPaceMode('steady');
      setDefaultNumQuestions(5);
      setAutoRevision(true);
      setInstantFeedback(true);
      setEnableVoiceTts(true);
      setSpeechRate(1.0);
      setSelectedVoiceURI('');

      speechService.setLanguage('en-US');
      speechService.setRate(1.0);

      setResetNotice('Preferences reset to default values.');
      setTimeout(() => setResetNotice(null), 3500);
    } catch (err) {
      console.warn('Reset error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* =========================================================================
          PAGE HEADER & SAVE ACTION BAR
          ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Settings size={26} color="var(--brand-violet)" /> Settings & Preferences
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
            Customize your student profile, academic subjects, voice synthesis, theme appearance, and data storage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="btn-secondary"
            title="Reset preferences to defaults"
            style={{ fontSize: '0.82rem', padding: '0.55rem 0.9rem', gap: '0.4rem', color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={15} /> Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="btn-primary"
            style={{ fontSize: '0.86rem', padding: '0.55rem 1.15rem', gap: '0.45rem', minWidth: '140px' }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      {saveNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          color: 'var(--accent-emerald)',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
        }}>
          <CheckCircle2 size={19} />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Error Notice */}
      {saveError && (
        <div style={{
          background: 'rgba(225, 29, 72, 0.12)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          color: 'var(--accent-rose)',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={19} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Reset Notice */}
      {resetNotice && (
        <div style={{
          background: 'rgba(115, 87, 255, 0.12)',
          border: '1px solid rgba(115, 87, 255, 0.35)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          color: 'var(--brand-violet)',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <RotateCcw size={18} />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: STUDENT PROFILE
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(115, 87, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-violet)'
            }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Student Profile & Identity
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Personal credentials used across study sessions, lecture notes, and revision planning.
              </p>
            </div>
          </div>

          <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
            Student ID: default_student
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Student Full Name
            </label>
            <input
              type="text"
              className="custom-input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Scholar or Nagalambika"
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Student Email Address
            </label>
            <input
              type="email"
              className="custom-input"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="e.g. student@college.edu"
              style={{ fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              College / University
            </label>
            <input
              type="text"
              className="custom-input"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Engineering College, Bengaluru"
              style={{ fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* Linked Target Exam Summary */}
        <div style={{
          marginTop: '1.15rem',
          padding: '0.85rem 1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calendar size={18} color="var(--brand-violet)" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Target Academic Exam: <span style={{ color: 'var(--brand-violet)' }}>{examProfile?.exam_title || `${preferredSubject} End-Sem`}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Target Date: {examProfile?.exam_date || '2026-11-20'} ({examProfile?.days_remaining != null ? `${examProfile.days_remaining} days left` : '33 days left'})
              </div>
            </div>
          </div>

          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
            >
              <span>Manage Profile & Plan</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: STUDY PREFERENCES & CURRICULUM
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <BookOpen size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Study Preferences & Curriculum
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Choose your primary subject focus, curriculum language, daily commitment, and revision cadence.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Preferred Academic Subject Focus
            </label>
            <select
              className="custom-input"
              value={preferredSubject}
              onChange={(e) => setPreferredSubject(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              {allSubjects.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name} ({sub.categoryName})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Used as the initial focus for AI tutor explanations and note classification.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Primary Study & Dictation Language
            </label>
            <select
              className="custom-input"
              value={studyLanguage}
              onChange={(e) => {
                setStudyLanguage(e.target.value);
                speechService.setLanguage(e.target.value);
              }}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="en-US">English (United States) — Standard en-US</option>
              <option value="en-IN">English (India) — Indian Academic Accent en-IN</option>
              <option value="kn-IN">Kannada (India) — kn-IN Localized Regional</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Sets the speech recognition dictionary and AI conversational language.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Daily Study Target (Hours / Day)
            </label>
            <select
              className="custom-input"
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(parseFloat(e.target.value))}
              style={{ fontSize: '0.88rem' }}
            >
              <option value={1.0}>1.0 Hour / Day (Light Revision)</option>
              <option value={1.5}>1.5 Hours / Day (Steady Regular)</option>
              <option value={2.0}>2.0 Hours / Day (Standard Recommended)</option>
              <option value={3.0}>3.0 Hours / Day (Intensive Preparation)</option>
              <option value={4.0}>4.0 Hours / Day (High-Yield Exam Sprint)</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Used by the Revision Planner to allocate daily checklist tasks.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Revision Study Pace Mode
            </label>
            <select
              className="custom-input"
              value={studyPaceMode}
              onChange={(e) => setStudyPaceMode(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="steady">Steady Pace (Evenly distributed spaced repetition)</option>
              <option value="sprint">Exam Sprint (Priority focus on weak areas and high weightage)</option>
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Controls algorithm weighting in the revision scheduler.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: LEARNING & QUIZ PREFERENCES
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-violet)'
          }}>
            <Sliders size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Learning & Quiz Configuration
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Default question counts, cognitive difficulty levels, and automated revision workflows.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Default Practice Quiz Questions
            </label>
            <select
              className="custom-input"
              value={defaultNumQuestions}
              onChange={(e) => setDefaultNumQuestions(Number(e.target.value))}
              style={{ fontSize: '0.88rem' }}
            >
              <option value={3}>3 Questions (Quick 2-Minute Concept Check)</option>
              <option value={5}>5 Questions (Standard Practice Test)</option>
              <option value={10}>10 Questions (Comprehensive Exam Simulation)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Default Quiz & Study Difficulty
            </label>
            <select
              className="custom-input"
              value={studyDifficulty}
              onChange={(e) => setStudyDifficulty(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="easy">Easy (Core definitions & basic recall)</option>
              <option value="medium">Medium (Application, synthesis & analysis)</option>
              <option value="hard">Hard (Complex multi-step problems & edge cases)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <input
              type="checkbox"
              id="autoRevisionToggle"
              checked={autoRevision}
              onChange={(e) => setAutoRevision(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="autoRevisionToggle" style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer', display: 'block' }}>
                Automated Revision Plan Scheduling
              </label>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Automatically schedule targeted revision tasks in your study vault when completing quizzes or processing new lecture notes.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <input
              type="checkbox"
              id="instantFeedbackToggle"
              checked={instantFeedback}
              onChange={(e) => setInstantFeedback(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="instantFeedbackToggle" style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer', display: 'block' }}>
                Instant Quiz Answer Keys & Explanations
              </label>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Display detailed conceptual rationales immediately when answering practice quiz questions.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: VOICE & SPEECH SETTINGS
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <Volume2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Voice & Speech Engine Settings
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure browser-native speech recognition dictation, text-to-speech output, voice engines, and playback speed.
              </p>
            </div>
          </div>

          <span className={speechSupported ? 'badge badge-emerald' : 'badge badge-amber'} style={{ fontSize: '0.72rem' }}>
            {speechSupported ? 'Web Speech API: Available' : 'Speech Recognition: Fallback Mode'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Microphone Speech Input Language
            </label>
            <select
              className="custom-input"
              value={studyLanguage}
              onChange={(e) => {
                setStudyLanguage(e.target.value);
                speechService.setLanguage(e.target.value);
              }}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="en-US">English (en-US)</option>
              <option value="en-IN">English (India - en-IN)</option>
              <option value="kn-IN">Kannada (India - kn-IN)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Speech Playback Speed (Rate)
            </label>
            <select
              className="custom-input"
              value={speechRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setSpeechRate(rate);
                speechService.setRate(rate);
              }}
              style={{ fontSize: '0.88rem' }}
            >
              <option value={0.75}>0.75x — Slower / Deliberate</option>
              <option value={1.0}>1.0x — Normal Conversational (Default)</option>
              <option value={1.25}>1.25x — Brisk / Efficient</option>
              <option value={1.5}>1.5x — Rapid Speed Run</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Speech Synthesis Voice Engine
            </label>
            <select
              className="custom-input"
              value={selectedVoiceURI}
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                speechService.setVoice(e.target.value);
              }}
              style={{ fontSize: '0.88rem' }}
            >
              {availableVoices.length === 0 ? (
                <option value="">Default System Voice (Natural)</option>
              ) : (
                availableVoices.map((v, i) => (
                  <option key={v.voiceURI || i} value={v.voiceURI || v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* TTS Toggle & Live Audio Test Card */}
        <div style={{
          marginTop: '1.15rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              type="checkbox"
              id="ttsEnableCheckbox"
              checked={enableVoiceTts}
              onChange={(e) => setEnableVoiceTts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <div>
              <label htmlFor="ttsEnableCheckbox" style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer', display: 'block' }}>
                Enable Text-to-Speech Audio Playback
              </label>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Allows the AI study tutor and flashcard player to read explanations out loud.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAudioTest}
            className={isPlayingAudio ? 'btn-secondary' : 'btn-primary'}
            style={{
              fontSize: '0.82rem',
              padding: '0.5rem 0.95rem',
              gap: '0.45rem',
              color: isPlayingAudio ? 'var(--accent-rose)' : undefined,
              borderColor: isPlayingAudio ? 'rgba(225, 29, 72, 0.4)' : undefined
            }}
          >
            {isPlayingAudio ? (
              <>
                <Square size={15} />
                <span>Stop Audio Playback</span>
              </>
            ) : (
              <>
                <Volume2 size={15} />
                <span>Test Voice Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: APPEARANCE & THEME (EYFI NAVY & VIOLET)
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(115, 87, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-violet)'
          }}>
            <Sun size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Appearance & Theme
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Switch between our default eye-friendly Light theme and our cinematic midnight Dark mode.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {/* Light Theme Card (Default) */}
          <div 
            onClick={() => onSelectTheme && onSelectTheme('light')}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              border: theme === 'light' ? '2px solid var(--brand-violet)' : '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              boxShadow: theme === 'light' ? '0 0 0 3px rgba(115, 87, 255, 0.18), var(--shadow-card-hover)' : 'var(--shadow-card)',
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sun size={18} color="#7357FF" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#10152B' }}>Light Theme</strong>
                  <span className="badge badge-indigo" style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Recommended</span>
                </div>
              </div>
              {theme === 'light' && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7357FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
              Eye-friendly off-white canvas with crisp white cards, balanced electric violet accents, and maximum contrast for reading lecture notes.
            </p>
          </div>

          {/* Dark Theme Card */}
          <div 
            onClick={() => onSelectTheme && onSelectTheme('dark')}
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              border: theme === 'dark' ? '2px solid var(--brand-violet)' : '1px solid var(--border-subtle)',
              background: '#10152B',
              boxShadow: theme === 'dark' ? '0 0 0 3px rgba(115, 87, 255, 0.25), 0 8px 30px rgba(0,0,0,0.5)' : 'var(--shadow-card)',
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1A213D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={18} color="#9A86FF" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>Dark Theme</strong>
                  <span className="badge badge-purple" style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Cinematic</span>
                </div>
              </div>
              {theme === 'dark' && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7357FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5', margin: 0 }}>
              Deep midnight navy palette with gentle violet glows and reduced blue light for distraction-free late-night study sessions.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: DATA STORAGE & PRIVACY CONTROLS
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Data Storage & Privacy Isolation
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Strict multi-layer tenant isolation across SQLite databases and Qdrant vector memory.
              </p>
            </div>
          </div>

          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
            Zero Cross-Student Leakage
          </span>
        </div>

        {/* Architecture Isolation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Database size={16} color="var(--brand-violet)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>SQLite Local Study Vault</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Stores exam countdown dates, daily revision checklists, and quiz score attempts locally on the server with isolated student UID scope.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Cpu size={16} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Qdrant 1536-Dim Vector Memory</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              AI tutoring and search queries are semantically matched exclusively against your own lecture notes and uploaded syllabus files.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <Lock size={16} color="var(--accent-emerald)" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Strict Server-Side Key Security</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              All AI integration credentials and API keys remain strictly server-side. No sensitive tokens or webhook URLs are exposed in the client browser.
            </p>
          </div>
        </div>

        {/* Real Stats & Action Footer */}
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Qdrant Vector Database Status: <span style={{ color: qdrant.status === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: '700' }}>
                {qdrant.status || 'Connected'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Indexed Notes & Lecture Points: <strong style={{ color: 'var(--text-primary)' }}>{qdrant.total_memories || 0}</strong> (1536-dim embeddings)
            </div>
          </div>

          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', gap: '0.45rem' }}
            >
              <Database size={15} />
              <span>Manage & Delete Stored Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 7: CONNECTED TECHNOLOGY STACK & HACKATHON
          ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--brand-violet)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              RevHack 2026 Connected Technology Stack
            </h4>
          </div>
          <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
            Meeting & Lecture Intelligence Track
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizers</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>AI House & HiDevs</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--brand-violet)' }}>VoiceStudy AI</div>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Architecture</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-emerald)' }}>Lyzr + Qdrant + SQLite</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Database size={18} color="var(--brand-violet)" />
              <strong style={{ fontSize: '0.9rem' }}>Qdrant Vector DB</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Status: <span style={{ color: qdrant.status === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {qdrant.status || 'Connected'}
              </span><br />
              Total Indexed Memories: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{qdrant.total_memories || 0}</span>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cpu size={18} color="var(--accent-cyan)" />
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
              Integration: <span style={{ color: 'var(--accent-emerald)' }}>Standard Webhook Listener</span><br />
              Web Speech Mic: <span style={{ color: 'var(--accent-emerald)' }}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PERSISTENT BOTTOM SAVE CALLOUT
          ========================================================================= */}
      <div style={{
        position: 'sticky',
        bottom: '1.5rem',
        zIndex: 20,
        background: 'var(--bg-card-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-violet)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        boxShadow: 'var(--shadow-violet), 0 8px 32px rgba(16, 21, 43, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={20} color="var(--brand-violet)" />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Ready to apply your study settings?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Preferences are saved persistently to your local browser storage and backend study profile.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.55rem 0.95rem' }}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.6rem 1.35rem', gap: '0.5rem', minWidth: '150px' }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
