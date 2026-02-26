import React, { useState } from 'react';

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' },
  inner: { maxWidth: '800px', margin: '0 auto' },
  scoreCard: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '24px' },
  scoreNum: { fontSize: '72px', fontWeight: '800', lineHeight: 1 },
  scoreLabel: { fontSize: '18px', color: '#aaa', marginTop: '8px' },
  pct: { fontSize: '32px', fontWeight: '600', marginTop: '16px' },
  metaRow: { display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '24px' },
  metaItem: { textAlign: 'center' },
  metaVal: { fontSize: '20px', fontWeight: '700' },
  metaKey: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  btnRow: { display: 'flex', gap: '12px', marginBottom: '28px' },
  btn: (primary) => ({
    flex: 1,
    padding: '14px',
    background: primary ? '#1a1a1a' : '#fff',
    color: primary ? '#fff' : '#1a1a1a',
    border: `2px solid ${primary ? '#1a1a1a' : '#ddd'}`,
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600'
  }),
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '16px' },
  qItem: { background: '#fff', borderRadius: '6px', marginBottom: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' },
  qHeader: (correct) => ({
    padding: '14px 18px',
    background: correct ? '#e8f5e9' : '#fce4ec',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    cursor: 'pointer'
  }),
  qNum: { fontWeight: '700', fontSize: '14px' },
  badge: (correct) => ({
    background: correct ? '#4caf50' : '#f44336',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0
  }),
  qBody: { padding: '16px 18px', fontSize: '14px' },
  qText: { marginBottom: '12px', fontSize: '15px', lineHeight: '1.5' },
  answerRow: { display: 'flex', gap: '24px', marginBottom: '10px' },
  answerLabel: { fontWeight: '600', color: '#555', minWidth: '100px' },
  solution: { background: '#f9f9f9', padding: '12px', borderRadius: '4px', color: '#444', lineHeight: '1.6', fontSize: '13px' },
  timedOut: { background: '#fff3e0', border: '1px solid #ffe0b2', padding: '14px', borderRadius: '6px', color: '#e65100', marginBottom: '20px', fontWeight: '600' }
};

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function ResultsPage({ resultData, onRetry, onHome }) {
  const { score, totalQuestions, percentage, timeTaken, results, timedOut } = resultData;
  const [expandedIdx, setExpandedIdx] = useState(null);

  const correct = results?.filter(r => r.isCorrect).length || score;
  const wrong = totalQuestions - correct;

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.scoreCard}>
          <div style={s.scoreNum}>{score}<span style={{ fontSize: '36px', color: '#aaa' }}>/{totalQuestions}</span></div>
          <div style={s.scoreLabel}>Questions Correct</div>
          <div style={s.pct}>{percentage}%</div>
          <div style={s.metaRow}>
            <div style={s.metaItem}>
              <div style={s.metaVal}>{correct}</div>
              <div style={s.metaKey}>Correct</div>
            </div>
            <div style={s.metaItem}>
              <div style={s.metaVal}>{wrong}</div>
              <div style={s.metaKey}>Wrong</div>
            </div>
            <div style={s.metaItem}>
              <div style={s.metaVal}>{totalQuestions - correct - wrong}</div>
              <div style={s.metaKey}>Skipped</div>
            </div>
            <div style={s.metaItem}>
              <div style={s.metaVal}>{formatTime(timeTaken)}</div>
              <div style={s.metaKey}>Time Taken</div>
            </div>
          </div>
        </div>

        {timedOut && (
          <div style={s.timedOut}>⏰ Test auto-submitted — time ran out!</div>
        )}

        <div style={s.btnRow}>
          <button style={s.btn(false)} onClick={onHome}>← Home</button>
          <button style={s.btn(true)} onClick={onRetry}>Try Again →</button>
        </div>

        <div style={s.sectionTitle}>Question Review</div>

        {results && results.map((q, i) => (
          <div key={i} style={s.qItem}>
            <div style={s.qHeader(q.isCorrect)} onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
              <div>
                <div style={s.qNum}>Q{i + 1} · {q.topic}</div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{q.question.slice(0, 80)}...</div>
              </div>
              <span style={s.badge(q.isCorrect)}>{q.isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
            </div>
            {expandedIdx === i && (
              <div style={s.qBody}>
                <div style={s.qText}>{q.question}</div>
                <div style={s.answerRow}>
                  <span style={s.answerLabel}>Your Answer:</span>
                  <span style={{ color: q.isCorrect ? '#4caf50' : '#f44336', fontWeight: '600' }}>
                    {q.userAnswer || 'Skipped'}
                  </span>
                </div>
                <div style={s.answerRow}>
                  <span style={s.answerLabel}>Correct Answer:</span>
                  <span style={{ color: '#4caf50', fontWeight: '600' }}>{q.answer}</span>
                </div>
                <div style={s.solution}><strong>Solution:</strong><br />{q.solution}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}