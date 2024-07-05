import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { sequentialize } from "@grammyjs/runner";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { conversations } from "@grammyjs/conversations";
import { autoRetry } from "@grammyjs/auto-retry";
import { BotConfig, StorageAdapter, Bot as TelegramBot, session } from "grammy";
import {
  Context,
  SessionData,
  createContextConstructor,
} from "#root/bot/context.js";
import { welcomeFeature, commonFeature } from "#root/bot/features/index.js";
import { errorHandler } from "#root/bot/handlers/index.js";
import { i18n } from "#root/bot/i18n.js";
import { updateLogger } from "#root/bot/middlewares/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { freeStorage } from "@grammyjs/storage-free";
import {
  updateFirstNameConversation,
  updateLastNameConversation,
} from "./conversations/index.js";

type Options = {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<Context>, "ContextConstructor">;
};

function getSessionKey(ctx: Omit<Context, "session">) {
  return ctx.chat?.id.toString();
}

export function createBot(token: string, options: Options = {}) {
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  // Middlewares
  bot.api.config.use(parseMode("HTML"));
  bot.api.config.use(
    autoRetry({
      rethrowInternalServerErrors: true,
      rethrowHttpErrors: true,
    }),
  );

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(sequentialize(getSessionKey));
  protectedBot.use(
    session({
      initial: () => ({
        locale: "en",
        firstName: "unknown",
        lastName: "unknown",
      }),
      storage: freeStorage<SessionData>(bot.token),
    }),
  );
  protectedBot.use(i18n);
  protectedBot.use(conversations());

  // conversation
  protectedBot.use(updateFirstNameConversation());
  protectedBot.use(updateLastNameConversation());

  protectedBot.use(commonFeature);
  protectedBot.use(welcomeFeature);

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
