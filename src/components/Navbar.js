import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import './Navbar.css';

const links = [
  { to: '/', label: '🌊 Mood' },
  { to: '/journal', label: '📝 Journal' },
  { to: '/habits', label: '🎯 Habits' },
  { to: '/stories', label: '📖 Stories' },
  { to: '/chat', label: '💬 Companion' },
  { to: '/garden', label: '🌱 Garden' },
  { to: '/report', label: '📊 Report' },
];

function Navbar() {
  const { mode, signOut } = useAuth();
  const signedOut = mode === 'signedOut';

  return (
    <nav className="navbar" aria-label="Main">
      <div className="logo">
        <span className="logo-icon" aria-hidden="true">🌌</span>
        <span className="logo-text">SoulSpace</span>
      </div>
      <div className="nav-links">
        {!signedOut &&
          links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
      </div>
      {/* Kept outside the scrolling link row so it's always on screen. */}
      <div className="nav-actions">
        <NavLink to="/support" className="nav-support">💙 Get help</NavLink>
        {mode === 'cloud' && (
          <button className="nav-signout" onClick={signOut}>Sign out</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
