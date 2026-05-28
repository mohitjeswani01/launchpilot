"use client";

import { motion } from "framer-motion";
import { Loader2, Database, Zap } from "lucide-react";

const STAGES = [
  { label: "Connecting to Coral SQL engine", icon: "⚡", delay: 0 },
  { label: "Querying GitHub PRs & CI runs", icon: "⚡", delay: 0.6 },
  { label: "Scanning Sentry error logs", icon: "🐛", delay: 1.2 },
  { label: "Fetching PostHog feature flags", icon: "📊", delay: 1.6 },
  { label: "Pulling Stripe revenue signals", icon: "💳", delay: 2.0 },
  { label: "Checking Beehiiv newsletter stats", icon: "📧", delay: 2.4 },
  { label: "Loading Dub link analytics", icon: "🔗", delay: 2.8 },
  { label: "Scoring launch health…", icon: "✨", delay: 3.2 },
];

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={20} color="var(--color-accent)" />
        </motion.div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-text-1)",
            }}
          >
            Analyzing your launch
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-3)",
              marginTop: 2,
            }}
          >
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: stage.delay + 0.1, type: "spring" }}
              style={{ fontSize: 14, width: 20, textAlign: "center" }}
            >
              {stage.icon}
            </motion.span>
            <span
              style={{
                fontSize: 12.5,
                color: "var(--color-text-2)",
                flex: 1,
              }}
            >
              {stage.label}
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: stage.delay + 0.3 }}
            >
              <div
                className="shimmer"
                style={{
                  width: 48,
                  height: 6,
                  borderRadius: 3,
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
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
            background:
              "linear-gradient(90deg, var(--color-accent) 0%, #818cf8 100%)",
            borderRadius: 2,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */
export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 32px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "var(--color-accent-dim)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Zap size={24} color="var(--color-accent)" fill="var(--color-accent)" />
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "var(--color-text-1)",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        Ready to analyze
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-3)",
          maxWidth: 300,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Enter a GitHub repo and launch date. LaunchPilot will query 6 data
        sources in parallel and return a launch health score.
      </p>

      {/* Mini SQL preview */}
      <div
        className="code-block"
        style={{
          maxWidth: 380,
          width: "100%",
          textAlign: "left",
          fontSize: 11.5,
        }}
      >
        <span className="sql-comment">-- LaunchPilot runs this for you</span>
        {"\n"}
        <span className="sql-keyword">SELECT</span> g.merged_at, s.error_count,
        {"\n"}
        {"       "}st.new_subs, b.open_rate, d.clicks
        {"\n"}
        <span className="sql-keyword">FROM</span>{" "}
        <span className="sql-table">github.pulls</span> g
        {"\n"}
        <span className="sql-keyword">JOIN</span>{" "}
        <span className="sql-table">sentry.issues</span> s ...
        {"\n"}
        <span className="sql-keyword">JOIN</span>{" "}
        <span className="sql-table">stripe.subscriptions</span> st ...
        {"\n"}
        <span className="sql-keyword">JOIN</span>{" "}
        <span className="sql-table">beehiiv.posts</span> b ...
        {"\n"}
        <span className="sql-keyword">JOIN</span>{" "}
        <span className="sql-table">dub.links</span> d ...
      </div>
    </motion.div>
  );
}

/* ─── Error State ─────────────────────────────────────────── */
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
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
