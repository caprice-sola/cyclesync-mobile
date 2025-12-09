// src/pages/Plan.tsx
import React, { useEffect, useState } from "react";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonList,
  IonButton,
} from "@ionic/react";

import type { CSSProperties } from "react";

import { PlanState, WeekPlan, getMondayLocal } from "../utils/log";

import {
  DAYS,
  STORAGE_KEY_PLAN_V2,
  LEGACY_KEY_PLAN_V1,
  createWeek,
} from "../utils/plan";

import { PageLayout } from "../components/PageLayout";

import { warn } from "../utils/logging";

const weekSelectorStyle: CSSProperties & {
  "--inner-padding-end"?: string;
} = {
  flex: 1,
  "--inner-padding-end": "0",
  minWidth: 120,
};

const Plan: React.FC = () => {
  const [weeks, setWeeks] = useState<WeekPlan[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  // Load plan from localStorage, migrating if needed
  useEffect(() => {
    const todayMonday = getMondayLocal(new Date());

    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY_PLAN_V2);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as PlanState;
        const list = Array.isArray(parsed.weeks) ? parsed.weeks : [];
        if (list.length > 0) {
          setWeeks(list);
          const hasThisWeek = list.some((w) => w.weekStart === todayMonday);
          setCurrentWeekStart(
            hasThisWeek ? todayMonday : list[0].weekStart,
          );
          setLoaded(true);
          return;
        }
      }

      // Legacy single-week format (before multi-week refactor)
      const rawV1 = localStorage.getItem(LEGACY_KEY_PLAN_V1);
      if (rawV1) {
        const legacy = JSON.parse(rawV1) as WeekPlan;
        const wkStart = legacy.weekStart || todayMonday;
        const migrated: WeekPlan = {
          weekStart: wkStart,
          focus: legacy.focus || "",
          days:
            legacy.days && legacy.days.length === 7
              ? legacy.days
              : createWeek(wkStart).days,
        };
        setWeeks([migrated]);
        setCurrentWeekStart(wkStart);
        // Save into new format
        localStorage.setItem(
          STORAGE_KEY_PLAN_V2,
          JSON.stringify({ weeks: [migrated] as WeekPlan[] }),
        );
        setLoaded(true);
        return;
      }

      // Nothing stored yet → create week for this week
      const initialWeek = createWeek(todayMonday);
      setWeeks([initialWeek]);
      setCurrentWeekStart(todayMonday);
      setLoaded(true);
    } catch (e) {
      warn("Failed to load plan", e);
      const fallbackWeek = createWeek(todayMonday);
      setWeeks([fallbackWeek]);
      setCurrentWeekStart(todayMonday);
      setLoaded(true);
    }
  }, []);

  // Save plan whenever weeks change
  useEffect(() => {
    if (!loaded) return;
    const state: PlanState = { weeks };
    try {
      localStorage.setItem(STORAGE_KEY_PLAN_V2, JSON.stringify(state));
    } catch (e) {
      warn("Failed to save plan", e);
    }
  }, [weeks, loaded]);

  const currentWeek: WeekPlan =
    weeks.find((w) => w.weekStart === currentWeekStart) ??
    createWeek(currentWeekStart || getMondayLocal(new Date()));

  const setWeekStart = (newWeekStart: string) => {
    setWeeks((prev) => {
      const exists = prev.some((w) => w.weekStart === newWeekStart);
      if (exists) return prev;
      return [...prev, createWeek(newWeekStart)];
    });
    setCurrentWeekStart(newWeekStart);
  };

  const goToWeekOffset = (offsetWeeks: number) => {
    const baseDate =
      currentWeekStart !== ""
        ? new Date(currentWeekStart)
        : new Date();
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + offsetWeeks * 7);
    const newWeekStart = getMondayLocal(newDate);
    setWeekStart(newWeekStart);
  };

  const handleWeekDateChange = (value: string | null | undefined) => {
    if (!value) return;
    const picked = new Date(String(value));
    const newWeekStart = getMondayLocal(picked);
    setWeekStart(newWeekStart);
  };

  const updateFocus = (focus: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekStart === currentWeekStart ? { ...w, focus } : w,
      ),
    );
  };

  const updateDay = (index: number, planned: string) => {
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.weekStart !== currentWeekStart) return w;
        const days = w.days.slice();
        days[index] = { ...days[index], planned };
        return { ...w, days };
      }),
    );
  };

  return (
    <PageLayout title="Plan" loading={!loaded} loadingText="Loading plan…">
      {/* Week navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <IonButton
          fill="outline"
          className="tap-target"
          style={{ minWidth: 96, minHeight: 44, flexShrink: 0 }}
          onClick={() => goToWeekOffset(-1)}
          aria-label="Previous week"
        >
          ◀ Prev
        </IonButton>

        <IonItem lines="none" style={weekSelectorStyle}>
          <IonLabel position="stacked">Week starting (Monday)</IonLabel>
          <IonInput
            type="date"
            value={currentWeek.weekStart}
            onIonChange={(e) =>
              handleWeekDateChange(e.detail.value ?? null)
            }
          />
        </IonItem>

        <IonButton
          fill="outline"
          className="tap-target"
          style={{ minWidth: 96, minHeight: 44, flexShrink: 0 }}
          onClick={() => goToWeekOffset(1)}
          aria-label="Next week"
        >
          Next ▶
        </IonButton>
      </div>

      <IonItem lines="full">
        <IonLabel position="stacked">Week focus</IonLabel>
        <IonTextarea
          autoGrow
          placeholder="e.g. Power tricks, deload, endurance, recovery…"
          value={currentWeek.focus}
          onIonChange={(e) => updateFocus(String(e.detail.value ?? ""))}
        />
      </IonItem>

      <IonList>
        <IonItem lines="full">
          <IonLabel>
            <h2>Planned sessions for this week</h2>
            <p>One quick line per day is enough.</p>
          </IonLabel>
        </IonItem>

        {currentWeek.days.map((day, index) => (
          <IonItem
            key={DAYS[index]}
            lines="full"
            style={{ paddingTop: 10, paddingBottom: 10 }}
          >
            <div style={{ width: "100%" }}>
              <IonLabel position="stacked">{DAYS[index]}</IonLabel>
              <IonInput
                placeholder="e.g. Pole - spin / Strength / Rest"
                value={day.planned}
                onIonChange={(e) =>
                  updateDay(index, String(e.detail.value ?? ""))
                }
              />
            </div>
          </IonItem>
        ))}
      </IonList>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Each week is saved separately. Use the arrows or date field to switch
        weeks. Your Log tab can pull from the plan that matches the selected
        date.
      </div>
    </PageLayout>
  );
};

export default Plan;
