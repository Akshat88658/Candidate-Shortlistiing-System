import React, { useState, useEffect } from 'react';
import { getEmployees, getAIRecommendations } from '../api/apiService';

export default function AIRecommendations() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch employees list to allow selective analysis
  const fetchEmployeesList = async () => {
    setFetchingEmployees(true);
    setError('');
    try {
      const res = await getEmployees();
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not fetch the employee directory.');
    } finally {
      setFetchingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  // Handle employee selection checkboxes
  const handleCheckboxChange = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  // Select all employees helper
  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp._id));
    }
  };

  // Triggers the OpenRouter recommendation API
  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // If none selected, pass empty array to analyze ALL
      const idsToAnalyze = selectedEmployees.length > 0 ? selectedEmployees : [];
      const res = await getAIRecommendations(idsToAnalyze);
      if (res.data.success) {
        setRecommendations(res.data.data);
        setSuccess(`AI Recommendations generated successfully using ${res.data.model}!`);
      }
    } catch (err) {
      console.error('AI Recommendation Error:', err);
      setError(err.response?.data?.message || 'Error occurred while contacting OpenRouter AI API. Ensure keys are valid.');
    } finally {
      setLoading(false);
    }
  };

  // Badge styler for promotion status
  const getPromoBadgeClass = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('highly') || s.includes('immediate')) return 'badge badge-success';
    if (s.includes('recommend') || s.includes('yes')) return 'badge badge-info';
    if (s.includes('future') || s.includes('consider') || s.includes('soon')) return 'badge badge-warning';
    return 'badge badge-danger';
  };

  return (
    <div className="container animated-fade">
      {/* Page Header */}
      <div className="ai-header-panel" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎯 AI recommendation Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Evaluate promotion potentials, upskilling recommendations, and ranks.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleGenerateRecommendations}
          disabled={loading || employees.length === 0}
        >
          {loading ? (
            <>
              <div style={{ display: 'inline-block', border: '2px solid rgba(0,0,0,0.1)', borderTop: '2px solid #000', borderRadius: '50%', width: '14px', height: '14px', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}></div>
              Analyzing Profiles...
            </>
          ) : (
            '🧠 Run AI Diagnostics'
          )}
        </button>
      </div>

      {success && (
        <div className="badge badge-success" style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'none', textShadow: 'none', fontWeight: 500 }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'none', textShadow: 'none', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Select Employees Section */}
      {employees.length > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              👥 Select Employees to Evaluate ({selectedEmployees.length === 0 ? 'All' : `${selectedEmployees.length} selected`})
            </h4>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleSelectAll}>
              {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {employees.map(emp => (
              <label
                key={emp._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  background: selectedEmployees.includes(emp._id) ? 'rgba(20, 241, 197, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: selectedEmployees.includes(emp._id) ? '1px solid rgba(20, 241, 197, 0.3)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={() => handleCheckboxChange(emp._id)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <span style={{ fontWeight: 600 }}>{emp.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({emp.department} - {emp.performanceScore}%)</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Main recommendation Results display */}
      {recommendations.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1.5rem' }}>🧠</span>
          <h3>Ready for AI evaluation</h3>
          <p style={{ maxWidth: '550px', margin: '0.5rem auto 1.5rem auto', fontSize: '0.92rem' }}>
            Select your desired employee profiles and click "Run AI Diagnostics" above. The AI will evaluate performance trends, generate upskilling modules, recommend promotion targets, and rank candidates automatically.
          </p>
          <button className="btn btn-primary" onClick={handleGenerateRecommendations} disabled={loading || employees.length === 0}>
            {loading ? 'Analyzing...' : 'Execute Evaluation now'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📊</span> AI Diagnostic & Performance Ranking Results
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {recommendations.map((rec) => {
              const isHighlyRec = rec.promotionStatus?.toLowerCase().includes('highly') || rec.performanceScore >= 85;
              const isNotRec = rec.promotionStatus?.toLowerCase().includes('not');
              
              let borderClass = 'ai-recommendation-card';
              if (isHighlyRec) borderClass += ' highly-rec';
              if (isNotRec) borderClass += ' not-rec';

              return (
                <div key={rec.employeeId} className={`card ${borderClass} animated-fade`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className="ai-rank-badge" title="Performance Rank relative to search">
                        {rec.rank}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{rec.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{rec.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                        Score: {rec.performanceScore}/100
                      </span>
                      <span className={getPromoBadgeClass(rec.promotionStatus)}>
                        📢 {rec.promotionStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    {/* Promotion Panel */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        📋 Promotion Recommendation
                      </h4>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {rec.promotionExplanation}
                      </p>
                    </div>

                    {/* Training suggestions panel */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        🛠️ Training & Upskilling Suggestions
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {rec.trainingSuggestions && rec.trainingSuggestions.length > 0 ? (
                          rec.trainingSuggestions.map((skill, sIdx) => (
                            <span key={sIdx} className="badge badge-info" style={{ textTransform: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                              📘 {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No immediate training required.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI qualitative feedback speech card */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--border-color)', marginTop: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      💬 Qualitative AI Feedback
                    </h5>
                    <p className="ai-feedback-quote" style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      "{rec.aiFeedback}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyframe spinner style hack */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
