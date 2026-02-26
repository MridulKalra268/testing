import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  topBar: {
    background: '#1a1a1a',
    color: '#fff',
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  timerRed: { fontSize: '20px', fontWeight: '800', color: '#ff4444' },
  timerNormal: { fontSize: '20px', fontWeight: '800', color: '#4caf50' },
  topInfo: { fontSize: '14px', color: '#ccc' },
  body: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', gap: '24px' },
  main: { flex: 1 },
  sidebar: { width: '200px', flexShrink: 0 },
  qCard: { background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '16px', border: '1px solid #e0e0e0' },
  qMeta: { fontSize: '12px', color: '#888', marginBottom: '12px', display: 'flex', gap: '12px' },
  diffBadge: (d) => ({
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    background: d === 'easy' ? '#e8f5e9' : d === 'moderate' ? '#fff3e0' : '#fce4ec',
    color: d === 'easy' ? '#2e7d32' : d === 'moderate' ? '#e65100' : '#c62828'
  }),
  qText: { fontSize: '17px', fontWeight: '500', lineHeight: '1.6', marginBottom: '24px' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  option: (selected) => ({
    padding: '14px 18px',
    border: `2px solid ${selected ? '#1a1a1a' : '#e0e0e0'}`,
    background: selected ? '#1a1a1a' : '#fff',
    color: selected ? '#fff' : '#1a1a1a',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    textAlign: 'left',
    fontWeight: selected ? '600' : '400'
  }),
  navRow: { display: 'flex', justifyContent: 'space-between', marginTop: '20px' },
  navBtn: (disabled) => ({
    padding: '10px 24px',
    background: disabled ? '#f0f0f0' : '#1a1a1a',
    color: disabled ? '#aaa' : '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  }),
  submitBtn: {
    padding: '10px 28px',
    background: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700'
  },
  sideTitle: { fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '10px' },
  navGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' },
  navDot: (status) => ({
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    background: status === 'current' ? '#1a1a1a' : status === 'answered' ? '#4caf50' : '#e0e0e0',
    color: status === 'current' || status === 'answered' ? '#fff' : '#555'
  }),
  legend: { marginTop: '16px', fontSize: '11px', color: '#888' },
  legendDot: (color) => ({
    display: 'inline-block', width: '10px', height: '10px',
    background: color, borderRadius: '2px', marginRight: '4px'
  })
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TestPage({ testData, onFinish }) {
  const { questions, selectedTopics, timeLimit } = testData;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit || 25 * 60);
  const [startTime] = useState(Date.now());

  const submitTest = useCallback(async (timedOut = false) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const userAnswers = questions.map((_, i) => answers[i] || null);
    try {
      const res = await axios.post('/api/test/submit', {
        questions,
        userAnswers,
        timeTaken,
        topics: selectedTopics
      });
      onFinish({ ...res.data, timedOut });
    } catch {
      // fallback local scoring
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });
      onFinish({ score, totalQuestions: questions.length, percentage: Math.round(score / questions.length * 100), timeTaken, results: questions.map((q, i) => ({ ...q, userAnswer: answers[i], isCorrect: answers[i] === q.answer })), timedOut });
    }
  }, [answers, questions, selectedTopics, startTime, onFinish]);

  useEffect(() => {
    if (timeLeft <= 0) { submitTest(true); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitTest]);

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  const getStatus = (i) => {
    if (i === current) return 'current';
    if (answers[i]) return 'answered';
    return 'unanswered';
  };

  const handleSubmit = () => {
    if (answeredCount < questions.length) {
      const ok = window.confirm(`You've answered ${answeredCount}/${questions.length} questions. Submit anyway?`);
      if (!ok) return;
    }
    submitTest(false);
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.topInfo}>
          Q {current + 1} / {questions.length} · {answeredCount} answered
        </div>
        <div style={timeLeft < 300 ? s.timerRed : s.timerNormal}>
          ⏱ {formatTime(timeLeft)}
        </div>
        <button style={s.submitBtn} onClick={handleSubmit}>Submit Test</button>
      </div>

      <div style={s.body}>
        <div style={s.main}>
          <div style={s.qCard}>
            <div style={s.qMeta}>
              <span>Q{current + 1}</span>
              <span style={s.diffBadge(q.difficulty)}>{q.difficulty}</span>
              <span style={{ color: '#999' }}>{q.topic}</span>
              <span style={{ color: '#bbb' }}>{q.pattern}</span>
            </div>
            <div style={s.qText}>{q.question}</div>
            <div style={s.optionsGrid}>
              {q.options.map((opt, idx) => {
                const letter = opt.charAt(0);
                return (
                  <button
                    key={idx}
                    style={s.option(answers[current] === letter)}
                    onClick={() => setAnswers(prev => ({ ...prev, [current]: letter }))}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.navRow}>
            <button
              style={s.navBtn(current === 0)}
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
            >
              ← Previous
            </button>
            {current < questions.length - 1 ? (
              <button style={s.navBtn(false)} onClick={() => setCurrent(c => c + 1)}>
                Next →
              </button>
            ) : (
              <button style={s.submitBtn} onClick={handleSubmit}>Submit Test ✓</button>
            )}
          </div>
        </div>

        <div style={s.sidebar}>
          <div style={s.sideTitle}>Questions</div>
          <div style={s.navGrid}>
            {questions.map((_, i) => (
              <button key={i} style={s.navDot(getStatus(i))} onClick={() => setCurrent(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={s.legend}>
            <div><span style={s.legendDot('#4caf50')} />Answered</div>
            <div><span style={s.legendDot('#1a1a1a')} />Current</div>
            <div><span style={s.legendDot('#e0e0e0')} />Not visited</div>
          </div>
        </div>
      </div>
    </div>
  );
}