# Data Sources

LaunchPilot queries 6 data sources through Coral SQL. Four are Coral core
sources; two were authored as community sources for this project.

---

## Core sources

### ⚡ GitHub

Tracks engineering velocity and CI health after a launch.

**Queries:**
- `github.pulls` — merged pull requests since launch date
- `github.repo_action_runs` — CI workflow run status and conclusions

**Credentials:** `GITHUB_TOKEN` — classic personal access token with `repo` scope

**Key signals:**
- Number of PRs merged → engineering activity
- CI conclusion (`success` / `failure`) → stability

---

### 🐛 Sentry

Tracks error rate and crash frequency after a release.

**Queries:**
- `sentry.issues` — new issues created since launch date, filtered by severity

**Credentials:**
- `SENTRY_TOKEN` — auth token from sentry.io → Settings → API → Auth Tokens
- `SENTRY_ORG` — organization slug
- `SENTRY_PROJECT` — project slug

**Key signals:**
- Zero new issues → clean launch (positive)
- `fatal` or `critical` level issues → launch failing (negative)

---

### 📊 PostHog

Tracks feature flag adoption after rollout.

**Queries:**
- `posthog.feature_flags` — active flags and rollout percentages

**Credentials:**
- `POSTHOG_API_KEY` — project API key
- `POSTHOG_PROJECT_ID` — numeric project ID

**Key signals:**
- Active flags with rollout → feature is live and ramping
- No flags → feature may not be behind a flag yet

---

### 💳 Stripe

Tracks subscription growth and revenue signals post-launch.

**Queries:**
- `stripe.subscriptions` — new subscriptions created since launch timestamp

**Credentials:** `STRIPE_API_KEY` — use `sk_test_` in development

**Key signals:**
- New subscriptions → launch driving conversions
- Zero new subs → no revenue signal yet

---

## Community sources

These two sources were authored and submitted to the Coral community catalog
as part of the Pirates of the Coral-bean hackathon.

### 📧 Beehiiv ⭐ Community

Tracks newsletter reach and audience engagement tied to a launch.

**Queries:**
- `beehiiv.posts` — posts published since the launch date
- `beehiiv.publications` — publication metadata

**Credentials:**
- `BEEHIIV_API_KEY` — from app.beehiiv.com → Settings → API
- `BEEHIIV_PUBLICATION_ID` — your publication ID (starts with `pub_`)

**Key signals:**
- Posts published → launch announcement went out
- Open rate (from post stats) → audience engagement

**Source SQL reference:** [`queries/beehiiv.sql`](../queries/beehiiv.sql)

---

### 🔗 Dub ⭐ Community

Tracks link-in-bio and launch announcement link analytics.

**Queries:**
- `dub.links` — all tracked links with click counts and lead data

**Credentials:** `DUB_API_KEY` — from app.dub.co → Settings → API

**Key signals:**
- Click count → distribution reach (social posts, newsletters, etc.)
- Lead count → high-intent conversions from tracked links

**Source SQL reference:** [`queries/dub.sql`](../queries/dub.sql)

---

## Adding more sources

To add a new source to LaunchPilot:

1. Register it with `coral source add <source-name>`
2. Add a new SQL query builder in `web/src/lib/queries.ts`
3. Add the query to the parallel run array in `web/src/app/api/analyze/route.ts`
4. Add scoring logic in `web/src/lib/scorer.ts`
5. Add the metric tile configuration in the scorer's metric builder
