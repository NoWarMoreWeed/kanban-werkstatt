import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type {
  StatisticsForecastQuery,
  StatisticsProblemExportQuery
} from "./statistics.schemas.js";

const CARD_ARCHIVE_STATUS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED"
} as const;

const CARD_UC_STATUS = {
  NOT_IN_UC: "NOT_IN_UC",
  IN_UC: "IN_UC"
} as const;

const baseCardSelect = {
  id: true,
  responsibleName: true,
  deviceName: true,
  priority: true,
  dueDate: true,
  statusChangedAt: true,
  partNumber: true,
  serialNumber: true,
  sapNumber: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
  archiveStatus: true,
  ucStatus: true,
  board: {
    select: {
      id: true,
      title: true,
      groupName: true
    }
  },
  column: {
    select: {
      id: true,
      key: true,
      title: true
    }
  },
  previousColumn: {
    select: {
      title: true
    }
  }
} satisfies Prisma.CardSelect;

const forecastRuleSelect = {
  id: true,
  boardGroupName: true,
  partNumber: true,
  columnKey: true,
  estimatedRemainingDays: true,
  blocksCompletion: true
} as const;

type ExportCard = Prisma.CardGetPayload<{
  select: typeof baseCardSelect;
}>;

type ForecastCard = Prisma.CardGetPayload<{
  select: typeof baseCardSelect;
}>;

type ForecastRule = {
  id: string;
  boardGroupName: string | null;
  partNumber: string | null;
  columnKey: string;
  estimatedRemainingDays: number;
  blocksCompletion: boolean;
};

const normalizeOptionalFilter = (value?: string) => {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
};

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").trim().toLocaleLowerCase("de-DE");

const getElapsedDays = (value: Date) => {
  const diffMs = Date.now() - value.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const escapeCsvCell = (value: string | number) => {
  const normalized = String(value ?? "");
  const escaped = normalized.replace(/"/g, "\"\"");
  return `"${escaped}"`;
};

const formatDate = (value: Date | null) => {
  if (!value) {
    return "";
  }

  return value.toISOString();
};

const toCsv = (rows: Array<Record<string, string | number>>) => {
  if (rows.length === 0) {
    return [
      [
        "Problem",
        "Board",
        "Gruppe",
        "Spalte",
        "Vorherige Spalte",
        "Bearbeiter",
        "Geraet",
        "P/N",
        "S/N",
        "Auftragsnummer",
        "Meldungsnummer",
        "Prioritaet",
        "Eckende",
        "Status seit",
        "Zuletzt geaendert"
      ].join(",")
    ].join("\n");
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map((header) => escapeCsvCell(header)).join(",");
  const bodyLines = rows.map((row) =>
    headers.map((header) => escapeCsvCell(row[header] ?? "")).join(",")
  );

  return [headerLine, ...bodyLines].join("\n");
};

const buildFilename = (type: StatisticsProblemExportQuery["type"]) => {
  const datePart = new Date().toISOString().slice(0, 10);
  return `problemfaelle-${type}-${datePart}.csv`;
};

const getBaseWhere = (
  input: Pick<StatisticsProblemExportQuery, "groupName" | "boardId" | "assignee">
): Prisma.CardWhereInput => {
  const groupName = normalizeOptionalFilter(input.groupName);
  const boardId = normalizeOptionalFilter(input.boardId);
  const assignee = normalizeOptionalFilter(input.assignee);

  return {
    ...(boardId ? { boardId } : {}),
    ...(groupName || assignee
      ? {
          board: {
            ...(groupName ? { groupName } : {})
          },
          ...(assignee
            ? {
                responsibleName: {
                  contains: assignee,
                  mode: "insensitive"
                }
              }
            : {})
        }
      : assignee
        ? {
            responsibleName: {
              contains: assignee,
              mode: "insensitive"
            }
          }
        : {})
  };
};

const buildRows = (
  type: StatisticsProblemExportQuery["type"],
  cards: ExportCard[],
  staleDays: number
) =>
  cards.map((card) => ({
    Problem:
      type === "overdue"
        ? `Ueberfaellig seit ${getElapsedDays(card.dueDate)} Tagen`
        : type === "unassigned"
          ? "Kein Bearbeiter hinterlegt"
          : type === "stale"
            ? `Seit mindestens ${staleDays} Tagen unveraendert`
            : "Karte liegt in UC",
    Board: card.board.title,
    Gruppe: card.board.groupName,
    Spalte: card.column.title,
    "Vorherige Spalte": card.previousColumn?.title ?? "",
    Bearbeiter: card.responsibleName,
    Geraet: card.deviceName,
    "P/N": card.partNumber,
    "S/N": card.serialNumber,
    Auftragsnummer: card.sapNumber,
    Meldungsnummer: card.orderNumber,
    Prioritaet: card.priority,
    Eckende: formatDate(card.dueDate),
    "Status seit": formatDate(card.statusChangedAt),
    "Zuletzt geaendert": formatDate(card.updatedAt)
  }));

const getCurrentWeekTargets = (now = new Date()) => {
  const monday = new Date(now);
  const day = monday.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  saturday.setHours(23, 59, 59, 999);

  return { friday, saturday };
};

const addCalendarDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const isOverdue = (dueDate: Date, now: Date) => dueDate.getTime() < now.getTime();

const getRuleScope = (rule: ForecastRule) => {
  if (rule.boardGroupName && rule.partNumber) {
    return "boardAndPartNumber";
  }

  if (rule.partNumber) {
    return "partNumber";
  }

  if (rule.boardGroupName) {
    return "board";
  }

  return "generic";
};

const getRuleWeight = (rule: ForecastRule) =>
  (rule.boardGroupName ? 2 : 0) + (rule.partNumber ? 1 : 0);

const getBestForecastRule = (rules: ForecastRule[], card: ForecastCard) => {
  const matchingRules = rules.filter((rule) => {
    if (rule.columnKey !== card.column.key) {
      return false;
    }

    if (
      rule.boardGroupName &&
      normalizeText(rule.boardGroupName) !== normalizeText(card.board.groupName)
    ) {
      return false;
    }

    if (rule.partNumber && normalizeText(rule.partNumber) !== normalizeText(card.partNumber)) {
      return false;
    }

    return true;
  });

  if (matchingRules.length === 0) {
    return null;
  }

  return matchingRules.sort((left, right) => getRuleWeight(right) - getRuleWeight(left))[0];
};

const buildForecastItem = (
  card: ForecastCard,
  rule: ForecastRule | null,
  absentNameSet: Set<string>,
  now: Date,
  targets: { friday: Date; saturday: Date }
) => {
  const riskFlags: string[] = [];
  let blockedReason: string | null = null;

  if (!rule) {
    blockedReason = "Keine Prognoseregel fuer diese Spalte vorhanden.";
  } else if (rule.blocksCompletion) {
    blockedReason = "Aktueller Status ist fuer die Prognose als nicht fertigstellbar markiert.";
  }

  if (card.ucStatus === CARD_UC_STATUS.IN_UC) {
    blockedReason = blockedReason ?? "Karte liegt aktuell in UC.";
  }

  const normalizedResponsibleName = normalizeText(card.responsibleName);

  if (!normalizedResponsibleName) {
    riskFlags.push("Kein Bearbeiter hinterlegt");
  }

  if (absentNameSet.has(normalizedResponsibleName)) {
    riskFlags.push("Bearbeiter aktuell abwesend");
  }

  if (isOverdue(card.dueDate, now)) {
    riskFlags.push("Eckende bereits ueberschritten");
  }

  const baseRemainingDays = rule?.estimatedRemainingDays ?? null;
  let adjustedRemainingDays = baseRemainingDays;

  if (adjustedRemainingDays !== null && !blockedReason) {
    if (!normalizedResponsibleName && adjustedRemainingDays > 0) {
      adjustedRemainingDays += 1;
    }

    if (absentNameSet.has(normalizedResponsibleName) && adjustedRemainingDays > 0) {
      adjustedRemainingDays += 1;
    }

    if (isOverdue(card.dueDate, now) && adjustedRemainingDays > 0) {
      adjustedRemainingDays += 1;
    }
  }

  const estimatedFinishAt =
    adjustedRemainingDays !== null && !blockedReason ? addCalendarDays(now, adjustedRemainingDays) : null;

  const canFinishByFriday =
    estimatedFinishAt !== null && estimatedFinishAt.getTime() <= targets.friday.getTime();
  const canFinishBySaturday =
    estimatedFinishAt !== null && estimatedFinishAt.getTime() <= targets.saturday.getTime();

  return {
    id: card.id,
    boardId: card.board.id,
    boardTitle: card.board.title,
    groupName: card.board.groupName,
    column: card.column,
    responsibleName: card.responsibleName,
    deviceName: card.deviceName,
    priority: card.priority,
    dueDate: card.dueDate.toISOString(),
    statusChangedAt: card.statusChangedAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    partNumber: card.partNumber,
    serialNumber: card.serialNumber,
    sapNumber: card.sapNumber,
    orderNumber: card.orderNumber,
    archiveStatus: card.archiveStatus,
    ucStatus: card.ucStatus,
    baseRemainingDays,
    adjustedRemainingDays,
    estimatedFinishAt: estimatedFinishAt?.toISOString() ?? null,
    canFinishByFriday,
    canFinishBySaturday,
    blockedReason,
    riskFlags,
    rule: rule
      ? {
          id: rule.id,
          scope: getRuleScope(rule),
          columnKey: rule.columnKey,
          estimatedRemainingDays: rule.estimatedRemainingDays,
          blocksCompletion: rule.blocksCompletion
        }
      : null
  };
};

const compareForecastItems = <
  T extends {
    estimatedFinishAt: string | null;
    groupName: string;
    boardTitle: string;
    partNumber: string;
    serialNumber: string;
  }
>(
  left: T,
  right: T
) => {
  if (left.estimatedFinishAt && right.estimatedFinishAt) {
    const difference =
      new Date(left.estimatedFinishAt).getTime() - new Date(right.estimatedFinishAt).getTime();

    if (difference !== 0) {
      return difference;
    }
  }

  return (
    left.groupName.localeCompare(right.groupName) ||
    left.boardTitle.localeCompare(right.boardTitle) ||
    left.partNumber.localeCompare(right.partNumber) ||
    left.serialNumber.localeCompare(right.serialNumber)
  );
};

export const statisticsService = {
  async exportProblemCards(input: StatisticsProblemExportQuery) {
    const baseWhere = getBaseWhere(input);
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - input.staleDays);
    staleThreshold.setHours(23, 59, 59, 999);

    const where: Prisma.CardWhereInput =
      input.type === "overdue"
        ? {
            ...baseWhere,
            archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
            ucStatus: CARD_UC_STATUS.NOT_IN_UC,
            dueDate: {
              lt: new Date()
            }
          }
        : input.type === "unassigned"
          ? {
              ...baseWhere,
              archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
              ucStatus: CARD_UC_STATUS.NOT_IN_UC,
              OR: [
                {
                  responsibleName: ""
                },
                {
                  responsibleName: {
                    equals: ""
                  }
                }
              ]
            }
          : input.type === "stale"
            ? {
                ...baseWhere,
                archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
                ucStatus: CARD_UC_STATUS.NOT_IN_UC,
                updatedAt: {
                  lte: staleThreshold
                }
              }
            : {
                ...baseWhere,
                archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
                ucStatus: CARD_UC_STATUS.IN_UC
              };

    const cards = await prisma.card.findMany({
      where,
      orderBy: [{ board: { title: "asc" } }, { column: { title: "asc" } }, { position: "asc" }],
      select: baseCardSelect
    });

    const csv = toCsv(buildRows(input.type, cards, input.staleDays));

    return {
      csv,
      filename: buildFilename(input.type)
    };
  },

  async getCompletionForecast(input: StatisticsForecastQuery) {
    const groupName = normalizeOptionalFilter(input.groupName);
    const boardId = normalizeOptionalFilter(input.boardId);
    const assignee = normalizeOptionalFilter(input.assignee);
    const workshop = await prisma.workshop.findFirst({
      select: {
        id: true
      }
    });

    if (!workshop) {
      const targets = getCurrentWeekTargets();

      return {
        generatedAt: new Date().toISOString(),
        targets: {
          friday: targets.friday.toISOString(),
          saturday: targets.saturday.toISOString()
        },
        cardsByOutcome: {
          friday: [],
          saturday: [],
          blockedOrUnlikely: []
        }
      };
    }

    const now = new Date();
    const targets = getCurrentWeekTargets(now);
    const [forecastRules, absences] = await Promise.all([
      prisma.completionForecastRule.findMany({
        where: {
          workshopId: workshop.id
        },
        select: forecastRuleSelect,
        orderBy: [{ boardGroupName: "asc" }, { partNumber: "asc" }, { columnKey: "asc" }]
      }),
      prisma.assigneeAbsence.findMany({
        where: {
          workshopId: workshop.id
        },
        select: {
          responsibleName: true
        }
      })
    ]);
    const absentNameSet = new Set(absences.map((absence) => normalizeText(absence.responsibleName)));

    const cards = await prisma.card.findMany({
      where: {
        archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
        ...(boardId ? { boardId } : {}),
        ...(assignee
          ? {
              responsibleName: {
                contains: assignee,
                mode: "insensitive"
              }
            }
          : {}),
        board: {
          workshopId: workshop.id,
          ...(groupName ? { groupName } : {})
        }
      },
      orderBy: [{ board: { title: "asc" } }, { column: { position: "asc" } }, { position: "asc" }],
      select: baseCardSelect
    });

    const items = cards.map((card) =>
      buildForecastItem(
        card,
        getBestForecastRule(forecastRules, card),
        absentNameSet,
        now,
        targets
      )
    );

    const friday = items
      .filter((item) => item.canFinishByFriday)
      .sort(compareForecastItems);
    const saturday = items
      .filter((item) => !item.canFinishByFriday && item.canFinishBySaturday)
      .sort(compareForecastItems);
    const blockedOrUnlikely = items
      .filter((item) => !item.canFinishBySaturday)
      .sort(compareForecastItems);

    return {
      generatedAt: now.toISOString(),
      targets: {
        friday: targets.friday.toISOString(),
        saturday: targets.saturday.toISOString()
      },
      cardsByOutcome: {
        friday,
        saturday,
        blockedOrUnlikely
      }
    };
  }
};
