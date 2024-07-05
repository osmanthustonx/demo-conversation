import { createCallbackData } from "callback-data";

export const languageActionData = createCallbackData("language-action", {});

export const changeLanguageData = createCallbackData("language", {
  code: String,
});

export const backToData = createCallbackData("back-to-menu", {
  to: String,
});
