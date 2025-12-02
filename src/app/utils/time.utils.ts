/**
 * Formats minutes into a human-readable string (e.g., "8h 30m").
 * @param minutes - The total minutes to format.
 * @returns The formatted time string.
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Parses a time string (e.g., "8h 30m", "8:30", "510") into minutes.
 * @param timeString - The time string to parse.
 * @returns The total minutes, or null if invalid.
 */
export function parseTimeToMinutes(timeString: string): number | null {
  if (!timeString || timeString.trim() === '') {
    return null;
  }

  const trimmed = timeString.trim().toLowerCase();

  const hoursMinutesMatch = /^(\d+)h\s*(\d+)?m?$/.exec(trimmed);
  if (hoursMinutesMatch) {
    const hours = parseInt(hoursMinutesMatch[1], 10);
    const mins = hoursMinutesMatch[2] ? parseInt(hoursMinutesMatch[2], 10) : 0;
    return hours * 60 + mins;
  }

  const hoursOnlyMatch = /^(\d+)h$/.exec(trimmed);
  if (hoursOnlyMatch) {
    return parseInt(hoursOnlyMatch[1], 10) * 60;
  }

  const minsOnlyMatch = /^(\d+)m$/.exec(trimmed);
  if (minsOnlyMatch) {
    return parseInt(minsOnlyMatch[1], 10);
  }

  const colonMatch = /^(\d+):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const mins = parseInt(colonMatch[2], 10);
    if (mins >= 60) {
      return null;
    }
    return hours * 60 + mins;
  }

  const numberMatch = /^(\d+)$/.exec(trimmed);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  return null;
}

/**
 * Converts hours (decimal) to minutes.
 * @param hours - The hours value (can be decimal like 8.5).
 * @returns The total minutes.
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

/**
 * Converts minutes to hours (decimal).
 * @param minutes - The minutes value.
 * @returns The hours as decimal.
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}
