import React from "react";
import { apiFetch, buildApiUrl } from "../lib/api";
import { StatePanel } from "../components/ui/StatePanel";
import { useAssigneeAbsences } from "../features/assignee-absences";
import { useManagerMode } from "../features/manager-mode/ManagerModeContext";
import { useStatistics } from "../features/statistics/useStatistics";
import type { ForecastCardItem, StatisticsForecastResponse } from "../types/api";
import {
  buildStatisticsCards,
  filterByAssignee,
  formatDate,
  formatDateTime,
  getCurrentWeekRange,
  getElapsedDays,
  isActiveOperationalCard,
  isAbsenceRiskCard,
  isCompletedCard,
  isDateInRange,
  isOverdue,
  isToday,
  normalizeText,
  type StatisticsCard
} from "../features/statistics/statistics.utils";

export function StatisticsPage() {
  const { isManagerModeActive } = useManagerMode();
  const { boards, boardCards, isLoading, error } = useStatistics();
  const {
    absences,
    absentNameSet,
    isLoading: areAbsencesLoading,
    isSaving: isSavingAbsence,
    error: absencesError,
    setAssigneeAbsentState
  } = useAssigneeAbsences();
  const [selectedGroupName, setSelectedGroupName] = React.useState("all");
  const [selectedBoardId, setSelectedBoardId] = React.useState("all");
  const [assigneeFilter, setAssigneeFilter] = React.useState("");
  const [exportType, setExportType] = React.useState<"overdue" | "unassigned" | "stale" | "uc">(
    "overdue"
  );
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [forecast, setForecast] = React.useState<StatisticsForecastResponse | null>(null);
  const [isForecastLoading, setIsForecastLoading] = React.useState(false);
  const [forecastError, setForecastError] = React.useState<string | null>(null);

  const groups = React.useMemo(
    () =>
      Array.from(new Set(boards.map((board) => board.groupName))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [boards]
  );

  const boardsForSelectedGroup = React.useMemo(() => {
    if (selectedGroupName === "all") {
      return boards;
    }

    return boards.filter((board) => board.groupName === selectedGroupName);
  }, [boards, selectedGroupName]);

  React.useEffect(() => {
    if (
      selectedBoardId !== "all" &&
      !boardsForSelectedGroup.some((board) => board.id === selectedBoardId)
    ) {
      setSelectedBoardId("all");
    }
  }, [boardsForSelectedGroup, selectedBoardId]);

  const filteredStatisticsCards = React.useMemo(() => {
    const allCards = buildStatisticsCards(boardCards);

    const byGroup =
      selectedGroupName === "all"
        ? allCards
        : allCards.filter((card) => card.groupName === selectedGroupName);

    const byBoard =
      selectedBoardId === "all"
        ? byGroup
        : byGroup.filter((card) => card.boardId === selectedBoardId);

    return filterByAssignee(byBoard, assigneeFilter);
  }, [assigneeFilter, boardCards, selectedBoardId, selectedGroupName]);

  const activeCards = React.useMemo(
    () => filteredStatisticsCards.filter(isActiveOperationalCard),
    [filteredStatisticsCards]
  );
  const completedCards = React.useMemo(
    () =>
      filteredStatisticsCards
        .filter(isCompletedCard)
        .sort(
          (left, right) =>
            new Date(right.completedAt ?? 0).getTime() - new Date(left.completedAt ?? 0).getTime()
        ),
    [filteredStatisticsCards]
  );
  const currentWeekRange = React.useMemo(() => getCurrentWeekRange(), []);
  const completedThisWeekCards = React.useMemo(
    () =>
      completedCards.filter((card) =>
        card.completedAt
          ? isDateInRange(card.completedAt, currentWeekRange.monday, currentWeekRange.sunday)
          : false
      ),
    [completedCards, currentWeekRange.monday, currentWeekRange.sunday]
  );
  const completedTodayCards = React.useMemo(
    () => completedCards.filter((card) => (card.completedAt ? isToday(card.completedAt) : false)),
    [completedCards]
  );
  const latestCompletedCard = completedCards[0] ?? null;

  const activeDevicesPerAssignee = React.useMemo(() => {
    const counts = new Map<string, number>();

    for (const card of activeCards) {
      const key = card.responsibleName.trim() || "Nicht zugeordnet";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [activeCards]);

  const cardsPerColumn = React.useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();

    for (const card of activeCards) {
      const key = `${card.boardId}:${card.columnId}`;
      const label = `${card.boardTitle} / ${card.column.title}`;
      const current = counts.get(key);

      counts.set(key, {
        label,
        count: (current?.count ?? 0) + 1
      });
    }

    return Array.from(counts.values()).sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }, [activeCards]);

  const overdueCards = React.useMemo(
    () =>
      activeCards
        .filter((card) => isOverdue(card.dueDate))
        .sort(
          (left, right) =>
            new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
        ),
    [activeCards]
  );

  const statusAgingCards = React.useMemo(
    () =>
      [...activeCards].sort(
        (left, right) =>
          (getElapsedDays(right.statusChangedAt) ?? 0) -
          (getElapsedDays(left.statusChangedAt) ?? 0)
      ),
    [activeCards]
  );

  const staleCards = React.useMemo(
    () =>
      [...activeCards].sort(
        (left, right) =>
          (getElapsedDays(right.updatedAt) ?? 0) - (getElapsedDays(left.updatedAt) ?? 0)
      ),
    [activeCards]
  );

  const assigneeNames = React.useMemo(() => {
    const names = new Set<string>();

    for (const card of filteredStatisticsCards) {
      const normalizedName = card.responsibleName.trim();

      if (normalizedName) {
        names.add(normalizedName);
      }
    }

    for (const absence of absences) {
      names.add(absence.responsibleName.trim());
    }

    return Array.from(names).sort((left, right) => left.localeCompare(right));
  }, [absences, filteredStatisticsCards]);

  const absenceRiskCards = React.useMemo(
    () =>
      filteredStatisticsCards
        .filter((card) => isAbsenceRiskCard(card, absentNameSet))
        .sort((left, right) => left.responsibleName.localeCompare(right.responsibleName)),
    [absentNameSet, filteredStatisticsCards]
  );
  const forecastFridayCards = forecast?.cardsByOutcome.friday ?? [];
  const forecastSaturdayCards = forecast?.cardsByOutcome.saturday ?? [];
  const forecastBlockedCards = forecast?.cardsByOutcome.blockedOrUnlikely ?? [];
  const forecastRiskCards = React.useMemo(
    () =>
      [...forecastSaturdayCards, ...forecastBlockedCards].filter(
        (card) => card.riskFlags.length > 0 || Boolean(card.blockedReason)
      ),
    [forecastBlockedCards, forecastSaturdayCards]
  );

  const hasActiveFilters =
    normalizeText(assigneeFilter).length > 0 ||
    selectedGroupName !== "all" ||
    selectedBoardId !== "all";

  const statisticsFilterQuery = React.useMemo(() => {
    const params = new URLSearchParams();

    if (selectedGroupName !== "all") {
      params.set("groupName", selectedGroupName);
    }

    if (selectedBoardId !== "all") {
      params.set("boardId", selectedBoardId);
    }

    if (assigneeFilter.trim().length > 0) {
      params.set("assignee", assigneeFilter.trim());
    }

    return params.toString();
  }, [assigneeFilter, selectedBoardId, selectedGroupName]);

  React.useEffect(() => {
    if (!isManagerModeActive || isLoading || error) {
      return;
    }

    let isActive = true;

    async function loadForecast() {
      setIsForecastLoading(true);
      setForecastError(null);

      try {
        const path = statisticsFilterQuery
          ? `/statistics/forecast?${statisticsFilterQuery}`
          : "/statistics/forecast";
        const response = await apiFetch<StatisticsForecastResponse>(path);

        if (!isActive) {
          return;
        }

        setForecast(response);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setForecastError(
          loadError instanceof Error
            ? loadError.message
            : "Die Prognose konnte nicht geladen werden."
        );
      } finally {
        if (isActive) {
          setIsForecastLoading(false);
        }
      }
    }

    void loadForecast();

    return () => {
      isActive = false;
    };
  }, [error, isLoading, isManagerModeActive, statisticsFilterQuery]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const params = new URLSearchParams(statisticsFilterQuery);
      params.set("type", exportType);

      const response = await fetch(buildApiUrl(`/statistics/problem-export?${params.toString()}`), {
        credentials: "include"
      });

      if (!response.ok) {
        let message = "Der Export konnte nicht erstellt werden.";

        try {
          const payload = (await response.json()) as {
            error?: {
              message?: string;
            };
          };
          message = payload.error?.message ?? message;
        } catch {
          // Keep default message when the body is not JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/i);
      const filename = match?.[1] ?? `problemfaelle-${exportType}.csv`;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setExportError(
        downloadError instanceof Error
          ? downloadError.message
          : "Der Export konnte nicht erstellt werden."
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isManagerModeActive) {
    return (
      <section className="flex min-h-screen items-center px-10 py-10">
        <StatePanel
          message="Die Statistik ist nur im Verwaltermodus sichtbar."
          tone="neutral"
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex min-h-screen items-center px-10 py-10">
        <StatePanel message="Statistik wird geladen…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center px-10 py-10">
        <StatePanel message={error} tone="error" />
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col px-10 py-10">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700 dark:text-zinc-500">
          Verwaltermodus
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100">
          Statistik
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
          Sachliche Übersicht für die operative Steuerung. Die Ansicht zeigt nur Kennzahlen, die mit
          dem aktuellen Datenstand sauber ableitbar sind.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 xl:grid-cols-[220px_220px_minmax(0,1fr)_auto] xl:items-end">
          <FilterField label="Gruppe">
            <select
              value={selectedGroupName}
              onChange={(event) => setSelectedGroupName(event.target.value)}
              className={inputClassName}
            >
              <option value="all">Alle Gruppen</option>
              {groups.map((groupName) => (
                <option key={groupName} value={groupName}>
                  {groupName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Board">
            <select
              value={selectedBoardId}
              onChange={(event) => setSelectedBoardId(event.target.value)}
              className={inputClassName}
            >
              <option value="all">Alle Boards</option>
              {boardsForSelectedGroup.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Bearbeitername">
            <input
              type="text"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              placeholder="Nach Bearbeiter filtern"
              className={inputClassName}
            />
          </FilterField>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedGroupName("all");
                setSelectedBoardId("all");
                setAssigneeFilter("");
              }}
              disabled={!hasActiveFilters}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <KpiCard
          title="Aktiv offen"
          value={String(activeCards.length)}
          helper="Aktive Karten außerhalb von UC und Archiv"
        />
        <KpiCard
          title="Diese Woche fertig"
          value={String(completedThisWeekCards.length)}
          helper="Fertig abgeschlossen und bereits historisiert"
        />
        <KpiCard
          title="Heute fertig"
          value={String(completedTodayCards.length)}
          helper={
            latestCompletedCard?.completedAt
              ? `Letzter Abschluss: ${formatDateTime(latestCompletedCard.completedAt)}`
              : "Heute noch kein Abschluss"
          }
        />
        <KpiCard
          title="Bis Freitag"
          value={isForecastLoading ? "..." : String(forecastFridayCards.length)}
          helper="Regelbasiert als realistisch eingestuft"
        />
        <KpiCard
          title="Bis Samstag"
          value={isForecastLoading ? "..." : String(forecastFridayCards.length + forecastSaturdayCards.length)}
          helper="Freitag plus zusätzlich Samstag realistisch"
        />
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
              Problemfall Export
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
              CSV-Export für operative Problemfälle. Die aktuellen Filter für Gruppe, Board und
              Bearbeiter werden übernommen.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:w-[360px]">
            <FilterField label="Exporttyp">
              <select
                value={exportType}
                onChange={(event) =>
                  setExportType(
                    event.target.value as "overdue" | "unassigned" | "stale" | "uc"
                  )
                }
                className={inputClassName}
              >
                <option value="overdue">Überfällige Karten</option>
                <option value="unassigned">Karten ohne Bearbeiter</option>
                <option value="stale">Seit langer Zeit unverändert</option>
                <option value="uc">UC Karten</option>
              </select>
            </FilterField>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={isExporting}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                {isExporting ? "Wird exportiert…" : "CSV exportieren"}
              </button>
            </div>
          </div>
        </div>

        {exportError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {exportError}
          </div>
        ) : null}
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <StatisticsSection
          title="Prognose bis Freitag"
          description={
            forecast
              ? `Regelbasiert für ${formatDate(forecast.targets.friday)}.`
              : "Regelbasierte Einschätzung für diese Woche."
          }
          isEmpty={!isForecastLoading && !forecastError && (forecast?.cardsByOutcome.friday.length ?? 0) === 0}
          emptyMessage="Aktuell ist keine Karte für Freitag als realistisch eingestuft."
          contentClassName="max-h-[420px] overflow-y-auto pr-1"
        >
          {isForecastLoading ? (
            <LoadingBox message="Prognose wird geladen…" />
          ) : forecastError ? (
            <ErrorBox message={forecastError} />
          ) : (
            <ForecastCardList cards={forecast?.cardsByOutcome.friday ?? []} />
          )}
        </StatisticsSection>

        <StatisticsSection
          title="Prognose bis Samstag / gefährdet"
          description={
            forecast
              ? `Regelbasiert für ${formatDate(forecast.targets.saturday)}.`
              : "Karten, die Freitag voraussichtlich nicht schaffen, aber bis Samstag realistisch sind."
          }
          isEmpty={
            !isForecastLoading &&
            !forecastError &&
            (forecast?.cardsByOutcome.saturday.length ?? 0) === 0
          }
          emptyMessage="Aktuell ist keine weitere Karte nur für Samstag als realistisch eingestuft."
          contentClassName="max-h-[420px] overflow-y-auto pr-1"
        >
          {isForecastLoading ? (
            <LoadingBox message="Prognose wird geladen…" />
          ) : forecastError ? (
            <ErrorBox message={forecastError} />
          ) : (
            <ForecastCardList cards={forecast?.cardsByOutcome.saturday ?? []} />
          )}
        </StatisticsSection>

        <StatisticsSection
          title="Blockiert oder aktuell nicht realistisch"
          description="Karten mit UC, Warten, fehlender Regel oder zu langer Restzeit für diese Woche."
          isEmpty={
            !isForecastLoading &&
            !forecastError &&
            (forecast?.cardsByOutcome.blockedOrUnlikely.length ?? 0) === 0
          }
          emptyMessage="Aktuell gibt es keine blockierten oder für diese Woche nicht realistischen Karten."
          contentClassName="max-h-[420px] overflow-y-auto pr-1"
        >
          {isForecastLoading ? (
            <LoadingBox message="Prognose wird geladen…" />
          ) : forecastError ? (
            <ErrorBox message={forecastError} />
          ) : (
            <ForecastCardList cards={forecast?.cardsByOutcome.blockedOrUnlikely ?? []} />
          )}
        </StatisticsSection>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StatisticsSection
          title="Fertig abgeschlossen"
          description="Alle Karten, die fachlich als fertig abgeschlossen gelten, auch nach dem Archivieren."
          isEmpty={completedCards.length === 0}
          emptyMessage="Keine fertig abgeschlossenen Karten in der aktuellen Sicht."
          contentClassName="max-h-[420px] overflow-y-auto pr-1"
        >
          <CompletedCardList cards={completedCards} />
        </StatisticsSection>

        <StatisticsSection
          title="Abwesenheiten"
          description="Bearbeiter können hier manuell als abwesend oder wieder verfügbar markiert werden."
          isEmpty={false}
          emptyMessage=""
          contentClassName="max-h-[360px] overflow-y-auto pr-1"
        >
          {areAbsencesLoading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
              Abwesenheiten werden geladen…
            </div>
          ) : assigneeNames.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
              Für die aktuelle Filterkombination sind keine Bearbeiter vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {assigneeNames.map((name) => {
                const isAbsent = absentNameSet.has(name.trim().toLocaleLowerCase("de-DE"));

                return (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        {isAbsent ? "Aktuell als abwesend markiert" : "Aktuell verfügbar"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void setAssigneeAbsentState({
                          responsibleName: name,
                          isAbsent: !isAbsent
                        })
                      }
                      disabled={isSavingAbsence}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isAbsent
                          ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                          : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {isAbsent ? "Wieder verfügbar" : "Als abwesend markieren"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {absencesError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {absencesError}
            </div>
          ) : null}
        </StatisticsSection>

        <StatisticsSection
          title="Risiko / Übergabe"
          description="Offene Karten von abwesenden Bearbeitern und prognostisch problematische Fälle."
          isEmpty={absenceRiskCards.length === 0 && forecastRiskCards.length === 0}
          emptyMessage="Keine aktuellen Risiko- oder Übergabefälle in der aktuellen Sicht."
          contentClassName="max-h-[360px] overflow-y-auto pr-1"
        >
          <div className="space-y-5">
            {absenceRiskCards.length > 0 ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                  Abwesenheiten
                </p>
                <CardMetricList
                  cards={absenceRiskCards}
                  renderMeta={(card) =>
                    `${card.boardTitle} / ${card.column.title} | Bearbeiter abwesend`
                  }
                />
              </div>
            ) : null}

            {forecastRiskCards.length > 0 ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                  Prognoserisiken
                </p>
                <ForecastCardList cards={forecastRiskCards} />
              </div>
            ) : null}
          </div>
        </StatisticsSection>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <StatisticsSection
          title="Aktive Geräte pro Bearbeiter"
          description="Offene Karten außerhalb von UC und Archiv."
          isEmpty={activeDevicesPerAssignee.length === 0}
          emptyMessage="Für die aktuelle Filterkombination gibt es keine aktiven Karten."
          contentClassName="max-h-[360px] overflow-y-auto pr-1"
        >
          <SimpleCountList
            items={activeDevicesPerAssignee.map((entry) => ({
              label: entry.name,
              value: `${entry.count}`
            }))}
          />
        </StatisticsSection>

        <StatisticsSection
          title="Karten pro Spalte"
          description="Aktuelle Verteilung aktiver Karten auf die fachlichen Spalten."
          isEmpty={cardsPerColumn.length === 0}
          emptyMessage="Aktuell liegen keine aktiven Karten in Spalten."
          contentClassName="max-h-[360px] overflow-y-auto pr-1"
        >
          <SimpleCountList
            items={cardsPerColumn.map((entry) => ({
              label: entry.label,
              value: `${entry.count}`
            }))}
          />
        </StatisticsSection>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <StatisticsSection
          title="Überfällige Karten"
          description="Karten mit Eckende vor heute."
          isEmpty={overdueCards.length === 0}
          emptyMessage="Keine überfälligen Karten in der aktuellen Sicht."
          contentClassName="max-h-[440px] overflow-y-auto pr-1"
        >
          <CardMetricList
            cards={overdueCards}
            renderMeta={(card) => `Fällig seit ${formatDate(card.dueDate)}`}
          />
        </StatisticsSection>

        <StatisticsSection
          title="Im aktuellen Status"
          description="Zeit seit der letzten statusrelevanten Änderung der Karte."
          isEmpty={statusAgingCards.length === 0}
          emptyMessage="Keine aktiven Karten für diese Auswertung."
          contentClassName="max-h-[440px] overflow-y-auto pr-1"
        >
          <CardMetricList
            cards={statusAgingCards}
            renderMeta={(card) => {
              const days = getElapsedDays(card.statusChangedAt) ?? 0;
              return `${days} Tage seit Statuswechsel | ${formatDateTime(card.statusChangedAt)}`;
            }}
          />
        </StatisticsSection>

        <StatisticsSection
          title="Seit letzter Änderung unverändert"
          description="Zeit seit der letzten Kartenaktualisierung."
          isEmpty={staleCards.length === 0}
          emptyMessage="Keine aktiven Karten für diese Auswertung."
          contentClassName="max-h-[440px] overflow-y-auto pr-1"
        >
          <CardMetricList
            cards={staleCards}
            renderMeta={(card) => {
              const days = getElapsedDays(card.updatedAt) ?? 0;
              return `${days} Tage seit letzter Änderung | ${formatDateTime(card.updatedAt)}`;
            }}
          />
        </StatisticsSection>
      </div>
    </section>
  );
}

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

type StatisticsSectionProps = {
  title: string;
  description: string;
  isEmpty: boolean;
  emptyMessage: string;
  contentClassName?: string;
  children: React.ReactNode;
};

function StatisticsSection({
  title,
  description,
  isEmpty,
  emptyMessage,
  contentClassName,
  children
}: StatisticsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
      <div className={`mt-5 ${contentClassName ?? ""}`}>
        {!isEmpty ? (
          children
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}

type KpiCardProps = {
  title: string;
  value: string;
  helper: string;
};

function KpiCard({ title, value, helper }: KpiCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-500">{helper}</p>
    </section>
  );
}

type LoadingBoxProps = {
  message: string;
};

function LoadingBox({ message }: LoadingBoxProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
      {message}
    </div>
  );
}

type ErrorBoxProps = {
  message: string;
};

function ErrorBox({ message }: ErrorBoxProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
      {message}
    </div>
  );
}

type SimpleCountListProps = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

function SimpleCountList({ items }: SimpleCountListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.label}:${item.value}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]"
        >
          <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">
            {item.label}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white dark:bg-zinc-700 dark:text-zinc-100">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

type CardMetricListProps = {
  cards: StatisticsCard[];
  renderMeta: (card: StatisticsCard) => string;
};

function CardMetricList({ cards, renderMeta }: CardMetricListProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.deviceName}
            </p>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              {card.boardTitle} / {card.column.title}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
            Bearbeiter: {card.responsibleName}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
            {renderMeta(card)}
          </p>
        </article>
      ))}
    </div>
  );
}

type ForecastCardListProps = {
  cards: ForecastCardItem[];
};

function ForecastCardList({ cards }: ForecastCardListProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.partNumber} / {card.serialNumber}
            </p>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              {card.boardTitle} / {card.column.title}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
            Bearbeiter: {card.responsibleName || "Nicht zugeordnet"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
            {card.estimatedFinishAt
              ? `Prognose: ${formatDate(card.estimatedFinishAt)} | Restzeit ${card.adjustedRemainingDays ?? "?"} Tage`
              : "Derzeit keine belastbare Fertigprognose"}
          </p>

          {card.blockedReason ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              {card.blockedReason}
            </p>
          ) : null}

          {card.riskFlags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.riskFlags.map((flag) => (
                <span
                  key={`${card.id}:${flag}`}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {flag}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

type CompletedCardListProps = {
  cards: StatisticsCard[];
};

function CompletedCardList({ cards }: CompletedCardListProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.partNumber} / {card.serialNumber}
            </p>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              {card.boardTitle}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
            Bearbeiter: {card.responsibleName || "Nicht zugeordnet"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
            Abgeschlossen: {card.completedAt ? formatDateTime(card.completedAt) : "unbekannt"} | Aus{" "}
            {card.completedFromColumnTitle ?? "unbekannter Spalte"}
          </p>
        </article>
      ))}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]";
