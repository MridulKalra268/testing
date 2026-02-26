import React from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    cursor: 'pointer',
    userSelect: 'none'
  },
  title: {
    fontSize: '64px',
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: '-2px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#888',
    marginTop: '16px'
  },
  hint: {
    fontSize: '14px',
    color: '#bbb',
    marginTop: '48px',
    border: '1px solid #eee',
    padding: '10px 24px',
    borderRadius: '4px'
  }
};

export default function LandingPage({ onStart }) {
  return (
    <div style={styles.container} onClick={onStart}>
      <h1 style={styles.title}>Quant Aptitude</h1>
      <p style={styles.subtitle}>TCS NQT Practice Platform</p>
      <p style={styles.hint}>Click anywhere to start →</p>
    </div>
  );
}