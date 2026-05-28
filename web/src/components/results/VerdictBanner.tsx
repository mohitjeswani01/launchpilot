"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { LaunchAnalysis } from "@/lib/types";

type LaunchStatus = "healthy" | "at_risk" | "failing" | "unknown";

const STATUS_CONFIG: Record<
  LaunchStatus,
  {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    color: string;
    bgClass: string;
    description: string;
  }
> = {
  healthy: {
    icon: CheckCircle2,
    label: "Launch Healthy",
    color: "var(--color-green)",
    bgClass: "verdict-healthy",
    description: "All signals are positive. Your launch is performing well.",
  },
  at_risk: {
    icon: AlertTriangle,
    label: "Needs Attention",
    color: "var(--color-amber)",
    bgClass: "verdict-at_risk",
    description: "Mixed signals detected. Review the metrics below.",
  },
  failing: {
    icon: XCircle,
    label: "Launch Failing",
    color: "var(--color-red)",
    bgClass: "verdict-failing",
    description: "Critical issues found. Immediate action required.",
  },
  unknown: {
    icon: HelpCircle,
    label: "Insufficient Data",
    color: "var(--color-text-3)",
    bgClass: "",
    description: "Not enough data to assess launch health.",
  },
};

interface VerdictBannerProps {
  analysis: LaunchAnalysis;
}

export function VerdictBanner({ analysis }: VerdictBannerProps) {
  const cfg = STATUS_CONFIG[analysis.status];
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cfg.bgClass}
      style={{
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Left: icon + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        >
          <StatusIcon size={28} color={cfg.color} />
        </motion.div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: cfg.color,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            {cfg.label}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-2)",
              marginTop: 3,
              maxWidth: 400,
            }}
          >
            {analysis.verdictSummary}
          </div>
        </div>
      </div>

      {/* Right: score */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: cfg.color,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            fontFamily: "var(--font-mono)",
          }}
        >
          {analysis.healthScore}
        </motion.div>
        <div
          style={{ fontSize: 11, color: "var(--color-text-3)", fontWeight: 500, marginTop: 2 }}
        >
          HEALTH SCORE
        </div>
      </div>
    </motion.div>
  );
}
