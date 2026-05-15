import { useState } from 'react';
import { addCandidate } from '../api/apiService';

export default function CandidateForm({ onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', experience: '', bio: '' });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (idx) => setSkills(skills.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || skills.length === 0 || !form.experience) {
      setToast({ type: 'error', msg: 'Please fill all required fields and add at least one skill' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      await addCandidate({ ...form, experience: Number(form.experience), skills });
      setToast({ type: 'success', msg: `${form.name} added successfully!` });
      setForm({ name: '', email: '', experience: '', bio: '' });
      setSkills([]);
      if (onAdded) onAdded();
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Failed to add candidate' });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="card">
      <div className="card-header"><span className="icon">➕</span> Add Candidate</div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input className="form-input" placeholder="e.g. Rahul Sharma" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input className="form-input" type="email" placeholder="rahul@gmail.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Skills *</label>
          <div className="skill-input-wrap">
            <input className="form-input" placeholder="Type skill & press Enter" value={skillInput}
              onChange={e => setSkillInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
          </div>
          {skills.length > 0 && (
            <div className="skill-tags">
              {skills.map((s, i) => (
                <span className="skill-tag" key={i}>{s} <button type="button" onClick={() => removeSkill(i)}>×</button></span>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Experience (years) *</label>
          <input className="form-input" type="number" min="0" placeholder="2" value={form.experience}
            onChange={e => setForm({ ...form, experience: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Bio / Projects</label>
          <textarea className="form-textarea" placeholder="Brief description of projects or background..."
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <><span className="spinner"></span> Adding...</> : '🚀 Add Candidate'}
        </button>
      </form>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
