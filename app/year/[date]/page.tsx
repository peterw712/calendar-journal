"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CalendarMonth from "@/app/components/CalendarMonth";
import SearchPanel from "@/app/components/SearchPanel";
import ThemeToggle from "@/app/components/ThemeToggle";
import ViewSwitcher from "@/app/components/ViewSwitcher";
import {
  addYears,
  formatYear,
  getYearRange,
  parseDateString,
  todayString,
} from "@/lib/date";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthStart(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export default function YearPage() {
  const params = useParams<{ date?: string }>();
  const date = params?.date ?? todayString();
  const router = useRouter();
  const { year, month: selectedMonth } = useMemo(
    () => parseDateString(date),
    [date],
  );
  const range = useMemo(() => getYearRange(date), [date]);
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const today = useMemo(() => todayString(), []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchEntries = async () => {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/entries?start=${range.start}&end=${range.end}`,
          {
            signal: controller.signal,
          },
        );
        const data = (await response.json()) as { dates: string[] };
        setEntryDates(new Set(data.dates ?? []));
      } catch (error) {
        if (!(error instanceof DOMException)) {
          setEntryDates(new Set());
        }
      } finally {
        setStatus("idle");
      }
    };
    fetchEntries();
    return () => controller.abort();
  }, [range.end, range.start]);

  const previousYear = useMemo(() => addYears(date, -1), [date]);
  const nextYear = useMemo(() => addYears(date, 1), [date]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <ViewSwitcher selectedDate={date} currentView="year" />
        </div>
        <div className="header-center">
          <h1>{formatYear(date)}</h1>
          <div className="header-subnav">
            <Link href={`/month/${date}`}>Month view</Link>
          </div>
        </div>
        <div className="header-right">
          <Link href={`/year/${previousYear}`} className="nav-button">
            Previous year
          </Link>
          <Link href={`/year/${nextYear}`} className="nav-button">
            Next year
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="app-main">
        <div className="app-content">
          <div className="year-grid">
            {MONTH_LABELS.map((label, index) => {
              const month = index + 1;
              const monthDate = monthStart(year, month);
              const selectedDate =
                month === selectedMonth ? date : undefined;
              return (
                <div key={label} className="year-month">
                  <button
                    type="button"
                    className="year-month-label"
                    onClick={() => router.push(`/month/${monthDate}`)}
                  >
                    {label}
                  </button>
                  <CalendarMonth
                    year={year}
                    month={month}
                    selectedDate={selectedDate}
                    today={today}
                    entryDates={entryDates}
                    onSelectDate={(selected) => router.push(`/day/${selected}`)}
                    variant="mini"
                  />
                </div>
              );
            })}
          </div>
          {status === "idle" && entryDates.size === 0 && (
            <div className="status-note">No entries yet this year.</div>
          )}
          {status === "loading" && (
            <div className="status-note">Loading entry markers…</div>
          )}
        </div>
        <aside className="app-sidebar">
          <SearchPanel />
        </aside>
      </main>
    </div>
  );
}
