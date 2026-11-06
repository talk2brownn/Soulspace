import { compareWeeks, weekSeries, topMood, buildInsights } from './insights';
import { shiftDay } from './dates';

const today = '2026-11-06';
const mood = (offset, label) => ({ day: shiftDay(today, -offset), mood: { label, emoji: '' }, note: '' });

test('weekSeries has 7 days with gaps as null', () => {
  const series = weekSeries([mood(0, 'Happy'), mood(2, 'Sad')], today);
  expect(series).toHaveLength(7);
  expect(series[6].label).toBe('Happy');
  expect(series[5].score).toBeNull();
  expect(series[4].label).toBe('Sad');
});

test('compareWeeks splits this week from last week', () => {
  const data = {
    moods: [mood(0, 'Happy'), mood(8, 'Sad')],
    journals: [{ createdAt: '2026-11-06T10:00:00' }, { createdAt: '2026-10-30T10:00:00' }],
    habitLog: [{ habitId: 7, day: shiftDay(today, -1) }],
  };
  const { thisWeek, lastWeek } = compareWeeks(data, today);
  expect(thisWeek.checkIns).toBe(1);
  expect(lastWeek.checkIns).toBe(1);
  expect(thisWeek.journals).toBe(1);
  expect(lastWeek.journals).toBe(1);
  expect(thisWeek.habits).toBe(1);
  expect(thisWeek.avgScore).toBeGreaterThan(lastWeek.avgScore);
});

test('topMood breaks ties with the most recent mood', () => {
  const best = topMood([mood(3, 'Sad'), mood(1, 'Happy')], shiftDay(today, -6), today);
  expect(best.label).toBe('Happy');
});

test('insights notice a lifting week', () => {
  const moods = [mood(6, 'Sad'), mood(5, 'Sad'), mood(2, 'Happy'), mood(1, 'Happy'), mood(0, 'Excited')];
  const texts = buildInsights({ moods, journals: [], habitLog: [] }, today).map((i) => i.text);
  expect(texts.some((t) => /lifting/.test(t))).toBe(true);
});

test('insights give a friendly starter message with no data', () => {
  const insights = buildInsights({ moods: [], journals: [], habitLog: [] }, today);
  expect(insights).toHaveLength(1);
  expect(insights[0].text).toMatch(/check in/i);
});
