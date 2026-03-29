import cors from "cors";
import express from "express";
import session from "express-session";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rootRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(
    session({
      name: "werkstatt_kanban_session",
      secret: env.sessionSecret,
      proxy: env.trustProxy,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: env.nodeEnv === "production",
        maxAge:
          env.managerModeIdleMinutes > 0 ? env.managerModeIdleMinutes * 60 * 1000 : undefined
      }
    })
  );
  app.use(rootRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
