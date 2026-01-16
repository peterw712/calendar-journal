"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import EntryEditor from "@/app/components/EntryEditor";
import SearchPanel from "@/app/components/SearchPanel";
import ThemeToggle from "@/app/components/ThemeToggle";
import ViewSwitcher from "@/app/components/ViewSwitcher";
import { addDays, formatDateDisplay, todayString } from "@/lib/date";

export default function DayPage() {
  const params = useParams<{ date?: string }>();
  const date = params?.date ?? todayString();
  const previousDate = useMemo(() => addDays(date, -1), [date]);
  const nextDate = useMemo(() => addDays(date, 1), [date]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <ViewSwitcher selectedDate={date} currentView="day" />
        </div>
        <div className="header-center">
          <h1>{formatDateDisplay(date)}</h1>
          <div className="header-subnav">
            <Link href={`/month/${date}`}>Month view</Link>
            <Link href={`/year/${date}`}>Year view</Link>
          </div>
        </div>
        <div className="header-right">
          <Link href={`/day/${previousDate}`} className="nav-button">
            Previous day
          </Link>
          <Link href={`/day/${nextDate}`} className="nav-button">
            Next day
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="app-main">
        <div className="app-content">
          <EntryEditor date={date} />
        </div>
        <aside className="app-sidebar">
          <SearchPanel />
        </aside>
      </main>
    </div>
  );
}
