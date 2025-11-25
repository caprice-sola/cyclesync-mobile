// src/components/log/DayLogEntryCard.tsx
import React from "react";
import {
  IonButton,
  IonInput,
  IonLabel,
  IonTextarea,
} from "@ionic/react";
import type { DayLogEntry } from "./DayLogModal";
import styles from "./DayLogEntryCard.module.css";

const PRESET_PHASES = ["Menstrual", "Follicular", "Ovulatory", "Luteal"];

function getPhaseClassName(phase: string): string {
  const key = phase.trim();

  switch (key) {
    case "Menstrual":
      return styles.phaseTagMenstrual;
    case "Follicular":
      return styles.phaseTagFollicular;
    case "Ovulatory":
      return styles.phaseTagOvulatory;
    case "Luteal":
      return styles.phaseTagLuteal;
    default:
      return styles.phaseTagCustom; // any other custom label
  }
}

export type DayLogEntryCardProps = {
  index: number;
  entry: DayLogEntry;
  onUpdateEntry: (id: string, patch: Partial<DayLogEntry>) => void;
  onDeleteEntry: (id: string) => void;
  parseNullableNumber: (value: string) => number | null;
};

export const DayLogEntryCard: React.FC<DayLogEntryCardProps> = ({
  index,
  entry,
  onUpdateEntry,
  onDeleteEntry,
  parseNullableNumber,
}) => {
  const isCustomPhase =
    entry.phase !== "" && !PRESET_PHASES.includes(entry.phase);

  return (
    <div className={styles.entryCard}>
      {/* Header row: title + delete */}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.entryIndex}>Entry {index + 1}</div>
          <IonLabel>
            <h2 className={styles.entryTitle}>
              {entry.planned || "Session"}
            </h2>
            {entry.phase && (
  <p
    className={`${styles.entryPhase} ${getPhaseClassName(
      entry.phase,
    )}`}
  >
    Phase: {entry.phase}
  </p>
)}

          </IonLabel>
        </div>

        <IonButton
          size="small"
          fill="outline"
          color="medium"
          onClick={() => onDeleteEntry(entry.id)}
        >
          Delete
        </IonButton>
      </div>

      {/* Phase controls */}
      <IonLabel position="stacked">Cycle phase (optional)</IonLabel>
      <div className={styles.phasePills}>
        {PRESET_PHASES.map((phase) => (
          <IonButton
            key={phase}
            size="small"
            fill={entry.phase === phase ? "solid" : "outline"}
            color={entry.phase === phase ? "primary" : "medium"}
            onClick={() => onUpdateEntry(entry.id, { phase })}
          >
            {phase}
          </IonButton>
        ))}

        <IonButton
  size="small"
  fill={isCustomPhase ? "solid" : "outline"}
  color={isCustomPhase ? "primary" : "medium"}
  onClick={() => {
    if (isCustomPhase) {
      // Turn custom OFF → clear phase
      onUpdateEntry(entry.id, { phase: "" });
    } else {
      // Turn custom ON → set a placeholder label if empty,
      // or keep whatever non-preset value is already there
      const nextPhase =
        entry.phase && !PRESET_PHASES.includes(entry.phase)
          ? entry.phase
          : "Custom";
      onUpdateEntry(entry.id, { phase: nextPhase });
    }
  }}
>
  Custom
</IonButton>

      </div>

      <IonInput
        placeholder="Custom phase label – e.g. IUD bleed, PMS, deload, high-energy…"
        value={entry.phase}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            phase: String(e.detail.value ?? ""),
          })
        }
      />

      {/* Planned / Actual */}
      <IonLabel position="stacked" style={{ marginTop: 10 }}>
        Planned session
      </IonLabel>
      <IonInput
        placeholder="e.g. Pole - power tricks"
        value={entry.planned}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            planned: String(e.detail.value ?? ""),
            plannedSource: "manual",
          })
        }
      />

      <IonLabel position="stacked" style={{ marginTop: 6 }}>
        Actual session
      </IonLabel>
      <IonInput
        placeholder="What you actually did"
        value={entry.actual}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            actual: String(e.detail.value ?? ""),
          })
        }
      />

      {/* Metrics row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCol}>
          <IonLabel position="stacked">Energy (1–5)</IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="1"
            max="5"
            value={entry.energy ?? ""}
            onIonChange={(e) =>
              onUpdateEntry(entry.id, {
                energy: parseNullableNumber(
                  String(e.detail.value ?? ""),
                ),
              })
            }
          />
        </div>

        <div className={styles.metricCol}>
          <IonLabel position="stacked">RPE (1–10)</IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="1"
            max="10"
            value={entry.rpe ?? ""}
            onIonChange={(e) =>
              onUpdateEntry(entry.id, {
                rpe: parseNullableNumber(
                  String(e.detail.value ?? ""),
                ),
              })
            }
          />
        </div>

        <div className={styles.metricCol}>
          <IonLabel position="stacked">Sleep (h)</IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={entry.sleep ?? ""}
            onIonChange={(e) =>
              onUpdateEntry(entry.id, {
                sleep: parseNullableNumber(
                  String(e.detail.value ?? ""),
                ),
              })
            }
          />
        </div>
      </div>

      <div className={styles.helperText}>
        Track at least one of these regularly to get more meaningful trends in
        Insights.
      </div>

      {/* Notes */}
      <IonLabel position="stacked" style={{ marginTop: 10 }}>
        Notes
      </IonLabel>
      <IonTextarea
        autoGrow
        placeholder="Energy, pain, mood, PRs, adjustments…"
        value={entry.notes}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            notes: String(e.detail.value ?? ""),
          })
        }
      />
    </div>
  );
};
