import React, { useMemo, useState } from "react";
import { IonButton } from "@ionic/react";

import "./LogCalendar.css";

export type LogCalendarProps = {
  logs: { date: string; phase?: string }[];
  selectedDate: string;
  onDayClick: (dateStr: string) => void;
};

type CalendarDay = {
  dateStr: string;
  day: number;
  hasLog: boolean;
  phaseKey?: string; // e.g. "Menstrual", "Follicular", "mixed", "unlabeled"
};

function toDateStringLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatAriaDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPhaseKeyForDate(phaseValues: string[]): string {
  const cleaned = phaseValues
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (cleaned.length === 0) return "unlabeled";

  const unique = Array.from(new Set(cleaned));
  if (unique.length === 1) return unique[0];
  return "mixed";
}

function getPhaseDotColor(phaseKey?: string): string {
  if (!phaseKey) return "var(--phase-custom)";

  const key = phaseKey.trim();

  switch (key) {
    case "Menstrual":
      return "var(--phase-menstrual)";
    case "Follicular":
      return "var(--phase-follicular)";
    case "Ovulatory":
      return "var(--phase-ovulatory)";
    case "Luteal":
      return "var(--phase-luteal)";
    case "mixed":
      return "#64748b"; // neutral for mixed-phase days
    case "unlabeled":
      return "rgba(148,163,184,0.8)"; // subtle grey for unlabeled
    default:
      return "var(--phase-custom)"; // other custom labels
  }
}

// Build the calendar grid plus phase info per day
function buildCalendarMonth(
  year: number,
  month: number,
  logs: { date: string; phase?: string }[],
): CalendarDay[][] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const offset = (firstWeekday + 6) % 7; // Monday-based grid

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group logs by date to decide whether there is a log and which phase colour to show
  const byDate = new Map<string, { hasLog: boolean; phaseKey?: string }>();

  for (const log of logs) {
    if (!log.date) continue;
    const dateStr = log.date;
    const phase = (log.phase ?? "").trim();

    const existing = byDate.get(dateStr);
    if (!existing) {
      byDate.set(dateStr, {
        hasLog: true,
        phaseKey: phase || undefined,
      });
    } else {
      const phasesForDate: string[] = [];
      if (existing.phaseKey) phasesForDate.push(existing.phaseKey);
      if (phase) phasesForDate.push(phase);

      if (phasesForDate.length === 0) {
        existing.phaseKey = "unlabeled";
      } else {
        existing.phaseKey = getPhaseKeyForDate(phasesForDate);
      }
      existing.hasLog = true;
      byDate.set(dateStr, existing);
    }
  }

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  // leading blanks
  for (let i = 0; i < offset; i++) {
    week.push({ dateStr: "", day: 0, hasLog: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = toDateStringLocal(dateObj);
    const info = byDate.get(dateStr);

    week.push({
      dateStr,
      day: d,
      hasLog: info?.hasLog ?? false,
      phaseKey: info?.phaseKey,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length) {
    while (week.length < 7) {
      week.push({ dateStr: "", day: 0, hasLog: false });
    }
    weeks.push(week);
  }

  return weeks;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <li className="log-calendar-legend-item" role="listitem">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      <span>{label}</span>
    </li>
  );
}

export const LogCalendar: React.FC<LogCalendarProps> = ({
  logs,
  selectedDate,
  onDayClick,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() }; // 0–11
  });

  const todayStr = toDateStringLocal(new Date());

  const calendarWeeks = useMemo(
    () => buildCalendarMonth(calendarMonth.year, calendarMonth.month, logs),
    [calendarMonth, logs],
  );

  const focusDayButton = (dateStr: string) => {
    const el = document.querySelector<HTMLButtonElement>(
      `button.log-calendar-day[data-date="${dateStr}"]`,
    );
    el?.focus();
  };

  const focusNextHorizontal = (
    startRow: number,
    startCol: number,
    step: 1 | -1,
  ) => {
    const maxCells = calendarWeeks.length * 7;
    let row = startRow;
    let col = startCol;

    for (let i = 0; i < maxCells; i += 1) {
      col += step;
      if (col > 6) {
        row += 1;
        col = 0;
      } else if (col < 0) {
        row -= 1;
        col = 6;
      }

      if (row < 0 || row >= calendarWeeks.length) return;
      const cell = calendarWeeks[row]?.[col];
      if (!cell || !cell.day) continue;
      focusDayButton(cell.dateStr);
      return;
    }
  };

  const focusNextVertical = (
    startRow: number,
    startCol: number,
    step: 1 | -1,
  ) => {
    let row = startRow + step;
    while (row >= 0 && row < calendarWeeks.length) {
      const cell = calendarWeeks[row]?.[startCol];
      if (cell && cell.day) {
        focusDayButton(cell.dateStr);
        return;
      }
      row += step;
    }
  };

  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
    dateStr: string,
  ) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        focusNextHorizontal(row, col, -1);
        break;
      case "ArrowRight":
        event.preventDefault();
        focusNextHorizontal(row, col, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusNextVertical(row, col, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        focusNextVertical(row, col, 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onDayClick(dateStr);
        break;
      default:
        break;
    }
  };

  const monthLabel = useMemo(
    () =>
      new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString(
        undefined,
        { month: "long", year: "numeric" },
      ),
    [calendarMonth],
  );
  const monthHeadingId = `log-calendar-month-${calendarMonth.year}-${calendarMonth.month}`;

  return (
    <>
      <div className="log-calendar" role="group" aria-labelledby={monthHeadingId}>
        {/* Month header */}
        <div className="log-calendar-header">
          <IonButton
            size="small"
            fill="clear"
            color="primary"
            className="tap-target"
            aria-label="Previous month"
            type="button"
            tabIndex={0}
            onClick={() =>
              setCalendarMonth((prev) => {
                const m = prev.month === 0 ? 11 : prev.month - 1;
                const y = prev.month === 0 ? prev.year - 1 : prev.year;
                return { year: y, month: m };
              })
            }
          >
            ◀
          </IonButton>

          <h2
            className="log-calendar-month"
            aria-live="polite"
            aria-atomic="true"
            role="status"
            tabIndex={-1}
            id={monthHeadingId}
            aria-label={`Month ${monthLabel}`}
          >
            {monthLabel}
          </h2>

          <IonButton
            size="small"
            fill="clear"
            color="primary"
            className="tap-target"
            aria-label="Next month"
            type="button"
            tabIndex={0}
            onClick={() =>
              setCalendarMonth((prev) => {
                const m = prev.month === 11 ? 0 : prev.month + 1;
                const y = prev.month === 11 ? prev.year + 1 : prev.year;
                return { year: y, month: m };
              })
            }
          >
            ▶
          </IonButton>
        </div>

        {/* Day names */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            fontSize: 11,
            textAlign: "center",
            marginBottom: 6,
            opacity: 0.7,
            letterSpacing: 0.3,
          }}
        >
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Grid */}
        <div
          key={`${calendarMonth.year}-${calendarMonth.month}`}
          className="log-calendar-grid"
        >
          {calendarWeeks.map((week, wi) =>
            week.map((cell, ci) => {
              if (!cell.day) {
                return (
                  <div
                    key={`${wi}-${ci}`}
                    aria-hidden="true"
                    style={{ height: 32 }}
                  />
                );
              }

              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const ariaDate = formatAriaDate(cell.dateStr) ?? cell.dateStr;

              // Human-friendly phase phrase
              let phasePhrase = "";
              if (cell.hasLog) {
                if (cell.phaseKey === "unlabeled" || !cell.phaseKey) {
                  phasePhrase = "No phase label set.";
                } else if (cell.phaseKey === "mixed") {
                  phasePhrase = "Mixed phases across entries.";
                } else {
                  phasePhrase = `Phase ${cell.phaseKey}.`;
                }
              }

              const ariaLabel = cell.hasLog
                ? `Log for ${ariaDate}. ${phasePhrase} Double-tap to edit log.`
                : `No log for ${ariaDate}. Double-tap to add log.`;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => onDayClick(cell.dateStr)}
                  className="tap-target log-calendar-day"
                  onKeyDown={(e) =>
                    handleDayKeyDown(e, wi, ci, cell.dateStr)
                  }
                  data-date={cell.dateStr}
                  data-row={wi}
                  data-col={ci}
                  aria-label={ariaLabel}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  style={{
                    borderRadius: 999,
                    border: isSelected
                      ? "1px solid var(--ion-color-primary)"
                      : isToday
                      ? "1px solid rgba(168,111,255,0.7)"
                      : "1px solid rgba(148,163,184,0.35)",
                    backgroundColor: isSelected
                      ? "var(--ion-color-primary)"
                      : isToday
                      ? "rgba(168,111,255,0.08)"
                      : "transparent",
                    color: isSelected ? "#ffffff" : "inherit",
                    fontSize: 12,
                    fontWeight: isSelected || isToday ? 600 : 400,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected
                      ? "0 0 0 1px rgba(255,255,255,0.4), 0 6px 14px rgba(15,23,42,0.18)"
                      : "none",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                    transition:
                      "background-color 120ms ease, color 120ms ease, transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
                  }}
                >
                  <span
                    style={{
                      lineHeight: 1.1,
                      marginBottom: cell.hasLog ? 0 : 1,
                    }}
                  >
                    {cell.day}
                  </span>
                  {cell.hasLog && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        backgroundColor: isSelected
                          ? "white"
                          : getPhaseDotColor(cell.phaseKey),
                        marginTop: 2,
                      }}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Phase legend */}
      <ul className="log-calendar-legend" role="list">
        <LegendDot color="var(--phase-menstrual)" label="Menstrual" />
        <LegendDot color="var(--phase-follicular)" label="Follicular" />
        <LegendDot color="var(--phase-ovulatory)" label="Ovulatory" />
        <LegendDot color="var(--phase-luteal)" label="Luteal" />
        <LegendDot color="var(--phase-custom)" label="Custom / other" />
        <LegendDot color="rgba(148,163,184,0.8)" label="Unlabeled" />
      </ul>

      <p
        style={{
          marginTop: -8,
          marginBottom: 12,
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        Tip: tap a date in the calendar to quickly see or add entries for that
        day. Dot colours reflect your phases or custom labels.
      </p>
    </>
  );
};
