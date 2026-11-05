import { Link } from 'react-router-dom';
import { CRISIS_RESOURCES, telHref } from '../lib/safety';
import './CrisisCard.css';

// Shown whenever someone writes something that sounds like they may be in
// danger. Calm, direct, and focused on reaching a real person.
function CrisisCard({ compact = false }) {
  const { nigeria, emergency, directory } = CRISIS_RESOURCES;
  return (
    <div className={`crisis-card ${compact ? 'compact' : ''}`} role="alert">
      <h3>You deserve support from a real person right now</h3>
      <p>
        It sounds like you're carrying something really painful. You don't have to get through
        this alone. Trained people are ready to listen, any time of day.
      </p>
      <div className="crisis-lines">
        <p className="crisis-org">{nigeria.name} · 24 hours</p>
        {nigeria.lines.map((line) => (
          <a key={line.number} href={telHref(line.number)} className="crisis-call">
            Call {line.number} <span>({line.label})</span>
          </a>
        ))}
      </div>
      <p className="crisis-emergency">
        In immediate danger? Call <a href={telHref(emergency.number)}>{emergency.number}</a> or go
        to the nearest hospital.
      </p>
      <p className="crisis-elsewhere">
        Outside Nigeria, or need another option?{' '}
        <a href={directory.url} target="_blank" rel="noreferrer">
          {directory.name}
        </a>{' '}
        lists free, confidential lines by country.
      </p>
      {compact && (
        <Link to="/support" className="crisis-more">
          More support options →
        </Link>
      )}
    </div>
  );
}

export default CrisisCard;
