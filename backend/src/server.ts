import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();
const server = app.listen(env.port, env.host, () => {
  console.log(`Backend gestartet auf ${env.host}:${env.port}`);
});

const shutdown = async (signal: NodeJS.Signals) => {
  console.log(`Signal empfangen: ${signal}. Server wird beendet.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
