# Setup Guide

Complete local setup for LaunchPilot.

## Prerequisites

| Tool        | Version   | Install                                       |
|-------------|-----------|-----------------------------------------------|
| Node.js     | ≥ 20      | [nodejs.org](https://nodejs.org)              |
| Coral CLI   | latest    | `curl -fsSL https://getcoraldb.dev/install.sh \| bash` |
| Git         | any       | [git-scm.com](https://git-scm.com)           |

**Windows users**: Run everything inside WSL (Ubuntu). Node.js and Coral should
both be installed inside WSL, not on Windows directly.

## 1. Clone the repo

```bash
git clone https://github.com/mohitjeswani01/launchpilot.git
cd launchpilot
```

## 2. Set environment variables

```bash
cp web/.env.example web/.env.local
# Edit web/.env.local and fill in all API keys
```

See the [credential reference table](../coral-config/README.md#source-credential-reference)
for where to get each key.

## 3. Install dependencies

```bash
cd web && npm install
```

## 4. Register Coral sources

```bash
# Make sure your .env.local keys are exported in the shell
set -a && source web/.env.local && set +a

# Run the setup script (registers all 6 sources)
bash scripts/setup-sources.sh
```

Or register manually:

```bash
coral source add github
coral source add sentry
coral source add posthog
coral source add stripe
coral source add beehiiv
coral source add dub
```

Verify:

```bash
coral sql "SELECT login FROM github.user LIMIT 1" --format json
```

## 5. Start the dev server

```bash
# From inside web/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 6. Run an analysis

1. Enter a feature name (e.g., `LaunchPilot v1`)
2. Enter your GitHub repo (e.g., `mohitjeswani01/launchpilot`)
3. Select the launch date
4. Click **Analyze Launch**

LaunchPilot will run 7 parallel SQL queries and return a health score in
seconds.

## Windows / WSL notes

On Windows, run the dev server from **Windows PowerShell** (not WSL) to avoid
Turbopack issues with the `/mnt/d/` filesystem mount:

```powershell
# Windows PowerShell
cd D:\launchpilot\web
npm run dev
```

Set `CORAL_BIN` in `.env.local` so Node.js on Windows can find coral in WSL:

```env
CORAL_BIN=wsl /home/<your-username>/.cargo/bin/coral
```

## Vercel deployment

See the root [README.md](../README.md#deploy-to-vercel) for Vercel setup.
Coral queries run in demo mode on Vercel since the binary is not available
in serverless environments.

## Troubleshooting

**`coral: command not found`**
```bash
# Add cargo bin to PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

**`/api/sources` returns 404 on Windows**
Use Windows PowerShell to run `npm run dev`, not WSL.

**Source shows as `error`**
Run `coral sql "SELECT ..." --format json` directly to see the raw error.
Usually a missing or incorrect API key.

**`lightningcss` build error in WSL**
Delete `node_modules` and reinstall from inside WSL:
```bash
rm -rf node_modules .next && npm install
```
