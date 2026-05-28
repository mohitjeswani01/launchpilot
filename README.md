# LaunchPilot

**Know if your product launch is winning — before your CEO asks.**

LaunchPilot is a launch intelligence dashboard that queries 6 data sources in parallel via [Coral SQL](https://github.com/withcoral/coral) and returns a single launch health score.

Built for the **Pirates of the Coral-bean** hackathon by [@mohitjeswani01](https://github.com/mohitjeswani01).

---

## How It Works

```
You type: "New Pricing Page | vercel/myapp | 2024-05-25"

LaunchPilot fires 7 parallel SQL queries:

  coral sql "SELECT merged_at FROM github.pulls WHERE ..."
  coral sql "SELECT count FROM sentry.issues WHERE first_seen >= ..."
  coral sql "SELECT active FROM posthog.feature_flags WHERE ..."
  coral sql "SELECT id FROM stripe.subscriptions WHERE created >= ..."
  coral sql "SELECT subject_line FROM beehiiv.posts WHERE ..."
  coral sql "SELECT clicks FROM dub.links ORDER BY ..."

Returns in ~4s:

  ✅ LAUNCH HEALTHY — Score: 84/100
  ├─ GitHub:  3 PRs merged, all CI passing
  ├─ Sentry:  0 new errors
  ├─ PostHog: 2 active feature flags
  ├─ Stripe:  +7 new subscriptions ($420 MRR)
  ├─ Beehiiv: 3 posts sent (YOUR source)
  └─ Dub:     1,247 link clicks (YOUR source)
```

---

## Setup

### 1. Install Coral

```bash
# macOS/Linux
curl -fsSL https://install.withcoral.com | sh

# Windows (PowerShell)
irm https://install.withcoral.com/windows | iex

coral --version
```

### 2. Clone & install

```bash
git clone https://github.com/yourusername/launchpilot
cd launchpilot/web
npm install
```

### 3. Configure credentials

```bash
cp ../.env.example .env.local
```

Edit `.env.local` with your API keys (see [docs/setup.md](docs/setup.md)).

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Source Stack

| Source | Type | What it provides |
|--------|------|-----------------|
| GitHub | **Core** | PR merges, CI health, issue spikes |
| Sentry | **Core** | Error rate since launch |
| PostHog | **Core** | Feature flag exposure, user adoption |
| Stripe | **Core** | Revenue delta post-launch |
| Beehiiv | **Community** ⭐ | Newsletter open/click rates |
| Dub | **Community** ⭐ | Launch link analytics |

⭐ Community sources authored by [@mohitjeswani01](https://github.com/mohitjeswani01)

---

## Architecture

```
launchpilot/
├── web/                  Next.js 16 (App Router)
│   └── src/
│       ├── app/          Routes + API endpoints
│       ├── components/   UI components
│       └── lib/          Coral client, scoring, types
├── queries/              Raw SQL query files
├── coral-config/         Workspace config
└── docs/                 Setup + demo guide
```

---

## License

MIT
