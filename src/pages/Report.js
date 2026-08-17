import ReportVideo from '../Report.mp4';
import { useState, useEffect } from 'react';
import './Report.css';

function Report() {
  const [moodHistory, setMoodHistory] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [habitCount, setHabitCount] = useState(0);
  const [topMood, setTopMood] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState('');

  useEffect(() => {
    const moods = JSON.parse(localStorage.getItem('mood-history') || '[]');
    const journals = JSON.parse(localStorage.getItem('journal-entries') || '[]');
    const habits = JSON.parse(localStorage.getItem('habits') || '{}');
    const habitCompletions = Object.keys(habits).filter(k => !k.includes('streak')).length;

    setMoodHistory(moods.slice(-7));
    setJournalCount(journals.length);
    setHabitCount(habitCompletions);

    if (moods.length > 0) {
      const moodCounts = {};
      moods.forEach(m => {
        moodCounts[m.mood.label] = (moodCounts[m.mood.label] || 0) + 1;
      });
      const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
      setTopMood({ label: top[0], count: top[1] });
    }

    generateInsight(moods, journals.length, habitCompletions);
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

      <div className="video-background">
  <video autoPlay loop muted playsInline>
    <source src={ReportVideo} type="video/mp4" />
  </video>
</div>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-icon">🌊</span>
          <h3>{moodHistory.length}</h3>
          <p>Mood Check-ins</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">📝</span>
          <h3>{journalCount}</h3>
          <p>Journal Entries</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">🎯</span>
          <h3>{habitCount}</h3>
          <p>Habits Completed</p>
        </div>
        <div className="summary-card">
          <span className="summary-icon">⭐</span>
          <h3>{topMood ? topMood.label : 'N/A'}</h3>
          <p>Most Felt Mood</p>
        </div>
      </div>

      {/* Weekly insight */}
      <div className="insight-card">
        <h3>💙 Your Weekly Insight</h3>
        <p>{weeklyInsight}</p>
      </div>

      {/* Mood history */}
      <div className="mood-history">
        <h3>Recent Mood Journey</h3>
        {moodHistory.length === 0 ? (
          <p className="no-data">No mood entries yet — start checking in! 🌊</p>
        ) : (
          <div className="mood-timeline">
            {moodHistory.map((entry, i) => (
              <div key={i} className="timeline-item">
                <span className="timeline-emoji">{entry.mood.emoji}</span>
                <div className="timeline-info">
                  <p className="timeline-mood">{entry.mood.label}</p>
                  <p className="timeline-date">{entry.date}</p>
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