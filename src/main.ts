#!/usr/bin/env tsx
import { run, RunnerHandle } from "@grammyjs/runner";
import { onShutdown } from "node-graceful-shutdown";
import { createBot } from "#root/bot/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { createPoolingServer } from "#root/server/index.js";

try {
  const bot = createBot(config.BOT_TOKEN);
  const server = await createPoolingServer();
  let runner: undefined | RunnerHandle;
  // Graceful shutdown
  onShutdown(async () => {
    logger.info("shutdown");

    await server.close();
    await runner?.stop();
    await bot.stop();
  });
  switch (config.BOT_MODE) {
    case "runner": {
      await bot.init();

      await server.listen({
        host: config.BOT_SERVER_HOST,
        port: config.BOT_SERVER_PORT,
      });

      logger.info({
        msg: "bot runner running...",
        username: bot.botInfo.username,
      });
      runner = run(bot, {
        runner: {
          fetch: {
            allowed_updates: config.BOT_ALLOWED_UPDATES,
          },
        },
      });
      break;
    }
    case "polling": {
      await server.listen({
        host: config.BOT_SERVER_HOST,
        port: config.BOT_SERVER_PORT,
      });
      await bot.start({
        allowed_updates: config.BOT_ALLOWED_UPDATES,
        onStart: ({ username }) =>
          logger.info({
            msg: "bot running...",
            username,
          }),
      });

      break;
    }
    default: {
      break;
    }
  }
} catch (error) {
  logger.error(error);
  process.exit(1);
}
