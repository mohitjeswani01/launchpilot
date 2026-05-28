// ============================================================
// LaunchPilot: App-wide constants
// ============================================================

export const APP_NAME = "LaunchPilot";

export const SOURCES = [
  { id: "github",  label: "GitHub",  icon: "⚡", type: "core",      color: "#6e7681" },
  { id: "sentry",  label: "Sentry",  icon: "🐛", type: "core",      color: "#7c3aed" },
  { id: "posthog", label: "PostHog", icon: "📊", type: "core",      color: "#f97316" },
  { id: "stripe",  label: "Stripe",  icon: "💳", type: "core",      color: "#635bff" },
  { id: "beehiiv", label: "Beehiiv", icon: "📧", type: "community", color: "#f59e0b" },
  { id: "dub",     label: "Dub",     icon: "🔗", type: "community", color: "#22c55e" },
] as const;

export const HEALTH_THRESHOLDS = {
  healthy: 70,
  at_risk: 45,
} as const;

export const SCORING_WEIGHTS = {
  github:  20,
  sentry:  30,
  posthog: 20,
  stripe:  25,
  beehiiv: 10,
  dub:     15,
} as const;
