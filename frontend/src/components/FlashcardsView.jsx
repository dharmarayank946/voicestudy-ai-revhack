import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Brain, 
  HelpCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function FlashcardsView({ memories = [], quizData = null, setActiveTab }) {
  const [deckSource, setDeckSource] = useState('memories'); // 'memories' | 'quiz'
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [masteredCards, setMasteredCards] = useState(() => {
    try {
      const saved = localStorage.getItem('voicestudy_mastered_cards');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Extract available subjects from memories
  const subjects = useMemo(() => {
    const list = Array.from(new Set(memories.map(m => m.subject).filter(Boolean)));
    return ['All', ...list];
  }, [memories]);

  // Build card deck from selected source
  const cards = useMemo(() => {
    if (deckSource === 'quiz' && quizData?.questions && quizData.questions.length > 0) {
      return quizData.questions.map((q, idx) => ({
        id: `quiz-${idx}`,
        sourceType: 'quiz',
        subject: quizData.title || 'Revision Quiz',
        topic: `Question ${idx + 1}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.options?.[q.correct_answer] || `Option ${q.correct_answer + 1}`,
        answer: q.options?.[q.correct_answer] || '',
        explanation: q.explanation || 'Based on core syllabus fundamentals.'
      }));
    }

    // Default to memories deck
    const filteredMemories = selectedSubject === 'All' 
      ? memories 
      : memories.filter(m => (m.subject || '').toLowerCase() === selectedSubject.toLowerCase());

    return filteredMemories.map((m, idx) => ({
      id: m.id || `mem-${idx}`,
      sourceType: 'memory',
      subject: m.subject || 'General Study',
      topic: m.topic || 'Core Concept',
      question: `What are the core mechanisms, definitions, and key takeaways of ${m.topic || 'this concept'}?`,
      answer: m.text,
      date: m.date_display || 'Recent'
    }));
  }, [deckSource, quizData, memories, selectedSubject]);

  // Keep index within bounds
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deckSource, selectedSubject]);

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Spacebar to flip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const currentCard = cards[currentIndex] || null;
  const isCurrentMastered = currentCard ? !!masteredCards[currentCard.id] : false;

  const handleShuffle = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentIndex(randomIndex);
  };

  const toggleMastered = (cardId) => {
    setMasteredCards(prev => {
      const updated = { ...prev, [cardId]: !prev[cardId] };
      try {
        localStorage.setItem('voicestudy_mastered_cards', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save mastered state:', err);
      }
      return updated;
    });
  };

  const handleCopyCard = (e) => {
    e.stopPropagation();
    if (!currentCard) return;
    const textToCopy = `Question:\n${currentCard.question}\n\nAnswer:\n${currentCard.answer || currentCard.correctAnswer}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const masteredCount = cards.filter(c => masteredCards[c.id]).length;
  const progressPercent = cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '840px', margin: '0 auto' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <RotateCw size={24} color="var(--accent-emerald)" /> Active Recall Flashcards
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Test your knowledge with spaced repetition grounded on your saved study materials
          </p>
        </div>

        {/* Source Deck Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(10, 16, 26, 0.7)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setDeckSource('memories')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9px',
              border: 'none',
              background: deckSource === 'memories' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: deckSource === 'memories' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Brain size={14} /> Saved Notes ({memories.length})
          </button>

          {quizData?.questions && (
            <button
              onClick={() => setDeckSource('quiz')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '9px',
                border: 'none',
                background: deckSource === 'quiz' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: deckSource === 'quiz' ? 'var(--accent-violet)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <HelpCircle size={14} /> Quiz Deck ({quizData.questions.length})
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Chips (Only for memories) */}
      {deckSource === 'memories' && subjects.length > 2 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Subject:</span>
          {subjects.map(s => {
            const isSelected = selectedSubject === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress & Stats Bar */}
      {cards.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Card <strong style={{ color: 'var(--text-primary)' }}>{currentIndex + 1}</strong> of {cards.length}</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> {masteredCount} Mastered
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '140px' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--gradient-cyan-emerald)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem' }}>{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Main Flashcard Stage */}
      {cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(8, 13, 24, 0.5)', borderRadius: '18px', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <RotateCw size={26} color="var(--accent-cyan)" />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No flashcards in this deck yet
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Save study notes from lectures in the Study Workspace, or generate a quiz to automatically build your flashcard deck.
          </p>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab && setActiveTab('study')}
            style={{ fontSize: '0.88rem', padding: '0.65rem 1.35rem' }}
          >
            Open Study Workspace <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="flashcard-stage">
          <div 
            className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            role="button"
            tabIndex={0}
            aria-label={`Flashcard: ${isFlipped ? 'Answer side' : 'Question side'}. Click to flip.`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsFlipped(!isFlipped);
            }}
          >
            {/* FRONT FACE (Question) */}
            <div className="flashcard-face flashcard-front">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                <span className="badge badge-cyan">{currentCard.subject}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={handleCopyCard}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                    title="Copy card text"
                    aria-label="Copy card text"
                  >
                    {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                    QUESTION
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem 0' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                  {currentCard.question}
                </h4>

                {currentCard.options && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {currentCard.options.map((opt, i) => (
                      <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{String.fromCharCode(65 + i)}.</strong> {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={13} color="var(--accent-cyan)" /> Tap card or press <kbd style={{ padding: '0.1rem 0.35rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>Space</kbd> to reveal answer
                </span>
                <span style={{ color: isCurrentMastered ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {isCurrentMastered ? '✓ Mastered' : '● Needs Review'}
                </span>
              </div>
            </div>

            {/* BACK FACE (Answer) */}
            <div className="flashcard-face flashcard-back">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                <span className="badge badge-emerald">ANSWER & EXPLANATION</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={handleCopyCard}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                    title="Copy answer text"
                    aria-label="Copy answer text"
                  >
                    {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', padding: '0.2rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                    GROUNDED NOTE
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem 0', maxHeight: '240px', overflowY: 'auto' }}>
                {currentCard.correctAnswer && (
                  <div style={{ marginBottom: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase' }}>Correct Answer</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)' }}>{currentCard.correctAnswer}</div>
                  </div>
                )}

                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.65' }}>
                  {currentCard.answer}
                </div>

                {currentCard.explanation && (
                  <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0, 0, 0, 0.25)', padding: '0.65rem', borderRadius: '8px' }}>
                    <strong style={{ color: 'var(--accent-cyan)' }}>Active Recall Tip:</strong> {currentCard.explanation}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered(currentCard.id);
                  }}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.75rem',
                    gap: '0.4rem',
                    color: isCurrentMastered ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    borderColor: isCurrentMastered ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'
                  }}
                >
                  <CheckCircle2 size={14} color={isCurrentMastered ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                  <span>{isCurrentMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                </button>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Tap to flip back
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.75rem' }}>
            <button
              onClick={handlePrev}
              className="btn-secondary"
              style={{ width: '44px', height: '44px', padding: 0, borderRadius: '12px', justifyContent: 'center' }}
              title="Previous card (Left Arrow)"
              aria-label="Previous flashcard"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="btn-primary"
              style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem', gap: '0.5rem' }}
            >
              <RotateCw size={16} />
              <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
            </button>

            <button
              onClick={handleNext}
              className="btn-secondary"
              style={{ width: '44px', height: '44px', padding: 0, borderRadius: '12px', justifyContent: 'center' }}
              title="Next card (Right Arrow)"
              aria-label="Next flashcard"
            >
              <ChevronRight size={20} />
            </button>

            <button
              onClick={handleShuffle}
              className="btn-secondary"
              style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              title="Shuffle card order"
              aria-label="Shuffle card order"
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
