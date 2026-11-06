import { useState, useEffect, useMemo, useRef } from 'react';
import './Journal.css';
import journalVideo from '../media/Journal.mp4';
import journalPoster from '../media/Journal-poster.jpg';
import BackgroundVideo from '../components/BackgroundVideo';
import CrisisCard from '../components/CrisisCard';
import { listJournal, addJournal, updateJournal, deleteJournal, listMoods } from '../lib/store';
import { detectCrisis } from '../lib/safety';
import { toDay } from '../lib/dates';
import { MOODS } from '../lib/moods';
import { promptsFor } from '../lib/prompts';

const tagOf = (mood) => (mood ? { label: mood.label, emoji: mood.emoji } : null);

// A row of mood emoji to tag an entry. Tap the selected one again to clear it.
function MoodPicker({ value, onChange, label }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label={label}>
      {MOODS.map((m) => {
        const selected = value?.label === m.label;
        return (
          <button
            key={m.label}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={m.label}
            title={m.label}
            className={`mood-chip ${selected ? 'selected' : ''}`}
            onClick={() => onChange(selected ? null : tagOf(m))}
          >
            {m.emoji}
          </button>
        );
      })}
    </div>
  );
}

function Journal() {
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(null); // tag for the new entry
  const [todayMood, setTodayMood] = useState(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editing, setEditing] = useState(null); // { title, content, mood } while editing
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  // True while the title or entry box has focus: softens the video.
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const entryRef = useRef(null);

  useEffect(() => {
    let active = true;
    listJournal()
      .then((list) => active && setEntries(list))
      .catch(() => active && setError("We couldn't load your entries. Check your connection."));
    // Pre-tag new entries with today's check-in, if there is one.
    listMoods()
      .then((moods) => {
        if (!active) return;
        const today = moods.find((m) => m.day === toDay());
        if (today) {
          setTodayMood(today.mood);
          setMood(tagOf(today.mood));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Prompts follow the mood you've tagged (or today's check-in).
  const promptMood = mood?.label || todayMood?.label;
  const prompts = promptsFor(promptMood);
  const prompt = prompts[promptIndex % prompts.length];

  function applyPrompt() {
    if (!title.trim()) setTitle(prompt);
    else setEntry((current) => (current.trim() ? `${current}\n\n${prompt}\n` : `${prompt}\n`));
    entryRef.current?.focus();
  }

  async function saveEntry() {
    if (entry.trim() === '' || busy) return;
    setBusy(true);
    setError('');
    try {
      const created = await addJournal({ title: title.trim() || 'Untitled Entry', content: entry, mood });
      setEntries((prev) => [created, ...prev]);
      setShowSupport(detectCrisis(`${title} ${entry}`));
      setEntry('');
      setTitle('');
      setMood(tagOf(todayMood));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Your entry didn't save. Your text is still here, so you can try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing || editing.content.trim() === '' || busy) return;
    setBusy(true);
    setError('');
    try {
      const updated = await updateJournal(selectedEntry.id, {
        title: editing.title.trim() || 'Untitled Entry',
        content: editing.content,
        mood: editing.mood,
      });
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedEntry(updated);
      setEditing(null);
      setShowSupport(detectCrisis(`${editing.title} ${editing.content}`));
    } catch {
      setError("Your changes didn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await deleteJournal(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) closeModal();
    } catch {
      setError("That entry couldn't be deleted. Please try again.");
    }
  }

  function closeModal() {
    setSelectedEntry(null);
    setEditing(null);
  }

  // Close the open entry with the Escape key.
  useEffect(() => {
    if (!selectedEntry) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedEntry(null);
        setEditing(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEntry]);

  const visibleEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (!moodFilter || e.mood?.label === moodFilter) &&
        (!q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q))
    );
  }, [entries, search, moodFilter]);

  // Only offer filters for moods you've actually used.
  const usedMoods = MOODS.filter((m) => entries.some((e) => e.mood?.label === m.label));

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

          <div className="prompt-card">
            <span className="prompt-label">
              ✨ {promptMood ? `A prompt for feeling ${promptMood.toLowerCase()}` : 'Need a spark?'}
            </span>
            <p className="prompt-text">{prompt}</p>
            <div className="prompt-actions">
              <button type="button" onClick={applyPrompt}>Use this</button>
              <button type="button" onClick={() => setPromptIndex((i) => i + 1)} aria-label="Show another prompt">
                ↻ Another
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
            aria-label="Entry title"
            onFocus={() => setWriting(true)}
            onBlur={() => setWriting(false)}
          />
          <textarea
            ref={entryRef}
            placeholder="What's on your mind today? Write freely, no judgement here... 💙"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={7}
            className="entry-input"
            aria-label="Entry text"
            onFocus={() => setWriting(true)}
            onBlur={() => setWriting(false)}
          />

          <div className="tag-row">
            <span>How does this entry feel?</span>
            <MoodPicker value={mood} onChange={setMood} label="Tag this entry with a mood" />
          </div>

          <button className="save-entry-btn" onClick={saveEntry} disabled={busy || entry.trim() === ''}>
            {busy ? 'Saving…' : 'Save Entry 💙'}
          </button>
          {saved && <p className="saved-msg">✅ Entry saved!</p>}
          {error && <p className="load-error" role="alert">{error}</p>}
          {showSupport && <CrisisCard compact />}
        </div>

        {/* Previous entries */}
        <div className="entries-section">
          <h3>Previous Entries ({entries.length})</h3>

          {entries.length > 0 && (
            <div className="entries-tools">
              <input
                type="search"
                className="search-input"
                placeholder="🔍 Search your entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search entries"
              />
              {usedMoods.length > 0 && (
                <div className="filter-row" aria-label="Filter by mood">
                  <button
                    type="button"
                    className={`filter-chip ${!moodFilter ? 'selected' : ''}`}
                    onClick={() => setMoodFilter(null)}
                  >
                    All
                  </button>
                  {usedMoods.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      className={`filter-chip ${moodFilter === m.label ? 'selected' : ''}`}
                      onClick={() => setMoodFilter(moodFilter === m.label ? null : m.label)}
                      aria-pressed={moodFilter === m.label}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {entries.length === 0 && <p className="no-entries">No entries yet — start writing! 📝</p>}
          {entries.length > 0 && visibleEntries.length === 0 && (
            <p className="no-entries">No entries match. Try another word or mood.</p>
          )}

          <div className="entries-list">
            {visibleEntries.map((e) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                className={`entry-card ${selectedEntry?.id === e.id ? 'active' : ''}`}
                onClick={() => setSelectedEntry(e)}
                onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), setSelectedEntry(e))}
              >
                <div className="entry-card-header">
                  <h4>
                    {e.mood && <span className="entry-mood" title={e.mood.label}>{e.mood.emoji}</span>}
                    {e.title}
                  </h4>
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

      {/* Full entry: read or edit */}
      {selectedEntry && (
        <div className="entry-modal-overlay" onClick={closeModal}>
          <div
            className="entry-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedEntry.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closeModal} aria-label="Close">✕</button>

            {editing ? (
              <div className="edit-form">
                <input
                  className="title-input"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  aria-label="Edit title"
                />
                <textarea
                  className="entry-input"
                  rows={12}
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  aria-label="Edit entry"
                  autoFocus
                />
                <div className="tag-row">
                  <span>Mood</span>
                  <MoodPicker
                    value={editing.mood}
                    onChange={(m) => setEditing({ ...editing, mood: m })}
                    label="Change this entry's mood"
                  />
                </div>
                <div className="modal-actions">
                  <button className="save-entry-btn" onClick={saveEdit} disabled={busy || editing.content.trim() === ''}>
                    {busy ? 'Saving…' : 'Save changes'}
                  </button>
                  <button className="ghost-btn" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>
                  {selectedEntry.mood && <span className="entry-mood">{selectedEntry.mood.emoji}</span>}
                  {selectedEntry.title}
                </h2>
                <p className="modal-date">
                  {selectedEntry.date} at {selectedEntry.time}
                  {selectedEntry.mood && ` · feeling ${selectedEntry.mood.label.toLowerCase()}`}
                </p>
                <p className="modal-content">{selectedEntry.content}</p>
                <div className="modal-actions">
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      setEditing({
                        title: selectedEntry.title,
                        content: selectedEntry.content,
                        mood: selectedEntry.mood,
                      })
                    }
                  >
                    ✏️ Edit
                  </button>
                  <button className="ghost-btn danger" onClick={() => removeEntry(selectedEntry.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;
