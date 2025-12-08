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

function getDateLabel(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export type DayLogEntryCardProps = {
  index: number;
  entry: DayLogEntry;
  onUpdateEntry: (id: string, patch: Partial<DayLogEntry>) => void;
  onDeleteEntry: (id: string) => void;
  parseNullableNumber: (value: string) => number | null;
};

export const DayLogEntryCard: React.FC<DayLogEntryCardProps> = ({
  //index,
  entry,
  onUpdateEntry,
  onDeleteEntry,
  parseNullableNumber,
}) => {
  const isCustomPhase =
    entry.phase !== "" && !PRESET_PHASES.includes(entry.phase);

  const dateLabel = getDateLabel(entry.date);
  //const entryLabelPrefix = `Log for ${dateLabel}`;
  const helperId = `entry-helper-${entry.id}`;
  const baseId = `day-log-${entry.id}`;

  const customPhaseLabelId = `${baseId}-custom-phase-label`;
  const plannedLabelId = `${baseId}-planned`;
  const actualLabelId = `${baseId}-actual`;
  const energyLabelId = `${baseId}-energy`;
  const rpeLabelId = `${baseId}-rpe`;
  const sleepLabelId = `${baseId}-sleep`;
  const notesLabelId = `${baseId}-notes`;

  return (
    <div className={styles.entryCard}>
      {/* Header row: title + delete */}
      <div className={styles.headerRow}>
        <div>
          {/* No more "Entry 1" / "Log 1" here */}
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
          aria-label={`Delete log for ${dateLabel}`}
        >
          Delete
        </IonButton>
      </div>

      {/* Phase controls */}
      <IonLabel position="stacked">
        Cycle phase (optional)
      </IonLabel>
      <div className={styles.phasePills}>
        {PRESET_PHASES.map((phase) => (
          <IonButton
            key={phase}
            size="small"
            fill={entry.phase === phase ? "solid" : "outline"}
            color={entry.phase === phase ? "primary" : "medium"}
            aria-pressed={entry.phase === phase}
            aria-label={
              entry.phase === phase
                ? `Selected: ${phase} phase`
                : `Set phase to ${phase}`
            }
            onClick={() => onUpdateEntry(entry.id, { phase })}
          >
            {phase}
          </IonButton>
        ))}

        <IonButton
          size="small"
          fill={isCustomPhase ? "solid" : "outline"}
          color={isCustomPhase ? "primary" : "medium"}
          aria-pressed={isCustomPhase}
          aria-label={
            isCustomPhase
              ? "Clear custom phase label"
              : "Use custom phase label"
          }
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

      {/* Custom phase label */}
      <IonLabel
        position="stacked"
        id={customPhaseLabelId}
      >
        Custom phase label (optional)
      </IonLabel>
      <IonInput
        aria-labelledby={customPhaseLabelId}
        placeholder="e.g. IUD bleed, PMS, deload, high-energy…"
        value={entry.phase}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            phase: String(e.detail.value ?? ""),
          })
        }
      />

      {/* Planned / Actual */}
      <IonLabel
        position="stacked"
        id={plannedLabelId}
        style={{ marginTop: 10 }}
      >
        Planned session
      </IonLabel>
      <IonInput
        aria-labelledby={plannedLabelId}
        placeholder="e.g. Pole - power tricks"
        value={entry.planned}
        onIonChange={(e) =>
          onUpdateEntry(entry.id, {
            planned: String(e.detail.value ?? ""),
            plannedSource: "manual",
          })
        }
      />

      <IonLabel
        position="stacked"
        id={actualLabelId}
        style={{ marginTop: 6 }}
      >
        Actual session
      </IonLabel>
      <IonInput
        aria-labelledby={actualLabelId}
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
          <IonLabel
            position="stacked"
            id={energyLabelId}
          >
            Energy (1–5)
          </IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="1"
            max="5"
            value={entry.energy ?? ""}
            aria-labelledby={energyLabelId}
            aria-describedby={helperId}
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
          <IonLabel
            position="stacked"
            id={rpeLabelId}
          >
            RPE (1–10)
          </IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="1"
            max="10"
            value={entry.rpe ?? ""}
            aria-labelledby={rpeLabelId}
            aria-describedby={helperId}
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
          <IonLabel
            position="stacked"
            id={sleepLabelId}
          >
            Sleep (h)
          </IonLabel>
          <IonInput
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={entry.sleep ?? ""}
            aria-labelledby={sleepLabelId}
            aria-describedby={helperId}
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

      <div className={styles.helperText} id={helperId}>
        Track at least one of these regularly to get more meaningful trends in
        Insights.
      </div>

      {/* Notes */}
      <IonLabel
        position="stacked"
        id={notesLabelId}
        style={{ marginTop: 10 }}
      >
        Notes
      </IonLabel>
      <IonTextarea
        autoGrow
        aria-labelledby={notesLabelId}
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
