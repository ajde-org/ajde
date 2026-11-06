import type { en, MessageKey, Messages } from "./messages/en";

type ParametersIn<Text extends string> = Text extends `${string}{${infer Name}}${infer Rest}`
  ? Name | ParametersIn<Rest> : never;
type Arguments<Key extends MessageKey> = [ParametersIn<(typeof en)[Key]>] extends [never]
  ? [] : [values: Record<ParametersIn<(typeof en)[Key]>, string | number>];

export function createTranslator(messages: Messages) {
  return function t<Key extends MessageKey>(key: Key, ...args: Arguments<Key>): string {
    const values = args[0] as Record<string, string | number> | undefined;
    return messages[key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      values && Object.hasOwn(values, name) ? String(values[name]) : placeholder,
    );
  };
}

export type Translator = ReturnType<typeof createTranslator>;

export type StaticMessageKey = { [Key in MessageKey]: ParametersIn<(typeof en)[Key]> extends never ? Key : never }[MessageKey];

/** Action/API notices are untrusted strings. Only render complete, known catalog messages. */
export function createNoticeTranslator(messages: Messages) {
  return (code: string, fallback: StaticMessageKey): string => {
    const value = Object.hasOwn(messages, code) ? messages[code as MessageKey] : undefined;
    return value && !/\{\w+\}/.test(value) ? value : messages[fallback];
  };
}
