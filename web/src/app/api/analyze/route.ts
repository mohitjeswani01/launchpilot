import { NextRequest, NextResponse } from 'next/server';
import { runParallelQueries } from '@/lib/coral';
import {
  githubPRsQuery,
  githubCIQuery,
  sentryIssuesQuery,
  posthogFeatureFlagsQuery,
  stripeSubscriptionsQuery,
  dubLinksQuery,
  beehiivPostsQuery,
} from '@/lib/queries';
import { scoreLaunch, getVerdictTitle, getVerdictSummary } from '@/lib/scorer';
import { AnalyzeRequest, AnalyzeResponse, LaunchAnalysis } from '@/lib/types';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for all queries

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body: AnalyzeRequest = await req.json();

    // Validate required fields
    if (!body.owner || !body.repo || !body.featureName || !body.launchDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: owner, repo, featureName, launchDate' },
        { status: 400 }
      );
    }

    // Build all SQL queries
    const queries = [
      { sql: githubPRsQuery(body),              source: 'github-prs' },
      { sql: githubCIQuery(body),               source: 'github-ci' },
      { sql: sentryIssuesQuery(body),            source: 'sentry' },
      { sql: posthogFeatureFlagsQuery(body),     source: 'posthog' },
      { sql: stripeSubscriptionsQuery(body),     source: 'stripe' },
      { sql: beehiivPostsQuery(body),            source: 'beehiiv' },
      { sql: dubLinksQuery(),                    source: 'dub' },
    ];

    // 🚀 Run all queries in parallel via Coral
    const results = await runParallelQueries(queries);

    const [
      githubPRsResult,
      githubCIResult,
      sentryResult,
      posthogResult,
      stripeResult,
      beehiivResult,
      dubResult,
    ] = results;

    // Merge GitHub rows (PRs + CI)
    const githubRows = [
      ...githubPRsResult.rows,
      ...githubCIResult.rows,
    ];

    // Score the launch
    const { score, status, metrics } = scoreLaunch({
      githubRows,
      sentryRows: sentryResult.rows,
      posthogRows: posthogResult.rows,
      stripeRows: stripeResult.rows,
      beehiivRows: beehiivResult.rows,
      dubRows: dubResult.rows,
    });

    // Build AI insights (rule-based for speed, swap for Groq if time allows)
    const keyInsights = buildInsights(metrics, score);
    const recommendedActions = buildActions(metrics, status);

    const analysis: LaunchAnalysis = {
      id: randomUUID(),
      featureName: body.featureName,
      repo: body.repo,
      owner: body.owner,
      launchDate: body.launchDate,
      analyzedAt: new Date().toISOString(),
      status,
      healthScore: score,
      verdictTitle: getVerdictTitle(status),
      verdictSummary: getVerdictSummary(status, metrics, body.featureName),
      metrics,
      keyInsights,
      recommendedActions,
      sqlQueries: results.map((r) => ({
        source: r.source,
        sql: r.sql,
        rowCount: r.rows.length,
        durationMs: r.durationMs ?? 0,
      })),
    };

    return NextResponse.json({ success: true, analysis });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[LaunchPilot] Analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── Helper: Build Key Insights ─────────────────────────────
function buildInsights(
  metrics: ReturnType<typeof scoreLaunch>['metrics'],
  score: number
): string[] {
  const insights: string[] = [];

  const github = metrics.find((m) => m.source === 'github');
  const sentry = metrics.find((m) => m.source === 'sentry');
  const stripe = metrics.find((m) => m.source === 'stripe');
  const dub = metrics.find((m) => m.source === 'dub');

  if (score >= 70) insights.push('Launch signals are strong across all monitored sources');
  if (github?.sentiment === 'warning') insights.push(`CI failures detected — ${github.subtext}`);
  if (sentry?.sentiment === 'negative') insights.push(`Critical errors found: ${sentry.value}`);
  if (sentry?.sentiment === 'positive') insights.push('Zero new errors detected since launch');
  if (stripe?.value !== 'No new subs yet') insights.push(`Revenue growing: ${stripe?.value}`);
  if (dub?.value !== 'No clicks yet') insights.push(`Strong marketing reach: ${dub?.value}`);
  if (insights.length === 0) insights.push('Monitoring in progress — check back after more data flows in');

  return insights.slice(0, 4);
}

// ─── Helper: Build Recommended Actions ──────────────────────
function buildActions(
  metrics: ReturnType<typeof scoreLaunch>['metrics'],
  status: string
): string[] {
  const actions: string[] = [];

  const sentry = metrics.find((m) => m.source === 'sentry');
  const github = metrics.find((m) => m.source === 'github');
  const stripe = metrics.find((m) => m.source === 'stripe');

  if (sentry?.sentiment === 'negative') actions.push('Fix critical errors in Sentry immediately');
  if (github?.sentiment === 'warning') actions.push('Investigate failed CI runs in GitHub Actions');
  if (stripe?.value === 'No new subs yet') actions.push('Consider a promotional push to drive first conversions');
  if (status === 'healthy') actions.push('Monitor for 24h more before marking launch complete');
  if (status === 'at_risk') actions.push('Schedule a team sync to review launch signals');
  if (status === 'failing') actions.push('Consider a feature flag rollback immediately');

  return actions.slice(0, 3);
}
