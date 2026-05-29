# Coral Workspace Configuration

This directory holds Coral workspace configuration for LaunchPilot.

Coral resolves all SQL queries in LaunchPilot against the sources registered
here. Before running the app locally, you must register all 6 sources in your
Coral workspace.

## Prerequisites

Install Coral CLI:

```bash
curl -fsSL https://getcoraldb.dev/install.sh | bash
```

Verify:

```bash
coral --version
```

## Quick setup (automated)

```bash
# From WSL or Linux/macOS — sets all sources in one shot
bash scripts/setup-sources.sh
```

The script reads credentials from environment variables and registers each
source. Set your keys in `.env.local` first (copy from `.env.example`).

## Manual setup

### 1. GitHub

```bash
GITHUB_TOKEN=ghp_xxx coral source add github
```

### 2. Sentry

```bash
SENTRY_TOKEN=sntryu_xxx \
SENTRY_ORG=your-org-slug \
coral source add sentry
```

### 3. PostHog

```bash
POSTHOG_API_KEY=phx_xxx coral source add posthog
```

### 4. Stripe

```bash
STRIPE_API_KEY=sk_test_xxx coral source add stripe
```

### 5. Beehiiv (community source)

```bash
BEEHIIV_API_KEY=xxx coral source add beehiiv
```

### 6. Dub (community source)

```bash
DUB_API_KEY=dub_xxx coral source add dub
```

## Verify registration

```bash
coral sql "SELECT DISTINCT schema_name FROM coral.tables ORDER BY 1"
```

Expected output includes: `beehiiv`, `dub`, `github`, `posthog`, `sentry`, `stripe`

## Test a query

```bash
coral sql "SELECT login FROM github.user LIMIT 1" --format json
```

## Workspace path

Coral stores its workspace configuration in `~/.coral/` by default.
LaunchPilot's backend reads credentials from the process environment and passes
them to Coral via the `CORAL_BIN` environment variable (or auto-detects from
PATH).

## Source credential reference

| Variable                 | Source    | Where to get it                                    |
|--------------------------|-----------|----------------------------------------------------|
| `GITHUB_TOKEN`           | github    | github.com/settings/tokens → classic → `repo`     |
| `SENTRY_TOKEN`           | sentry    | sentry.io → Settings → API → Auth Tokens           |
| `SENTRY_ORG`             | sentry    | Your Sentry org slug                               |
| `SENTRY_PROJECT`         | sentry    | Your Sentry project slug                           |
| `POSTHOG_API_KEY`        | posthog   | app.posthog.com → Project Settings → API Keys      |
| `POSTHOG_PROJECT_ID`     | posthog   | Your PostHog project numeric ID                    |
| `STRIPE_API_KEY`         | stripe    | dashboard.stripe.com/test/apikeys                  |
| `BEEHIIV_API_KEY`        | beehiiv   | app.beehiiv.com → Settings → API                  |
| `BEEHIIV_PUBLICATION_ID` | beehiiv   | Your publication ID (starts with `pub_`)           |
| `DUB_API_KEY`            | dub       | app.dub.co → Settings → API                        |
