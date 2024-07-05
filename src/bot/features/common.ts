import { Composer } from "grammy";
import { backToData } from "#root/bot/callback-data/index.js";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.callbackQuery(
  backToData.filter(),
  logHandle("keyboard-back-action"),
  async (ctx, next) => {
    return next();
  },
);

export { composer as commonFeature };
