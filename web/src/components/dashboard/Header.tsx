"use client";

import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";

interface HeaderProps {
  sourcesLive?: number;
  sourcesTotal?: number;
}

export function Header({ sourcesLive = 0, sourcesTotal = 6 }: HeaderProps) {
  const allLive = sourcesLive === sourcesTotal && sourcesTotal > 0;

  return (
    <header className="header">
      <div className="page-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--color-text-1)",
                letterSpacing: "-0.02em",
              }}
            >
              LaunchPilot
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 4,
                background: "var(--color-accent-dim)",
                color: "var(--color-accent)",
                fontWeight: 500,
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              BETA
            </span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Source status */}
            {sourcesTotal > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "5px 10px",
                  background: allLive
                    ? "var(--color-green-dim)"
                    : "var(--color-surface-2)",
                  border: `1px solid ${allLive ? "var(--color-green-border)" : "var(--color-border)"}`,
                  borderRadius: 20,
                  cursor: "default",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: allLive
                      ? "var(--color-green)"
                      : "var(--color-amber)",
                    boxShadow: allLive
                      ? "0 0 5px var(--color-green)"
                      : "0 0 5px var(--color-amber)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: allLive
                      ? "var(--color-green)"
                      : "var(--color-text-2)",
                    fontWeight: 500,
                  }}
                >
                  {sourcesLive}/{sourcesTotal} sources
                </span>
              </motion.div>
            )}

            {/* Powered by Coral badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: 0.5,
              }}
            >
              <Activity size={13} color="var(--color-text-3)" />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                coral sql
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
