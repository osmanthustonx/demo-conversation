import { InlineKeyboard } from "grammy";
import ISO6391 from "iso-639-1";
import {
  backToData,
  changeLanguageData,
} from "#root/bot/callback-data/index.js";
import type { Context } from "#root/bot/context.js";
import { i18n } from "#root/bot/i18n.js";
import { chunk } from "#root/bot/helpers/keyboard.js";

export const createChangeLanguageKeyboard = async (ctx: Context) => {
  const currentLocaleCode = await ctx.i18n.getLocale();

  const getLabel = (code: string) => {
    const isActive = code === currentLocaleCode;
    return `${isActive ? "✅ " : ""}${ISO6391.getNativeName(code)}`;
  };
  const keyboard = chunk(
    i18n.locales.map((localeCode) => ({
      text: getLabel(localeCode),
      callback_data: changeLanguageData.pack({
        code: localeCode,
      }),
    })),
    2,
  );
  if (ctx.session.locale)
    keyboard.push([
      {
        text: ctx.t("common.back"),
        callback_data: backToData.pack({ to: "start" }),
      },
    ]);

  return InlineKeyboard.from(keyboard);
};
