import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CoralQueryResult {
  rows: Record<string, unknown>[];
  sql: string;
  source: string;
  error?: string;
  durationMs?: number;
}

/**
 * Detect the correct coral binary path.
 *
 * Priority:
 *   1. CORAL_BIN env var (explicit override)
 *   2. 'coral' — works natively when running inside WSL or on Linux/macOS
 *   3. 'wsl coral' — fallback when running Node.js on Windows but coral
 *      is installed in the WSL environment (the common dev setup)
 */
function getCoralBin(): string {
  if (process.env.CORAL_BIN) return process.env.CORAL_BIN;
  if (process.platform === 'win32') return 'wsl coral';
  return 'coral';
}

const CORAL_BIN = getCoralBin();

/**
 * Build the environment block to pass to the child process.
 * When calling via `wsl coral`, env vars are forwarded as WSLENV.
 */
function buildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GITHUB_TOKEN:      process.env.GITHUB_TOKEN,
    SENTRY_TOKEN:      process.env.SENTRY_TOKEN,
    SENTRY_ORG:        process.env.SENTRY_ORG,
    POSTHOG_API_KEY:   process.env.POSTHOG_API_KEY,
    STRIPE_API_KEY:    process.env.STRIPE_API_KEY,
    BEEHIIV_API_KEY:   process.env.BEEHIIV_API_KEY,
    DUB_API_KEY:       process.env.DUB_API_KEY,
    SENTRY_PROJECT:    process.env.SENTRY_PROJECT,
    POSTHOG_PROJECT_ID:process.env.POSTHOG_PROJECT_ID,
    BEEHIIV_PUBLICATION_ID: process.env.BEEHIIV_PUBLICATION_ID,
  };

  // When bridging to WSL, WSLENV tells WSL which vars to forward
  if (process.platform === 'win32') {
    env.WSLENV = [
      'GITHUB_TOKEN',
      'SENTRY_TOKEN',
      'SENTRY_ORG',
      'POSTHOG_API_KEY',
      'STRIPE_API_KEY',
      'BEEHIIV_API_KEY',
      'DUB_API_KEY',
      'SENTRY_PROJECT',
      'POSTHOG_PROJECT_ID',
      'BEEHIIV_PUBLICATION_ID',
    ].join(':');
  }

  return env;
}

/**
 * Execute a Coral SQL query and return structured results.
 *
 * Handles both native (WSL / Linux / macOS) and Windows-via-WSL execution.
 */
export async function runCoralQuery(
  sql: string,
  source: string
): Promise<CoralQueryResult> {
  const startTime = Date.now();

  // Sanitize SQL for shell: collapse newlines, escape double-quotes
  const sanitizedSql = sql
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, '\\"');

  const command = `${CORAL_BIN} sql "${sanitizedSql}" --format json`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      env: buildEnv(),
      maxBuffer: 10 * 1024 * 1024, // 10 MB
      timeout: 30_000,              // 30 s per query
    });

    if (stderr && !stdout) {
      return {
        rows: [],
        sql,
        source,
        error: stderr.trim(),
        durationMs: Date.now() - startTime,
      };
    }

    let rows: Record<string, unknown>[] = [];
    try {
      const parsed = JSON.parse(stdout.trim());
      rows = Array.isArray(parsed) ? parsed : (parsed.rows ?? [parsed]);
    } catch {
      // Newline-delimited JSON fallback
      rows = stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          try { return JSON.parse(line); }
          catch { return { raw: line }; }
        });
    }

    return { rows, sql, source, durationMs: Date.now() - startTime };
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    return {
      rows: [],
      sql,
      source,
      error: error.stderr?.trim() ?? error.message ?? 'coral query failed',
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Lightweight source health check — runs a minimal query.
 */
export async function checkSourceHealth(
  source: string,
  testQuery: string
): Promise<{ healthy: boolean; error?: string }> {
  const result = await runCoralQuery(testQuery, source);
  return {
    healthy: !result.error && result.rows.length >= 0,
    error: result.error,
  };
}

/**
 * Run multiple queries in parallel and collect all results.
 */
export async function runParallelQueries(
  queries: Array<{ sql: string; source: string }>
): Promise<CoralQueryResult[]> {
  const settled = await Promise.allSettled(
    queries.map(({ sql, source }) => runCoralQuery(sql, source))
  );
  return settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          rows: [],
          sql: queries[i].sql,
          source: queries[i].source,
          error: (r.reason as Error)?.message ?? 'Query failed',
        }
  );
}
