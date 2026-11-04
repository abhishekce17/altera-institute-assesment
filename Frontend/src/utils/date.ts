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
