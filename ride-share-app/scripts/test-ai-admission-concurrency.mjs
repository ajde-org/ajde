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
async function admit(user) {
  const result = await query(`begin; set local role authenticated;
    set local request.jwt.claim.sub = '${user}';
    select public.admit_ai_operation('search'); commit;`);
  return JSON.parse(result);
}
async function reset() {
  await query(`delete from public.ai_operations where user_id in ('${users[0]}','${users[1]}');
    delete from public.ai_admission_buckets where user_id in ('${users[0]}','${users[1]}');`);
}

try {
  await query(`insert into auth.users(id) values ('${users[0]}'), ('${users[1]}');`);
  // Separate psql processes give separate connections and competing transactions,
  // including INSERT/lock races before the first user state exists.
  let results = await Promise.all(Array.from({ length: 12 }, () => admit(users[0])));
  assert.equal(results.filter(result => result.admitted).length, 2, "only two first admissions acquire leases");
  assert.ok(results.filter(result => !result.admitted).every(result => result.reason === "concurrency_limit"));
  assert.equal(await query(`select count(*) from public.ai_operations where user_id = '${users[0]}'`), "2");

  await reset();
  await query(`insert into public.ai_operations(user_id, policy_group, feature,
    admitted_at, deadline_at, lease_expires_at, released_at)
    select '${users[0]}', 'explicit', 'search', clock_timestamp() - interval '30 minutes',
      clock_timestamp() - interval '28 minutes', clock_timestamp() - interval '27 minutes',
      clock_timestamp() - interval '29 minutes' from generate_series(1, 29);`);
  results = await Promise.all(Array.from({ length: 12 }, () => admit(users[0])));
  assert.equal(results.filter(result => result.admitted).length, 1, "29/30 race admits exactly one request");
  assert.ok(results.filter(result => !result.admitted).every(result => result.reason === "hourly_limit"));
  assert.equal(await query(`select count(*) from public.ai_operations where user_id = '${users[0]}'`), "30");

  await reset();
  results = await Promise.all(users.flatMap(user => Array.from({ length: 4 }, () => admit(user))));
  assert.equal(results.filter(result => result.admitted).length, 4, "parallel users each acquire two leases");
  const requestId = randomUUID();
  const claims = await Promise.all(Array.from({ length: 12 }, async () => JSON.parse(await query(`begin;
    set local role authenticated; set local request.jwt.claim.sub = '${users[0]}';
    select public.claim_ai_execution('${requestId}', 'search', '${"a".repeat(64)}'); commit;`))));
  assert.equal(claims.filter(claim => claim.state === "claimed").length, 1, "one process claims duplicate request execution");
  assert.equal(claims.filter(claim => claim.state === "pending").length, 11);
  console.log("AI admission concurrency checks passed (first admissions, 29/30 race, user isolation, duplicate execution).");
} finally {
  await query(`delete from auth.users where id in ('${users[0]}','${users[1]}');`);
}
