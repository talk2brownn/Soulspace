import { useState, useEffect } from 'react';
import './Journal.css';
import journalVideo from '../media/Journal.mp4';
import journalPoster from '../media/Journal-poster.jpg';
import BackgroundVideo from '../components/BackgroundVideo';
import CrisisCard from '../components/CrisisCard';
import { listJournal, addJournal, deleteJournal } from '../lib/store';
import { detectCrisis } from '../lib/safety';

function Journal() {
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  // True while the title or entry box has focus: softens the video.
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listJournal()
      .then((list) => active && setEntries(list))
      .catch(() => active && setError("We couldn't load your entries. Check your connection."));
    return () => {
      active = false;
    };
  }, []);

  async function saveEntry() {
    if (entry.trim() === '' || busy) return;
    setBusy(true);
    setError('');
    try {
      const created = await addJournal({ title: title.trim() || 'Untitled Entry', content: entry });
      setEntries((prev) => [created, ...prev]);
      setShowSupport(detectCrisis(`${title} ${entry}`));
      setEntry('');
      setTitle('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Your entry didn't save. Your text is still here, so you can try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await deleteJournal(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch {
      setError("That entry couldn't be deleted. Please try again.");
    }
  }

  return (
    <div className="journal">
      <div className="journal-header">
        <h1><span className="h1-emoji" aria-hidden="true">📝</span>My Journal</h1>
        <p>Your safe space to express yourself freely</p>
      </div>

      <BackgroundVideo src={journalVideo} poster={journalPoster} focused={writing} />

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
            onFocus={() => setWriting(true)}
            onBlur={() => setWriting(false)}
          />
          <textarea
            placeholder="What's on your mind today? Write freely, no judgement here... 💙"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={10}
            className="entry-input"
            onFocus={() => setWriting(true)}
            onBlur={() => setWriting(false)}
          />
          <button className="save-entry-btn" onClick={saveEntry} disabled={busy}>
            {busy ? 'Saving…' : 'Save Entry 💙'}
          </button>
          {saved && <p className="saved-msg">✅ Entry saved!</p>}
          {error && <p className="load-error" role="alert">{error}</p>}
          {showSupport && <CrisisCard compact />}
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
                    onClick={(ev) => { ev.stopPropagation(); removeEntry(e.id); }}
                    aria-label={`Delete ${e.title}`}
                  >✕</button>
                </div>
                <p className="entry-preview">
                  {e.content.length > 80 ? `${e.content.substring(0, 80)}…` : e.content}
                </p>
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