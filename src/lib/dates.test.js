import { computeStreak, shiftDay } from './dates';

describe('computeStreak', () => {
  const today = '2026-11-05';
  it('counts consecutive days ending today', () => {
    const days = new Set([today, shiftDay(today, -1), shiftDay(today, -2)]);
    expect(computeStreak(days, today)).toBe(3);
  });
  it('keeps a streak alive if today is not done yet', () => {
    const days = new Set([shiftDay(today, -1), shiftDay(today, -2)]);
    expect(computeStreak(days, today)).toBe(2);
  });
  it('resets after a missed day', () => {
    const days = new Set([today, shiftDay(today, -2)]);
    expect(computeStreak(days, today)).toBe(1);
  });
  it('handles month boundaries', () => {
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
  });
});
