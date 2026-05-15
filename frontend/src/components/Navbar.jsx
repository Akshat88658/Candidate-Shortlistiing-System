import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="icon">🎯</span>
        ShortlistAI
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>Home</NavLink>
        <NavLink to="/candidates" className={({ isActive }) => isActive ? 'active' : ''}>Candidates</NavLink>
        <NavLink to="/shortlist" className={({ isActive }) => isActive ? 'active' : ''}>Shortlist</NavLink>
      </div>
    </nav>
  );
}
