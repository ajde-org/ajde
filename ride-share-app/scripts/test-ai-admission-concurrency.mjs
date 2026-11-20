import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

const run = promisify(execFile);
const databaseUrl = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(databaseUrl).hostname)) {
  throw new Error("Admission concurrency tests require a local database.");
}
const psql = process.env.PSQL_BIN || "psql";
async function query(sql) {
  try {
    const { stdout } = await run(psql, [databaseUrl, "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", sql], {
      timeout: 30_000, env: { ...process.env, PGCLIENTENCODING: "UTF8" },
    });
    return stdout.trim();
  } catch (error) {
    // Do not print execFile's command, which contains the database connection string.
    throw new Error(`Local SQL test failed: ${error.stderr || error.code || "psql unavailable"}`);
  }
}
const users = [randomUUID(), randomUUID(), randomUUID()];
async function admit(user, requestId = randomUUID(), feature = "search", screenshotId = null) {
  const result = await query(`begin; set local role authenticated;
    set local request.jwt.claim.sub = '${user}';
    select public.admit_ai_operation('${feature}', '${requestId}', ${screenshotId ? `'${screenshotId}'` : "null"}); commit;`);
  return JSON.parse(result);
}
try {
  await query(`insert into auth.users(id) values ('${users[0]}'), ('${users[1]}'), ('${users[2]}');`);
  const capacity = Number(await query("select burst_capacity from public.ai_admission_policies where policy_group = 'explicit'"));
  const heavy = await Promise.all(Array.from({ length: 8 }, () => admit(users[0], randomUUID(), "parse")));
  assert.equal(heavy.filter(row => row.admitted).length, Math.floor(capacity / 6));
  assert.ok(heavy.filter(row => !row.admitted).every(row => row.reason === "allowance_limit"));
  const searches = await Promise.all(Array.from({ length: 8 }, () => admit(users[0])));
  assert.equal(searches.filter(row => row.admitted).length, capacity % 6);
  const key = randomUUID();
  const duplicates = await Promise.all(Array.from({ length: 8 }, () => admit(users[1], key)));
  assert.equal(duplicates.filter(row => row.admitted).length, 1);
  assert.equal(duplicates.filter(row => row.reason === "conflict").length, 7);
  const screenshot = randomUUID();
  assert.ok((await admit(users[2], screenshot, "screenshot")).admitted);
  assert.equal((await admit(users[1], randomUUID(), "parse", screenshot)).reason, "conflict");
  const drafts = await Promise.all(Array.from({ length: 8 }, () => admit(users[2], randomUUID(), "parse", screenshot)));
  assert.equal(drafts.filter(row => row.admitted).length, 1);
  assert.equal(drafts.filter(row => row.reason === "conflict").length, 7);
  console.log("Weighted admission, user isolation and duplicate races passed.");
} finally {
  await query(`delete from auth.users where id in ('${users[0]}','${users[1]}','${users[2]}');`);
}
