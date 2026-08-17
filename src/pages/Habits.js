import { useState, useEffect } from 'react';
import './Habits.css';

const badHabits = [
  { id: 1, name: 'Smoking', icon: '🚬', difficulty: 'Hard' },
  { id: 2, name: 'Excessive Phone Use', icon: '📱', difficulty: 'Medium' },
  { id: 3, name: 'Overeating', icon: '🍔', difficulty: 'Medium' },
  { id: 4, name: 'Procrastinating', icon: '⏰', difficulty: 'Hard' },
  { id: 5, name: 'Negative Self Talk', icon: '💭', difficulty: 'Hard' },
  { id: 6, name: 'Skipping Sleep', icon: '😴', difficulty: 'Medium' },
];

const goodHabits = [
  { id: 7, name: 'Exercise', icon: '💪', difficulty: 'Medium' },
  { id: 8, name: 'Reading', icon: '📚', difficulty: 'Easy' },
  { id: 9, name: 'Meditation', icon: '🧘', difficulty: 'Easy' },
  { id: 10, name: 'Drinking Water', icon: '💧', difficulty: 'Easy' },
  { id: 11, name: 'Journaling', icon: '📝', difficulty: 'Easy' },
  { id: 12, name: 'Gratitude', icon: '🙏', difficulty: 'Easy' },
];

function Habits() {
  const [habits, setHabits] = useState({});
  const [customHabit, setCustomHabit] = useState('');
  const [activeTab, setActiveTab] = useState('break');

  useEffect(() => {
    const savedHabits = JSON.parse(localStorage.getItem('habits') || '{}');
    setHabits(savedHabits);
  }, []);

  function toggleHabit(habitId) {
    const today = new Date().toDateString();
    const key = `${habitId}-${today}`;
    const updatedHabits = { ...habits };

    if (updatedHabits[key]) {
      delete updatedHabits[key];
    } else {
      updatedHabits[key] = true;
      // Calculate streak
      let streak = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
      while (updatedHabits[`${habitId}-${checkDate.toDateString()}`]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      updatedHabits[`${habitId}-streak`] = streak;
    }

    setHabits(updatedHabits);
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
  }

  function isCompletedToday(habitId) {
    const today = new Date().toDateString();
    return habits[`${habitId}-${today}`];
  }

  function getStreak(habitId) {
    return habits[`${habitId}-streak`] || 0;
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
            className={`habit-card ${isCompletedToday(habit.id) ? 'completed' : ''}`}
            onClick={() => toggleHabit(habit.id)}
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

      {/* Milestone messages */}
      {Object.values(habits).some(v => v === 7) && (
        <div className="milestone">
          🏆 BOSS BATTLE WON! 7 Day Streak! You're incredible!
        </div>
      )}
    </div>
  );
}

export default Habits;