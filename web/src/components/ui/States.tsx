"use client";

import { motion } from "framer-motion";
import { Loader2, Zap, ArrowRight } from "lucide-react";

/* ─── Loading stages ────────────────────────────────────────── */
const STAGES = [
  { label: "Connecting to Coral SQL engine",   icon: "⚡", delay: 0   },
  { label: "Querying GitHub PRs & CI runs",    icon: "⚡", delay: 0.6 },
  { label: "Scanning Sentry error logs",       icon: "🐛", delay: 1.2 },
  { label: "Fetching PostHog feature flags",   icon: "📊", delay: 1.6 },
  { label: "Pulling Stripe revenue signals",   icon: "💳", delay: 2.0 },
  { label: "Checking Beehiiv newsletter reach",icon: "📧", delay: 2.4 },
  { label: "Loading Dub link analytics",       icon: "🔗", delay: 2.8 },
  { label: "Scoring launch health…",           icon: "✨", delay: 3.2 },
];

/* ─── Source definitions for explainer ─────────────────────── */
const SOURCES = [
  { icon: "⚡", name: "GitHub",  desc: "PRs · CI runs"     },
  { icon: "🐛", name: "Sentry",  desc: "Errors · crashes"  },
  { icon: "📊", name: "PostHog", desc: "Flags · adoption"  },
  { icon: "💳", name: "Stripe",  desc: "Revenue · subs"    },
  { icon: "📧", name: "Beehiiv", desc: "Newsletter reach", star: true },
  { icon: "🔗", name: "Dub",     desc: "Link analytics",   star: true },
];

const R = 34;
const CIRC = 2 * Math.PI * R; // 213.6

/* ─── Loading State ─────────────────────────────────────────── */
export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="card"
      style={{ padding: 32 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={20} color="var(--color-accent)" />
        </motion.div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-1)" }}>
            Analyzing your launch
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
            Running 7 parallel SQL queries via Coral…
          </div>
        </div>
      </div>

      {/* Stage list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STAGES.map((stage, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: stage.delay, duration: 0.3 }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: stage.delay + 0.1, type: "spring" }}
              style={{ fontSize: 14, width: 20, textAlign: "center" }}
            >
              {stage.icon}
            </motion.span>
            <span style={{ fontSize: 12.5, color: "var(--color-text-2)", flex: 1 }}>
              {stage.label}
            </span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: stage.delay + 0.3 }}
            >
              <div className="shimmer" style={{ width: 48, height: 6, borderRadius: 3 }} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 24,
          height: 3,
          borderRadius: 2,
          background: "var(--color-surface-3)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--color-accent) 0%, #818cf8 100%)",
            borderRadius: 2,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Empty State — "What is LaunchPilot?" explainer ────────── */
export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="card"
      style={{ overflow: "hidden" }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: "32px 28px 26px",
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          className="glow-orb"
          style={{
            width: 260,
            height: 260,
            background: "var(--color-accent)",
            opacity: 0.07,
            top: -80,
            right: -60,
          }}
        />

        {/* Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={13} color="#fff" fill="#fff" />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-accent)",
            }}
          >
            Launch Intelligence
          </span>
        </div>

        {/* Headline */}
        <h3
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.2,
            color: "var(--color-text-1)",
            marginBottom: 10,
            position: "relative",
          }}
        >
          Understand launch impact.<br />
          <span style={{ color: "var(--color-text-3)" }}>Before your team asks.</span>
        </h3>

        {/* Subtext */}
        <p
          style={{
            fontSize: 13.5,
            color: "var(--color-text-3)",
            maxWidth: 520,
            lineHeight: 1.75,
            position: "relative",
          }}
        >
          Connect your stack once. LaunchPilot runs{" "}
          <span style={{ color: "var(--color-text-2)", fontWeight: 500 }}>
            7 parallel SQL queries
          </span>{" "}
          across 6 live data sources and returns a launch health score in seconds.
          No ETL, no warehouse, no waiting.
        </p>
      </div>

      {/* ── 3-step flow diagram ───────────────────────────────── */}
      <div style={{ padding: "24px 28px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            color: "var(--color-text-3)",
            marginBottom: 16,
          }}
        >
          How it works
        </div>

        <div
          className="flow-layout"
          style={{ display: "flex", alignItems: "stretch", gap: 0 }}
        >
          {/* Step 1: Data Sources */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="step-card"
            style={{ flex: "1 1 0" }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-accent)",
                marginBottom: 14,
              }}
            >
              01 · Data Sources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SOURCES.map((s) => (
                <div key={s.name} className="source-chip">
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-1)",
                    }}
                  >
                    {s.name}
                  </span>
                  {s.star && (
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--color-accent)",
                        fontWeight: 700,
                      }}
                    >
                      ★
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-3)",
                      marginLeft: "auto",
                    }}
                  >
                    {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flow-connector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <ArrowRight size={16} />
          </motion.div>

          {/* Step 2: Coral SQL */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="step-card"
            style={{ flex: "1.1 1 0" }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-accent)",
                marginBottom: 14,
              }}
            >
              02 · Coral SQL Engine
            </div>

            <div
              className="code-block"
              style={{ fontSize: 11, padding: 12, lineHeight: 2 }}
            >
              <span className="sql-comment">-- 7 parallel queries</span>
              {"\n"}
              <span className="sql-keyword">SELECT</span> g.merged_at,{"\n"}
              {"       "}s.error_count,{"\n"}
              {"       "}st.revenue, d.clicks{"\n"}
              <span className="sql-keyword">FROM</span>{" "}
              <span className="sql-table">github.pulls</span> g{"\n"}
              <span className="sql-keyword">JOIN</span>{" "}
              <span className="sql-table">sentry.issues</span> s{"\n"}
              <span className="sql-keyword">JOIN</span>{" "}
              <span className="sql-table">stripe.subscriptions</span>...
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--color-text-3)",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--color-green)",
                  boxShadow: "0 0 5px var(--color-green)",
                  flexShrink: 0,
                }}
              />
              Data resolved locally · No ETL
            </div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flow-connector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <ArrowRight size={16} />
          </motion.div>

          {/* Step 3: Health Verdict */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 }}
            className="step-card"
            style={{
              flex: "0.8 1 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-accent)",
                marginBottom: 16,
                alignSelf: "flex-start",
              }}
            >
              03 · Health Verdict
            </div>

            {/* Animated preview ring */}
            <svg width="84" height="84" viewBox="0 0 84 84" style={{ marginBottom: 8 }}>
              <circle
                cx="42" cy="42" r={R}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              <motion.circle
                cx="42" cy="42" r={R}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC * 0.06 }}
                transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1], delay: 0.6 }}
                style={{ transform: "rotate(-90deg)", transformOrigin: "42px 42px" }}
              />
              <text
                x="42" y="47"
                textAnchor="middle"
                fill="var(--color-green)"
                fontSize="16"
                fontWeight="800"
                fontFamily="monospace"
              >
                94
              </text>
            </svg>

            <div
              style={{ fontSize: 13, fontWeight: 600, color: "var(--color-green)" }}
            >
              Launch Healthy ✓
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-3)",
                marginTop: 3,
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              Health Score
            </div>

            <div
              style={{
                marginTop: 14,
                padding: "5px 10px",
                background: "var(--color-surface-2)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: 11,
                color: "var(--color-text-3)",
              }}
            >
              7 queries · ~4s avg
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 28px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {[
          "All queries via coral sql",
          "No ETL · No warehouse",
          "Built for Pirates of the Coral-bean",
        ].map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {i > 0 && (
              <span style={{ color: "var(--color-border-2)", fontSize: 12 }}>·</span>
            )}
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item}
            </span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Error State ────────────────────────────────────────────── */
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card"
      style={{ padding: 24, border: "1px solid var(--color-red-border)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 18 }}>❌</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-red)",
              marginBottom: 4,
            }}
          >
            Analysis Failed
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--color-text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {message}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-outline"
              style={{ marginTop: 14 }}
            >
              Retry Analysis
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
