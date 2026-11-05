import { useState, useEffect } from 'react';
import './Report.css';
import reportVideo from '../media/Report.mp4';
import reportPoster from '../media/Report-poster.jpg';
import BackgroundVideo from '../components/BackgroundVideo';
import { listMoods, listJournal, listHabitLog } from '../lib/store';
import { toDay, shiftDay } from '../lib/dates';

const formatDay = (day) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

function Report() {
  const [moodHistory, setMoodHistory] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [habitCount, setHabitCount] = useState(0);
  const [topMood, setTopMood] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const weekStart = shiftDay(toDay(), -6); // today plus the 6 days before it
    Promise.all([listMoods(), listJournal(), listHabitLog()])
      .then(([moods, journals, habitLog]) => {
        if (!active) return;
        const weekMoods = moods.filter((m) => m.day >= weekStart);
        const weekHabits = habitLog.filter((h) => h.day >= weekStart);

        setMoodHistory(weekMoods);
        setJournalCount(journals.length);
        setHabitCount(weekHabits.length);

        if (weekMoods.length > 0) {
          const moodCounts = {};
          weekMoods.forEach((m) => {
            moodCounts[m.mood.label] = (moodCounts[m.mood.label] || 0) + 1;
          });
          const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
          setTopMood({ label: top[0], count: top[1] });
        }
        generateInsight(weekMoods, journals.length, weekHabits.length);
      })
      .catch(() => active && setError("We couldn't load your report. Check your connection."));
    return () => {
      active = false;
    };
  }, []);

  function generateInsight(moods, journals, habits) {
    if (moods.length === 0) {
      setWeeklyInsight("Start checking in daily to receive your personalized weekly insight! 💙");
      return;
    }
    const insights = [
      "You've been showing up for yourself consistently. That takes real strength. 💙",
      "Every check-in you complete is an act of self-awareness. You're doing beautifully.",
      "Your willingness to face your emotions head-on is one of the bravest things a person can do.",
      "The data shows you're building a habit of self-care. Keep going — it compounds over time.",
      "You showed up this week. On the hard days and the good ones. That matters more than you know."
    ];
    setWeeklyInsight(insights[Math.floor(Math.random() * insights.length)]);
  }

  return (
    <div className="report">
      <div className="report-header">
        <h1>📊 Weekly Soul Report</h1>
        <p>Your journey in numbers and insights 💙</p>
      </div>

      <BackgroundVideo src={reportVideo} poster={reportPoster} />

      {error && <p className="load-error" role="alert">{error}</p>}

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-icon">🌊</span>
          <h3>{moodHistory.length}</h3>
          <p>Check-ins this week</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">📝</span>
          <h3>{journalCount}</h3>
          <p>Journal entries (all time)</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">🎯</span>
          <h3>{habitCount}</h3>
          <p>Habits done this week</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">⭐</span>
          <h3>{topMood ? topMood.label : 'N/A'}</h3>
          <p>Most felt this week</p>
        </div>
      </div>

      {/* Weekly insight */}
      <div className="insight-card">
        <h3>💙 Your Weekly Insight</h3>
        <p>{weeklyInsight}</p>
      </div>

      {/* Mood history */}
      <div className="mood-history">
        <h3>This Week's Mood Journey</h3>
        {moodHistory.length === 0 ? (
          <p className="no-data">No mood entries yet — start checking in! 🌊</p>
        ) : (
          <div className="mood-timeline">
            {moodHistory.map((entry) => (
              <div key={entry.day} className="timeline-item">
                <span className="timeline-emoji">{entry.mood.emoji}</span>
                <div className="timeline-info">
                  <p className="timeline-mood">{entry.mood.label}</p>
                  <p className="timeline-date">{formatDay(entry.day)}</p>
                  {entry.note && <p className="timeline-note">"{entry.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Report;