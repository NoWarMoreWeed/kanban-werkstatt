import type { BoardListItem, CardItem } from "../../types/api";

export type StatisticsCard = CardItem & {
  boardTitle: string;
  groupName: string;
};

export type BoardCardsBundle = {
  board: BoardListItem;
  cards: CardItem[];
};

export function buildStatisticsCards(boardCards: BoardCardsBundle[]) {
  return boardCards.flatMap(({ board, cards }) =>
    cards.map((card) => ({
      ...card,
      boardTitle: board.title,
      groupName: board.groupName
    }))
  );
}

export function isActiveOperationalCard(card: CardItem) {
  return card.archiveStatus === "ACTIVE" && card.ucStatus === "NOT_IN_UC";
}

export function isCompletedCard(card: CardItem) {
  return Boolean(card.completedAt);
}

export function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("de-DE");
}

export function filterByAssignee(cards: StatisticsCard[], assigneeFilter: string) {
  const normalizedFilter = normalizeText(assigneeFilter);

  if (!normalizedFilter) {
    return cards;
  }

  return cards.filter((card) =>
    normalizeText(card.responsibleName).includes(normalizedFilter)
  );
}

export function isOverdue(dateValue: string, now = new Date()) {
  const dueDate = new Date(dateValue);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate.getTime() < now.getTime();
}

export function getElapsedDays(from: string, to = new Date()) {
  const fromDate = new Date(from);

  if (Number.isNaN(fromDate.getTime())) {
    return null;
  }

  const differenceInMilliseconds = to.getTime() - fromDate.getTime();

  return Math.max(0, Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24)));
}

export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium"
  }).format(date);
}

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function isToday(value: string, now = new Date()) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getCurrentWeekRange(now = new Date()) {
  const monday = new Date(now);
  const day = monday.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

export function isDateInRange(value: string, start: Date, end: Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export function isAbsenceRiskCard(card: CardItem, absentNameSet: Set<string>) {
  if (!isActiveOperationalCard(card)) {
    return false;
  }

  return absentNameSet.has(card.responsibleName.trim().toLocaleLowerCase("de-DE"));
}
