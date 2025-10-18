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
 * Format a date for display based on its index in the array
 * @param date ISO date string
 * @param index Index in the date array (0 = today, 1 = yesterday)
 * @returns Formatted label: "Today", "Yesterday", or "Oct 15, 2024"
 */
export const formatDateLabel = (date: string, index: number): string => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Yesterday';

  const dateObj = new Date(date + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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
