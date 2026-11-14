import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const url = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) throw new Error("Database tests require a local database");
const result = spawnSync(process.env.PSQL_BIN || "psql", [url, "-X", "-q", "-v", "ON_ERROR_STOP=1",
  "-f", fileURLToPath(new URL("../supabase/tests/schema_smoke.sql", import.meta.url))], {
  stdio: ["ignore", "ignore", "pipe"], encoding: "utf8", windowsHide: true,
  env: { ...process.env, PGCLIENTENCODING: "UTF8" }, timeout: 120000,
});
if (result.error || result.status !== 0) {
  // Never print the command/arguments: the connection string may contain a password.
  console.error(result.stderr || "Database smoke checks could not run. Check PSQL_BIN and the local stack.");
  process.exitCode = 1;
} else console.log("Database smoke checks passed.");
