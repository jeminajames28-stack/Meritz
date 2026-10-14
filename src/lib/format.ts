const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-12-01' -> '1 Dec 2026'. Returns the input unchanged if it is not a valid date. */
export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return isoDate;
  return `${Number(day)} ${MONTHS[monthIndex]} ${year}`;
}

/** '2026-12-01', '2026-12-31' -> '1 Dec 2026 to 31 Dec 2026'. Empty parts are skipped. */
export function formatDateRange(from: string, until: string): string {
  if (from && until) return `${formatDate(from)} to ${formatDate(until)}`;
  return formatDate(from || until);
}

/** Today's date in Malaysia (UTC+8, no daylight saving) as 'YYYY-MM-DD'. */
export function todayInMalaysia(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}
