import { useState, useEffect } from 'react';
import './Home.css';
import oceanVideo from '../media/Ocean.mp4';
import oceanPoster from '../media/Ocean-poster.jpg';
import BackgroundVideo from '../components/BackgroundVideo';
import CrisisCard from '../components/CrisisCard';
import { listMoods, saveMood as storeMood } from '../lib/store';
import { detectCrisis } from '../lib/safety';
import { toDay } from '../lib/dates';


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
  const [showSupport, setShowSupport] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listMoods()
      .then((moods) => {
        if (!active) return;
        const today = moods.find((m) => m.day === toDay());
        if (today) setTodaysMood(today);
      })
      .catch(() => active && setError("We couldn't load today's check-in. Check your connection."));
    return () => {
      active = false;
    };
  }, []);

  async function saveMood() {
    if (!selectedMood || busy) return;
    setBusy(true);
    setError('');
    try {
      const entry = await storeMood({ mood: selectedMood, note });
      setShowSupport(detectCrisis(note));
      setTodaysMood(entry);
      setSaved(true);
      setNote('');
      setSelectedMood(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Your mood didn't save. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Keep today's mood theme on screen after saving.
  const themeMood = selectedMood || todaysMood?.mood || null;

  function getMoodParticles() {
    if (!themeMood) {
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

    switch (themeMood.ocean) {
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
    <div className={`home ${themeMood ? themeMood.ocean : 'default'}`}>

      <BackgroundVideo src={oceanVideo} poster={oceanPoster} />

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
            <button className="save-btn" onClick={saveMood} disabled={busy}>
              {busy ? 'Saving…' : 'Save My Mood 💙'}
            </button>
          </div>
        )}

        {error && <p className="load-error" role="alert">{error}</p>}
        {saved && <p className="saved-msg">✅ Mood saved! Keep going, you're doing great!</p>}
        {showSupport && <CrisisCard compact />}

        {/* Today's mood display */}
        {todaysMood && !selectedMood && (
          <div className="todays-mood">
            <h3>Today's Check-in</h3>
            <p>{todaysMood.mood.emoji} You felt <strong>{todaysMood.mood.label}</strong>{todaysMood.time ? ` at ${todaysMood.time}` : ''}</p>
            {todaysMood.note && <p className="mood-note-display">"{todaysMood.note}"</p>}
            <button className="update-btn" onClick={() => { setTodaysMood(null); setShowSupport(false); }}>
              Update Mood
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;