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
export async function listJournal() {
  if (!inCloud()) {
    return readJSON('journal-entries', []).map((e) => ({ ...e, id: String(e.id) }));
  }
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => {
    const d = new Date(row.created_at);
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });
}

export async function addJournal({ title, content }) {
  const now = new Date();
  if (!inCloud()) {
    const entry = {
      id: String(now.getTime()),
      title,
      content,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    writeJSON('journal-entries', [entry, ...readJSON('journal-entries', [])]);
    return entry;
  }
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ user_id: cloudUserId, title, content })
    .select('id, created_at')
    .single();
  if (error) throw error;
  const d = new Date(data.created_at);
  return {
    id: data.id,
    title,
    content,
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
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
  const journal = readJSON('journal-entries', []);
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
      journal.map((e) => {
        const created = new Date(`${e.date} ${e.time}`);
        return {
          user_id: userId,
          title: e.title || 'Untitled Entry',
          content: e.content,
          ...(Number.isNaN(created.getTime()) ? {} : { created_at: created.toISOString() }),
        };
      })
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
