import React, { useEffect, useMemo, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonBadge,
  useIonViewWillEnter,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import "./Insights.css";
import { LogEntry } from "../utils/log";
import {
  InsightsStats,
  buildInsightsStats,
  buildMetricsSeries,
} from "../utils/insights";
import { MetricsChart } from "../components/EnergyChart";
import { loadLogs } from "../services/storage";
import { PageLayout } from "../components/PageLayout";

function monthKey(date: string | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(key: string): string {
  const [yearStr, monthStr] = key.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const d = new Date(year, month, 1);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const Insights: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Load logs via storage service (shared with Logs tab)
  useIonViewWillEnter(() => {
    const lastedLogs = loadLogs();
    setLogs(lastedLogs);
    setLoaded(true);
  });

  const stats: InsightsStats = useMemo(
    () => buildInsightsStats(logs),
    [logs],
  );

  const monthOptions = useMemo(() => {
    const seen = new Map<string, string>();

    for (const log of logs) {
      const key = monthKey(log.date);
      if (!key || seen.has(key)) continue;
      seen.set(key, formatMonthLabel(key));
    }

    return Array.from(seen.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [logs]);

  useEffect(() => {
    if (!monthOptions.length) {
      setSelectedMonth(null);
      return;
    }

    if (!selectedMonth || !monthOptions.some((m) => m.key === selectedMonth)) {
      setSelectedMonth(monthOptions[0].key);
    }
  }, [monthOptions, selectedMonth]);

  const filteredLogs = useMemo(() => {
    if (!selectedMonth) return logs;
    return logs.filter((log) => monthKey(log.date) === selectedMonth);
  }, [logs, selectedMonth]);

  const metricsSeries = useMemo(
    () => buildMetricsSeries(filteredLogs),
    [filteredLogs],
  );

  const hasAnyData = logs.length > 0;

  return (
    <PageLayout title="Insights" loading={!loaded} loadingText="Loading…">
      {/* Pretty gradient header, matches other tabs */}
      <div className="page-header">
        <h1>Your training patterns</h1>
        <p>
          See how your energy, effort and sleep move across your sessions and
          phases.
        </p>
      </div>

      {!hasAnyData && (
        <IonCard style={{ marginTop: 16 }}>
          <IonCardHeader>
            <IonCardTitle>Insights</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              Start logging your sessions in the <strong>Log</strong> tab to see
              trends in your energy, RPE, sleep, and phases here.
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      {hasAnyData && (
        <>
          {/* Overview */}
          <IonCard style={{ marginTop: 16 }}>
            <IonCardHeader>
              <IonCardTitle>Overview</IonCardTitle>
              <IonCardSubtitle>
                A quick snapshot of your training log so far
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Total entries
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {stats.overall.totalEntries}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Days with logs
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {stats.overall.daysWithLogs}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Avg energy
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    {stats.overall.avgEnergy != null
                      ? stats.overall.avgEnergy.toFixed(1)
                      : "–"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Avg RPE
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    {stats.overall.avgRpe != null
                      ? stats.overall.avgRpe.toFixed(1)
                      : "–"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Avg sleep
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500 }}>
                    {stats.overall.avgSleep != null
                      ? `${stats.overall.avgSleep.toFixed(1)} h`
                      : "–"}
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Metrics chart */}
          <IonCard className="insights-chart-card">
  <IonCardHeader>
    <IonCardTitle>Energy, RPE &amp; sleep over time</IonCardTitle>
    <IonCardSubtitle className="insights-chart-subtitle">
      See how intensity and recovery dance together across your
      sessions.
    </IonCardSubtitle>
  </IonCardHeader>
  <IonCardContent className="insights-chart-content">
    <div className="insights-chart-controls">
      <IonSelect
        value={selectedMonth ?? undefined}
        onIonChange={(e) => setSelectedMonth(e.detail.value ?? null)}
        interface="popover"
        label="Month"
        aria-label="Select month"
      >
        {monthOptions.map((option) => (
          <IonSelectOption key={option.key} value={option.key}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
    </div>
    <div className="insights-chart-container">
      <MetricsChart data={metricsSeries} />
    </div>
  </IonCardContent>
</IonCard>


          {/* By phase */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>By phase / labels</IonCardTitle>
              <IonCardSubtitle>
                How your experience shifts across phases and custom tags
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              {stats.phases.length === 0 ? (
                <IonText>
                  Tag entries with a phase or custom label (e.g.{" "}
                  <em>IUD bleed</em>, <em>High-energy luteal</em>) to see
                  breakdowns here.
                </IonText>
              ) : (
                <IonList>
                  {stats.phases.map((p) => (
                    <IonItem key={p.key} lines="full">
                      <IonLabel>
                        <h2>
                          {p.phase === "Unlabeled"
                            ? "Unlabeled sessions"
                            : p.phase}
                        </h2>
                        <p>
                          {p.entries} entr
                          {p.entries === 1 ? "y" : "ies"}
                        </p>
                        <p style={{ fontSize: 12, marginTop: 4 }}>
                          {p.avgEnergy != null && (
                            <IonBadge
                              color="medium"
                              style={{ marginRight: 4 }}
                            >
                              Avg energy {p.avgEnergy.toFixed(1)}
                            </IonBadge>
                          )}
                          {p.avgRpe != null && (
                            <IonBadge
                              color="medium"
                              style={{ marginRight: 4 }}
                            >
                              Avg RPE {p.avgRpe.toFixed(1)}
                            </IonBadge>
                          )}
                          {p.avgSleep != null && (
                            <IonBadge color="medium">
                              Avg sleep {p.avgSleep.toFixed(1)}h
                            </IonBadge>
                          )}
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </>
      )}
    </PageLayout>
  );
};

export default Insights;
