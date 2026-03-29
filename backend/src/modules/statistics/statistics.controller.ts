import type { Request, Response } from "express";
import type { StatisticsForecastQuery, StatisticsProblemExportQuery } from "./statistics.schemas.js";
import { statisticsService } from "./statistics.service.js";

export const statisticsController = {
  async getCompletionForecast(request: Request, response: Response) {
    const result = await statisticsService.getCompletionForecast(
      request.query as unknown as StatisticsForecastQuery
    );

    response.json(result);
  },

  async exportProblemCards(request: Request, response: Response) {
    const result = await statisticsService.exportProblemCards(
      request.query as unknown as StatisticsProblemExportQuery
    );

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    response.send(`\uFEFF${result.csv}`);
  }
};
