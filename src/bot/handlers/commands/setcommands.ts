import { BotCommand } from "@grammyjs/types";
import { CommandContext } from "grammy";
import { i18n, isMultipleLocales } from "#root/bot/i18n.js";
import { config } from "#root/config.js";
import type { Context } from "#root/bot/context.js";

export function getLanguageCommand(localeCode: string): BotCommand {
  return {
    command: "language",
    description: i18n.t(localeCode, "language_command.description"),
  };
}

export function getPrivateChatCommands(localeCode: string): BotCommand[] {
  return [
    {
      command: "start",
      description: i18n.t(localeCode, "start_command.description"),
    },
    {
      command: "ranking",
      description: i18n.t(localeCode, "one_h_tx_ranking_command.description"),
    },
    {
      command: "watchlist",
      description: i18n.t(localeCode, "watchlist_command.description"),
    },
  ];
}

function getPrivateChatAdminCommands(localeCode: string): BotCommand[] {
  return [
    {
      command: "setcommands",
      description: i18n.t(localeCode, "setcommands_command.description"),
    },
  ];
}

export async function updateCommandLanguage(ctx: Context, localeCode: string) {
  if (!ctx.chat?.id) return;
  await ctx.api.setMyCommands(
    [
      ...getPrivateChatCommands(localeCode),
      ...(isMultipleLocales ? [getLanguageCommand(localeCode)] : []),
    ],
    {
      scope: {
        chat_id: ctx.chat.id,
        type: "chat",
      },
      language_code: localeCode,
    },
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getGroupChatCommands(localeCode: string): BotCommand[] {
  return [];
}

export async function setCommandsHandler(ctx: CommandContext<Context>) {
  const DEFAULT_LANGUAGE_CODE = "en";
  const currentLocaleCode =
    (await ctx.i18n.getLocale()) || DEFAULT_LANGUAGE_CODE;

  // set private chat commands
  if (isMultipleLocales) {
    const requests = i18n.locales.map((code) =>
      ctx.api.setMyCommands(
        [
          ...getPrivateChatCommands(code),
          ...(isMultipleLocales ? [getLanguageCommand(code)] : []),
        ],
        {
          language_code: code,
          scope: {
            type: "all_private_chats",
          },
        },
      ),
    );

    await Promise.all(requests);
  } else {
    await ctx.api.setMyCommands(
      [
        ...getPrivateChatCommands(currentLocaleCode),
        ...(isMultipleLocales ? [getLanguageCommand(currentLocaleCode)] : []),
      ],
      {
        scope: {
          type: "all_private_chats",
        },
      },
    );
  }

  // set group chat commands
  if (isMultipleLocales) {
    const requests = i18n.locales.map((code) =>
      ctx.api.setMyCommands(getGroupChatCommands(code), {
        language_code: code,
        scope: {
          type: "all_group_chats",
        },
      }),
    );

    await Promise.all(requests);
  } else {
    await ctx.api.setMyCommands(getGroupChatCommands(currentLocaleCode), {
      scope: {
        type: "all_group_chats",
      },
    });
  }

  // set private chat commands for owner
  await ctx.api.setMyCommands(
    [
      ...getPrivateChatCommands(currentLocaleCode),
      ...getPrivateChatAdminCommands(currentLocaleCode),
      ...(isMultipleLocales ? [getLanguageCommand(currentLocaleCode)] : []),
    ],
    {
      scope: {
        type: "chat",
        chat_id: config.BOT_ADMINS[0],
      },
    },
  );

  return ctx.reply(ctx.t("admin.commands-updated"));
}
