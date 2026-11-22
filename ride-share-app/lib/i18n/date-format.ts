import { intlLocale, type Locale } from "./config";

// Some browsers lack Macedonian ICU date data and silently fall back to English.
// Keep MK wording/order deterministic; Intl supplies only numeric zoned date parts.
const months = ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"];
const shortMonths = ["јан.", "фев.", "мар.", "апр.", "мај", "јун.", "јул.", "авг.", "септ.", "окт.", "ноем.", "дек."];
const weekdays = ["недела", "понеделник", "вторник", "среда", "четврток", "петок", "сабота"];
const shortWeekdays = ["нед.", "пон.", "вт.", "сре.", "чет.", "пет.", "саб."];

export function formatLocalizedDate(locale: Locale, value: Date, options: Intl.DateTimeFormatOptions) {
  if (locale !== "mk") return new Intl.DateTimeFormat(intlLocale(locale), options).format(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: options.timeZone, calendar: "gregory", numberingSystem: "latn", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value;
  const year = get("year"), month = get("month"), day = get("day");
  const weekday = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();
  const style = options.dateStyle;
  let date = "";
  if (style === "short" || style === "medium") {
    date = `${Number(day)}.${Number(month)}.${style === "short" ? year.slice(-2) : year}${style === "medium" ? " г." : ""}`;
  } else {
    const monthOption = style ? "long" : options.month;
    const items = [
      style || options.day ? (options.day === "2-digit" ? day : String(Number(day))) : "",
      monthOption ? (monthOption === "long" ? months[Number(month) - 1] : monthOption === "short" ? shortMonths[Number(month) - 1] : monthOption === "2-digit" ? month : String(Number(month))) : "",
      style || options.year ? (options.year === "2-digit" ? year.slice(-2) : year) : "",
    ].filter(Boolean);
    date = items.join(" ");
    if (style === "full" || options.weekday) {
      const name = options.weekday === "short" ? shortWeekdays[weekday] : weekdays[weekday];
      date = date ? `${name}, ${date}` : name;
    }
  }
  const time = options.timeStyle || options.hour ? `${get("hour")}:${get("minute")}${options.second || options.timeStyle === "medium" ? `:${get("second")}` : ""}` : "";
  return date && time ? `${date}, во ${time}` : date || time;
}
