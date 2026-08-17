import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-icon">🌌</span>
        <span className="logo-text">SoulSpace</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>🌊 Mood</Link>
        <Link to="/journal" className={location.pathname === '/journal' ? 'active' : ''}>📝 Journal</Link>
        <Link to="/habits" className={location.pathname === '/habits' ? 'active' : ''}>🎯 Habits</Link>
        <Link to="/stories" className={location.pathname === '/stories' ? 'active' : ''}>📖 Stories</Link>
        <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>🧠 AI Chat</Link>
        <Link to="/garden" className={location.pathname === '/garden' ? 'active' : ''}>🌱 Garden</Link>
        <Link to="/report" className={location.pathname === '/report' ? 'active' : ''}>📊 Report</Link>
      </div>
    </nav>
  );
}

export default Navbar;