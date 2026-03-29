import type { RequestHandler } from "express";

export const asyncHandler = <T extends RequestHandler>(handler: T): RequestHandler => {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
};
