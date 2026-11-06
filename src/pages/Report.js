import { useState, useEffect, useMemo } from 'react';
import './Report.css';
import reportVideo from '../media/Report.mp4';
import reportPoster from '../media/Report-poster.jpg';
import BackgroundVideo from '../components/BackgroundVideo';
import MoodWave from '../components/MoodWave';
import { listMoods, listJournal, listHabitLog } from '../lib/store';
import { toDay, shiftDay } from '../lib/dates';
import { compareWeeks, weekSeries, topMood, buildInsights } from '../lib/insights';
import { moodForScore } from '../lib/moods';

const formatDay = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

// "▲ 2 vs last week" — or a neutral note when there's nothing to compare.
function Delta({ now, before, unit = '' }) {
  if (before === null || before === undefined) return <span className="delta neutral">first week</span>;
  const diff = Math.round((now - before) * 10) / 10;
  if (diff === 0) return <span className="delta neutral">same as last week</span>;
  return (
    <span className={`delta ${diff > 0 ? 'up' : 'down'}`}>
      {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}{unit} vs last week
    </span>
  );
}

function Report() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([listMoods(), listJournal(), listHabitLog()])
      .then(([moods, journals, habitLog]) => active && setData({ moods, journals, habitLog }))
      .catch(() => active && setError("We couldn't load your report. Check your connection."));
    return () => {
      active = false;
    };
  }, []);

  const today = toDay();
  const view = useMemo(() => {
    if (!data) return null;
    const { thisWeek, lastWeek } = compareWeeks(data, today);
    const hadLastWeek = lastWeek.checkIns + lastWeek.journals + lastWeek.habits > 0;
    return {
      thisWeek,
      lastWeek: hadLastWeek ? lastWeek : null,
      series: weekSeries(data.moods, today),
      top: topMood(data.moods, shiftDay(today, -6), today),
      insights: buildInsights(data, today),
      weekMoods: data.moods.filter((m) => m.day >= shiftDay(today, -6)).reverse(),
    };
  }, [data, today]);

  const weekFeel = view?.thisWeek.avgScore != null ? moodForScore(view.thisWeek.avgScore) : null;

  return (
    <div className="report">
      <div className="report-header">
        <h1><span className="h1-emoji" aria-hidden="true">📊</span>Weekly Soul Report</h1>
        <p>The last 7 days, in patterns you might not notice day to day 💙</p>
      </div>

      <BackgroundVideo src={reportVideo} poster={reportPoster} />

      {error && <p className="load-error" role="alert">{error}</p>}
      {!view && !error && <p className="report-loading" aria-live="polite">Gathering your week…</p>}

      {view && (
        <>
          {/* This week vs last week */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-icon">🌊</span>
              <h3>{view.thisWeek.checkIns}<small>/7</small></h3>
              <p>Check-ins</p>
              <Delta now={view.thisWeek.checkIns} before={view.lastWeek?.checkIns} />
            </div>
            <div className="summary-card">
              <span className="summary-icon">📝</span>
              <h3>{view.thisWeek.journals}</h3>
              <p>Journal entries</p>
              <Delta now={view.thisWeek.journals} before={view.lastWeek?.journals} />
            </div>
            <div className="summary-card">
              <span className="summary-icon">🎯</span>
              <h3>{view.thisWeek.habits}</h3>
              <p>Habits ticked</p>
              <Delta now={view.thisWeek.habits} before={view.lastWeek?.habits} />
            </div>
            <div className="summary-card">
              <span className="summary-icon">{view.top ? view.top.emoji : '⭐'}</span>
              <h3 className="summary-word">{view.top ? view.top.label : '—'}</h3>
              <p>Most felt</p>
              {weekFeel && <span className="delta neutral">week felt {weekFeel.emoji}</span>}
            </div>
          </div>

          {/* Mood wave chart */}
          <section className="wave-card" aria-labelledby="wave-title">
            <h3 id="wave-title">Your mood wave</h3>
            {view.thisWeek.checkIns === 0 ? (
              <p className="no-data">No check-ins in the last 7 days yet. Log a mood and your wave starts here. 🌊</p>
            ) : (
              <MoodWave series={view.series} />
            )}
          </section>

          {/* Insights from real data */}
          <section className="insight-card" aria-labelledby="insight-title">
            <h3 id="insight-title">💙 What your week is telling you</h3>
            <ul className="insight-list">
              {view.insights.map((insight) => (
                <li key={insight.text}>
                  <span className="insight-icon" aria-hidden="true">{insight.icon}</span>
                  <span>{insight.text}</span>
                </li>
              ))}
            </ul>
            <p className="insight-note">Based only on what you've logged. Patterns, not diagnoses.</p>
          </section>

          {/* Day-by-day notes */}
          {view.weekMoods.length > 0 && (
            <section className="mood-history" aria-labelledby="journey-title">
              <h3 id="journey-title">Day by day</h3>
              <div className="mood-timeline">
                {view.weekMoods.map((entry) => (
                  <div key={entry.day} className="timeline-item">
                    <span className="timeline-emoji">{entry.mood.emoji}</span>
                    <div className="timeline-info">
                      <p className="timeline-mood">{entry.mood.label}</p>
                      <p className="timeline-date">{entry.day === today ? 'Today' : formatDay(entry.day)}</p>
                      {entry.note && <p className="timeline-note">"{entry.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Report;
