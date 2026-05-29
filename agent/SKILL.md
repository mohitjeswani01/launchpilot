# Coral Launch Intelligence

Analyze the health of any software or product launch using real-time SQL across GitHub, Sentry, PostHog, Stripe, Beehiiv, and Dub — all through Coral.

## What this skill does

`$coral-launch-pilot` runs 7 parallel SQL queries across 6 connected data sources and returns a structured launch health report with:

- **Health Score** (0–100) — weighted across engineering, reliability, adoption, revenue, and reach
- **Per-source signals** — merged PRs, error rate, feature flag adoption, new subscriptions, newsletter reach, link clicks
- **Key insights** — what's going well and what needs attention
- **Recommended actions** — prioritized next steps based on the signal mix
- **Full SQL evidence** — every query that was executed, with row counts and timing

## Skill token

```
$coral-launch-pilot
```

## Default prompt

Use `$coral-launch-pilot` to analyze the launch health of `owner/repo` launched on `YYYY-MM-DD`.

## Example prompts

```
Use $coral-launch-pilot to check the launch health of vercel/next.js launched on 2024-10-01.
```

```
Run $coral-launch-pilot for mohitjeswani01/launchpilot launched today and summarize the key risks.
```

```
Use $coral-launch-pilot to compare launch health before and after the v2 release of my-org/my-app.
```

## Required sources

The following sources must be registered in your Coral workspace:

| Source   | Type      | Required credentials |
|----------|-----------|----------------------|
| github   | Core      | `GITHUB_TOKEN`       |
| sentry   | Core      | `SENTRY_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| posthog  | Core      | `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID` |
| stripe   | Core      | `STRIPE_API_KEY`     |
| beehiiv  | Community | `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` |
| dub      | Community | `DUB_API_KEY`        |

See [`coral-config/README.md`](../coral-config/README.md) for workspace setup instructions.

## SQL queries executed

```sql
-- 1. GitHub: merged pull requests since launch
SELECT id, title, merged_at, user__login, additions, deletions
FROM github.pulls
WHERE owner = :owner AND repo = :repo
  AND state = 'closed' AND merged_at >= :launch_date
LIMIT 20;

-- 2. GitHub: CI run status
SELECT id, name, status, conclusion, created_at
FROM github.repo_action_runs
WHERE owner = :owner AND repo = :repo
LIMIT 10;

-- 3. Sentry: new issues since launch
SELECT id, title, level, times_seen, first_seen, last_seen
FROM sentry.issues
WHERE organization_slug = :sentry_org AND project = :sentry_project
  AND first_seen >= :launch_date
LIMIT 20;

-- 4. PostHog: active feature flags
SELECT id, key, name, active, rollout_percentage
FROM posthog.feature_flags
WHERE project_id = :posthog_project_id
LIMIT 10;

-- 5. Stripe: new subscriptions since launch
SELECT id, status, created, current_period_start, customer
FROM stripe.subscriptions
WHERE created >= :launch_timestamp
LIMIT 20;

-- 6. Beehiiv: newsletter posts since launch
SELECT id, subject_line, status, created, web_url
FROM beehiiv.posts
WHERE publication_id = :beehiiv_publication_id
  AND created >= :launch_date
LIMIT 10;

-- 7. Dub: link analytics
SELECT id, key, url, title, clicks, leads, created_at
FROM dub.links
ORDER BY created_at DESC
LIMIT 20;
```

## Health scoring model

| Source   | Weight | Positive signal              | Negative signal           |
|----------|--------|------------------------------|---------------------------|
| GitHub   | 30%    | PRs merged, CI passing       | CI failing, 0 activity    |
| Sentry   | 25%    | 0 new errors                 | Critical/fatal errors     |
| PostHog  | 15%    | Feature flags active         | No flags configured       |
| Stripe   | 15%    | New subscriptions            | No revenue signal         |
| Beehiiv  | 8%     | Posts published              | No posts found            |
| Dub      | 7%     | Link clicks                  | No tracked links          |

## Built for

Pirates of the Coral-bean Hackathon — authored by [@mohitjeswani01](https://github.com/mohitjeswani01)
