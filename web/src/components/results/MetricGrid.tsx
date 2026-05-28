"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { SourceMetric } from "@/lib/types";

type Sentiment = "positive" | "negative" | "warning" | "neutral";

const SOURCE_ICONS: Record<string, string> = {
  github:  "⚡",
  sentry:  "🐛",
  posthog: "📊",
  stripe:  "💳",
  beehiiv: "📧",
  dub:     "🔗",
};

const SENTIMENT_COLORS: Record<Sentiment, { text: string; bg: string; border: string }> = {
  positive: {
    text:   "var(--color-green)",
    bg:     "var(--color-green-dim)",
    border: "var(--color-green-border)",
  },
  negative: {
    text:   "var(--color-red)",
    bg:     "var(--color-red-dim)",
    border: "var(--color-red-border)",
  },
  warning: {
    text:   "var(--color-amber)",
    bg:     "var(--color-amber-dim)",
    border: "var(--color-amber-border)",
  },
  neutral: {
    text:   "var(--color-text-3)",
    bg:     "var(--color-surface-2)",
    border: "var(--color-border)",
  },
};

/* ─── Animated Number ──────────────────────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/* ─── Metric Tile ──────────────────────────────────────────── */
interface MetricTileProps {
  metric: SourceMetric;
  index: number;
}

function MetricTile({ metric, index }: MetricTileProps) {
  const sentimentCfg = SENTIMENT_COLORS[metric.sentiment];
  const icon = SOURCE_ICONS[metric.source] ?? "◆";
  const numericValue =
    typeof metric.value === "number" ? metric.value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`metric-tile ${metric.sentiment}`}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        {/* Source icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: sentimentCfg.bg,
            border: `1px solid ${sentimentCfg.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Status dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: sentimentCfg.text,
            boxShadow:
              metric.sentiment !== "neutral"
                ? `0 0 6px ${sentimentCfg.text}`
                : "none",
            flexShrink: 0,
            marginTop: 4,
          }}
        />
      </div>

      {/* Source label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-text-3)",
          marginBottom: 6,
        }}
      >
        {metric.label}
      </div>

      {/* Primary value */}
      <div
        style={{
          fontSize: numericValue !== null ? 22 : 15,
          fontWeight: 700,
          color: sentimentCfg.text,
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          marginBottom: 6,
          fontFamily: numericValue !== null ? "var(--font-mono)" : "inherit",
          minHeight: 28,
        }}
      >
        {numericValue !== null ? (
          <AnimatedNumber value={numericValue} />
        ) : (
          <span>{String(metric.value ?? "—")}</span>
        )}
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: 12,
          color: "var(--color-text-3)",
          lineHeight: 1.4,
        }}
      >
        {metric.subtext}
      </div>

      {/* Community badge for beehiiv / dub */}
      {(metric.source === "beehiiv" || metric.source === "dub") && (
        <div
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 6px",
            borderRadius: 4,
            background: "var(--color-accent-dim)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--color-accent)",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            COMMUNITY SOURCE
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Metric Grid ──────────────────────────────────────────── */
interface MetricGridProps {
  metrics: SourceMetric[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
      }}
    >
      {metrics.map((metric, i) => (
        <MetricTile key={metric.source} metric={metric} index={i} />
      ))}
    </div>
  );
}
