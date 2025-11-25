// Types shared by log + plan
export type LogEntry = {
  id: string;
  date: string;
  planned: string;
  actual: string;
  notes: string;
  rpe: number | null;
  energy: number | null;
  sleep: number | null;
  phase: string;
  plannedSource?: "plan" | "manual" | null;
};

export type DayPlan = {
  name: string;
  planned: string;
};

export type WeekPlan = {
  weekStart: string; // YYYY-MM-DD (Monday)
  focus: string;
  days: DayPlan[];
};

export type PlanState = {
  weeks: WeekPlan[];
};

// --- Date helpers ---

export function parseISODate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toDateStringLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseISODate(dateStr);
  if (!d) return dateStr;

  const today = new Date();
  const todayStr = toDateStringLocal(today);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStringLocal(yesterday);

  const thisStr = toDateStringLocal(d);

  if (thisStr === todayStr) return "Today";
  if (thisStr === yesterdayStr) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function parseNullableNumber(value: string): number | null {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// --- Plan → Log helpers ---

export function getMondayLocal(date: Date): string {
  const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
  const diffToMonday = (dayOfWeek + 6) % 7; // Mon=0
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  return toDateStringLocal(monday);
}

export function getPlannedFromPlan(
  dateStr: string,
  plan: PlanState | null,
): string | null {
  if (!dateStr || !plan || !plan.weeks || plan.weeks.length === 0) return null;

  const date = parseISODate(dateStr);
  if (!date) return null;

  const msPerDay = 1000 * 60 * 60 * 24;

  const pickFromWeek = (week: WeekPlan): string | null => {
    const start = parseISODate(week.weekStart);
    if (!start) return null;

    const diffDays = Math.floor(
      (date.getTime() - start.getTime()) / msPerDay,
    );

    if (diffDays < 0 || diffDays >= week.days.length) return null;
    const day = week.days[diffDays];
    return day && day.planned ? day.planned : null;
  };

  // 1) Preferred: week whose weekStart matches this date's Monday
  const expectedWeekStart = getMondayLocal(date);
  const directWeek = plan.weeks.find(
    (w) => w.weekStart === expectedWeekStart,
  );
  if (directWeek) {
    const planned = pickFromWeek(directWeek);
    if (planned) return planned;
  }

  // 2) Fallback: legacy / slightly misaligned weeks
  for (const week of plan.weeks) {
    const planned = pickFromWeek(week);
    if (planned) return planned;
  }

  return null;
}
