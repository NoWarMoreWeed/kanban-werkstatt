import type { RequestHandler } from "express";

/**
 * Version 1 has no login or role system.
 * This middleware intentionally does not enforce access control yet.
 *
 * Its purpose is to make the business rule explicit in the create-board path:
 * boards are organizationally intended to be created only by admins.
 *
 * A future implementation can replace this placeholder with a real
 * authentication and authorization check without changing the route shape.
 */
export const requireBoardAdminRule: RequestHandler = (_request, _response, next) => {
  next();
};
