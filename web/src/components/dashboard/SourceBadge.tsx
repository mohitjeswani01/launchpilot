"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Minus } from "lucide-react";

type SourceStatus = "live" | "error" | "unconfigured";

const SOURCE_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  github:  { label: "GitHub",  icon: "⚡", color: "#6e7681" },
  sentry:  { label: "Sentry",  icon: "🐛", color: "#7c3aed" },
  posthog: { label: "PostHog", icon: "📊", color: "#f97316" },
  stripe:  { label: "Stripe",  icon: "💳", color: "#635bff" },
  beehiiv: { label: "Beehiiv", icon: "📧", color: "#f59e0b" },
  dub:     { label: "Dub",     icon: "🔗", color: "#22c55e" },
};

interface SourceBadgeProps {
  name: string;
  label?: string;
  status: SourceStatus;
  compact?: boolean;
}

export function SourceBadge({ name, label, status, compact = false }: SourceBadgeProps) {
  const meta = SOURCE_META[name] ?? { label: name, icon: "◆", color: "#888" };
  const displayLabel = label ?? meta.label;

  const statusConfig = {
    live:          { icon: CheckCircle2, color: "var(--color-green)",  bg: "var(--color-green-dim)",  border: "var(--color-green-border)",  text: "Live" },
    error:         { icon: XCircle,      color: "var(--color-red)",    bg: "var(--color-red-dim)",    border: "var(--color-red-border)",    text: "Error" },
    unconfigured:  { icon: Minus,        color: "var(--color-text-3)", bg: "var(--color-surface-3)",  border: "var(--color-border)",        text: "Not set" },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        title={`${displayLabel}: ${cfg.text}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 8px",
          borderRadius: 6,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          cursor: "default",
        }}
      >
        <span style={{ fontSize: 13 }}>{meta.icon}</span>
        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>
          {displayLabel}
        </span>
        <StatusIcon size={11} color={cfg.color} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderRadius: 10,
        background: "var(--color-surface-2)",
        border: `1px solid ${status === "live" ? cfg.border : "var(--color-border)"}`,
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span style={{ fontSize: 13, color: "var(--color-text-1)", fontWeight: 500 }}>
          {displayLabel}
        </span>
        {(name === "beehiiv" || name === "dub") && (
          <span
            style={{
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 3,
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            COMMUNITY
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <StatusIcon size={13} color={cfg.color} />
        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>
          {cfg.text}
        </span>
      </div>
    </motion.div>
  );
}

interface SourceStatusPanelProps {
  sources: Array<{ name: string; label: string; status: SourceStatus; configured: boolean }>;
}

export function SourceStatusPanel({ sources }: SourceStatusPanelProps) {
  const liveCount = sources.filter((s) => s.status === "live").length;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-text-3)",
          }}
        >
          Data Sources
        </span>
        <span
          style={{
            fontSize: 11,
            color: liveCount === sources.length ? "var(--color-green)" : "var(--color-text-3)",
            fontWeight: 500,
          }}
        >
          {liveCount}/{sources.length} live
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sources.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SourceBadge
              name={s.name}
              label={s.label}
              status={s.status}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
