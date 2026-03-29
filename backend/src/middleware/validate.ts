import type { RequestHandler } from "express";
import { ZodError, z, type ZodType } from "zod";
import { AppError } from "../errors/app-error.js";

const formatIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

export const validateBody = <T extends ZodType>(schema: T): RequestHandler => {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return next(
        new AppError("Request body validation failed.", 400, "VALIDATION_ERROR", {
          issues: formatIssues(result.error)
        })
      );
    }

    request.body = result.data;
    next();
  };
};

export const validateParams = <T extends z.AnyZodObject>(schema: T): RequestHandler => {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      return next(
        new AppError("Route parameter validation failed.", 400, "VALIDATION_ERROR", {
          issues: formatIssues(result.error)
        })
      );
    }

    request.params = result.data;
    next();
  };
};

export const validateQuery = <T extends z.AnyZodObject>(schema: T): RequestHandler => {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      return next(
        new AppError("Query validation failed.", 400, "VALIDATION_ERROR", {
          issues: formatIssues(result.error)
        })
      );
    }

    request.query = result.data;
    next();
  };
};
