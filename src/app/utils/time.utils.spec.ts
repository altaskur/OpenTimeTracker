import {
  formatMinutes,
  parseTimeToMinutes,
  hoursToMinutes,
  minutesToHours,
} from './time.utils';

describe('time.utils', () => {
  describe('formatMinutes', () => {
    it('should return 0m for zero minutes', () => {
      expect(formatMinutes(0)).toBe('0m');
    });

    it('should return 0m for negative minutes', () => {
      expect(formatMinutes(-10)).toBe('0m');
    });

    it('should format minutes only', () => {
      expect(formatMinutes(30)).toBe('30m');
    });

    it('should format hours only', () => {
      expect(formatMinutes(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatMinutes(150)).toBe('2h 30m');
    });

    it('should format 8h 30m correctly', () => {
      expect(formatMinutes(510)).toBe('8h 30m');
    });
  });

  describe('parseTimeToMinutes', () => {
    it('should return null for empty string', () => {
      expect(parseTimeToMinutes('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(parseTimeToMinutes('   ')).toBeNull();
    });

    it('should parse hours and minutes (8h 30m)', () => {
      expect(parseTimeToMinutes('8h 30m')).toBe(510);
    });

    it('should parse hours and minutes without m (8h 30)', () => {
      expect(parseTimeToMinutes('8h 30')).toBe(510);
    });

    it('should parse hours only (8h)', () => {
      expect(parseTimeToMinutes('8h')).toBe(480);
    });

    it('should parse minutes only (30m)', () => {
      expect(parseTimeToMinutes('30m')).toBe(30);
    });

    it('should parse colon format (8:30)', () => {
      expect(parseTimeToMinutes('8:30')).toBe(510);
    });

    it('should return null for invalid minutes in colon format', () => {
      expect(parseTimeToMinutes('8:65')).toBeNull();
    });

    it('should parse plain number', () => {
      expect(parseTimeToMinutes('120')).toBe(120);
    });

    it('should return null for invalid format', () => {
      expect(parseTimeToMinutes('invalid')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(parseTimeToMinutes('8H 30M')).toBe(510);
    });
  });

  describe('hoursToMinutes', () => {
    it('should convert hours to minutes', () => {
      expect(hoursToMinutes(2)).toBe(120);
    });

    it('should handle decimal hours', () => {
      expect(hoursToMinutes(1.5)).toBe(90);
    });

    it('should round result', () => {
      expect(hoursToMinutes(1.333)).toBe(80);
    });

    it('should handle zero', () => {
      expect(hoursToMinutes(0)).toBe(0);
    });
  });

  describe('minutesToHours', () => {
    it('should convert minutes to hours', () => {
      expect(minutesToHours(120)).toBe(2);
    });

    it('should return decimal for partial hours', () => {
      expect(minutesToHours(90)).toBe(1.5);
    });

    it('should handle zero', () => {
      expect(minutesToHours(0)).toBe(0);
    });
  });
});
