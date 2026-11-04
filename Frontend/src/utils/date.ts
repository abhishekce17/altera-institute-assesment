import type { DayItem } from '../types/task';

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return formatDateToISO(new Date());
}

/**
 * Returns Monday (YYYY-MM-DD) for any given date string.
 * Week starts on Monday.
 */
export function getMondayOfDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = d.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d.toISOString().split('T')[0];
}

/**
 * Generates an array of 7 days representing the week (Monday to Sunday) containing `referenceDateStr`.
 */
export function getWeekDays(referenceDateStr: string, selectedDateStr: string): DayItem[] {
  const mondayStr = getMondayOfDate(referenceDateStr);
  const [year, month, day] = mondayStr.split('-').map(Number);
  const todayStr = getTodayISO();

  const days: DayItem[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(year, month - 1, day + i));
    const isoString = d.toISOString().split('T')[0];
    const dateNum = String(d.getUTCDate()).padStart(2, '0');

    days.push({
      dateString: isoString,
      dayName: dayNames[i],
      dayNumber: dateNum,
      isToday: isoString === todayStr,
      isSelected: isoString === selectedDateStr,
    });
  }

  return days;
}

/**
 * Format date for display matching Figma (e.g., "Friday 14, January")
 */
export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('en-US', { month: 'long' });

  return `${weekday} ${dayNum}, ${monthName}`;
}

/**
 * Parse time string to minutes from midnight (0 to 1439).
 * Supports 12-hour ("09:00 AM", "2:30 PM") and 24-hour ("09:00", "14:30").
 */
export function timeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const t = timeStr.trim();

  // 12-hour format: "09:00 AM" or "9:00AM"
  const match12 = t.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toUpperCase();
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format: "09:00", "14:30"
  const match24 = t.match(/^([01]?\d|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Convert 12-hour ("09:00 AM") or 24-hour ("9:00") to 24-hour ("09:00") for HTML5 <input type="time">.
 */
export function to24HourInput(timeStr: string): string {
  const minutes = timeToMinutes(timeStr);
  if (minutes === null) return '09:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Convert 24-hour ("14:30") to standard 12-hour display format ("02:30 PM").
 */
export function to12HourDisplay(time24: string): string {
  const minutes = timeToMinutes(time24);
  if (minutes === null) return time24;
  const rawH = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  const meridiem = rawH >= 12 ? 'PM' : 'AM';
  const h12 = rawH % 12 === 0 ? 12 : rawH % 12;
  return `${String(h12).padStart(2, '0')}:${m} ${meridiem}`;
}

/**
 * Get current local time in minutes from midnight (0 to 1439).
 */
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Format minutes from midnight to standard 12-hour display format ("02:30 PM").
 */
export function minutesTo12Hour(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, minutes));
  const rawH = Math.floor(clamped / 60);
  const m = String(clamped % 60).padStart(2, '0');
  const meridiem = rawH >= 12 ? 'PM' : 'AM';
  const h12 = rawH % 12 === 0 ? 12 : rawH % 12;
  return `${String(h12).padStart(2, '0')}:${m} ${meridiem}`;
}

/**
 * Get default start and end times for task scheduling.
 * If date is today, calculates the next available future 15-minute slot.
 * If date is in the future, defaults to 09:00 AM and 10:30 AM.
 */
export function getDefaultTaskTimes(dateStr: string): { startTime: string; endTime: string } {
  const today = getTodayISO();
  if (dateStr > today) {
    return { startTime: '09:00 AM', endTime: '10:30 AM' };
  }

  // Today: compute next upcoming 15-minute slot
  const nowMin = getCurrentTimeMinutes();
  const nextSlot = Math.ceil((nowMin + 1) / 15) * 15;
  const startMin = Math.min(1380, Math.max(0, nextSlot)); // Max 11:00 PM
  const endMin = Math.min(1439, startMin + 60); // 1 hour duration, max 11:59 PM

  return {
    startTime: minutesTo12Hour(startMin),
    endTime: minutesTo12Hour(endMin),
  };
}
