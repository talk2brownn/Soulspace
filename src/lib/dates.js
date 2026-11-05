// Local calendar day as YYYY-MM-DD (not UTC, so late-night check-ins in
// Lagos don't land on the wrong day).
export function toDay(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function shiftDay(day, offset) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offset);
  return toDay(date);
}

// Consecutive days ending today (or yesterday, so a streak isn't shown as
// broken before you've had the chance to check in today).
export function computeStreak(daySet, today = toDay()) {
  let cursor = daySet.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}
