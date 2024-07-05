import { Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Context } from "../context.js";
import {
  cancel,
  retry,
  updateFirstName,
  updateLastName,
} from "../callback-data/updatename.callback.js";
import { isNormalName } from "../helpers/checker.js";

function leaveConversation(ctx: Context, messageId: number) {
  if (ctx.hasCallbackQuery("cancel:deleteMessage")) {
    ctx.deleteMessages([messageId]).catch(console.error);
    return true;
  }
  return false;
}

function createRetryKeyboard(ctx: Context, conversation: string) {
  const keyboard = [
    [
      {
        text: `☝️Retry`,
        callback_data: retry.pack({ conversation }),
      },
    ],
  ];
  return InlineKeyboard.from(keyboard);
}

export const UPDATE_FIRST_NAME_CONVERSATION = "update-first-name";
export const UPDATE_LAST_NAME_CONVERSATION = "update-last-name";
export function updateFirstNameConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      const message = await ctx.reply(
        "✏️Please enter up to 20 characters, including letters, and numbers for the first name",
        {
          reply_markup: new InlineKeyboard().text(
            "back",
            cancel.pack({ action: "deleteMessage" }),
          ),
        },
      );

      const answerCtx = await conversation.waitFor([
        "callback_query:data",
        "message:text",
      ]);

      // Leaving a Conversation
      if (leaveConversation(answerCtx, message.message_id)) return;

      const answerMessageId = answerCtx.msg?.message_id ?? 0;
      const newName = answerCtx.msg?.text ?? "";

      if (!isNormalName(newName)) {
        const invalidNameMessage = await answerCtx.reply(
          "Invalid name format",
          {
            reply_markup: createRetryKeyboard(
              ctx,
              UPDATE_FIRST_NAME_CONVERSATION,
            ),
          },
        );
        ctx
          .deleteMessages([message.message_id, answerMessageId])
          .catch(console.error);
        setTimeout(() => {
          ctx
            .deleteMessages([invalidNameMessage.message_id])
            .catch(console.error);
        }, 10_000);
      }

      conversation.session.firstName = newName;

      ctx
        .deleteMessages([message.message_id, answerMessageId])
        .catch(console.error);

      await ctx
        .editMessageReplyMarkup({
          reply_markup: new InlineKeyboard()
            .text(
              `current first name:${conversation.session.firstName}`,
              updateFirstName.pack({}),
            )
            .text(
              `current last name:${conversation.session.lastName}`,
              updateLastName.pack({}),
            ),
        })
        .catch(console.error);
    },
    UPDATE_FIRST_NAME_CONVERSATION,
  );
}

export function updateLastNameConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      const message = await ctx.reply(
        "✏️Please enter up to 20 characters, including letters, and numbers for the last name.",
        {
          reply_markup: new InlineKeyboard().text(
            "back",
            cancel.pack({ action: "deleteMessage" }),
          ),
        },
      );

      const answerCtx = await conversation.waitFor([
        "callback_query:data",
        "message:text",
      ]);

      // Leaving a Conversation
      if (leaveConversation(answerCtx, message.message_id)) return;

      const answerMessageId = answerCtx.msg?.message_id ?? 0;
      const newName = answerCtx.msg?.text ?? "";

      if (!isNormalName(newName)) {
        const invalidNameMessage = await answerCtx.reply(
          "Invalid name format",
          {
            reply_markup: createRetryKeyboard(
              ctx,
              UPDATE_LAST_NAME_CONVERSATION,
            ),
          },
        );
        ctx
          .deleteMessages([message.message_id, answerMessageId])
          .catch(console.error);
        setTimeout(() => {
          ctx
            .deleteMessages([invalidNameMessage.message_id])
            .catch(console.error);
        }, 10_000);
      }

      conversation.session.lastName = newName;

      ctx
        .deleteMessages([message.message_id, answerMessageId])
        .catch(console.error);

      await ctx
        .editMessageReplyMarkup({
          reply_markup: new InlineKeyboard()
            .text(
              `current first name:${conversation.session.firstName}`,
              updateFirstName.pack({}),
            )
            .text(
              `current last name:${conversation.session.lastName}`,
              updateLastName.pack({}),
            ),
        })
        .catch(console.error);
    },
    UPDATE_LAST_NAME_CONVERSATION,
  );
}
