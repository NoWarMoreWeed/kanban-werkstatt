export type BoardListItem = {
  id: string;
  workshopId: string;
  groupName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  key: string;
  title: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BoardDetail = {
  id: string;
  workshopId: string;
  groupName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  columns: BoardColumn[];
};

export type CardColumnInfo = {
  id: string;
  key: string;
  title: string;
  position: number;
};

export type CardItem = {
  id: string;
  boardId: string;
  columnId: string;
  archiveStatus: "ACTIVE" | "ARCHIVED";
  ucStatus: "NOT_IN_UC" | "IN_UC";
  previousColumnId: string | null;
  position: number;
  creatorName: string;
  responsibleName: string;
  deviceName: string;
  priority: string;
  dueDate: string;
  statusChangedAt: string;
  completedAt: string | null;
  completedYear: number | null;
  completedWeek: number | null;
  completedFromColumnKey: string | null;
  completedFromColumnTitle: string | null;
  partNumber: string;
  serialNumber: string;
  sapNumber: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  column: CardColumnInfo;
};

export type AssigneeAbsenceItem = {
  id: string;
  workshopId: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentItem = {
  id: string;
  cardId: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export type BoardListResponse = {
  workshop: {
    id: string;
    name: string;
  };
  boards: BoardListItem[];
};

export type AssigneeAbsenceListResponse = {
  workshop: {
    id: string;
    name: string;
  };
  absences: AssigneeAbsenceItem[];
};

export type SetAssigneeAbsencePayload = {
  responsibleName: string;
  isAbsent: boolean;
};

export type BoardCardsResponse = {
  boardId: string;
  cards: CardItem[];
};

export type CreateCardPayload = {
  boardId: string;
  columnId: string;
  responsibleName: string;
  deviceName: string;
  priority: string;
  dueDate: string;
  partNumber: string;
  serialNumber: string;
  sapNumber: string;
  orderNumber: string;
};

export type CardCommentsResponse = {
  cardId: string;
  comments: CommentItem[];
};

export type CreateCommentPayload = {
  authorName: string;
  message: string;
};

export type PartNumberSuggestionItem = {
  id: string;
  partNumber: string;
  deviceName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PartNumberSuggestionListResponse = {
  query: string;
  suggestions: PartNumberSuggestionItem[];
};

export type ManagerColumnItem = {
  id: string;
  boardId: string;
  key: string;
  title: string;
  position: number;
  isActive: boolean;
  cardCount: number;
  previousCardCount: number;
  canDeactivate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumnsManagerResponse = {
  board: {
    id: string;
    title: string;
    groupName: string;
  };
  columns: ManagerColumnItem[];
};

export type CreateColumnPayload = {
  title: string;
};

export type UpdateColumnPayload = {
  title: string;
};

export type ReorderColumnPayload = {
  direction: "up" | "down";
};

export type UpdateColumnActivePayload = {
  isActive: boolean;
};

export type CreatePartNumberSuggestionPayload = {
  partNumber: string;
  deviceName?: string;
};

export type CardSearchResponse = {
  boardId: string;
  query: string;
  state: "active" | "archived" | "uc" | "all";
  cards: CardItem[];
};

export type BulkCardActionPayload =
  | {
      action: "archive";
      boardId: string;
      cardIds: string[];
    }
  | {
      action: "assign";
      boardId: string;
      cardIds: string[];
      responsibleName: string;
    }
  | {
      action: "move";
      boardId: string;
      cardIds: string[];
      targetColumnId: string;
    }
  | {
      action: "moveToUc";
      boardId: string;
      cardIds: string[];
    };

export type BulkCardActionResponse = {
  action: BulkCardActionPayload["action"];
  count: number;
  cards: CardItem[];
};

export type ForecastRuleScope =
  | "generic"
  | "board"
  | "partNumber"
  | "boardAndPartNumber";

export type ForecastCardItem = {
  id: string;
  boardId: string;
  boardTitle: string;
  groupName: string;
  column: CardColumnInfo;
  responsibleName: string;
  deviceName: string;
  priority: string;
  dueDate: string;
  statusChangedAt: string;
  updatedAt: string;
  partNumber: string;
  serialNumber: string;
  sapNumber: string;
  orderNumber: string;
  archiveStatus: "ACTIVE" | "ARCHIVED";
  ucStatus: "NOT_IN_UC" | "IN_UC";
  baseRemainingDays: number | null;
  adjustedRemainingDays: number | null;
  estimatedFinishAt: string | null;
  canFinishByFriday: boolean;
  canFinishBySaturday: boolean;
  blockedReason: string | null;
  riskFlags: string[];
  rule: {
    id: string;
    scope: ForecastRuleScope;
    columnKey: string;
    estimatedRemainingDays: number;
    blocksCompletion: boolean;
  } | null;
};

export type StatisticsForecastResponse = {
  generatedAt: string;
  targets: {
    friday: string;
    saturday: string;
  };
  cardsByOutcome: {
    friday: ForecastCardItem[];
    saturday: ForecastCardItem[];
    blockedOrUnlikely: ForecastCardItem[];
  };
};
