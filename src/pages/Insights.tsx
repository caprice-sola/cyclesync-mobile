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
} from "@ionic/react";

import { LogEntry } from "../utils/log";
import {
  InsightsStats,
  buildInsightsStats,
  buildMetricsSeries,
} from "../utils/insights";
import { MetricsChart } from "../components/EnergyChart";
import { loadLogs } from "../services/storage";
import { PageLayout } from "../components/PageLayout";

const Insights: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load logs via storage service (shared with Logs tab)
  useEffect(() => {
    const initialLogs = loadLogs();
    setLogs(initialLogs);
    setLoaded(true);
  }, []);

  const stats: InsightsStats = useMemo(
    () => buildInsightsStats(logs),
    [logs],
  );

  const metricsSeries = useMemo(
    () => buildMetricsSeries(logs),
    [logs],
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
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Energy, RPE &amp; sleep over time</IonCardTitle>
              <IonCardSubtitle>
                See how intensity and recovery dance together across your
                sessions.
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <MetricsChart data={metricsSeries} />
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
