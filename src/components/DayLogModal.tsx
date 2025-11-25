// src/components/log/DayLogModal.tsx
import React from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  //IonText,
  IonList,
  IonItem,
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

  const title = hasDate
    ? formatDisplayDate(selectedDate)
    : "Day log";

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={onClose}>
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
              No entries yet for{" "}
              <strong>{formatDisplayDate(selectedDate)}</strong>.
            </p>
            <div className="day-modal-actions">
              <IonButton expand="block" onClick={onAddEntryForDay}>
                Add entry for this day
              </IonButton>
            </div>
          </div>
        ) : (
          <>
            <p className="day-modal-summary">
              You have <strong>{entries.length}</strong>{" "}
              entr{entries.length === 1 ? "y" : "ies"} for{" "}
              <strong>{formatDisplayDate(selectedDate)}</strong>.
            </p>

            <IonList className="day-modal-list">
              {entries.map((entry, index) => (
                <IonItem key={entry.id} lines="none">
                  <DayLogEntryCard
                    index={index}
                    entry={entry}
                    onUpdateEntry={onUpdateEntry}
                    onDeleteEntry={onDeleteEntry}
                    parseNullableNumber={parseNullableNumber}
                  />
                </IonItem>
              ))}
            </IonList>

            <div className="day-modal-actions">
              <IonButton expand="block" onClick={onAddEntryForDay}>
                Add another entry for this day
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonModal>
  );
};
