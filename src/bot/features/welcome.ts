import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { chatAction } from "@grammyjs/auto-chat-action";
import { updateFirstName, updateLastName } from "../callback-data/index.js";
import {
  UPDATE_FIRST_NAME_CONVERSATION,
  UPDATE_LAST_NAME_CONVERSATION,
} from "../conversations/index.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command(
  "start",
  logHandle("command-start"),
  chatAction("typing"),
  async (ctx) => {
    await ctx.reply(`update name`, {
      reply_markup: new InlineKeyboard()
        .text(
          `current first name:${ctx.session.firstName}`,
          updateFirstName.pack({}),
        )
        .text(
          `current last name:${ctx.session.lastName}`,
          updateLastName.pack({}),
        ),
    });
  },
);

feature.callbackQuery(updateFirstName.filter(), async (ctx) => {
  await ctx.conversation.enter(UPDATE_FIRST_NAME_CONVERSATION);
  return ctx.answerCallbackQuery();
});

feature.callbackQuery(updateLastName.filter(), async (ctx) => {
  await ctx.conversation.enter(UPDATE_LAST_NAME_CONVERSATION);
  return ctx.answerCallbackQuery();
});

export { composer as welcomeFeature };
