import "express-session";

declare module "express-session" {
  interface SessionData {
    isManagerModeActive?: boolean;
    managerModeActivatedAt?: number;
    managerModeLastActivityAt?: number;
  }
}
