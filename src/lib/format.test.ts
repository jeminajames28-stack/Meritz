import { describe, expect, it } from 'vitest';
import { formatDate, formatDateRange, todayInMalaysia } from './format';

describe('formatDate', () => {
  it('formats ISO dates as day, short month and year', () => {
    expect(formatDate('2026-12-01')).toBe('1 Dec 2026');
    expect(formatDate('2026-01-31')).toBe('31 Jan 2026');
    expect(formatDate('2027-10-09')).toBe('9 Oct 2027');
  });

  it('covers every month', () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      formatDate(`2026-${String(i + 1).padStart(2, '0')}-15`).split(' ')[1],
    );
    expect(months).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });

  it('returns anything that is not an ISO date unchanged', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('soon')).toBe('soon');
    expect(formatDate('1/12/2026')).toBe('1/12/2026');
    expect(formatDate('2026-13-01')).toBe('2026-13-01');
    expect(formatDate('2026-00-10')).toBe('2026-00-10');
  });
});

describe('formatDateRange', () => {
  it('joins both dates with "to"', () => {
    expect(formatDateRange('2026-12-01', '2026-12-31')).toBe('1 Dec 2026 to 31 Dec 2026');
  });

  it('shows a single date when the other is empty', () => {
    expect(formatDateRange('2026-12-01', '')).toBe('1 Dec 2026');
    expect(formatDateRange('', '2026-12-31')).toBe('31 Dec 2026');
  });

  it('returns an empty string when both are empty', () => {
    expect(formatDateRange('', '')).toBe('');
  });
});

describe('todayInMalaysia', () => {
  it('uses UTC+8, so 15:59 UTC is still the same day', () => {
    expect(todayInMalaysia(new Date('2026-10-14T15:59:59.999Z'))).toBe('2026-10-14');
  });

  it('moves to the next day at 16:00 UTC (midnight in Malaysia)', () => {
    expect(todayInMalaysia(new Date('2026-10-14T16:00:00.000Z'))).toBe('2026-10-15');
  });

  it('is ahead of UTC early in the UTC day', () => {
    expect(todayInMalaysia(new Date('2026-10-13T20:30:00.000Z'))).toBe('2026-10-14');
  });

  it('rolls over months and years', () => {
    expect(todayInMalaysia(new Date('2026-12-31T16:00:00.000Z'))).toBe('2027-01-01');
    expect(todayInMalaysia(new Date('2028-02-28T18:00:00.000Z'))).toBe('2028-02-29');
  });

  it('does not depend on the local time zone offset of the Date', () => {
    const instant = new Date(Date.UTC(2026, 9, 14, 3, 0, 0));
    expect(todayInMalaysia(instant)).toBe('2026-10-14');
  });
});
