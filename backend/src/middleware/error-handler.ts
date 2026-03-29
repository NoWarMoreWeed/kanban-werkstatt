import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler = (request: Request, _response: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404, "NOT_FOUND"));
};

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null
      }
    });

    return;
  }

  console.error(error);

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    }
  });
};
