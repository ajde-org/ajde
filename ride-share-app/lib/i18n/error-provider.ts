"use client";

import { useSyncExternalStore } from "react";
import { useOptionalI18n } from "./provider";
import { errorsEn } from "./messages/errors-en";
import { errorsMk } from "./messages/errors-mk";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

/** A boundary must remain usable even when the layout/provider could not mount. */
export function useErrorI18n() {
  const context = useOptionalI18n();
  const locale = useSyncExternalStore(subscribe,
    () => document.documentElement.lang === "mk" ? "mk" : "en",
    () => "en");
  const messages = locale === "mk" ? errorsMk : errorsEn;
  return { t: (key: keyof typeof errorsEn) => context ? context.t(key) : messages[key] };
}
