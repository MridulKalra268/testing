import React, { useState, useEffect } from 'react';
import axios from 'axios';

const s = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' },
  inner: { maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' },
  back: { background: 'none', border: '1px solid #ccc', padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' },
  title: { fontSize: '28px', fontWeight: '700' },
  modeRow: { display: 'flex', gap: '12px', marginBottom: '28px' },
  modeBtn: (active) => ({
    padding: '10px 24px',
    border: `2px solid ${active ? '#1a1a1a' : '#ddd'}`,
    background: active ? '#1a1a1a' : '#fff',
    color: active ? '#fff' : '#1a1a1a',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '14px'
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' },
  card: (selected) => ({
    padding: '16px',
    background: selected ? '#1a1a1a' : '#fff',
    color: selected ? '#fff' : '#1a1a1a',
    border: `2px solid ${selected ? '#1a1a1a' : '#e0e0e0'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    userSelect: 'none'
  }),
  cardName: { fontWeight: '600', fontSize: '15px', marginBottom: '4px' },
  cardMeta: (selected) => ({ fontSize: '12px', color: selected ? '#ccc' : '#888' }),
  startBtn: (disabled) => ({
    width: '100%',
    padding: '16px',
    background: disabled ? '#ccc' : '#1a1a1a',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '6px'
  }),
  loading: { textAlign: 'center', padding: '80px', fontSize: '18px', color: '#888' },
  error: { background: '#fee', border: '1px solid #fcc', padding: '16px', borderRadius: '4px', color: '#c00', marginBottom: '20px' },
  info: { background: '#f0f0f0', padding: '12px 16px', borderRadius: '4px', fontSize: '13px', color: '#555', marginBottom: '20px' }
};

export default function TopicSelector({ onStart, onBack }) {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('multi'); // 'multi' | 'all'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/topics')
      .then(r => { setTopics(r.data.topics); setLoading(false); })
      .catch(() => { setError('Failed to load topics. Is the backend running?'); setLoading(false); });
  }, []);

  const toggleTopic = (slug) => {
    if (mode === 'all') return;
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const setAllMode = (m) => {
    setMode(m);
    if (m === 'all') setSelected(topics.map(t => t.slug));
    else setSelected([]);
  };

  const activeTopics = mode === 'all' ? topics.map(t => t.slug) : selected;

  const handleStart = async () => {
    if (activeTopics.length === 0) return;
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post('/api/test/generate', { topicSlugs: activeTopics });
      onStart({ ...res.data, selectedTopics: activeTopics });
    } catch (err) {
      setError(err.response?.data?.message || 'Test generation failed. Check Grok API key.');
      setGenerating(false);
    }
  };

  if (loading) return <div style={s.loading}>Loading topics...</div>;

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <button style={s.back} onClick={onBack}>← Back</button>
          <h1 style={s.title}>Select Topics</h1>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.modeRow}>
          <button style={s.modeBtn(mode === 'multi')} onClick={() => setAllMode('multi')}>
            Choose Topics
          </button>
          <button style={s.modeBtn(mode === 'all')} onClick={() => setAllMode('all')}>
            All Topics (Mixed)
          </button>
        </div>

        <div style={s.info}>
          20 Questions · 25 Minutes · Mix of Easy / Moderate / Hard
          {activeTopics.length > 0 && ` · ${activeTopics.length} topic${activeTopics.length > 1 ? 's' : ''} selected`}
        </div>

        <div style={s.grid}>
          {topics.map(topic => {
            const isSel = activeTopics.includes(topic.slug);
            return (
              <div key={topic.slug} style={s.card(isSel)} onClick={() => toggleTopic(topic.slug)}>
                <div style={s.cardName}>{topic.name}</div>
                <div style={s.cardMeta(isSel)}>
                  {topic.minQuestions}–{topic.maxQuestions} questions
                </div>
              </div>
            );
          })}
        </div>

        <button
          style={s.startBtn(activeTopics.length === 0 || generating)}
          disabled={activeTopics.length === 0 || generating}
          onClick={handleStart}
        >
          {generating ? '⏳ Generating Test... (up to 30s)' : 'Start Test →'}
        </button>
      </div>
    </div>
  );
}