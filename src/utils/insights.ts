import { LogEntry } from "./log";

export type OverallStats = {
  totalEntries: number;
  daysWithLogs: number;
  avgEnergy: number | null;
  avgRpe: number | null;
  avgSleep: number | null;
};

export type PhaseStats = {
  phase: string; // display label
  key: string;   // grouping key (phase label)
  entries: number;
  avgEnergy: number | null;
  avgRpe: number | null;
  avgSleep: number | null;
};

export type InsightsStats = {
  overall: OverallStats;
  phases: PhaseStats[];
};

export type MetricsPoint = {
  date: string;
  energy?: number;
  rpe?: number;
  sleep?: number;
  phase?: string;
};

// --- Helpers to build stats ---

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / nums.length;
}

export function buildInsightsStats(logs: LogEntry[]): InsightsStats {
  const totalEntries = logs.length;

  const datesWithLogs = new Set(
    logs.filter((l) => l.date).map((l) => l.date),
  );

  const energies = logs
    .map((l) => l.energy)
    .filter((v): v is number => v != null);
  const rpes = logs
    .map((l) => l.rpe)
    .filter((v): v is number => v != null);
  const sleeps = logs
    .map((l) => l.sleep)
    .filter((v): v is number => v != null);

  const overall: OverallStats = {
    totalEntries,
    daysWithLogs: datesWithLogs.size,
    avgEnergy: avg(energies),
    avgRpe: avg(rpes),
    avgSleep: avg(sleeps),
  };

  // Phase grouping (use phase label; empty -> "Unlabeled")
  const byPhase = new Map<
    string,
    {
      phase: string;
      energies: number[];
      rpes: number[];
      sleeps: number[];
      count: number;
    }
  >();

  for (const log of logs) {
  const key = log.phase?.trim() || "Unlabeled";
  let bucket = byPhase.get(key);

  if (!bucket) {
    bucket = {
      phase: key,
      energies: [],
      rpes: [],
      sleeps: [],
      count: 0,
    };
    byPhase.set(key, bucket);
  }

  bucket.count += 1;
  if (log.energy != null) bucket.energies.push(log.energy);
  if (log.rpe != null) bucket.rpes.push(log.rpe);
  if (log.sleep != null) bucket.sleeps.push(log.sleep);
}


  const phases: PhaseStats[] = Array.from(byPhase.values())
    .map((b) => ({
      phase: b.phase,
      key: b.phase,
      entries: b.count,
      avgEnergy: avg(b.energies),
      avgRpe: avg(b.rpes),
      avgSleep: avg(b.sleeps),
    }))
    // sort by most data first
    .sort((a, b) => b.entries - a.entries);

  return { overall, phases };
}

// --- Metrics chart series (Energy / RPE / Sleep overlay) ---

export function buildMetricsSeries(logs: LogEntry[]): MetricsPoint[] {
  const points: MetricsPoint[] = [];

  for (const log of logs) {
    if (!log.date) continue;
    if (log.energy == null && log.rpe == null && log.sleep == null) {
      continue;
    }

    points.push({
      date: log.date,
      energy: log.energy ?? undefined,
      rpe: log.rpe ?? undefined,
      sleep: log.sleep ?? undefined,
      phase: log.phase || undefined,
    });
  }

  points.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });

  return points;
}
