// src/components/log/LogCalendar.tsx
import React, { useMemo, useState } from "react";
import { IonButton } from "@ionic/react";

import "./LogCalendar.css";

export type LogCalendarProps = {
  // We only care about date + phase here; other fields are ignored
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

// Phase → colour mapping for the dot under each day
// const PHASE_COLORS: Record<string, string> = {
//   Menstrual: "#f97373", // soft red
//   Follicular: "#34d399", // green
//   Ovulatory: "#facc15", // yellow
//   Luteal: "#a78bfa", // purple
//   mixed: "#64748b", // grey-ish for mixed days
//   unlabeled: "#3b82f6", // default blue
// };

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
      // Update phaseKey to account for multiple entries in the same day
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
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginRight: 12,
        marginBottom: 4,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      <span>{label}</span>
    </span>
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

  const monthLabel = useMemo(
    () =>
      new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString(
        undefined,
        { month: "long", year: "numeric" },
      ),
    [calendarMonth],
  );

  return (
    <>
      <div className="log-calendar">
        {/* Month header */}
      <div className="log-calendar-header">
          <IonButton
            size="small"
            fill="clear"
            color="primary"
            className="tap-target"
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

          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: 0.2,
              color: "#0f172a",
            }}
          >
            {monthLabel}
          </div>

          <IonButton
            size="small"
            fill="clear"
            color="primary"
            className="tap-target"
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
                    style={{ height: 32 }}
                  />
                );
              }

              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => onDayClick(cell.dateStr)}
                  className="tap-target log-calendar-day"
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
                  <span style={{
    lineHeight: 1.1,
    marginBottom: cell.hasLog ? 0 : 1,
  }}>{cell.day}</span>
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
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        fontSize: 11,
        opacity: 0.8,
        marginBottom: 8,
      }}
    >
      <LegendDot color="var(--phase-menstrual)" label="Menstrual" />
      <LegendDot color="var(--phase-follicular)" label="Follicular" />
      <LegendDot color="var(--phase-ovulatory)" label="Ovulatory" />
      <LegendDot color="var(--phase-luteal)" label="Luteal" />
      <LegendDot color="var(--phase-custom)" label="Custom / other" />
      <LegendDot color="rgba(148,163,184,0.8)" label="Unlabeled" />
    </div>

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
