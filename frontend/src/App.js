import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import TopicSelector from './pages/TopicSelector';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [page, setPage] = useState('landing'); // landing | topics | test | results
  const [testData, setTestData] = useState(null);
  const [resultData, setResultData] = useState(null);

  const goTo = (pg, data = null) => {
    if (pg === 'test') setTestData(data);
    if (pg === 'results') setResultData(data);
    setPage(pg);
  };

  return (
    <div>
      {page === 'landing' && <LandingPage onStart={() => setPage('topics')} />}
      {page === 'topics' && <TopicSelector onStart={(data) => goTo('test', data)} onBack={() => setPage('landing')} />}
      {page === 'test' && <TestPage testData={testData} onFinish={(data) => goTo('results', data)} />}
      {page === 'results' && <ResultsPage resultData={resultData} onRetry={() => setPage('topics')} onHome={() => setPage('landing')} />}
    </div>
  );
}