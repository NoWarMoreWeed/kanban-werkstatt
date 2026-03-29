import type { Session, SessionData } from "express-session";
import { AppError } from "../../errors/app-error.js";
import { env } from "../../config/env.js";

type ManagerModeSession = Session & Partial<SessionData>;

const getIdleTimeoutMs = () =>
  env.managerModeIdleMinutes > 0 ? env.managerModeIdleMinutes * 60 * 1000 : 0;

const touchManagerSession = (session: ManagerModeSession) => {
  const now = Date.now();
  session.isManagerModeActive = true;
  session.managerModeActivatedAt ??= now;
  session.managerModeLastActivityAt = now;
};

const clearManagerSession = (session: ManagerModeSession) => {
  delete session.isManagerModeActive;
  delete session.managerModeActivatedAt;
  delete session.managerModeLastActivityAt;
};

const resolveStatus = (session: ManagerModeSession) => {
  if (!session.isManagerModeActive) {
    return {
      isManagerModeActive: false as const,
      activatedAt: null,
      idleTimeoutMinutes: env.managerModeIdleMinutes > 0 ? env.managerModeIdleMinutes : null
    };
  }

  const idleTimeoutMs = getIdleTimeoutMs();
  const lastActivityAt = session.managerModeLastActivityAt ?? session.managerModeActivatedAt ?? 0;

  if (idleTimeoutMs > 0 && lastActivityAt > 0 && Date.now() - lastActivityAt > idleTimeoutMs) {
    clearManagerSession(session);

    return {
      isManagerModeActive: false as const,
      activatedAt: null,
      idleTimeoutMinutes: env.managerModeIdleMinutes
    };
  }

  touchManagerSession(session);

  return {
    isManagerModeActive: true as const,
    activatedAt: session.managerModeActivatedAt ?? null,
    idleTimeoutMinutes: env.managerModeIdleMinutes > 0 ? env.managerModeIdleMinutes : null
  };
};

export const managerModeService = {
  getStatus(session: ManagerModeSession) {
    return resolveStatus(session);
  },

  activate(password: string, session: ManagerModeSession) {
    if (!env.managerModePassword) {
      throw new AppError(
        "Verwalter Modus ist serverseitig noch nicht konfiguriert.",
        503,
        "MANAGER_MODE_NOT_CONFIGURED"
      );
    }

    if (password !== env.managerModePassword) {
      throw new AppError(
        "Das Passwort fuer den Verwalter Modus ist ungueltig.",
        401,
        "MANAGER_MODE_INVALID_PASSWORD"
      );
    }

    touchManagerSession(session);

    return resolveStatus(session);
  },

  deactivate(session: ManagerModeSession) {
    clearManagerSession(session);

    return {
      isManagerModeActive: false as const,
      activatedAt: null,
      idleTimeoutMinutes: env.managerModeIdleMinutes > 0 ? env.managerModeIdleMinutes : null
    };
  },

  assertActive(session: ManagerModeSession) {
    const status = resolveStatus(session);

    if (!status.isManagerModeActive) {
      throw new AppError(
        "Diese Aktion ist nur im Verwalter Modus erlaubt.",
        403,
        "MANAGER_MODE_REQUIRED"
      );
    }
  }
};
