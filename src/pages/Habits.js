import { useState, useEffect, useMemo } from 'react';
import './Habits.css';
import { listHabitLog, setHabitDone } from '../lib/store';
import { toDay, computeStreak } from '../lib/dates';
import { BAD_HABITS, GOOD_HABITS } from '../lib/habits';

const badHabits = BAD_HABITS;
const goodHabits = GOOD_HABITS;

function Habits() {
  // log: [{ habitId, day: 'YYYY-MM-DD' }]
  const [log, setLog] = useState([]);
  const [activeTab, setActiveTab] = useState('break');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listHabitLog()
      .then((rows) => active && setLog(rows))
      .catch(() => active && setError("We couldn't load your habits. Check your connection."));
    return () => {
      active = false;
    };
  }, []);

  // Days completed per habit, e.g. { 7: Set(['2026-11-04', '2026-11-05']) }
  const daysByHabit = useMemo(() => {
    const map = {};
    log.forEach(({ habitId, day }) => {
      if (!map[habitId]) map[habitId] = new Set();
      map[habitId].add(day);
    });
    return map;
  }, [log]);

  const today = toDay();

  function isCompletedToday(habitId) {
    return Boolean(daysByHabit[habitId]?.has(today));
  }

  // Calculated fresh from the log every time, so a missed day resets it.
  function getStreak(habitId) {
    return daysByHabit[habitId] ? computeStreak(daysByHabit[habitId], today) : 0;
  }

  async function toggleHabit(habitId) {
    const done = !isCompletedToday(habitId);
    const previous = log;
    // Update the screen straight away, then save; undo if saving fails.
    setLog(done ? [...log, { habitId, day: today }] : log.filter((r) => !(r.habitId === habitId && r.day === today)));
    try {
      setError('');
      await setHabitDone(habitId, done, today);
    } catch {
      setLog(previous);
      setError("That didn't save. Please check your connection and try again.");
    }
  }

  function getDifficultyColor(difficulty) {
    switch(difficulty) {
      case 'Easy': return '#00ff88';
      case 'Medium': return '#FFD700';
      case 'Hard': return '#FF4500';
      default: return 'white';
    }
  }

  const currentHabits = activeTab === 'break' ? badHabits : goodHabits;

  return (
    <div className="habits">
      <div className="habits-header">
        <h1>🎯 Habit Battle</h1>
        <p>Win your battles one day at a time! ⚔️</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'break' ? 'active' : ''}`}
          onClick={() => setActiveTab('break')}
        >
          ⚔️ Break Bad Habits
        </button>
        <button
          className={`tab ${activeTab === 'build' ? 'active' : ''}`}
          onClick={() => setActiveTab('build')}
        >
          🌱 Build Good Habits
        </button>
      </div>

      <div className="habits-grid">
        {currentHabits.map((habit) => (
          <div
            key={habit.id}
            role="button"
            tabIndex={0}
            className={`habit-card ${isCompletedToday(habit.id) ? 'completed' : ''}`}
            onClick={() => toggleHabit(habit.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleHabit(habit.id);
              }
            }}
            aria-pressed={isCompletedToday(habit.id)}
          >
            <div className="habit-icon">{habit.icon}</div>
            <div className="habit-info">
              <h3>{habit.name}</h3>
              <span
                className="difficulty"
                style={{ color: getDifficultyColor(habit.difficulty) }}
              >
                {habit.difficulty}
              </span>
            </div>
            <div className="habit-right">
              {getStreak(habit.id) > 0 && (
                <div className="streak">
                  🔥 {getStreak(habit.id)} day{getStreak(habit.id) > 1 ? 's' : ''}
                </div>
              )}
              <div className={`check ${isCompletedToday(habit.id) ? 'checked' : ''}`}>
                {isCompletedToday(habit.id) ? '✅' : '⬜'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="load-error" role="alert">{error}</p>}

      {/* Milestone: any habit on a 7+ day streak */}
      {[...badHabits, ...goodHabits].some((h) => getStreak(h.id) >= 7) && (
        <div className="milestone">
          🏆 BOSS BATTLE WON! 7 Day Streak! You're incredible!
        </div>
      )}
    </div>
  );
}

export default Habits;