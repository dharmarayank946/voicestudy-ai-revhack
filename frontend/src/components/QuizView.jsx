import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertCircle, 
  Copy, 
  Check, 
  FileText,
  Brain
} from 'lucide-react';
import { generateQuiz, submitQuizAttempt } from '../services/api';

export default function QuizView({ initialTopic = '', onQuizGenerated, setActiveTab, onSelectStudyTopic }) {
  const [topic, setTopic] = useState(() => initialTopic?.trim() || 'DBMS Concurrency Control');
  const [lectureNotes, setLectureNotes] = useState('');
  const [showLectureInput, setShowLectureInput] = useState(false);
  const [numQuestions, setNumQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_pref_num_q');
      return saved ? Number(saved) : 5;
    } catch {
      return 5;
    }
  });
  const [difficulty, setDifficulty] = useState(() => {
    try {
      return localStorage.getItem('voicestudy_pref_diff') || 'medium';
    } catch {
      return 'medium';
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
  
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [copiedQuiz, setCopiedQuiz] = useState(false);
  const [backendResult, setBackendResult] = useState(null);

  // Synchronize when initialTopic changes externally
  useEffect(() => {
    if (initialTopic && initialTopic.trim() && initialTopic.trim() !== topic) {
      setTopic(initialTopic.trim());
    }
  }, [initialTopic]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic || !topic.trim()) {
      setError('Please provide a revision topic for the quiz.');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setUserAnswers({});
    setShowResults(false);
    setBackendResult(null);
    setError(null);
    setCopiedQuiz(false);
    try {
      const res = await generateQuiz(
        topic.trim(), 
        numQuestions, 
        difficulty, 
        'default_student', 
        lectureNotes.trim() || null
      );
      if (!res || !res.questions || res.questions.length === 0) {
        throw new Error('No quiz questions returned for the selected topic.');
      }
      setQuizData(res);
      if (onQuizGenerated) onQuizGenerated(res);
    } catch (err) {
      setError(err.message || 'Quiz generation failed. Please check backend connection.');
      setQuizData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyQuiz = () => {
    if (!quizData?.questions) return;
    const text = `# ${quizData.title || topic} Revision Quiz\n\n` +
      quizData.questions.map((q, idx) => {
        const opts = (q.options || []).map((o, oIdx) => `  ${String.fromCharCode(65 + oIdx)}. ${o}`).join('\n');
        return `${idx + 1}. ${q.question}\n${opts}\n\nCorrect Answer: ${String.fromCharCode(65 + q.correct_answer)}\nExplanation: ${q.explanation || 'N/A'}\n`;
      }).join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopiedQuiz(true);
    setTimeout(() => setCopiedQuiz(false), 2500);
  };

  const selectAnswer = (qIndex, optionIndex) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitAnswers = async () => {
    if (!quizData?.questions || Object.keys(userAnswers).length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitQuizAttempt(
        quizData.title || topic,
        difficulty,
        quizData.questions,
        userAnswers,
        'default_student'
      );
      setBackendResult(result);
      setShowResults(true);
    } catch (err) {
      console.warn('Backend quiz submit error, showing client calculation:', err);
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateClientScore = () => {
    if (!quizData?.questions) return 0;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) score++;
    });
    return score;
  };

  const displayScore = backendResult ? backendResult.score : calculateClientScore();
  const totalQuestionsCount = quizData?.questions?.length || numQuestions;
  const accuracyPct = backendResult ? backendResult.percentage : Math.round((displayScore / Math.max(1, totalQuestionsCount)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Quiz Controls Header */}
      <div className="glass-card" style={{ border: '1px solid var(--border-violet)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={22} color="var(--brand-violet)" /> Adaptive Active Recall Quiz
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Test your comprehension with topic-targeted questions synthesized directly from your Qdrant vector notes. Scores and weak areas are permanently logged to your revision vault.
        </p>

        <form onSubmit={handleGenerate} className="quiz-controls-form">
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Revision Topic</label>
            <input
              type="text"
              className="custom-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. DBMS Concurrency Control, Virtual Memory Paging"
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Questions</label>
            <select
              className="custom-input"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Difficulty</label>
            <select
              className="custom-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isLoading}
            >
              <option value="easy">Easy (Fundamentals)</option>
              <option value="medium">Medium (Analytical)</option>
              <option value="hard">Hard (Exam Prep)</option>
            </select>
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading} style={{ height: '42px', gap: '0.4rem' }}>
            {isLoading ? <Sparkles size={16} className="spin" /> : <Sparkles size={16} />}
            <span>{isLoading ? 'Synthesizing...' : 'Generate Quiz'}</span>
          </button>
        </form>

        {/* Toggle Custom Lecture Input */}
        <div style={{ marginTop: '0.85rem' }}>
          <button
            type="button"
            onClick={() => setShowLectureInput(!showLectureInput)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-violet)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: 0
            }}
          >
            <FileText size={14} />
            <span>{showLectureInput ? 'Hide lecture text input' : '+ Ground quiz with custom lecture notes'}</span>
          </button>

          {showLectureInput && (
            <textarea
              className="custom-input"
              rows={3}
              placeholder="Paste specific lecture snippet or professor notes here to build questions directly from this content..."
              value={lectureNotes}
              onChange={(e) => setLectureNotes(e.target.value)}
              style={{ marginTop: '0.6rem', fontSize: '0.85rem' }}
            />
          )}
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.65rem 0.95rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: 'var(--accent-rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quiz Content Container */}
      {quizData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Card with Score Summary */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {quizData.title || topic}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {quizData.questions?.length} Questions • Difficulty: <strong style={{ textTransform: 'capitalize' }}>{difficulty}</strong> • {quizData.is_offline ? 'Offline Fallback Engine' : 'Grounded in Qdrant Vector Memory'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                className="btn-secondary"
                onClick={handleCopyQuiz}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', gap: '0.3rem' }}
              >
                {copiedQuiz ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                <span>{copiedQuiz ? 'Copied!' : 'Export Quiz'}</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => setInstantFeedback(!instantFeedback)}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              >
                {instantFeedback ? '⚡ Instant Feedback' : '📝 Exam Mode'}
              </button>
            </div>
          </div>

          {/* Backend Results Banner */}
          {showResults && (
            <div className="glass-card" style={{
              background: accuracyPct >= 80 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(115, 87, 255, 0.08)',
              border: `1px solid ${accuracyPct >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-violet)'}`,
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: accuracyPct >= 80 ? 'var(--accent-emerald)' : 'var(--brand-violet)' }}>
                    Backend-Verified Attempt Record
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    Score: {displayScore} / {totalQuestionsCount} ({accuracyPct}%)
                  </h3>
                  {backendResult?.recommendation && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                      {backendResult.recommendation}
                    </p>
                  )}
                </div>

                {backendResult?.weak_topics && backendResult.weak_topics.length > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                      Target Weak Area:
                    </span>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        const targetWeak = backendResult.weak_topics[0];
                        if (onSelectStudyTopic) onSelectStudyTopic(targetWeak);
                        if (setActiveTab) setActiveTab('study');
                      }}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '0.35rem' }}
                    >
                      <Brain size={14} /> Revise "{backendResult.weak_topics[0].slice(0, 24)}"
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Cards */}
          {quizData.questions?.map((q, idx) => {
            const hasAnsweredQuestion = userAnswers[idx] !== undefined;
            const shouldReveal = showResults || (instantFeedback && hasAnsweredQuestion);

            return (
              <div key={idx} className="glass-card">
                <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {idx + 1}. {q.question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {q.options?.map((opt, optIdx) => {
                    const isOptionSelected = userAnswers[idx] === optIdx;
                    const isOptionCorrect = optIdx === q.correct_answer;
                    
                    let bg = 'var(--bg-secondary)';
                    let border = 'var(--border-subtle)';
                    let textColor = 'var(--text-secondary)';

                    if (shouldReveal) {
                      if (isOptionCorrect) {
                        bg = 'rgba(16, 185, 129, 0.15)';
                        border = 'rgba(16, 185, 129, 0.6)';
                        textColor = 'var(--accent-emerald)';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        bg = 'rgba(244, 63, 94, 0.15)';
                        border = 'rgba(244, 63, 94, 0.6)';
                        textColor = 'var(--accent-rose)';
                      }
                    } else if (isOptionSelected) {
                      bg = 'rgba(115, 87, 255, 0.15)';
                      border = 'var(--brand-violet)';
                      textColor = 'var(--brand-violet)';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => selectAnswer(idx, optIdx)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: bg,
                          border: `1px solid ${border}`,
                          color: textColor,
                          fontWeight: isOptionSelected ? '700' : '500',
                          fontSize: '0.9rem',
                          textAlign: 'left',
                          cursor: (showResults || (instantFeedback && hasAnsweredQuestion)) ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>
                          <strong style={{ opacity: 0.8, marginRight: '0.5rem' }}>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                        </span>

                        {shouldReveal && isOptionCorrect && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
                        {shouldReveal && isOptionSelected && !isOptionCorrect && <XCircle size={18} color="var(--accent-rose)" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {shouldReveal && q.explanation && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '10px', borderLeft: '3px solid var(--brand-violet)', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--brand-violet)' }}>Explanation: </strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {!showResults ? (
              <button
                className="btn-primary"
                onClick={handleSubmitAnswers}
                disabled={Object.keys(userAnswers).length === 0 || isSubmitting}
                style={{ minWidth: '220px' }}
              >
                {isSubmitting ? 'Evaluating & Saving...' : 'Submit Answers'}
              </button>
            ) : (
              <button
                className="btn-secondary"
                onClick={handleGenerate}
                style={{ gap: '0.5rem' }}
              >
                <RotateCcw size={16} /> Try Another Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
