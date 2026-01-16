"use client";

import { useMemo } from "react";
import {
  getDaysInMonth,
  getWeekdayIndex,
  WEEK_STARTS_ON_MONDAY,
} from "@/lib/date";

type CalendarMonthProps = {
  year: number;
  month: number;
  selectedDate?: string;
  today: string;
  entryDates: Set<string>;
  onSelectDate?: (date: string) => void;
  variant?: "full" | "mini";
};

const WEEKDAYS = WEEK_STARTS_ON_MONDAY
  ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateStringFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

export default function CalendarMonth({
  year,
  month,
  selectedDate,
  today,
  entryDates,
  onSelectDate,
  variant = "full",
}: CalendarMonthProps) {
  const grid = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const startWeekday = getWeekdayIndex(
      dateStringFromParts(year, month, 1),
    );
    const cells: Array<number | null> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = remainder; i < 7; i += 1) {
        cells.push(null);
      }
    }
    return cells;
  }, [year, month]);

  return (
    <div className={`calendar-month calendar-${variant}`}>
      {variant === "full" && (
        <div className="calendar-weekdays">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="calendar-weekday">
              {weekday}
            </div>
          ))}
        </div>
      )}
      <div className="calendar-grid">
        {grid.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-cell empty" />;
          }
          const dateString = dateStringFromParts(year, month, day);
          const hasEntry = entryDates.has(dateString);
          const isToday = dateString === today;
          const isSelected = dateString === selectedDate;
          const className = [
            "calendar-cell",
            hasEntry ? "has-entry" : "",
            isToday ? "today" : "",
            isSelected ? "selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={dateString}
              type="button"
              className={className}
              onClick={() => onSelectDate?.(dateString)}
            >
              <span>{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
