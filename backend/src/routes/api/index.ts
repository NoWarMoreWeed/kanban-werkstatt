import { Router } from "express";
import { assigneeAbsencesRouter } from "./assignee-absences.js";
import { boardsRouter } from "./boards.js";
import { cardsRouter } from "./cards.js";
import { columnsRouter } from "./columns.js";
import { managerModeRouter } from "./manager-mode.js";
import { partNumberSuggestionsRouter } from "./part-number-suggestions.js";
import { statisticsRouter } from "./statistics.js";

export const apiRouter = Router();

apiRouter.use("/assignee-absences", assigneeAbsencesRouter);
apiRouter.use("/boards", boardsRouter);
apiRouter.use("/columns", columnsRouter);
apiRouter.use("/cards", cardsRouter);
apiRouter.use("/manager-mode", managerModeRouter);
apiRouter.use("/part-number-suggestions", partNumberSuggestionsRouter);
apiRouter.use("/statistics", statisticsRouter);
