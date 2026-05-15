import { useState } from 'react';
import { aiInterviewQuestions } from '../api/apiService';

export default function InterviewQuestions({ candidate, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await aiInterviewQuestions({
        candidateName: candidate.name,
        skills: candidate.strengths || [],
        experience: candidate.matchPercentage ? Math.round(candidate.matchPercentage / 25) : 2,
        role: 'Software Developer'
      });
      if (res.data.success && res.data.parsed) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to get interview questions:', err);
    }
    setLoading(false);
    setFetched(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>🎤 Interview Questions for {candidate.name}</h2>

        {!fetched && !loading && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Generate AI-powered interview questions tailored to this candidate's profile.
            </p>
            <button className="btn btn-primary" onClick={fetchQuestions}>
              🤖 Generate Questions
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-state"><span className="spinner"></span> Generating questions...</div>
        )}

        {fetched && questions.length === 0 && !loading && (
          <div className="empty-state">
            <p>Could not generate questions. Make sure OpenRouter API key is configured.</p>
          </div>
        )}

        {questions.map((q, i) => (
          <div className="question-card" key={i}>
            <div className="q-num">Question {i + 1}</div>
            <div className="q-text">{q.question}</div>
            <div className="q-skill">🎯 Tests: {q.testsSkill}</div>
            <div className="q-answer">💡 Expected: {q.expectedAnswer}</div>
          </div>
        ))}

        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
