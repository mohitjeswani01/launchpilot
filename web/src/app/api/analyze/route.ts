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

// ─────────────────────────────────────────────────────────────────────────────
// Vercel Demo Mode
//
// Coral is a local binary and cannot run in Vercel's serverless environment.
// When deployed to Vercel (VERCEL=1), we return a realistic demo analysis so
// the product can be showcased live. The SQL evidence shows the exact queries
// that would have been executed locally.
// ─────────────────────────────────────────────────────────────────────────────
const IS_VERCEL = process.env.VERCEL === '1';

function buildDemoAnalysis(body: AnalyzeRequest): LaunchAnalysis {
  return {
    id: randomUUID(),
    featureName: body.featureName,
    repo:        body.repo,
    owner:       body.owner,
    launchDate:  body.launchDate,
    analyzedAt:  new Date().toISOString(),
    status:      'healthy',
    healthScore: 87,
    verdictTitle:   'Launch Healthy',
    verdictSummary: `${body.featureName} is performing well. Strong engineering velocity, zero critical errors, and early engagement signals across all monitored sources.`,
    metrics: [
      {
        source:    'github',
        label:     'GitHub Activity',
        status:    'live' as const,
        icon:      '⚡',
        value:     '8 PRs merged',
        subtext:   'CI passing · 3 active contributors',
        sentiment: 'positive' as const,
      },
      {
        source:    'sentry',
        label:     'Error Rate',
        status:    'live' as const,
        icon:      '🐛',
        value:     '0 new errors',
        subtext:   'Clean launch 🎉',
        sentiment: 'positive' as const,
      },
      {
        source:    'posthog',
        label:     'Feature Adoption',
        status:    'live' as const,
        icon:      '📊',
        value:     '2 flags active',
        subtext:   '~9% early adoption',
        sentiment: 'neutral' as const,
      },
      {
        source:    'stripe',
        label:     'Revenue Signal',
        status:    'live' as const,
        icon:      '💳',
        value:     '3 new subs',
        subtext:   '$90 MRR added since launch',
        sentiment: 'positive' as const,
      },
      {
        source:    'beehiiv',
        label:     'Newsletter Reach',
        status:    'live' as const,
        icon:      '📧',
        value:     '1 post sent',
        subtext:   '58% open rate · 980 readers',
        sentiment: 'positive' as const,
      },
      {
        source:    'dub',
        label:     'Link Analytics',
        status:    'live' as const,
        icon:      '🔗',
        value:     '342 clicks',
        subtext:   '2 tracked links · launch thread',
        sentiment: 'positive' as const,
      },
    ],
    keyInsights: [
      'Zero critical errors detected since launch — clean deployment',
      '8 PRs merged in the first 24 hours — strong team velocity',
      '342 tracked link clicks signals healthy distribution reach',
      '3 new subscriptions represent early revenue momentum',
    ],
    recommendedActions: [
      'Capitalize on newsletter momentum — 58% open rate is above industry average',
      'Monitor Stripe churn signals over the next 7 days',
      'Expand PostHog feature flags to a wider user segment',
    ],
    sqlQueries: [
      {
        source:     'github-prs',
        sql:        githubPRsQuery(body),
        rowCount:   8,
        durationMs: 834,
      },
      {
        source:     'github-ci',
        sql:        githubCIQuery(body),
        rowCount:   10,
        durationMs: 612,
      },
      {
        source:     'sentry',
        sql:        sentryIssuesQuery(body),
        rowCount:   0,
        durationMs: 498,
      },
      {
        source:     'posthog',
        sql:        posthogFeatureFlagsQuery(body),
        rowCount:   2,
        durationMs: 701,
      },
      {
        source:     'stripe',
        sql:        stripeSubscriptionsQuery(body),
        rowCount:   3,
        durationMs: 923,
      },
      {
        source:     'beehiiv',
        sql:        beehiivPostsQuery(body),
        rowCount:   1,
        durationMs: 441,
      },
      {
        source:     'dub',
        sql:        dubLinksQuery(),
        rowCount:   2,
        durationMs: 629,
      },
    ],
  };
}

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

    // ── Vercel / serverless: return demo analysis ───────────────────────────
    // Coral requires a locally installed binary and cannot run in a serverless
    // environment. Demo mode returns realistic data so the UI can be showcased.
    if (IS_VERCEL) {
      return NextResponse.json({ success: true, analysis: buildDemoAnalysis(body) });
    }

    // ── Local / self-hosted: run real Coral queries ─────────────────────────
    const queries = [
      { sql: githubPRsQuery(body),           source: 'github-prs' },
      { sql: githubCIQuery(body),            source: 'github-ci'  },
      { sql: sentryIssuesQuery(body),        source: 'sentry'     },
      { sql: posthogFeatureFlagsQuery(body), source: 'posthog'    },
      { sql: stripeSubscriptionsQuery(body), source: 'stripe'     },
      { sql: beehiivPostsQuery(body),        source: 'beehiiv'    },
      { sql: dubLinksQuery(),                source: 'dub'        },
    ];

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

    const githubRows = [
      ...githubPRsResult.rows,
      ...githubCIResult.rows,
    ];

    const { score, status, metrics } = scoreLaunch({
      githubRows,
      sentryRows:  sentryResult.rows,
      posthogRows: posthogResult.rows,
      stripeRows:  stripeResult.rows,
      beehiivRows: beehiivResult.rows,
      dubRows:     dubResult.rows,
    });

    const keyInsights       = buildInsights(metrics, score);
    const recommendedActions = buildActions(metrics, status);

    const analysis: LaunchAnalysis = {
      id:             randomUUID(),
      featureName:    body.featureName,
      repo:           body.repo,
      owner:          body.owner,
      launchDate:     body.launchDate,
      analyzedAt:     new Date().toISOString(),
      status,
      healthScore:    score,
      verdictTitle:   getVerdictTitle(status),
      verdictSummary: getVerdictSummary(status, metrics, body.featureName),
      metrics,
      keyInsights,
      recommendedActions,
      sqlQueries: results.map((r) => ({
        source:     r.source,
        sql:        r.sql,
        rowCount:   r.rows.length,
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
  const dub    = metrics.find((m) => m.source === 'dub');

  if (score >= 70) insights.push('Launch signals are strong across all monitored sources');
  if (github?.sentiment === 'warning') insights.push(`CI failures detected — ${github.subtext}`);
  if (sentry?.sentiment === 'negative') insights.push(`Critical errors found: ${sentry.value}`);
  if (sentry?.sentiment === 'positive') insights.push('Zero new errors detected since launch');
  if (stripe?.value !== 'No new subs yet') insights.push(`Revenue growing: ${stripe?.value}`);
  if (dub?.value !== 'No clicks yet') insights.push(`Strong marketing reach: ${dub?.value}`);
  if (insights.length === 0)
    insights.push('Monitoring in progress — check back after more data flows in');

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
  if (github?.sentiment === 'warning')  actions.push('Investigate failed CI runs in GitHub Actions');
  if (stripe?.value === 'No new subs yet') actions.push('Consider a promotional push to drive first conversions');
  if (status === 'healthy')  actions.push('Monitor for 24h more before marking launch complete');
  if (status === 'at_risk')  actions.push('Schedule a team sync to review launch signals');
  if (status === 'failing')  actions.push('Consider a feature flag rollback immediately');

  return actions.slice(0, 3);
}
