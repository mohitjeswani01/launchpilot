<div align="center">

# ⚡ LaunchPilot

**Know if your launch is winning — before your CEO asks.**

[![Built with Coral SQL](https://img.shields.io/badge/Built%20with-Coral%20SQL-6366f1?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iOCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==)](https://getcoraldb.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Pirates of the Coral-bean](https://img.shields.io/badge/Hackathon-Pirates%20of%20the%20Coral--bean-f59e0b?style=flat-square)](https://www.wemakedevs.org/hackathons/coral)

</div>

---

## What is LaunchPilot?

LaunchPilot replaces 6 manual dashboards with a single SQL query.

After shipping a feature or product, most teams have to manually check:
GitHub for CI status, Sentry for errors, PostHog for adoption, Stripe for revenue, Beehiiv for newsletter reach, and Dub for link clicks. That's 6 tabs, 15 minutes, and still no single answer to "is this launch going well?"

LaunchPilot connects all 6 sources through **[Coral SQL](https://withcoral.com/)**, runs 7 parallel queries, and returns a 0–100 launch health score in seconds — with per-source signals, key insights, and recommended next steps.

```
Enter repo + launch date → 7 SQL queries → Health Score
```

---

## Demo

> **Live demo** → [launchpilot.vercel.app](https://launchpilot.vercel.app)  
> The Vercel deployment runs in demo mode (Coral requires a local binary).  
> Clone and run locally for real data from your own sources.

---

## Features

- **6 live data sources** — GitHub, Sentry, PostHog, Stripe, Beehiiv, Dub
- **7 parallel SQL queries** — all executed simultaneously via Coral
- **Health score 0–100** — weighted model across engineering, reliability, adoption, revenue, and reach
- **Animated score ring** — real-time SVG progress visualization
- **SQL Evidence panel** — every query, row count, and timing shown transparently
- **Source breakdown** — per-source signals with sentiment indicators
- **Key insights + recommended actions** — derived from the metric mix
- **"What is LaunchPilot?" explainer** — interactive 3-step flow diagram in the empty state
- **Vercel deployment** — auto-detected demo mode for serverless environments
- **2 community sources** — Beehiiv and Dub authored for the Coral catalog

---

## Tech stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 16, React 19, Framer Motion     |
| Styling     | Vanilla CSS with design tokens          |
| Data layer  | **Coral SQL** (local binary)            |
| Sources     | GitHub, Sentry, PostHog, Stripe, Beehiiv, Dub |
| Deployment  | Vercel (demo mode), local (real data)   |
| Language    | TypeScript 5 (strict)                   |

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- [Coral CLI](https://withcoral.com/) installed and in PATH
- API keys for the sources you want to query

### 1. Clone

```bash
git clone https://github.com/mohitjeswani01/launchpilot.git
cd launchpilot
```

### 2. Configure environment

```bash
cp web/.env.example web/.env.local
# Fill in your API keys
```

| Variable                 | Source    | Where to get it                                    |
|--------------------------|-----------|----------------------------------------------------|
| `GITHUB_TOKEN`           | GitHub    | github.com/settings/tokens → classic → `repo`     |
| `SENTRY_TOKEN`           | Sentry    | sentry.io → Settings → API → Auth Tokens           |
| `SENTRY_ORG`             | Sentry    | Your org slug                                      |
| `SENTRY_PROJECT`         | Sentry    | Your project slug                                  |
| `POSTHOG_API_KEY`        | PostHog   | app.posthog.com → Project Settings → API Keys      |
| `POSTHOG_PROJECT_ID`     | PostHog   | Numeric project ID                                 |
| `STRIPE_API_KEY`         | Stripe    | dashboard.stripe.com/test/apikeys                  |
| `BEEHIIV_API_KEY`        | Beehiiv   | app.beehiiv.com → Settings → API                  |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv   | Your `pub_xxx` ID                                  |
| `DUB_API_KEY`            | Dub       | app.dub.co → Settings → API                        |

### 3. Register Coral sources

```bash
# Export your env vars, then:
bash scripts/setup-sources.sh
```

Or manually:

```bash
coral source add github
coral source add sentry
coral source add posthog
coral source add stripe
coral source add beehiiv
coral source add dub
```

### 4. Install and run

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

```
User input: feature name · GitHub repo · launch date
                │
                ▼
        POST /api/analyze
                │
    ┌───────────┴────────────┐
    │   7 parallel queries   │
    │   via Coral SQL        │
    │                        │
    │  github.pulls          │
    │  github.repo_action_runs│
    │  sentry.issues         │
    │  posthog.feature_flags │
    │  stripe.subscriptions  │
    │  beehiiv.posts         │
    │  dub.links             │
    └───────────┬────────────┘
                │
                ▼
        Weighted scorer
        (GitHub 30% · Sentry 25% · PostHog 15%
         Stripe 15% · Beehiiv 8% · Dub 7%)
                │
                ▼
        Health Score 0–100
        Verdict · Insights · Actions
```

All queries are executed locally through Coral. No data leaves your machine
except to the configured API providers.

---

## Project structure

```
launchpilot/
├── web/                        # Next.js application
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # Main dashboard
│       │   └── api/
│       │       ├── analyze/    # Core analysis endpoint
│       │       └── sources/    # Source health check
│       └── lib/
│           ├── coral.ts        # Coral CLI bridge
│           ├── queries.ts      # SQL query builders
│           ├── scorer.ts       # Health scoring model
│           └── types.ts        # TypeScript types
├── queries/                    # Raw SQL reference files
│   ├── github.sql
│   ├── sentry.sql
│   ├── posthog.sql
│   ├── stripe.sql
│   ├── beehiiv.sql             # ⭐ Community source
│   └── dub.sql                 # ⭐ Community source
├── agent/                      # Coral agent skill
│   ├── SKILL.md
│   └── agents/openai.yaml
├── coral-config/               # Coral workspace setup
├── docs/                       # Documentation
│   ├── setup.md
│   ├── architecture.md
│   └── sources.md
└── scripts/
    └── setup-sources.sh        # Automated source registration
```

---

## Deploy to Vercel

1. **Import** `mohitjeswani01/launchpilot` on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `web`
3. Add all environment variables from the table above
4. Click **Deploy**

> **Note:** Coral is a local binary and cannot run in Vercel serverless functions.
> The analyze endpoint auto-detects `VERCEL=1` and returns realistic demo data.
> The SQL evidence panel still shows the exact queries that would run locally.

---

## Community sources

Two new Coral sources were authored for this project:

### 📧 Beehiiv
Query newsletter analytics — posts, open rates, subscriber counts — directly
through Coral SQL. Reference: [`queries/beehiiv.sql`](queries/beehiiv.sql)

### 🔗 Dub
Query link tracking data — clicks, leads, UTM analytics — through Coral SQL.
Reference: [`queries/dub.sql`](queries/dub.sql)

---

## Coral agent skill

LaunchPilot ships as a Coral agent skill. See [`agent/SKILL.md`](agent/SKILL.md).

```
$coral-launch-pilot
```

Use it to analyze any launch directly from your AI assistant:

```
Use $coral-launch-pilot to analyze the health of mohitjeswani01/launchpilot
launched on 2026-05-29 and tell me the top 3 risks.
```

---

## Windows / WSL setup

Run the dev server from **Windows PowerShell** (not WSL) to avoid Turbopack
filesystem issues with `/mnt/d/` mounts:

```powershell
cd D:\launchpilot\web
npm run dev
```

Set the coral binary path in `.env.local`:

```env
CORAL_BIN=wsl /home/<your-username>/.cargo/bin/coral
```

Full guide: [`docs/setup.md`](docs/setup.md)

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/setup.md](docs/setup.md) | Full local setup guide |
| [docs/architecture.md](docs/architecture.md) | System design and data flow |
| [docs/sources.md](docs/sources.md) | All 6 data sources documented |
| [coral-config/README.md](coral-config/README.md) | Coral workspace configuration |
| [agent/SKILL.md](agent/SKILL.md) | Coral agent skill definition |

---

## Built for

**[Pirates of the Coral-bean](https://www.wemakedevs.org/hackathons/coral)** hackathon

> Coral is an open-source tool that lets you query any API or database using SQL.
> LaunchPilot demonstrates how Coral can unify completely different APIs
> (REST, webhooks, SaaS) behind a single SQL interface for real-time intelligence.

---

<div align="center">

Made by [@mohitjeswani01](https://github.com/mohitjeswani01)

</div>
