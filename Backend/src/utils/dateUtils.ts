/**
 * Date and time utility functions for Monday-to-Sunday weekly calculations and validation.
 * Avoids timezone drift by operating strictly on UTC date components.
 */

/**
 * Returns the Monday (YYYY-MM-DD) for the given date (YYYY-MM-DD).
 * Weeks start on Monday and end on Sunday.
 */
export function getWeekStart(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  
  // getUTCDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfWeek = d.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  
  return d.toISOString().split('T')[0];
}

/**
 * Returns the Sunday (YYYY-MM-DD) of the week for the given date.
 */
export function getWeekEnd(dateStr: string): string {
  const mondayStr = getWeekStart(dateStr);
  const [year, month, day] = mondayStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 6));
  return d.toISOString().split('T')[0];
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a string matches YYYY-MM-DD and is a real date.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Parse time string (e.g. "09:00 AM", "14:30", "2:15 PM") to minutes from midnight.
 * Returns null if invalid.
 */
export function timeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match12 = timeStr.trim().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toUpperCase();
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const match24 = timeStr.trim().match(/^([01]?\d|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}
