import { useState, useEffect } from 'react';
import './Home.css';
import oceanVideo from '../Ocean.mp4';


const moods = [
  { emoji: '😊', label: 'Happy', color: '#FFD700', ocean: 'happy' },
  { emoji: '😔', label: 'Sad', color: '#4A90D9', ocean: 'sad' },
  { emoji: '😰', label: 'Anxious', color: '#7B68EE', ocean: 'anxious' },
  { emoji: '😤', label: 'Angry', color: '#FF4500', ocean: 'angry' },
  { emoji: '😴', label: 'Tired', color: '#708090', ocean: 'tired' },
  { emoji: '🥰', label: 'Grateful', color: '#FF69B4', ocean: 'grateful' },
  { emoji: '😌', label: 'Peaceful', color: '#20B2AA', ocean: 'peaceful' },
  { emoji: '🤗', label: 'Excited', color: '#FF8C00', ocean: 'excited' },
];

function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [todaysMood, setTodaysMood] = useState(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedMood = localStorage.getItem(`mood-${today}`);
    if (savedMood) {
      setTodaysMood(JSON.parse(savedMood));
    }
  }, []);

  function saveMood() {
    if (!selectedMood) return;
    const today = new Date().toDateString();
    const moodEntry = {
      mood: selectedMood,
      note: note,
      date: today,
      time: new Date().toLocaleTimeString()
    };
    localStorage.setItem(`mood-${today}`, JSON.stringify(moodEntry));

    const history = JSON.parse(localStorage.getItem('mood-history') || '[]');
    history.push(moodEntry);
    localStorage.setItem('mood-history', JSON.stringify(history));

    setTodaysMood(moodEntry);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function getMoodParticles() {
    if (!selectedMood) {
      return Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="star-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ));
    }

    switch(selectedMood.ocean) {
      case 'happy':
        return Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="firefly" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 4}s`,
            fontSize: `${Math.random() * 10 + 8}px`,
          }}>✨</div>
        ));

      case 'sad':
        return Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="raindrop-mood" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 1 + 0.8}s`,
            animationDelay: `${Math.random() * 2}s`,
          }} />
        ));

      case 'anxious':
        return Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="swirl-particle" style={{
            left: `${40 + Math.random() * 20}%`,
            top: `${40 + Math.random() * 20}%`,
            animationDuration: `${Math.random() * 2 + 1}s`,
            animationDelay: `${Math.random() * 2}s`,
            fontSize: `${Math.random() * 8 + 6}px`,
          }}>•</div>
        ));

      case 'angry':
        return Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="spark" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 1.5 + 0.5}s`,
            animationDelay: `${Math.random() * 2}s`,
            fontSize: `${Math.random() * 12 + 8}px`,
          }}>🔥</div>
        ));

      case 'tired':
        return Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="tired-star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 3}s`,
            animationDelay: `${Math.random() * 4}s`,
            fontSize: `${Math.random() * 15 + 10}px`,
          }}>💤</div>
        ));

      case 'grateful':
        return Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="heart-float" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 4}s`,
            fontSize: `${Math.random() * 15 + 10}px`,
          }}>💕</div>
        ));

      case 'peaceful':
        return Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
          }} />
        ));

      case 'excited':
        return Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="confetti" style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 1}s`,
            animationDelay: `${Math.random() * 3}s`,
            fontSize: `${Math.random() * 15 + 10}px`,
            color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B'][Math.floor(Math.random() * 5)]
          }}>★</div>
        ));

      default:
        return null;
    }
  }

  return (
    <div className={`home ${selectedMood ? selectedMood.ocean : 'default'}`}>

  <div className="video-background">
  <video autoPlay muted loop playsInline>
    <source src={oceanVideo} type="video/mp4" />
  </video>
</div>

      {/* Mood Particles */}
<div className="particles-container">
  {getMoodParticles()}
</div>

      {/* Ocean waves */}
      <div className="ocean">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="home-content">
        <div className="greeting">
          <h1>How are you feeling today?</h1>
          <p>Your emotions are valid. Let's check in. 💙</p>
        </div>

        {/* Mood selector */}
        <div className="mood-grid">
          {moods.map((mood) => (
            <button
              key={mood.label}
              className={`mood-btn ${selectedMood?.label === mood.label ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood)}
              style={{ '--mood-color': mood.color }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Note input */}
        {selectedMood && (
          <div className="mood-note">
            <p>Want to share more about feeling <strong>{selectedMood.label}</strong>?</p>
            <textarea
              placeholder="Write anything on your mind... (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <button className="save-btn" onClick={saveMood}>
              Save My Mood 💙
            </button>
            {saved && <p className="saved-msg">✅ Mood saved! Keep going, you're doing great!</p>}
          </div>
        )}

        {/* Today's mood display */}
        {todaysMood && !selectedMood && (
          <div className="todays-mood">
            <h3>Today's Check-in</h3>
            <p>{todaysMood.mood.emoji} You felt <strong>{todaysMood.mood.label}</strong> at {todaysMood.time}</p>
            {todaysMood.note && <p className="mood-note-display">"{todaysMood.note}"</p>}
            <button className="update-btn" onClick={() => setTodaysMood(null)}>
              Update Mood
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;