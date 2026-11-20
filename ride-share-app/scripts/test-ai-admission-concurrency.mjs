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
const users = [randomUUID(), randomUUID()];
async function admit(user, requestId = randomUUID(), feature = "search") {
  const result = await query(`begin; set local role authenticated;
    set local request.jwt.claim.sub = '${user}';
    select public.admit_ai_operation('${feature}', '${requestId}'); commit;`);
  return JSON.parse(result);
}
try {
  await query(`insert into auth.users(id) values ('${users[0]}'), ('${users[1]}');`);
  const heavy = await Promise.all(Array.from({ length: 8 }, () => admit(users[0], randomUUID(), "parse")));
  assert.equal(heavy.filter(row => row.admitted).length, 2);
  assert.ok(heavy.filter(row => !row.admitted).every(row => row.reason === "allowance_limit"));
  const searches = await Promise.all(Array.from({ length: 8 }, () => admit(users[0])));
  assert.equal(searches.filter(row => row.admitted).length, 4);
  const key = randomUUID();
  const duplicates = await Promise.all(Array.from({ length: 8 }, () => admit(users[1], key)));
  assert.equal(duplicates.filter(row => row.admitted).length, 1);
  assert.equal(duplicates.filter(row => row.reason === "conflict").length, 7);
  console.log("Weighted admission, user isolation and duplicate races passed.");
} finally {
  await query(`delete from auth.users where id in ('${users[0]}','${users[1]}');`);
}
