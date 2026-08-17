import { useState, useEffect } from 'react';
import './Garden.css';
import gardenVideo from '../Garden.mp4';

function Garden() {
  const [growthLevel, setGrowthLevel] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [habitCount, setHabitCount] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    // Count journal entries
    const journals = JSON.parse(localStorage.getItem('journal-entries') || '[]');
    setJournalCount(journals.length);

    // Count mood entries
    const moods = JSON.parse(localStorage.getItem('mood-history') || '[]');
    setMoodCount(moods.length);

    // Count habit completions
    const habits = JSON.parse(localStorage.getItem('habits') || '{}');
    const habitCompletions = Object.keys(habits).filter(k => !k.includes('streak')).length;
    setHabitCount(habitCompletions);

    // Calculate growth level
    const totalActivity = journals.length + moods.length + habitCompletions;
    let level = 0;
    if (totalActivity >= 1) level = 1;
    if (totalActivity >= 5) level = 2;
    if (totalActivity >= 10) level = 3;
    if (totalActivity >= 20) level = 4;
    if (totalActivity >= 35) level = 5;
    if (totalActivity >= 50) level = 6;
    setGrowthLevel(level);

    // Generate plants based on level
    generatePlants(level, totalActivity);
  }, []);

  function generatePlants(level, total) {
    const plantTypes = ['🌱', '🌿', '🌸', '🌺', '🌻', '🌳', '🌲', '🍀', '🌾', '🌴'];
    const count = Math.min(total + 2, 30);
    const newPlants = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: plantTypes[Math.min(Math.floor(level * 1.5), plantTypes.length - 1)],
      left: `${5 + (i % 10) * 9}%`,
      bottom: `${10 + Math.random() * 30}%`,
      size: `${1.5 + Math.random() * 2}rem`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));
    setPlants(newPlants);
  }

  function getGrowthMessage() {
    switch(growthLevel) {
      case 0: return { title: "Your garden awaits 🌑", message: "Start journaling, tracking moods and completing habits to watch your garden grow!", color: "#666" };
      case 1: return { title: "Seeds are planted 🌱", message: "You've taken your first steps! Keep going — something beautiful is beginning.", color: "#90EE90" };
      case 2: return { title: "Sprouts are growing 🌿", message: "Your consistency is showing! The garden is coming alive with your effort.", color: "#32CD32" };
      case 3: return { title: "Flowers are blooming 🌸", message: "Look at what you've built! Your dedication is creating something truly beautiful.", color: "#FF69B4" };
      case 4: return { title: "Your garden thrives 🌻", message: "You're doing incredible work. This garden is a reflection of your inner growth.", color: "#FFD700" };
      case 5: return { title: "Trees are standing tall 🌳", message: "Wow. You have built something remarkable. Your roots run deep now.", color: "#228B22" };
      case 6: return { title: "A lush forest 🌲", message: "This is extraordinary. You have transformed your inner world into something magnificent.", color: "#006400" };
      default: return { title: "Your garden awaits 🌑", message: "Start your journey today!", color: "#666" };
    }
  }

  const growthInfo = getGrowthMessage();

  return (
    <div className="garden">
      {/* Sky */}
      <div className="garden-sky">
        <div className="sun">☀️</div>
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">⛅</div>
      </div>

      <div className="video-background">
  <video autoPlay muted loop playsInline>
    <source src={gardenVideo} type="video/mp4" />
  </video>
</div>

      {/* Growth message */}
      <div className="growth-message">
        <h1>{growthInfo.title}</h1>
        <p>{growthInfo.message}</p>
      </div>

      {/* Stats */}
      <div className="garden-stats">
        <div className="stat-item">
          <span className="stat-icon">📝</span>
          <span className="stat-number">{journalCount}</span>
          <span className="stat-label">Journal Entries</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🌊</span>
          <span className="stat-number">{moodCount}</span>
          <span className="stat-label">Mood Check-ins</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <span className="stat-number">{habitCount}</span>
          <span className="stat-label">Habit Completions</span>
        </div>
      </div>

      {/* Garden ground */}
      <div className="garden-ground">
        {/* Plants */}
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="plant"
            style={{
              left: plant.left,
              bottom: plant.bottom,
              fontSize: plant.size,
              animationDelay: plant.animationDelay,
              animationDuration: plant.animationDuration,
            }}
          >
            {plant.emoji}
          </div>
        ))}

        {/* Empty state */}
        {plants.length === 0 && (
          <div className="empty-garden">
            <p>🌑 Your garden is waiting for you to begin...</p>
          </div>
        )}

        {/* Ground */}
        <div className="ground-base"></div>
      </div>

      {/* Progress bar */}
      <div className="growth-progress">
        <div className="progress-label">
          <span>Garden Growth</span>
          <span>{Math.round((growthLevel / 6) * 100)}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(growthLevel / 6) * 100}%` }}
          ></div>
        </div>
        <div className="progress-stages">
          <span>🌑</span>
          <span>🌱</span>
          <span>🌿</span>
          <span>🌸</span>
          <span>🌻</span>
          <span>🌳</span>
          <span>🌲</span>
        </div>
      </div>
    </div>
  );
}

export default Garden;