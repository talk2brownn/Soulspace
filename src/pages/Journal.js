import JournalVideo from '../Journal.mp4';
import { useState, useEffect } from 'react';
import './Journal.css';

function Journal() {
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('journal-entries') || '[]');
    setEntries(savedEntries);
  }, []);

  function saveEntry() {
    if (entry.trim() === '') return;

    const newEntry = {
      id: Date.now(),
      title: title || 'Untitled Entry',
      content: entry,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));

    setEntry('');
    setTitle('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function deleteEntry(id) {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  }

  return (
    <div className="journal">
      <div className="journal-header">
        <h1>📝 My Journal</h1>
        <p>Your safe space to express yourself freely</p>
      </div>

   <div className="video-background">
     <video autoPlay loop muted playsInline>
     <source src={JournalVideo} type="video/mp4" />
     </video>
    </div>

      <div className="journal-layout">
        {/* Write new entry */}
        <div className="write-section">
          <h3>New Entry</h3>
          <input
            type="text"
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          <textarea
            placeholder="What's on your mind today? Write freely, no judgement here... 💙"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={10}
            className="entry-input"
          />
          <button className="save-entry-btn" onClick={saveEntry}>
            Save Entry 💙
          </button>
          {saved && <p className="saved-msg">✅ Entry saved!</p>}
        </div>

        {/* Previous entries */}
        <div className="entries-section">
          <h3>Previous Entries ({entries.length})</h3>
          {entries.length === 0 && (
            <p className="no-entries">No entries yet — start writing! 📝</p>
          )}
          <div className="entries-list">
            {entries.map((e) => (
              <div
                key={e.id}
                className={`entry-card ${selectedEntry?.id === e.id ? 'active' : ''}`}
                onClick={() => setSelectedEntry(e)}
              >
                <div className="entry-card-header">
                  <h4>{e.title}</h4>
                  <button
                    className="delete-btn"
                    onClick={(ev) => { ev.stopPropagation(); deleteEntry(e.id); }}
                  >✕</button>
                </div>
                <p className="entry-preview">{e.content.substring(0, 80)}...</p>
                <span className="entry-date">{e.date} at {e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full entry modal */}
      {selectedEntry && (
        <div className="entry-modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedEntry(null)}>✕</button>
            <h2>{selectedEntry.title}</h2>
            <p className="modal-date">{selectedEntry.date} at {selectedEntry.time}</p>
            <p className="modal-content">{selectedEntry.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;