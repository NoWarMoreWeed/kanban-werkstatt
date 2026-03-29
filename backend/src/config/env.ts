import "dotenv/config";

const parsePort = (value: string | undefined) => {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 4000;
};

const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "development-session-secret",
  managerModePassword: process.env.MANAGER_MODE_PASSWORD ?? "",
  managerModeIdleMinutes: Number(process.env.MANAGER_MODE_IDLE_MINUTES ?? "0"),
  trustProxy: parseBoolean(process.env.TRUST_PROXY, false)
};
