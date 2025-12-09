// src/services/storage.ts
// Centralised storage layer for CycleSync data.
// Right now this uses localStorage, but we can later
// swap this out for secure storage / backend without
// touching the rest of the app.

import { LogEntry } from "../utils/log";

import { warn } from "../utils/logging";

const STORAGE_KEY_LOGS = "cyclesync_mobile_logs_v1";

// --- Helpers ---------------------------------------------------

function hasWindow(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function normaliseLogEntry(raw: Partial<LogEntry> | null | undefined): LogEntry {

  return {
    id: raw?.id ?? crypto.randomUUID(),
    date: raw?.date ?? "",
    planned: raw?.planned ?? "",
    actual: raw?.actual ?? "",
    notes: raw?.notes ?? "",
    rpe:
      typeof raw?.rpe === "number" || raw?.rpe === null ? raw.rpe : null,
    energy:
      typeof raw?.energy === "number" || raw?.energy === null
        ? raw.energy
        : null,
    sleep:
      typeof raw?.sleep === "number" || raw?.sleep === null
        ? raw.sleep
        : null,
    phase: raw?.phase ?? "",
    plannedSource: raw?.plannedSource ?? null,
  };
}

// --- Public API ------------------------------------------------

export function loadLogs(): LogEntry[] {
  if (!hasWindow()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normaliseLogEntry(item as Partial<LogEntry>));
  } catch (e) {
    warn("[storage] Failed to load logs", e);
    return [];
  }
}


export function saveLogs(logs: LogEntry[]): void {
  if (!hasWindow()) return;

  try {
    const payload = JSON.stringify(logs);
    window.localStorage.setItem(STORAGE_KEY_LOGS, payload);
  } catch (e) {
    warn("[storage] Failed to save logs", e);
  }
}
