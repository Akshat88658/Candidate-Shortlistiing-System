import { useState, useEffect } from 'react';
import { getCandidates, deleteCandidate } from '../api/apiService';

export default function CandidateList({ refreshKey }) {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await getCandidates(search);
      setCandidates(res.data.data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, [refreshKey, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteCandidate(id);
      fetchCandidates();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="card-header"><span className="icon">👥</span> Candidates ({candidates.length})</div>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input className="form-input" placeholder="Search by name, email, or skill..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner"></span> Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>{search ? 'No candidates match your search' : 'No candidates yet. Add one!'}</p>
        </div>
      ) : (
        <div className="candidate-list">
          {candidates.map((c, i) => (
            <div className="candidate-card animate-in" key={c._id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="name">{c.name}</div>
              <div className="email">{c.email}</div>
              <div className="experience">💼 {c.experience} year{c.experience !== 1 ? 's' : ''} experience</div>
              <div className="skill-tags" style={{ marginTop: '0.5rem' }}>
                {c.skills.map((s, j) => <span className="skill-tag" key={j}>{s}</span>)}
              </div>
              {c.bio && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{c.bio}</div>}
              <div className="actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
