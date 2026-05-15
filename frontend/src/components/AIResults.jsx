import { useState } from 'react';
import InterviewQuestions from './InterviewQuestions';

export default function AIResults({ results, rawResponse }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  if (!results && !rawResponse) return null;

  const getRecClass = (rec) => {
    if (!rec) return '';
    const r = rec.toLowerCase();
    if (r.includes('highly')) return 'highly';
    if (r.includes('not')) return 'not';
    if (r.includes('consider')) return 'consider';
    return 'recommended';
  };

  // If we couldn't parse the AI response, show raw
  if (rawResponse && (!results || results.length === 0)) {
    return (
      <div>
        <div className="section-title">🤖 AI Analysis</div>
        <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {rawResponse}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">🤖 AI-Powered Ranking</div>
      {results.map((r, i) => (
        <div className="ai-result-card animate-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="rank">#{r.rank}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.email}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>{r.matchPercentage}%</div>
              <span className={`ai-rec-badge ${getRecClass(r.recommendation)}`}>{r.recommendation}</span>
            </div>
          </div>

          <div className="explanation">{r.explanation}</div>

          {r.strengths && r.strengths.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>✅ Strengths:</span>
              <ul className="strengths" style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                {r.strengths.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            </div>
          )}

          {r.concerns && r.concerns.length > 0 && (
            <div style={{ marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-amber)' }}>⚠️ Concerns:</span>
              <ul className="concerns" style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                {r.concerns.map((s, j) => <li key={j}>{s}</li>)}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '0.8rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCandidate(r)}>
              🎤 Interview Questions
            </button>
          </div>
        </div>
      ))}

      {selectedCandidate && (
        <InterviewQuestions candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  );
}
