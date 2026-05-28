"use client";

import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";

interface InsightsPanelProps {
  insights: string[];
  actions: string[];
}

export function InsightsPanel({ insights, actions }: InsightsPanelProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
        style={{ padding: 20 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Lightbulb size={14} color="var(--color-amber)" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-3)",
            }}
          >
            Key Insights
          </span>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {insights.map((insight, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.5 }}>
                {insight}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card"
        style={{ padding: 20 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <ArrowRight size={14} color="var(--color-accent)" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-3)",
            }}
          >
            Recommended Actions
          </span>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map((action, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-3)",
                  minWidth: 16,
                  marginTop: 1,
                }}
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: 12.5, color: "var(--color-text-2)", lineHeight: 1.5 }}>
                {action}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
