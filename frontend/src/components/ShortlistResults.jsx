export default function ShortlistResults({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div>
      <div className="section-title">⚡ Basic Match Results ({results.length} candidates)</div>
      <div className="candidate-list">
        {results.map((c, i) => (
          <div className="candidate-card animate-in" key={c._id} style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="name">{c.name}</div>
                <div className="email">{c.email}</div>
              </div>
              <span className={`match-badge ${c.matchLevel.toLowerCase()}`}>{c.matchLevel}</span>
            </div>
            <div className="experience">💼 {c.experience} year{c.experience !== 1 ? 's' : ''} · {c.meetsExperience ? '✅ Meets requirement' : '⚠️ Below requirement'}</div>
            <div className="score-bar-wrap">
              <div className="score-bar-label">
                <span>Match Score</span>
                <span style={{ fontWeight: 700 }}>{c.matchScore}%</span>
              </div>
              <div className="score-bar">
                <div className={`score-bar-fill ${c.matchLevel.toLowerCase()}`} style={{ width: `${c.matchScore}%` }}></div>
              </div>
            </div>
            {c.matchedSkills.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Matched: </span>
                <div className="skill-tags" style={{ display: 'inline-flex' }}>
                  {c.matchedSkills.map((s, j) => <span className="skill-tag matched" key={j}>{s}</span>)}
                </div>
              </div>
            )}
            {c.matchedPreferred && c.matchedPreferred.length > 0 && (
              <div style={{ marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preferred: </span>
                <div className="skill-tags" style={{ display: 'inline-flex' }}>
                  {c.matchedPreferred.map((s, j) => <span className="skill-tag preferred" key={j}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
