import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { en, type MessageKey } from "../lib/i18n/messages/en";
import { mk } from "../lib/i18n/messages/mk";

// Preserve human approvals only when the exact reviewed wording is unchanged.
const file = path.resolve("../docs/plans/AJDE-29-translation-review.md");
const existing = readFileSync(file, "utf8");
const marker = /^## Message register \(\d+ messages\).*$/m;
const start = existing.search(marker);
if (start < 0) throw new Error("Translation review register marker not found");
const previous = new Map(existing.slice(start).split(/\r?\n/)
  .filter(line => line.startsWith("| ") && !line.startsWith("| Key /"))
  .map(line => { const cells = line.slice(2, -2).split(" | "); return [cells[0], cells] as const; }));
const keys = Object.keys(en).sort() as MessageKey[];
const escape = (text: string) => text.replaceAll("|", "\\|").replaceAll("\n", "<br>");
const rows = keys.map(key => {
  const revision = createHash("sha256").update(`${en[key]}\n${mk[key]}`).digest("hex").slice(0, 12);
  const old = previous.get(key);
  const review = old?.[3] === revision && old.length === 7 ? old.slice(4) : ["Pending", "—", "—"];
  return `| ${key} | ${escape(en[key])} | ${escape(mk[key])} | ${revision} | ${review.join(" | ")} |`;
});
writeFileSync(file, `${existing.slice(0, start)}## Message register (${keys.length} messages)\n\n| Key / context | English | Macedonian | Revision | Status | Reviewer | Date |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
console.log(`Synchronized ${keys.length} message pairs; unchanged human reviews preserved.`);
