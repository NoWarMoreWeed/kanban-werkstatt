import { Router } from "express";
import { API_PREFIX } from "../config/constants.js";
import { apiRouter } from "./api/index.js";
import { healthRouter } from "./health.js";

export const rootRouter = Router();

rootRouter.get("/", (_request, response) => {
  response.json({
    name: "werkstatt-kanban-api",
    status: "ready"
  });
});

rootRouter.use("/health", healthRouter);
rootRouter.use(API_PREFIX, apiRouter);

