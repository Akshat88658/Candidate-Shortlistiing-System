import { useState } from 'react';

export default function JobForm({ onMatch, onAiMatch, loading, aiLoading }) {
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [prefInput, setPrefInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');

  const addSkill = (type) => {
    if (type === 'required') {
      const s = skillInput.trim();
      if (s && !requiredSkills.includes(s)) { setRequiredSkills([...requiredSkills, s]); setSkillInput(''); }
    } else {
      const s = prefInput.trim();
      if (s && !preferredSkills.includes(s)) { setPreferredSkills([...preferredSkills, s]); setPrefInput(''); }
    }
  };

  const handleSubmit = (useAi = false) => {
    if (requiredSkills.length === 0) { alert('Add at least one required skill'); return; }
    const data = { requiredSkills, preferredSkills, minExperience: Number(minExperience) || 0 };
    if (useAi) onAiMatch(data);
    else onMatch(data);
  };

  return (
    <div className="card">
      <div className="card-header"><span className="icon">📋</span> Job Requirements</div>

      <div className="form-group">
        <label>Required Skills *</label>
        <div className="skill-input-wrap">
          <input className="form-input" placeholder="e.g. React" value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('required'); } }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSkill('required')}>Add</button>
        </div>
        {requiredSkills.length > 0 && (
          <div className="skill-tags">
            {requiredSkills.map((s, i) => (
              <span className="skill-tag" key={i}>{s}
                <button onClick={() => setRequiredSkills(requiredSkills.filter((_, j) => j !== i))}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Preferred Skills</label>
        <div className="skill-input-wrap">
          <input className="form-input" placeholder="e.g. AWS" value={prefInput}
            onChange={e => setPrefInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('preferred'); } }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSkill('preferred')}>Add</button>
        </div>
        {preferredSkills.length > 0 && (
          <div className="skill-tags">
            {preferredSkills.map((s, i) => (
              <span className="skill-tag preferred" key={i}>{s}
                <button onClick={() => setPreferredSkills(preferredSkills.filter((_, j) => j !== i))}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Minimum Experience (years)</label>
        <input className="form-input" type="number" min="0" placeholder="0" value={minExperience}
          onChange={e => setMinExperience(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(false)} disabled={loading}>
          {loading ? <><span className="spinner"></span> Matching...</> : '⚡ Basic Match'}
        </button>
        <button className="btn btn-secondary" style={{ flex: 1, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(34,211,238,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}
          onClick={() => handleSubmit(true)} disabled={aiLoading}>
          {aiLoading ? <><span className="spinner"></span> AI Analyzing...</> : '🤖 AI Match'}
        </button>
      </div>
    </div>
  );
}
