/**
 * Date utility functions for WHOOP records and sleep sessions
 */

/**
 * Extract date string (YYYY-MM-DD) from ISO timestamp
 */
export function extractDateFromTimestamp(timestamp: string): string | null {
  try {
    return new Date(timestamp).toISOString().split('T')[0];
  } catch (error) {
    console.warn('Unable to parse timestamp:', timestamp, error);
    return null;
  }
}

/**
 * Format ISO date range for WHOOP API
 */
export function getDateRange(daysBack: number): { startISO: string; endISO: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  return {
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
