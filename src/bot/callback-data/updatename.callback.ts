import { createCallbackData } from "callback-data";

export const updateFirstName = createCallbackData("update-first-name", {});

export const updateLastName = createCallbackData("update-last-name", {});

export const cancel = createCallbackData("cancel", {
  action: String,
});

export const retry = createCallbackData("retry", {
  conversation: String,
});
