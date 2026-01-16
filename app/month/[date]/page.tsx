"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CalendarMonth from "@/app/components/CalendarMonth";
import SearchPanel from "@/app/components/SearchPanel";
import ThemeToggle from "@/app/components/ThemeToggle";
import ViewSwitcher from "@/app/components/ViewSwitcher";
import {
  addMonths,
  formatMonthYear,
  getMonthRange,
  parseDateString,
  todayString,
} from "@/lib/date";

export default function MonthPage() {
  const params = useParams<{ date?: string }>();
  const date = params?.date ?? todayString();
  const router = useRouter();
  const { year, month } = useMemo(() => parseDateString(date), [date]);
  const range = useMemo(() => getMonthRange(date), [date]);
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
  }, [range.start, range.end]);

  const previousMonth = useMemo(() => addMonths(date, -1), [date]);
  const nextMonth = useMemo(() => addMonths(date, 1), [date]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <ViewSwitcher selectedDate={date} currentView="month" />
        </div>
        <div className="header-center">
          <h1>{formatMonthYear(date)}</h1>
          <div className="header-subnav">
            <Link href={`/year/${date}`}>Year view</Link>
          </div>
        </div>
        <div className="header-right">
          <Link href={`/month/${previousMonth}`} className="nav-button">
            Previous month
          </Link>
          <Link href={`/month/${nextMonth}`} className="nav-button">
            Next month
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="app-main">
        <div className="app-content">
          <CalendarMonth
            year={year}
            month={month}
            selectedDate={date}
            today={today}
            entryDates={entryDates}
            onSelectDate={(selected) => router.push(`/day/${selected}`)}
          />
          {status === "idle" && entryDates.size === 0 && (
            <div className="status-note">No entries yet this month.</div>
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
