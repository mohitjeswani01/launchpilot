import {
  LaunchAnalysis,
  LaunchStatus,
  ScoringInput,
  SourceMetric,
} from './types';

// ============================================================
// LaunchPilot: Launch Health Scorer
// Takes raw rows from all 6 sources → outputs health score + metrics
// ============================================================

/**
 * Score a launch 0–100 based on signals from all sources.
 * Higher = healthier.
 */
export function scoreLaunch(input: ScoringInput): {
  score: number;
  status: LaunchStatus;
  metrics: SourceMetric[];
} {
  const metrics: SourceMetric[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // ── GitHub (weight: 20) ──────────────────────────────────
  const prCount = input.githubRows.length;
  const ciRows = input.githubRows.filter(
    (r) => r.conclusion !== undefined
  );
  const failedCi = ciRows.filter(
    (r) => r.conclusion === 'failure' || r.conclusion === 'cancelled'
  ).length;
  const ciScore = ciRows.length > 0 ? Math.max(0, 100 - failedCi * 25) : 70;

  metrics.push({
    source: 'github',
    label: 'GitHub Activity',
    status: 'live',
    value: `${prCount} PR${prCount !== 1 ? 's' : ''} merged`,
    subtext:
      failedCi > 0
        ? `${failedCi} CI failure${failedCi !== 1 ? 's' : ''} detected`
        : 'All CI checks passing',
    icon: '⚡',
    sentiment: failedCi > 0 ? 'warning' : 'positive',
  });
  weightedScore += ciScore * 20;
  totalWeight += 20;

  // ── Sentry (weight: 30 — errors matter most) ─────────────
  const errorCount = input.sentryRows.length;
  const fatalErrors = input.sentryRows.filter(
    (r) => r.level === 'fatal'
  ).length;
  const sentryScore =
    fatalErrors > 0
      ? Math.max(0, 30 - fatalErrors * 15)
      : Math.max(0, 100 - errorCount * 10);

  metrics.push({
    source: 'sentry',
    label: 'Error Rate',
    status: 'live',
    value: errorCount === 0 ? 'No new errors' : `${errorCount} error${errorCount !== 1 ? 's' : ''}`,
    subtext:
      fatalErrors > 0
        ? `⚠️ ${fatalErrors} fatal error${fatalErrors !== 1 ? 's' : ''}`
        : errorCount === 0
        ? 'Clean launch 🎉'
        : 'Non-critical errors only',
    icon: '🐛',
    sentiment:
      fatalErrors > 0 ? 'negative' : errorCount > 3 ? 'warning' : 'positive',
  });
  weightedScore += sentryScore * 30;
  totalWeight += 30;

  // ── PostHog (weight: 20) ─────────────────────────────────
  const flagCount = input.posthogRows.length;
  const activeFlags = input.posthogRows.filter((r) => r.active).length;
  const posthogScore = flagCount > 0 ? 80 : 50; // Good if flags exist

  metrics.push({
    source: 'posthog',
    label: 'Feature Adoption',
    status: flagCount > 0 ? 'live' : 'unconfigured',
    value: activeFlags > 0 ? `${activeFlags} active flag${activeFlags !== 1 ? 's' : ''}` : 'No flags found',
    subtext:
      activeFlags > 0
        ? `Feature flags rolling out to users`
        : 'No feature flags configured',
    icon: '📊',
    sentiment: activeFlags > 0 ? 'positive' : 'neutral',
  });
  weightedScore += posthogScore * 20;
  totalWeight += 20;

  // ── Stripe (weight: 25) ──────────────────────────────────
  const newSubs = input.stripeRows.length;
  const revenue = input.stripeRows.reduce((sum, r) => {
    const amount = (r.amount_cents as number) ?? 0;
    return sum + amount;
  }, 0);
  const revenueDollars = (revenue / 100).toFixed(0);
  const stripeScore = newSubs > 0 ? Math.min(100, 60 + newSubs * 8) : 40;

  metrics.push({
    source: 'stripe',
    label: 'Revenue Signal',
    status: 'live',
    value: newSubs > 0 ? `+${newSubs} subscription${newSubs !== 1 ? 's' : ''}` : 'No new subs yet',
    subtext:
      newSubs > 0
        ? `$${revenueDollars} new MRR since launch`
        : 'Revenue signal pending',
    icon: '💰',
    sentiment: newSubs > 2 ? 'positive' : newSubs > 0 ? 'neutral' : 'neutral',
  });
  weightedScore += stripeScore * 25;
  totalWeight += 25;

  // ── Beehiiv (weight: 10) ─────────────────────────────────
  const postCount = input.beehiivRows.length;
  const beehiivScore = postCount > 0 ? 75 : 50;

  metrics.push({
    source: 'beehiiv',
    label: 'Newsletter Reach',
    status: postCount > 0 ? 'live' : 'unconfigured',
    value:
      postCount > 0
        ? `${postCount} post${postCount !== 1 ? 's' : ''} sent`
        : 'No posts found',
    subtext:
      postCount > 0
        ? 'Newsletter campaign active'
        : 'Configure Beehiiv to track newsletter',
    icon: '📧',
    sentiment: postCount > 0 ? 'positive' : 'neutral',
  });
  weightedScore += beehiivScore * 10;
  totalWeight += 10;

  // ── Dub (weight: 15) ─────────────────────────────────────
  const linkCount = input.dubRows.length;
  const totalClicks = input.dubRows.reduce(
    (sum, r) => sum + ((r.clicks as number) ?? 0),
    0
  );
  const dubScore =
    totalClicks > 100
      ? 90
      : totalClicks > 10
      ? 70
      : totalClicks > 0
      ? 55
      : 40;

  metrics.push({
    source: 'dub',
    label: 'Link Analytics',
    status: linkCount > 0 ? 'live' : 'unconfigured',
    value:
      totalClicks > 0
        ? `${totalClicks.toLocaleString()} clicks`
        : 'No clicks yet',
    subtext:
      linkCount > 0
        ? `${linkCount} tracked link${linkCount !== 1 ? 's' : ''}`
        : 'No Dub links found',
    icon: '🔗',
    sentiment:
      totalClicks > 100
        ? 'positive'
        : totalClicks > 10
        ? 'neutral'
        : 'neutral',
  });
  weightedScore += dubScore * 15;
  totalWeight += 15;

  // ── Final Score ──────────────────────────────────────────
  const score = Math.round(weightedScore / totalWeight);
  let status: LaunchStatus;
  if (score >= 70) status = 'healthy';
  else if (score >= 45) status = 'at_risk';
  else status = 'failing';

  return { score, status, metrics };
}

/**
 * Generate a verdict title based on status.
 */
export function getVerdictTitle(status: LaunchStatus): string {
  const map: Record<LaunchStatus, string> = {
    healthy: '✅ Launch Healthy',
    at_risk: '⚠️ Needs Attention',
    failing: '❌ Launch Failing',
    unknown: '❓ Insufficient Data',
  };
  return map[status];
}

/**
 * Generate a short summary sentence.
 */
export function getVerdictSummary(
  status: LaunchStatus,
  metrics: SourceMetric[],
  featureName: string
): string {
  if (status === 'healthy') {
    return `${featureName} is performing well across all signals. Revenue is up, errors are low, and users are adopting the feature.`;
  }
  if (status === 'at_risk') {
    const warnings = metrics.filter((m) => m.sentiment === 'warning' || m.sentiment === 'negative');
    const warningLabels = warnings.map((w) => w.label).join(', ');
    return warningLabels
      ? `${featureName} shows mixed signals. Pay attention to: ${warningLabels}.`
      : `${featureName} shows mixed signals. Monitor all sources closely over the next 24 hours.`;
  }
  return `${featureName} has critical issues. Immediate action required — check error rate and CI status.`;
}
