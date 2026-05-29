# Architecture

LaunchPilot is a launch intelligence platform built on Coral SQL.

## System overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LaunchPilot                                  │
│                                                                     │
│  ┌───────────────┐     ┌─────────────────┐     ┌────────────────┐  │
│  │  Next.js UI   │────▶│  /api/analyze   │────▶│  Coral SQL     │  │
│  │  (React 19)   │     │  (POST)         │     │  Engine        │  │
│  │               │     │                 │     │                │  │
│  │  • Form       │     │  • Builds 7     │     │  • github      │  │
│  │  • Verdict    │     │    SQL queries  │     │  • sentry      │  │
│  │  • Metrics    │     │  • Runs in      │     │  • posthog     │  │
│  │  • SQL panel  │     │    parallel     │     │  • stripe      │  │
│  │               │     │  • Scores       │     │  • beehiiv ⭐  │  │
│  └───────────────┘     │    launch       │     │  • dub ⭐      │  │
│                        └─────────────────┘     └────────────────┘  │
│                               │                        │            │
│                        ┌─────────────────┐             │            │
│                        │    Scorer       │◀────────────┘            │
│                        │                 │                          │
│                        │  Weighted model │                          │
│                        │  0–100 score    │                          │
│                        └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘

⭐ = Community source authored for this hackathon
```

## Request lifecycle

1. User fills in: feature name, GitHub repo (`owner/repo`), launch date
2. Frontend `POST /api/analyze` with the form payload
3. API route builds 7 SQL queries (see `web/src/lib/queries.ts`)
4. Queries run in parallel via `runParallelQueries()` → `coral sql ... --format json`
5. Coral executes each query against the registered source and returns JSON rows
6. The scorer (`web/src/lib/scorer.ts`) weights each result into a 0–100 score
7. Key insights and recommended actions are derived from the metric mix
8. Full result returned to the frontend for display

## Key files

```
launchpilot/
├── web/
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Main dashboard page
│       │   └── api/
│       │       ├── analyze/route.ts  # Core analysis endpoint
│       │       └── sources/route.ts  # Source health check
│       ├── lib/
│       │   ├── coral.ts              # Coral CLI bridge
│       │   ├── queries.ts            # All 7 SQL query builders
│       │   ├── scorer.ts             # Launch health scoring model
│       │   └── types.ts              # Shared TypeScript types
│       └── components/
│           ├── dashboard/            # Header, LaunchForm, SourceBadge
│           ├── results/              # VerdictBanner, MetricGrid, SqlEvidence
│           └── ui/                   # LoadingState, EmptyState, ErrorState
├── queries/                          # Raw SQL files (reference)
├── coral-config/                     # Coral workspace setup docs
├── agent/                            # Coral agent skill definition
├── scripts/                          # setup-sources.sh
└── docs/                             # This documentation
```

## Coral integration (`web/src/lib/coral.ts`)

LaunchPilot invokes Coral as a CLI subprocess:

```typescript
const command = `${CORAL_BIN} sql "${sanitizedSql}" --format json`;
const { stdout } = await execAsync(command, { env: buildEnv(), timeout: 30_000 });
const rows = JSON.parse(stdout.trim());
```

`CORAL_BIN` resolves in this order:
1. `CORAL_BIN` env var (explicit override — used for WSL/Windows setups)
2. `wsl coral` — auto-detected when `process.platform === 'win32'`
3. `coral` — default for Linux / macOS / WSL

## Scoring model

```
health_score = weighted_sum(per_source_scores) + confidence_bonus

Per-source weights:
  GitHub  30%   (PRs merged + CI status)
  Sentry  25%   (error count and severity)
  PostHog 15%   (feature flag adoption)
  Stripe  15%   (new subscriptions)
  Beehiiv  8%   (newsletter posts)
  Dub      7%   (link clicks)

Verdicts:
  80–100  → Launch Healthy   (green)
  50–79   → Needs Attention  (amber)
  0–49    → Launch Failing   (red)
```

## Community sources

Two new Coral sources were authored for this project and submitted to the
Coral community source catalog:

| Source  | Description                              |
|---------|------------------------------------------|
| beehiiv | Newsletter analytics — posts, open rates |
| dub     | Link tracking — clicks, leads, UTM data  |

Source spec files are stored in `queries/beehiiv.sql` and `queries/dub.sql`.

## Vercel deployment

Coral is a local binary and cannot run in Vercel serverless functions.
When `VERCEL=1` is detected, the analyze route returns a realistic demo
analysis using the exact SQL that would have been executed locally.

Sources still show as `live` on Vercel when API keys are configured.
