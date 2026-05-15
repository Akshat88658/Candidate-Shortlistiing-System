import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1>Candidate Shortlisting<br />Powered by AI</h1>
        <p className="subtitle">
          Intelligent skill matching and OpenRouter AI analysis to find the perfect candidates for every role.
        </p>
        <div className="hero-cta">
          <Link to="/candidates" className="btn btn-primary">➕ Add Candidates</Link>
          <Link to="/shortlist" className="btn btn-secondary">🤖 Start Shortlisting</Link>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <div className="f-icon">👥</div>
          <h3>Candidate Management</h3>
          <p>Store and manage candidate profiles with skills, experience, and project details.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">⚡</div>
          <h3>Smart Skill Matching</h3>
          <p>Algorithmic matching with composite scoring — required skills, preferred skills, and experience.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🤖</div>
          <h3>AI-Powered Analysis</h3>
          <p>OpenRouter GPT integration for intelligent ranking with detailed explanations.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">📊</div>
          <h3>Visual Analytics</h3>
          <p>Interactive charts and score breakdowns for data-driven hiring decisions.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🎤</div>
          <h3>Interview Questions</h3>
          <p>AI-generated interview questions tailored to each candidate's skills.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🔍</div>
          <h3>Search & Filter</h3>
          <p>Quickly find candidates by name, email, or skill keywords.</p>
        </div>
      </section>
    </div>
  );
}
