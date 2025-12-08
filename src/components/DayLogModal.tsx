import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
} from "@ionic/react";
import { DayLogEntryCard } from "./DayLogEntryCard";

export type DayLogEntry = {
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

export type DayLogModalProps = {
  isOpen: boolean;
  selectedDate: string;
  entries: DayLogEntry[];
  onClose: () => void;
  onAddEntryForDay: () => void;
  onUpdateEntry: (id: string, patch: Partial<DayLogEntry>) => void;
  onDeleteEntry: (id: string) => void;
  formatDisplayDate: (dateStr: string) => string;
  parseNullableNumber: (value: string) => number | null;
};

export const DayLogModal: React.FC<DayLogModalProps> = ({
  isOpen,
  selectedDate,
  entries,
  onClose,
  onAddEntryForDay,
  onUpdateEntry,
  onDeleteEntry,
  formatDisplayDate,
  parseNullableNumber,
}) => {
  const hasDate = !!selectedDate;
  const hasEntries = hasDate && entries.length > 0;

  const displayDate = hasDate ? formatDisplayDate(selectedDate) : "";
  const title = hasDate ? displayDate : "Day log";

  const titleId = "day-log-modal-title";
  const summaryId =
    hasDate && entries.length > 0
      ? `day-log-summary-${selectedDate}`
      : undefined;

  const describedBy = hasEntries ? summaryId : undefined;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle id={titleId}>{title}</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            onClick={onClose}
            aria-label="Close day log"
            type="button"
          >
            Close
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding day-modal-content">
        {!hasDate ? (
          <div className="day-modal-empty">
            <p>
              No date selected. Tap a day in the calendar to view or
              add entries.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="day-modal-empty">
            <p>
              No entries yet for <strong>{displayDate}</strong>.
            </p>
            <div className="day-modal-actions">
              <IonButton
                expand="block"
                onClick={onAddEntryForDay}
                aria-label={`Add log for ${displayDate}`}
                type="button"
              >
                Add entry for this day
              </IonButton>
            </div>
          </div>
        ) : (
          <>
            <p
              className="day-modal-summary"
              id={summaryId}
              aria-live="polite"
            >
              You have <strong>{entries.length}</strong>{" "}
              entr{entries.length === 1 ? "y" : "ies"} for{" "}
              <strong>{displayDate}</strong>.
            </p>

            <div className="day-modal-list" role="list">
  {entries.map((entry, index) => (
    <section
      key={entry.id}
      role="listitem"
      className="day-modal-list-item"
    >
      <DayLogEntryCard
        index={index}
        entry={entry}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={onDeleteEntry}
        parseNullableNumber={parseNullableNumber}
      />
    </section>
  ))}
</div>


            {/* Intentionally disabling multiple entries per day for now */}
          </>
        )}
      </IonContent>
    </IonModal>
  );
};
