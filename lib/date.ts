export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export const WEEK_STARTS_ON_MONDAY = true;

export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateString: string): DateParts {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return { year, month, day };
}

export function dateFromPartsUtc(parts: DateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function dateFromStringUtc(dateString: string): Date {
  const parts = parseDateString(dateString);
  return dateFromPartsUtc(parts);
}

export function dateStringFromUtcDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, amount: number): string {
  const date = dateFromStringUtc(dateString);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateStringFromUtcDate(date);
}

export function addMonths(dateString: string, amount: number): string {
  const date = dateFromStringUtc(dateString);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return dateStringFromUtcDate(date);
}

export function addYears(dateString: string, amount: number): string {
  const date = dateFromStringUtc(dateString);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCFullYear(date.getUTCFullYear() + amount);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return dateStringFromUtcDate(date);
}

export function getWeekdayIndex(dateString: string): number {
  const date = dateFromStringUtc(dateString);
  const weekday = date.getUTCDay();
  if (WEEK_STARTS_ON_MONDAY) {
    return (weekday + 6) % 7;
  }
  return weekday;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getMonthRange(dateString: string) {
  const { year, month } = parseDateString(dateString);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDay = getDaysInMonth(year, month);
  const end = `${year}-${String(month).padStart(2, "0")}-${String(
    endDay,
  ).padStart(2, "0")}`;
  return { start, end, year, month };
}

export function getYearRange(dateString: string) {
  const { year } = parseDateString(dateString);
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return { start, end, year };
}

export function formatDateDisplay(dateString: string): string {
  const date = dateFromStringUtc(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatMonthYear(dateString: string): string {
  const date = dateFromStringUtc(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatYear(dateString: string): string {
  const date = dateFromStringUtc(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
