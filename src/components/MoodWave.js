import { useId } from 'react';
import './MoodWave.css';

// A 7-day "mood wave": a smooth line through each day's check-in, with the
// mood's emoji riding on top. Higher = brighter mood. Days without a check-in
// show as a faint dot on the baseline, and the wave is drawn dashed across them.
const W = 700;
const H = 240;
const PAD_X = 90;
const TOP = 40;
const BOTTOM = 190;

const xFor = (i) => PAD_X + (i * (W - PAD_X * 2)) / 6;
const yFor = (score) => BOTTOM - ((score - 1) / 4) * (BOTTOM - TOP);

// Catmull-Rom spline -> one cubic Bézier per gap between check-ins, so the
// wave is smooth. Each piece knows whether it skips over missing days.
function smoothSegments(points) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    segments.push({
      d: `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`,
      curve: ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`,
      skipsDays: p2.index - p1.index > 1,
      order: i,
    });
  }
  return segments;
}

const dayName = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short' });
};

function MoodWave({ series }) {
  const id = useId().replace(/:/g, '');
  const points = series
    .map((d, i) => (d.score !== null ? { ...d, index: i, x: xFor(i), y: yFor(d.score) } : null))
    .filter(Boolean);
  const segments = smoothSegments(points);
  const area =
    points.length > 1
      ? `M ${points[0].x} ${points[0].y}${segments.map((s) => s.curve).join('')} L ${points[points.length - 1].x} ${BOTTOM + 20} L ${points[0].x} ${BOTTOM + 20} Z`
      : '';
  const hasGaps = segments.some((s) => s.skipsDays);

  const summary = series
    .map((d) => `${dayName(d.day)}: ${d.label || 'no check-in'}`)
    .join(', ');

  return (
    <figure className="mood-wave">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Mood over the last 7 days. ${summary}`}>
        <defs>
          <linearGradient id={`wave-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`wave-line-${id}`} gradientUnits="userSpaceOnUse" x1={PAD_X} y1="0" x2={W - PAD_X} y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Guide lines: brighter at the top, heavier at the bottom */}
        <line x1={PAD_X - 20} x2={W - PAD_X + 20} y1={TOP} y2={TOP} className="wave-guide" />
        <line x1={PAD_X - 20} x2={W - PAD_X + 20} y1={(TOP + BOTTOM) / 2} y2={(TOP + BOTTOM) / 2} className="wave-guide" />
        <line x1={PAD_X - 20} x2={W - PAD_X + 20} y1={BOTTOM} y2={BOTTOM} className="wave-guide" />
        <text x={6} y={TOP + 4} className="wave-axis">brighter</text>
        <text x={6} y={BOTTOM + 4} className="wave-axis">heavier</text>

        {area && <path d={area} fill={`url(#wave-fill-${id})`} className="wave-area" />}
        {/* Solid where days are back-to-back; dashed where a day was skipped. */}
        {segments.map((seg) => (
          <path
            key={seg.order}
            d={seg.d}
            fill="none"
            stroke={`url(#wave-line-${id})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={seg.skipsDays ? '8 9' : undefined}
            className={`wave-line ${seg.skipsDays ? 'skips' : ''}`}
            style={{ animationDelay: `${0.18 * seg.order}s` }}
          />
        ))}

        {series.map((d, i) =>
          d.score === null ? (
            <circle key={d.day} cx={xFor(i)} cy={BOTTOM + 20} r="4" className="wave-empty" />
          ) : (
            <g key={d.day} className="wave-point" style={{ animationDelay: `${0.15 * i + 0.4}s` }}>
              <circle cx={xFor(i)} cy={yFor(d.score)} r="20" className="wave-halo" />
              <text x={xFor(i)} y={yFor(d.score) + 9} textAnchor="middle" className="wave-emoji">
                {d.emoji}
              </text>
              <title>{`${dayName(d.day)}: ${d.label}${d.note ? ` — “${d.note}”` : ''}`}</title>
            </g>
          )
        )}

        {series.map((d, i) => (
          <text key={`label-${d.day}`} x={xFor(i)} y={H - 4} textAnchor="middle" className="wave-day">
            {i === 6 ? 'Today' : dayName(d.day)}
          </text>
        ))}
      </svg>
      {points.length === 1 && (
        <figcaption>One check-in so far. Your wave takes shape from the second one.</figcaption>
      )}
      {hasGaps && <figcaption>Dashed parts skip over days without a check-in.</figcaption>}
    </figure>
  );
}

export default MoodWave;
