/**
 * Date utility functions for TikTok-style date navigation
 */

/**
 * Generate an array of ISO date strings going backwards from today
 * @param days Number of days to generate (default: 30)
 * @returns Array of date strings in format 'YYYY-MM-DD'
 */
export const generateDateArray = (days: number = 30): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 First date
 * @param date2 Second date
 * @returns true if dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format a date for display based on comparison with today
 * @param date ISO date string
 * @param index Index in the date array (unused, kept for compatibility)
 * @returns Formatted label: "Today", "Yesterday", or "Mon, Oct 15"
 */
export const formatDateLabel = (date: string, index: number): string => {
  const dateObj = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Compare dates (ignore time)
  if (isSameDay(dateObj, today)) return 'Today';
  if (isSameDay(dateObj, yesterday)) return 'Yesterday';

  // Return formatted date for older dates
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };

  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Check if a date string is in the future
 * @param date ISO date string
 * @returns true if date is after today
 */
export const isFutureDate = (date: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date + 'T00:00:00');
  return checkDate > today;
};

/**
 * Get ISO date string for X days ago from today
 * @param daysAgo Number of days to go back
 * @returns ISO date string 'YYYY-MM-DD'
 */
export const getDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date in ISO format
 * @returns ISO date string 'YYYY-MM-DD'
 */
export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a date is today
 * @param date ISO date string
 * @returns true if date is today
 */
export const isToday = (date: string): boolean => {
  return date === getToday();
};

/**
 * Format time from "HH:MM:SS" to "H:MM AM/PM"
 * @param time Time string in format "HH:MM:SS"
 * @returns Formatted time like "11:47 PM"
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format duration from minutes to "Xh Ym" format
 * @param minutes Total minutes
 * @returns Formatted duration like "7h 36m"
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Safely format an ISO datetime string to "Mon 10/18 at 11:30 PM" style.
 * Returns null if the input is missing or invalid.
 */
export const formatDateTimeISO = (iso?: string): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} at ${timeStr}`;
};

/**
 * Format a display value given separate ISO date (YYYY-MM-DD) and HH:MM:SS time parts.
 * Does not create a Date from the time-only string to avoid Invalid Date.
 */
export const formatDateAndTimeParts = (dateISO: string, time: string): string => {
  const date = new Date(`${dateISO}T00:00:00`);
  const dateStr = Number.isNaN(date.getTime())
    ? dateISO
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${dateStr} at ${formatTime(time)}`;
};

/**
 * Format a timezone offset like "+08:00" or "-04:00" to "GMT+8" or "GMT-4:30".
 * If offset is missing, attempt to infer from an ISO string with offset or "Z".
 * Returns null if neither is available.
 */
export const formatTimezoneGMT = (offset?: string, iso?: string): string | null => {
  const toGMT = (off: string): string | null => {
    const m = off.match(/^([+-])?(\d{2})(?::?(\d{2}))?$/);
    if (!m) return null;
    const sign = m[1] === '-' ? -1 : 1;
    const hours = parseInt(m[2], 10);
    const minutes = m[3] ? parseInt(m[3], 10) : 0;
    const signChar = sign < 0 ? '-' : '+';
    return minutes === 0 ? `GMT${signChar}${hours}` : `GMT${signChar}${hours}:${String(minutes).padStart(2, '0')}`;
  };

  if (offset) {
    const normalized = offset.replace(/^UTC|^GMT/i, '').replace(/\s+/g, '');
    const gmt = toGMT(normalized);
    if (gmt) return gmt;
  }

  if (iso) {
    // Try to extract explicit offset from the ISO string
    const match = iso.match(/([+-]\d{2}:?\d{2}|Z)$/);
    if (match) {
      const token = match[1];
      if (token === 'Z') return 'GMT+0';
      const gmt = toGMT(token);
      if (gmt) return gmt;
    }
  }

  return null;
};
