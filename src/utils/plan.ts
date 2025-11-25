import { WeekPlan, PlanState, getMondayLocal } from "./log";

// Storage keys for the plan (multi-week)
export const STORAGE_KEY_PLAN_V2 = "cyclesync_mobile_plan_v2";
export const LEGACY_KEY_PLAN_V1 = "cyclesync_mobile_plan_v1";

// Labels for days in the plan UI
export const DAYS: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Create an empty week plan starting at a given Monday date string (YYYY-MM-DD)
export function createWeek(weekStart: string): WeekPlan {
  return {
    weekStart,
    focus: "",
    days: DAYS.map((name) => ({ name, planned: "" })),
  };
}

// Helper: create a week for the week that contains the given date
export function createWeekForDate(date: Date): WeekPlan {
  const mondayStr = getMondayLocal(date);
  return createWeek(mondayStr);
}

// Optional convenience: ensure a given week exists in the plan list
export function ensureWeekInState(
  weeks: WeekPlan[],
  weekStart: string,
): WeekPlan[] {
  const exists = weeks.some((w) => w.weekStart === weekStart);
  if (exists) return weeks;
  return [...weeks, createWeek(weekStart)];
}

// Small helper to build a default PlanState with a single week
export function createInitialPlanStateForToday(): {
  state: PlanState;
  currentWeekStart: string;
} {
  const todayMonday = getMondayLocal(new Date());
  const initialWeek = createWeek(todayMonday);
  return {
    state: { weeks: [initialWeek] },
    currentWeekStart: todayMonday,
  };
}

// Given a date string (YYYY-MM-DD), return the Monday of that week
export function getWeekStartForDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return getMondayLocal(d);
}

// Find the week in a PlanState that contains this date
export function findWeekForDate(
  weeks: WeekPlan[],
  dateStr: string,
): WeekPlan | undefined {
  const weekStart = getWeekStartForDateStr(dateStr);
  if (!weekStart) return undefined;
  return weeks.find((w) => w.weekStart === weekStart);
}

// Return the planned session text for this exact date, or "" if none
export function getPlannedForDate(
  weeks: WeekPlan[],
  dateStr: string,
): string {
  const week = findWeekForDate(weeks, dateStr);
  if (!week) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  // Map JS weekday (0=Sun..6=Sat) to our Monday-based 0–6 index
  const dayIndex = (d.getDay() + 6) % 7;
  if (dayIndex < 0 || dayIndex >= week.days.length) return "";
  return week.days[dayIndex]?.planned ?? "";
}