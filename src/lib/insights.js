// Turns raw check-ins into a weekly summary and plain-language insights.
// Pure functions (no React, no storage), so they're easy to test.
import { toDay, shiftDay } from './dates';
import { moodScore, findMood } from './moods';

const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

export function lastNDays(n, today = toDay()) {
  return Array.from({ length: n }, (_, i) => shiftDay(today, i - (n - 1)));
}

const inRange = (day, from, to) => day >= from && day <= to;

function periodStats({ moods, journals, habitLog }, from, to) {
  const periodMoods = moods.filter((m) => inRange(m.day, from, to));
  return {
    checkIns: periodMoods.length,
    journals: journals.filter((j) => inRange(toDay(j.createdAt), from, to)).length,
    habits: habitLog.filter((h) => inRange(h.day, from, to)).length,
    avgScore: avg(periodMoods.map((m) => moodScore(m.mood.label))),
  };
}

// This week = today and the 6 days before. Last week = the 7 days before that.
export function compareWeeks(data, today = toDay()) {
  return {
    thisWeek: periodStats(data, shiftDay(today, -6), today),
    lastWeek: periodStats(data, shiftDay(today, -13), shiftDay(today, -7)),
  };
}

// One point per day for the chart; days without a check-in are null.
export function weekSeries(moods, today = toDay()) {
  const byDay = new Map(moods.map((m) => [m.day, m]));
  return lastNDays(7, today).map((day) => {
    const entry = byDay.get(day);
    return entry
      ? { day, label: entry.mood.label, emoji: entry.mood.emoji, score: moodScore(entry.mood.label), note: entry.note }
      : { day, label: null, emoji: null, score: null };
  });
}

export function topMood(moods, from, to) {
  const counts = new Map();
  moods
    .filter((m) => inRange(m.day, from, to))
    .sort((a, b) => a.day.localeCompare(b.day))
    .forEach((m) => counts.set(m.mood.label, (counts.get(m.mood.label) || 0) + 1));
  let best = null;
  // Ties go to the most recent mood (Map keeps insertion order; later wins on >=).
  counts.forEach((count, label) => {
    if (!best || count >= best.count) best = { label, count, emoji: findMood(label)?.emoji };
  });
  return best;
}

// Average mood on days WITH something vs days WITHOUT it, over the last 14 days.
function comparison(moods, daysWith, today) {
  const window = lastNDays(14, today);
  const scored = moods.filter((m) => window.includes(m.day));
  const withIt = scored.filter((m) => daysWith.has(m.day)).map((m) => moodScore(m.mood.label));
  const without = scored.filter((m) => !daysWith.has(m.day)).map((m) => moodScore(m.mood.label));
  if (withIt.length < 2 || without.length < 2) return null;
  return { withIt: avg(withIt), without: avg(without), diff: avg(withIt) - avg(without) };
}

export function buildInsights({ moods, journals, habitLog }, today = toDay()) {
  const insights = [];
  const series = weekSeries(moods, today);
  const checked = series.filter((d) => d.score !== null);
  const { thisWeek, lastWeek } = compareWeeks({ moods, journals, habitLog }, today);

  if (checked.length === 0) {
    return [
      {
        icon: '🌱',
        text: 'Check in on the Mood page a few times this week, and your insights will start to appear here.',
      },
    ];
  }

  // 1. Consistency
  insights.push({
    icon: '📅',
    text:
      checked.length >= 5
        ? `You checked in on ${checked.length} of the last 7 days. That consistency is what makes patterns visible.`
        : `You checked in on ${checked.length} of the last 7 days. A few more check-ins will sharpen these insights.`,
  });

  // 2. Direction through the week (needs a few points)
  if (checked.length >= 3) {
    const half = Math.floor(checked.length / 2);
    const early = avg(checked.slice(0, half).map((d) => d.score));
    const late = avg(checked.slice(-half).map((d) => d.score));
    if (late - early >= 0.75) {
      insights.push({ icon: '🌅', text: 'Your mood has been lifting as the week went on.' });
    } else if (early - late >= 0.75) {
      insights.push({
        icon: '🌧️',
        text: 'Your week got heavier towards the end. Be gentle with yourself, and lean on someone if you can.',
      });
    } else {
      insights.push({ icon: '🌊', text: 'Your mood has stayed fairly steady across the week.' });
    }
  }

  // 3. Habits and mood
  const habitDays = new Set(habitLog.map((h) => h.day));
  const habitLink = comparison(moods, habitDays, today);
  if (habitLink && Math.abs(habitLink.diff) >= 0.5) {
    insights.push({
      icon: '🎯',
      text:
        habitLink.diff > 0
          ? 'On days you ticked off at least one habit, your mood tended to be brighter than on days you didn’t.'
          : 'Interesting: your mood was lower on habit days. Are some habits feeling like a chore? It might be worth adjusting them.',
    });
  }

  // 4. Journaling and mood
  const journalDays = new Set(journals.map((j) => toDay(j.createdAt)));
  const journalLink = comparison(moods, journalDays, today);
  if (journalLink && journalLink.diff >= 0.5) {
    insights.push({
      icon: '📝',
      text: 'Days you wrote in your journal tended to be brighter days. Writing seems to help you.',
    });
  }

  // 5. Compared with last week
  if (thisWeek.avgScore !== null && lastWeek.avgScore !== null) {
    const change = thisWeek.avgScore - lastWeek.avgScore;
    if (change >= 0.5) insights.push({ icon: '📈', text: 'Overall, this week felt brighter than last week.' });
    else if (change <= -0.5)
      insights.push({ icon: '💙', text: 'This week has been harder than last week. That’s okay. Hard weeks pass.' });
  }

  return insights.slice(0, 4);
}
