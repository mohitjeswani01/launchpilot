"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { LaunchForm } from "@/components/dashboard/LaunchForm";
import { SourceStatusPanel } from "@/components/dashboard/SourceBadge";
import { VerdictBanner } from "@/components/results/VerdictBanner";
import { MetricGrid } from "@/components/results/MetricGrid";
import { SqlEvidencePanel } from "@/components/results/SqlEvidencePanel";
import { InsightsPanel } from "@/components/results/InsightsPanel";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import type { LaunchAnalysis, AnalyzeRequest, SourceHealthResponse } from "@/lib/types";

type Phase = "idle" | "loading" | "results" | "error";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<LaunchAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [sources, setSources] = useState<SourceHealthResponse["sources"]>([]);
  const [lastRequest, setLastRequest] = useState<AnalyzeRequest | null>(null);

  // Fetch source health on mount
  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((data: SourceHealthResponse) => setSources(data.sources))
      .catch(() => {});
  }, []);

  const handleAnalyze = useCallback(
    async (data: AnalyzeRequest) => {
      setPhase("loading");
      setErrorMsg("");
      setLastRequest(data);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!json.success || !json.analysis) {
          throw new Error(json.error ?? "Analysis failed");
        }

        setAnalysis(json.analysis);
        setPhase("results");
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message ?? "Unknown error");
        setPhase("error");
      }
    },
    []
  );

  const handleRetry = useCallback(() => {
    if (lastRequest) handleAnalyze(lastRequest);
  }, [lastRequest, handleAnalyze]);

  const liveSources = sources.filter((s) => s.status === "live").length;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header sourcesLive={liveSources} sourcesTotal={sources.length} />

      {/* Hero strip */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "28px 0 24px",
        }}
      >
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-accent)",
                }}
              >
                Launch Intelligence
              </span>
              <span style={{ color: "var(--color-border-2)" }}>·</span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                powered by coral sql
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 700,
                color: "var(--color-text-1)",
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              Know if your launch is winning
              <br />
              <span style={{ color: "var(--color-text-3)" }}>before your CEO asks.</span>
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-3)",
                maxWidth: 540,
                lineHeight: 1.6,
              }}
            >
              Joins GitHub, Sentry, PostHog, Stripe, Beehiiv and Dub in one SQL
              query. Returns a launch health score in seconds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{ flex: 1, padding: "28px 0 60px" }}
      >
        <div className="page-container">
          <div className="sidebar-layout">
            {/* ── Left sidebar ── */}
            <aside>
              <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Form */}
                <LaunchForm
                  onSubmit={handleAnalyze}
                  isLoading={phase === "loading"}
                />

                {/* Source status */}
                {sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SourceStatusPanel sources={sources} />
                  </motion.div>
                )}

                {/* Coral attribution */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11.5,
                      color: "var(--color-text-3)",
                      lineHeight: 1.6,
                    }}
                  >
                    Built for the{" "}
                    <a
                      href="https://www.wemakedevs.org/hackathons/coral"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-accent)", textDecoration: "none" }}
                    >
                      Pirates of the Coral-bean
                    </a>{" "}
                    hackathon. Sources authored by{" "}
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--color-text-2)",
                      }}
                    >
                      @mohitjeswani01
                    </code>
                    .
                  </p>
                </motion.div>
              </div>
            </aside>

            {/* ── Main panel ── */}
            <main style={{ minWidth: 0 }}>
              <AnimatePresence mode="wait">
                {/* Idle / empty */}
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="card"
                  >
                    <EmptyState />
                  </motion.div>
                )}

                {/* Loading */}
                {phase === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingState />
                  </motion.div>
                )}

                {/* Error */}
                {phase === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ErrorState message={errorMsg} onRetry={handleRetry} />
                  </motion.div>
                )}

                {/* Results */}
                {phase === "results" && analysis && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    {/* Analysis meta */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--color-text-1)",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {analysis.featureName}
                        </h2>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-3)",
                            fontFamily: "var(--font-mono)",
                            marginTop: 2,
                          }}
                        >
                          {analysis.owner}/{analysis.repo} · launched{" "}
                          {new Date(analysis.launchDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setPhase("idle")}
                        className="btn btn-outline"
                        style={{ fontSize: 12 }}
                      >
                        New Analysis
                      </button>
                    </div>

                    {/* Verdict */}
                    <VerdictBanner analysis={analysis} />

                    {/* Metric grid */}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--color-text-3)",
                          marginBottom: 10,
                        }}
                      >
                        Source Breakdown
                      </div>
                      <MetricGrid metrics={analysis.metrics} />
                    </div>

                    {/* Insights + actions */}
                    <InsightsPanel
                      insights={analysis.keyInsights}
                      actions={analysis.recommendedActions}
                    />

                    {/* SQL evidence */}
                    <SqlEvidencePanel queries={analysis.sqlQueries} />

                    {/* Footer meta */}
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-3)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        Analyzed{" "}
                        {new Date(analysis.analyzedAt).toLocaleTimeString()}
                      </span>
                      <span style={{ color: "var(--color-border-2)" }}>·</span>
                      <span>
                        {analysis.sqlQueries.reduce((s, q) => s + q.rowCount, 0)} rows
                        from {analysis.sqlQueries.length} queries
                      </span>
                      <span style={{ color: "var(--color-border-2)" }}>·</span>
                      <span>
                        {(
                          analysis.sqlQueries.reduce((s, q) => s + q.durationMs, 0) /
                          1000
                        ).toFixed(1)}
                        s total
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
