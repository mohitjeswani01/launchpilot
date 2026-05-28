#!/usr/bin/env bash
# =============================================================
# LaunchPilot — Coral Source Setup Script
# Run from WSL: bash /mnt/d/launchpilot/scripts/setup-sources.sh
# =============================================================

set -e

echo ""
echo "🏴‍☠️  LaunchPilot — Coral Source Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Check coral is available ──────────────────────────────────
if ! command -v coral &>/dev/null; then
  echo "❌ coral not found in PATH. Make sure Coral CLI is installed."
  exit 1
fi

echo "✅ coral $(coral --version | awk '{print $2}') found"
echo ""

# ── Helper: add source if credentials are set ─────────────────
add_source() {
  local name="$1"
  local check_var="$2"

  if [ -z "${!check_var}" ]; then
    echo "⚠️  Skipping $name — $check_var not set"
    return
  fi

  echo "➕ Adding source: $name"
  if coral source add "$name" 2>&1; then
    echo "   ✅ $name registered"
  else
    echo "   ⚠️  $name may already exist (that's fine)"
  fi
}

# ── Add Sources ───────────────────────────────────────────────

# GitHub (core)
add_source "github" "GITHUB_TOKEN"

# Sentry (core)
add_source "sentry" "SENTRY_AUTH_TOKEN"

# PostHog (core)
add_source "posthog" "POSTHOG_API_KEY"

# Stripe (core)
add_source "stripe" "STRIPE_API_KEY"

# Beehiiv (community — you built this!)
add_source "beehiiv" "BEEHIIV_API_KEY"

# Dub (community — you built this! likely already registered)
add_source "dub" "DUB_API_KEY"

# ── Verify ────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Registered schemas:"
coral sql "SELECT DISTINCT schema_name FROM coral.tables" 2>/dev/null || echo "(query failed)"

echo ""
echo "🚀 Setup complete! Start the app:"
echo "   cd /mnt/d/launchpilot/web && npm run dev"
echo ""
