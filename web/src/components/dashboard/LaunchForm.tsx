"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, GitBranch, Loader2, ArrowRight } from "lucide-react";

interface LaunchFormProps {
  onSubmit: (data: {
    featureName: string;
    owner: string;
    repo: string;
    launchDate: string;
  }) => void;
  isLoading: boolean;
}

export function LaunchForm({ onSubmit, isLoading }: LaunchFormProps) {
  const [featureName, setFeatureName] = useState("");
  const [repoInput, setRepoInput] = useState(""); // "owner/repo"
  const [launchDate, setLaunchDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [owner, repo] = repoInput.includes("/")
      ? repoInput.split("/")
      : ["", repoInput];
    if (!featureName.trim() || !owner || !repo) return;
    onSubmit({
      featureName: featureName.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      launchDate: new Date(launchDate).toISOString(),
    });
  };

  const isValid =
    featureName.trim().length > 0 &&
    repoInput.includes("/") &&
    repoInput.split("/")[0].trim() !== "" &&
    repoInput.split("/")[1].trim() !== "" &&
    launchDate !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="card"
      style={{ padding: 24 }}
    >
      {/* Form header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-text-1)",
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          Analyze a Launch
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-3)", lineHeight: 1.5 }}>
          Enter your repo and feature details. LaunchPilot queries 6 data sources in parallel.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Feature name */}
          <div>
            <label
              htmlFor="featureName"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-2)",
                marginBottom: 6,
              }}
            >
              Feature / Launch Name
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                color="var(--color-text-3)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="featureName"
                type="text"
                className="input-base"
                placeholder="e.g. New Pricing Page, Checkout v2"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                style={{ paddingLeft: 34 }}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Repo */}
          <div>
            <label
              htmlFor="repo"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-2)",
                marginBottom: 6,
              }}
            >
              GitHub Repository
            </label>
            <div style={{ position: "relative" }}>
              <GitBranch
                size={14}
                color="var(--color-text-3)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="repo"
                type="text"
                className="input-base"
                placeholder="owner/repository"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                style={{ paddingLeft: 34, fontFamily: "var(--font-mono)", fontSize: 13 }}
                disabled={isLoading}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 5 }}>
              Format: <code style={{ fontFamily: "var(--font-mono)" }}>owner/repo</code>{" "}
              e.g.{" "}
              <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                vercel/next.js
              </code>
            </p>
          </div>

          {/* Launch date */}
          <div>
            <label
              htmlFor="launchDate"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-2)",
                marginBottom: 6,
              }}
            >
              Launch Date
            </label>
            <div style={{ position: "relative" }}>
              <Calendar
                size={14}
                color="var(--color-text-3)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="launchDate"
                type="date"
                className="input-base"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                style={{
                  paddingLeft: 34,
                  colorScheme: "dark",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || isLoading}
            style={{ width: "100%", height: 42, marginTop: 4 }}
            whileHover={isValid && !isLoading ? { scale: 1.01 } : {}}
            whileTap={isValid && !isLoading ? { scale: 0.99 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                Analyzing across 6 sources…
              </>
            ) : (
              <>
                Analyze Launch
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Data source strip */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-3)" }}>Queries:</span>
        {["GitHub", "Sentry", "PostHog", "Stripe", "Beehiiv", "Dub"].map((src) => (
          <span
            key={src}
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 4,
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-2)",
              fontWeight: 500,
            }}
          >
            {src}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
