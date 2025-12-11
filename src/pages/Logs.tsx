/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import {
} from "@ionic/react";

import { LogCalendar } from "../components/LogCalendar";
import { DayLogModal } from "../components/DayLogModal";
import { PageLayout } from "../components/PageLayout";

import {
  LogEntry,
  PlanState,
  parseNullableNumber,
  formatDisplayDate,
  parseISODate,
  getPlannedFromPlan,
} from "../utils/log";

import { loadLogs, saveLogs } from "../services/storage";

import {
  STORAGE_KEY_PLAN_V2,
} from "../utils/plan";

import { warn } from "../utils/logging";


//const STORAGE_KEY_PLAN_V2 = "cyclesync_mobile_plan_v2";
const LEGACY_KEY_PLAN_V1 = "cyclesync_mobile_plan_v1";

//const PRESET_PHASES = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];

const createEmptyLog = (): LogEntry => ({
  id: crypto.randomUUID(),
  date: "", // user chooses explicitly
  planned: "",
  actual: "",
  notes: "",
  rpe: null,
  energy: null,
  sleep: null,
  phase: "",
  plannedSource: null,
});

const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [planState, setPlanState] = useState<PlanState | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);


  // Load logs via storage service
  useEffect(() => {
    const initialLogs = loadLogs();
    setLogs(initialLogs);
    setLoaded(true);
  }, []);


  // Save logs via storage service
  useEffect(() => {
    if (!loaded) return;
    saveLogs(logs);
  }, [logs, loaded]);


  // Load plan (multi-week)
  useEffect(() => {
    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY_PLAN_V2);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as PlanState;
        if (Array.isArray(parsed.weeks)) {
          setPlanState({ weeks: parsed.weeks });
          return;
        }
      }

      // legacy single-week
      const rawV1 = localStorage.getItem(LEGACY_KEY_PLAN_V1);
      if (rawV1) {
        const single = JSON.parse(rawV1) as PlanState["weeks"][number];
        setPlanState({ weeks: [single] });
      }
    } catch (e) {
      warn("Failed to load plan for log suggestions", e);
    }
  }, []);

  const addLog = () => {
    setLogs((prev) => {
      const base = createEmptyLog();

      // Use selected date if present, otherwise default to today
      const date = selectedDate || todayStr; // make sure todayStr is defined above
      base.date = date;

      // Ask the plan for a suggestion for this date
      const suggestion = getPlannedFromPlan(date, planState);
      if (suggestion) {
        base.planned = suggestion;
        base.plannedSource = "plan";
      }

      return [base, ...prev];
    });
  };


  const updateLog = (id: string, patch: Partial<LogEntry>) => {
    setLogs((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    );
  };

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((entry) => entry.id !== id));
  };

  const sortedLogs = React.useMemo(() => {
    const copy = [...logs];

    copy.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1; // undated last
      if (!b.date) return -1;

      const da = parseISODate(a.date);
      const db = parseISODate(b.date);

      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      // newest first
      return db.getTime() - da.getTime();
    });

    return copy;
  }, [logs]);

  const entriesForSelectedDate = React.useMemo(
    () =>
      selectedDate
        ? sortedLogs.filter((entry) => entry.date === selectedDate)
        : [],
    [sortedLogs, selectedDate],
  );

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDayModalOpen(true);
  };

  return (
    <PageLayout title="Log" loading={!loaded} loadingText="Loading…">
      {/* Calendar */}
      <LogCalendar
        logs={logs}
        selectedDate={selectedDate}
        onDayClick={handleDayClick}
      />

      {selectedDate && (
        <p
          style={{
            marginTop: -8,
            marginBottom: 12,
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          Showing entries for{" "}
          <strong>{formatDisplayDate(selectedDate)}</strong>.
        </p>
      )}

      {/* Day modal – tap a date in the calendar to see or add entries */}
      <DayLogModal
        isOpen={isDayModalOpen}
        selectedDate={selectedDate}
        entries={entriesForSelectedDate}
        onClose={() => setIsDayModalOpen(false)}
        onAddEntryForDay={addLog}
        onUpdateEntry={updateLog}
        onDeleteEntry={removeLog}
        formatDisplayDate={formatDisplayDate}
        parseNullableNumber={parseNullableNumber}
      />
    </PageLayout>
  );
};

export default Logs;
