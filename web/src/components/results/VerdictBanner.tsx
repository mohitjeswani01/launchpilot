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
  }
> = {
  healthy: {
    icon: CheckCircle2,
    label: "Launch Healthy",
    color: "var(--color-green)",
    bgClass: "verdict-healthy",
  },
  at_risk: {
    icon: AlertTriangle,
    label: "Needs Attention",
    color: "var(--color-amber)",
    bgClass: "verdict-at_risk",
  },
  failing: {
    icon: XCircle,
    label: "Launch Failing",
    color: "var(--color-red)",
    bgClass: "verdict-failing",
  },
  unknown: {
    icon: HelpCircle,
    label: "Insufficient Data",
    color: "var(--color-text-3)",
    bgClass: "",
  },
};

interface VerdictBannerProps {
  analysis: LaunchAnalysis;
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~238.76

export function VerdictBanner({ analysis }: VerdictBannerProps) {
  const cfg = STATUS_CONFIG[analysis.status];
  const StatusIcon = cfg.icon;
  const dashOffset = CIRCUMFERENCE * (1 - analysis.healthScore / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className={cfg.bgClass}
      style={{
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      {/* Left: icon + status + summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          style={{ flexShrink: 0 }}
        >
          <StatusIcon size={26} color={cfg.color} />
        </motion.div>
        <div style={{ minWidth: 0 }}>
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
              marginTop: 5,
              lineHeight: 1.55,
              maxWidth: 420,
            }}
          >
            {analysis.verdictSummary}
          </div>
        </div>
      </div>

      {/* Right: animated score ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 18 }}
        style={{ textAlign: "center", flexShrink: 0 }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          className={`ring-glow-${analysis.status}`}
        >
          {/* Track ring */}
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="7"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke={cfg.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.6, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "48px 48px" }}
          />
          {/* Score label */}
          <text
            x="48"
            y="53"
            textAnchor="middle"
            fill={cfg.color}
            fontSize="20"
            fontWeight="800"
            fontFamily="monospace"
          >
            {analysis.healthScore}
          </text>
        </svg>
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-3)",
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          Health Score
        </div>
      </motion.div>
    </motion.div>
  );
}
