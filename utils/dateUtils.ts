/**
 * Date utility functions for WHOOP records and sleep sessions
 */

/**
 * Extract date string (YYYY-MM-DD) from ISO timestamp (UTC-based)
 * @deprecated Use extractLocalDateFromTimestamp for timezone-aware date extraction
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
 * Extract local date string (YYYY-MM-DD) from ISO timestamp with timezone offset
 * Handles WHOOP's timezone_offset field to ensure dates appear in user's local timezone
 *
 * @param timestamp - ISO 8601 timestamp (e.g., "2024-10-18T18:00:00.000Z")
 * @param timezoneOffset - W3C timezone designator (e.g., "+08:00", "-05:00", "Z")
 * @returns Local date string in YYYY-MM-DD format, or null if parsing fails
 *
 * @example
 * // GMT+8 user, sleep starts 2 AM Oct 19 local
 * extractLocalDateFromTimestamp("2024-10-18T18:00:00.000Z", "+08:00")
 * // Returns: "2024-10-19"
 */
export function extractLocalDateFromTimestamp(
  timestamp: string,
  timezoneOffset?: string
): string | null {
  try {
    const date = new Date(timestamp);

    // If no timezone offset provided, fall back to UTC date
    if (!timezoneOffset) {
      return date.toISOString().split('T')[0];
    }

    // Handle "Z" (UTC) explicitly
    if (timezoneOffset === 'Z') {
      return date.toISOString().split('T')[0];
    }

    // Parse timezone offset (format: "+HH:MM" or "-HH:MM")
    const offsetMatch = timezoneOffset.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!offsetMatch) {
      console.warn('Invalid timezone offset format:', timezoneOffset);
      return date.toISOString().split('T')[0];
    }

    const [, sign, hours, minutes] = offsetMatch;
    const offsetMinutes = (parseInt(hours) * 60 + parseInt(minutes)) * (sign === '+' ? 1 : -1);

    // Convert UTC timestamp to local time by applying timezone offset
    const localDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);

    // Extract YYYY-MM-DD from local timestamp
    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Unable to parse timestamp with timezone:', timestamp, timezoneOffset, error);
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
