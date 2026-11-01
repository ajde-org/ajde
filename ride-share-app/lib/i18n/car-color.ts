import type { Translator } from "./translate";
import type { carColorsEn } from "./messages/car-colors-en";

type ColorKey = keyof typeof carColorsEn;
const aliases: ReadonlyArray<readonly [ColorKey, string]> = [
  ["carColor.black", "black црн црна црно"],
  ["carColor.white", "white бел бела бело"],
  ["carColor.gray", "gray grey сив сива сиво"],
  ["carColor.silver", "silver сребрен сребрена сребрено"],
  ["carColor.blue", "blue син сина сино"],
  ["carColor.red", "red црвен црвена црвено"],
  ["carColor.green", "green зелен зелена зелено"],
  ["carColor.yellow", "yellow жолт жолта жолто"],
  ["carColor.orange", "orange портокалов портокалова портокалово"],
  ["carColor.brown", "brown кафеав кафеава кафеаво"],
  ["carColor.beige", "beige беж"],
  ["carColor.gold", "gold golden златен златна златно"],
  ["carColor.purple", "purple violet виолетов виолетова виолетово"],
  ["carColor.pink", "pink розов розова розово"],
];
const keys = new Map(aliases.flatMap(([key, names]) => names.split(" ").map(name => [name, key] as const)));

/** Translate recognized labels for display only; retain custom paint descriptions verbatim. */
export function localizedCarColor(value: string | null | undefined, t: Translator): string {
  if (!value) return "";
  const key = keys.get(value.trim().normalize("NFC").toLowerCase());
  return key ? t(key) : value;
}
