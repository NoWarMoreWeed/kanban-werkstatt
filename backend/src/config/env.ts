import "dotenv/config";

const parsePort = (value: string | undefined) => {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 4000;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "development-session-secret",
  managerModePassword: process.env.MANAGER_MODE_PASSWORD ?? "",
  managerModeIdleMinutes: Number(process.env.MANAGER_MODE_IDLE_MINUTES ?? "0")
};
