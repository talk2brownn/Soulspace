// One place for all SoulSpace data. Pages call these functions and never
// touch localStorage or Supabase directly, so the storage can change
// without rewriting every page.
//
// Two backends:
//  - local: the browser's localStorage (guest mode, or no Supabase set up)
//  - cloud: Supabase, scoped to the signed-in user by Row Level Security
import { supabase } from './supabase';
import { toDay } from './dates';

let cloudUserId = null;
export function setCloudUser(userId) {
  cloudUserId = userId;
}
const inCloud = () => Boolean(supabase && cloudUserId);

// ---------- local helpers (keeps the original localStorage keys) ----------
const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Old entries used Date.toDateString() ("Thu Nov 05 2026"); convert to YYYY-MM-DD.
const legacyToDay = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : toDay(d);
};

function readLocalMoods() {
  const history = readJSON('mood-history', []);
  // One entry per day: the latest check-in of the day wins.
  const byDay = new Map();
  history.forEach((entry) => {
    const day = entry.day || legacyToDay(entry.date);
    if (day && entry.mood) byDay.set(day, { ...entry, day });
  });
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

function readLocalHabitLog() {
  const raw = readJSON('habits', {});
  const log = [];
  Object.keys(raw).forEach((key) => {
    if (key.endsWith('-streak') || !raw[key]) return;
    const dash = key.indexOf('-');
    const habitId = Number(key.slice(0, dash));
    const day = legacyToDay(key.slice(dash + 1));
    if (habitId && day) log.push({ habitId, day });
  });
  return log;
}

// ---------- moods ----------
export async function listMoods() {
  if (!inCloud()) return readLocalMoods();
  const { data, error } = await supabase
    .from('mood_entries')
    .select('day, mood_label, mood_emoji, mood_color, mood_ocean, note, created_at')
    .order('day', { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    day: row.day,
    mood: { label: row.mood_label, emoji: row.mood_emoji, color: row.mood_color, ocean: row.mood_ocean },
    note: row.note || '',
    time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));
}

export async function saveMood({ mood, note }) {
  const day = toDay();
  const entry = {
    day,
    mood,
    note,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  if (!inCloud()) {
    const others = readLocalMoods().filter((m) => m.day !== day);
    writeJSON('mood-history', [...others, entry]);
    return entry;
  }
  const { error } = await supabase.from('mood_entries').upsert(
    {
      user_id: cloudUserId,
      day,
      mood_label: mood.label,
      mood_emoji: mood.emoji,
      mood_color: mood.color,
      mood_ocean: mood.ocean,
      note,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day' }
  );
  if (error) throw error;
  return entry;
}

// ---------- journal ----------
// Entry shape used by the pages:
// { id, title, content, mood: { label, emoji } | null, createdAt (ISO), date, time }
const displayDate = (iso) => new Date(iso).toLocaleDateString();
const displayTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function normalizeLocalEntry(e) {
  // Older entries have no createdAt: their id is the save timestamp.
  let createdAt = e.createdAt;
  if (!createdAt) {
    const fromId = new Date(Number(e.id));
    const fromText = new Date(`${e.date} ${e.time}`);
    createdAt = !Number.isNaN(fromId.getTime()) && Number(e.id) > 1e12
      ? fromId.toISOString()
      : !Number.isNaN(fromText.getTime())
        ? fromText.toISOString()
        : new Date().toISOString();
  }
  return {
    id: String(e.id),
    title: e.title || 'Untitled Entry',
    content: e.content || '',
    mood: e.mood || null,
    createdAt,
    date: displayDate(createdAt),
    time: displayTime(createdAt),
  };
}

function fromCloudRow(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    mood: row.mood_label ? { label: row.mood_label, emoji: row.mood_emoji } : null,
    createdAt: row.created_at,
    date: displayDate(row.created_at),
    time: displayTime(row.created_at),
  };
}

export async function listJournal() {
  if (!inCloud()) {
    return readJSON('journal-entries', [])
      .map(normalizeLocalEntry)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, title, content, mood_label, mood_emoji, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromCloudRow);
}

export async function addJournal({ title, content, mood = null }) {
  if (!inCloud()) {
    const createdAt = new Date().toISOString();
    const entry = normalizeLocalEntry({ id: String(Date.now()), title, content, mood, createdAt });
    writeJSON('journal-entries', [entry, ...readJSON('journal-entries', [])]);
    return entry;
  }
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: cloudUserId,
      title,
      content,
      mood_label: mood?.label ?? null,
      mood_emoji: mood?.emoji ?? null,
    })
    .select('id, title, content, mood_label, mood_emoji, created_at')
    .single();
  if (error) throw error;
  return fromCloudRow(data);
}

export async function updateJournal(id, { title, content, mood = null }) {
  if (!inCloud()) {
    const list = readJSON('journal-entries', []);
    let updated = null;
    const next = list.map((e) => {
      if (String(e.id) !== String(id)) return e;
      updated = normalizeLocalEntry({ ...normalizeLocalEntry(e), title, content, mood });
      return updated;
    });
    writeJSON('journal-entries', next);
    return updated;
  }
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ title, content, mood_label: mood?.label ?? null, mood_emoji: mood?.emoji ?? null })
    .eq('id', id)
    .select('id, title, content, mood_label, mood_emoji, created_at')
    .single();
  if (error) throw error;
  return fromCloudRow(data);
}

export async function deleteJournal(id) {
  if (!inCloud()) {
    writeJSON(
      'journal-entries',
      readJSON('journal-entries', []).filter((e) => String(e.id) !== String(id))
    );
    return;
  }
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw error;
}

// ---------- habits ----------
export async function listHabitLog() {
  if (!inCloud()) return readLocalHabitLog();
  const { data, error } = await supabase.from('habit_logs').select('habit_id, day');
  if (error) throw error;
  return data.map((row) => ({ habitId: row.habit_id, day: row.day }));
}

export async function setHabitDone(habitId, done, day = toDay()) {
  if (!inCloud()) {
    const raw = readJSON('habits', {});
    // Drop any legacy key for the same habit+day, then write the new format.
    Object.keys(raw).forEach((key) => {
      const dash = key.indexOf('-');
      if (Number(key.slice(0, dash)) === habitId && legacyToDay(key.slice(dash + 1)) === day) {
        delete raw[key];
      }
    });
    if (done) raw[`${habitId}-${day}`] = true;
    writeJSON('habits', raw);
    return;
  }
  if (done) {
    const { error } = await supabase
      .from('habit_logs')
      .upsert({ user_id: cloudUserId, habit_id: habitId, day }, { onConflict: 'user_id,habit_id,day' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('day', day);
    if (error) throw error;
  }
}

// ---------- one-time copy of this device's data into a new account ----------
export async function migrateLocalToCloud(userId) {
  if (!supabase || !userId) return;
  const flag = `soulspace-migrated-${userId}`;
  if (localStorage.getItem(flag)) return;

  const moods = readLocalMoods();
  const journal = readJSON('journal-entries', []).map(normalizeLocalEntry);
  const habits = readLocalHabitLog();

  if (moods.length) {
    const { error } = await supabase.from('mood_entries').upsert(
      moods.map((m) => ({
        user_id: userId,
        day: m.day,
        mood_label: m.mood.label,
        mood_emoji: m.mood.emoji,
        mood_color: m.mood.color,
        mood_ocean: m.mood.ocean,
        note: m.note || '',
      })),
      { onConflict: 'user_id,day', ignoreDuplicates: true }
    );
    if (error) throw error;
  }
  if (journal.length) {
    const { error } = await supabase.from('journal_entries').insert(
      journal.map((e) => ({
        user_id: userId,
        title: e.title,
        content: e.content,
        mood_label: e.mood?.label ?? null,
        mood_emoji: e.mood?.emoji ?? null,
        created_at: e.createdAt,
      }))
    );
    if (error) throw error;
  }
  if (habits.length) {
    const { error } = await supabase.from('habit_logs').upsert(
      habits.map((h) => ({ user_id: userId, habit_id: h.habitId, day: h.day })),
      { onConflict: 'user_id,habit_id,day', ignoreDuplicates: true }
    );
    if (error) throw error;
  }
  localStorage.setItem(flag, new Date().toISOString());
}
