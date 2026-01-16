"use client";

import Link from "next/link";

type ViewSwitcherProps = {
  selectedDate: string;
  currentView: "day" | "month" | "year";
};

export default function ViewSwitcher({
  selectedDate,
  currentView,
}: ViewSwitcherProps) {
  return (
    <div className="view-switcher">
      <Link
        className={currentView === "day" ? "active" : ""}
        href={`/day/${selectedDate}`}
      >
        Day
      </Link>
      <Link
        className={currentView === "month" ? "active" : ""}
        href={`/month/${selectedDate}`}
      >
        Month
      </Link>
      <Link
        className={currentView === "year" ? "active" : ""}
        href={`/year/${selectedDate}`}
      >
        Year
      </Link>
    </div>
  );
}
