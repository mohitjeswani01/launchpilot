import { AnalyzeRequest } from './types';

// ============================================================
// LaunchPilot: Coral SQL Query Templates
// Each function returns a ready-to-run SQL string
// ============================================================

export function githubPRsQuery(req: AnalyzeRequest): string {
  return `
    SELECT number, title, user__login AS author, merged_at,
           head__ref AS branch, additions, deletions, changed_files
    FROM github.pulls
    WHERE owner = '${req.owner}'
      AND repo  = '${req.repo}'
      AND state = 'closed'
      AND merged_at >= '${req.launchDate}'
    ORDER BY merged_at DESC
    LIMIT 5
  `.trim();
}

export function githubCIQuery(req: AnalyzeRequest): string {
  return `
    SELECT status, conclusion, name AS workflow_name, created_at
    FROM github.repo_action_runs
    WHERE owner = '${req.owner}'
      AND repo  = '${req.repo}'
    ORDER BY created_at DESC
    LIMIT 20
  `.trim();
}

export function githubIssuesQuery(req: AnalyzeRequest): string {
  return `
    SELECT number, title, state, user__login AS reporter, created_at
    FROM github.issues
    WHERE owner      = '${req.owner}'
      AND repo       = '${req.repo}'
      AND created_at >= '${req.launchDate}'
    ORDER BY created_at DESC
    LIMIT 10
  `.trim();
}

export function sentryIssuesQuery(req: AnalyzeRequest): string {
  const project = req.sentryProject ?? process.env.SENTRY_PROJECT ?? '';
  const projectFilter = project ? `WHERE project = '${project}'` : '';
  return `
    SELECT id, title, level, status, count AS occurrences,
           user_count, first_seen, last_seen, project
    FROM sentry.issues
    ${projectFilter}
    ORDER BY occurrences DESC
    LIMIT 10
  `.trim();
}

export function posthogFeatureFlagsQuery(req: AnalyzeRequest): string {
  const projectId = req.posthogProjectId ?? process.env.POSTHOG_PROJECT_ID ?? '';
  return `
    SELECT id, name, key, active, created_at, rollout_percentage
    FROM posthog.feature_flags
    WHERE project_id = '${projectId}'
      AND active     = true
    ORDER BY created_at DESC
    LIMIT 10
  `.trim();
}

export function stripeSubscriptionsQuery(req: AnalyzeRequest): string {
  // Convert ISO date to Unix timestamp for Stripe
  const unixTs = Math.floor(new Date(req.launchDate).getTime() / 1000);
  return `
    SELECT id, status, created, customer
    FROM stripe.subscriptions
    WHERE created >= ${unixTs}
    ORDER BY created DESC
    LIMIT 20
  `.trim();
}

export function stripeEventsQuery(req: AnalyzeRequest): string {
  const unixTs = Math.floor(new Date(req.launchDate).getTime() / 1000);
  return `
    SELECT id, type, created
    FROM stripe.events
    WHERE created >= ${unixTs}
      AND type IN ('customer.subscription.created', 'invoice.payment_succeeded')
    ORDER BY created DESC
    LIMIT 20
  `.trim();
}

export function beehiivPostsQuery(req: AnalyzeRequest): string {
  const pubId = req.beehiivPublicationId ?? process.env.BEEHIIV_PUBLICATION_ID ?? '';
  return `
    SELECT id, subject_line, status, displayed_date
    FROM beehiiv.posts
    WHERE publication_id = '${pubId}'
    ORDER BY displayed_date DESC
    LIMIT 10
  `.trim();
}

export function dubLinksQuery(): string {
  return `
    SELECT id, key, url, title, clicks, leads, created_at
    FROM dub.links
    ORDER BY created_at DESC
    LIMIT 20
  `.trim();
}
