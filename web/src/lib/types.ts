// ============================================================
// LaunchPilot: TypeScript Types
// Shared interfaces for launch analysis data
// ============================================================

export type LaunchStatus = 'healthy' | 'at_risk' | 'failing' | 'unknown';
export type SourceStatus = 'live' | 'error' | 'unconfigured';

// ─── Source Metric ───────────────────────────────────────────
export interface SourceMetric {
  source: 'github' | 'sentry' | 'posthog' | 'stripe' | 'beehiiv' | 'dub';
  label: string;
  status: SourceStatus;
  value: string | number | null;
  subtext: string;
  icon: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  sql?: string;          // The SQL used to get this metric
  rawRows?: Record<string, unknown>[];
}

// ─── Launch Analysis ─────────────────────────────────────────
export interface LaunchAnalysis {
  id: string;
  featureName: string;
  repo: string;
  owner: string;
  launchDate: string;        // ISO string
  analyzedAt: string;        // ISO string

  // Overall verdict
  status: LaunchStatus;
  healthScore: number;       // 0–100
  verdictTitle: string;      // "Launch Healthy" | "Needs Attention" | "Launch Failing"
  verdictSummary: string;    // 1–2 sentence AI summary

  // Per-source metrics
  metrics: SourceMetric[];

  // AI-generated insights
  keyInsights: string[];     // Bullet points from LLM
  recommendedActions: string[];

  // Evidence
  sqlQueries: Array<{
    source: string;
    sql: string;
    rowCount: number;
    durationMs: number;
  }>;
}

// ─── API Request / Response ──────────────────────────────────
export interface AnalyzeRequest {
  featureName: string;
  owner: string;
  repo: string;
  launchDate: string;  // ISO date string
  // Optional overrides per source
  sentryOrg?: string;
  sentryProject?: string;
  posthogProjectId?: string;
  beehiivPublicationId?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: LaunchAnalysis;
  error?: string;
}

export interface SourceHealthResponse {
  sources: Array<{
    name: string;
    status: SourceStatus;
    label: string;
    configured: boolean;
  }>;
}

// ─── Scoring ─────────────────────────────────────────────────
export interface ScoringInput {
  githubRows: Record<string, unknown>[];
  sentryRows: Record<string, unknown>[];
  posthogRows: Record<string, unknown>[];
  stripeRows: Record<string, unknown>[];
  beehiivRows: Record<string, unknown>[];
  dubRows: Record<string, unknown>[];
}
