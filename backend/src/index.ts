import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";
import { prisma } from "./db/client";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Wellspring API server started");
});

async function shutdown() {
  logger.info("Shutting down...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export { app };
