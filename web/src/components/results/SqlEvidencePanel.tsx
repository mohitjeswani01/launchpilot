"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Clock, Terminal } from "lucide-react";

interface SqlQuery {
  source: string;
  sql: string;
  rowCount: number;
  durationMs: number;
}

const SOURCE_ICONS: Record<string, string> = {
  "github-prs": "⚡",
  "github-ci":  "⚡",
  github:        "⚡",
  sentry:        "🐛",
  posthog:       "📊",
  stripe:        "💳",
  beehiiv:       "📧",
  dub:           "🔗",
};

function highlightSQL(sql: string): React.ReactNode {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|JOIN|ON|ORDER BY|GROUP BY|LIMIT|INNER|LEFT|RIGHT|AS|IN|NOT|IS|NULL|DESC|ASC|HAVING|DISTINCT|COUNT|SUM|MAX|MIN|AVG)\b/gi;
  const strings = /'([^']*)'/g;
  const numbers = /\b(\d+)\b/g;
  const tables = /\b([a-z_]+\.[a-z_]+)\b/g;

  // Simple token-based rendering
  const lines = sql.split("\n");
  return lines.map((line, li) => {
    // Apply regex replacements for coloring
    let html = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(
      /\b(SELECT|FROM|WHERE|AND|OR|JOIN|ON|ORDER BY|GROUP BY|LIMIT|INNER|LEFT|RIGHT|AS|IN|NOT|IS|NULL|DESC|ASC|HAVING|DISTINCT|COUNT|SUM|MAX|MIN|AVG)\b/gi,
      '<span class="sql-keyword">$1</span>'
    );
    html = html.replace(
      /'([^']*)'/g,
      "<span class=\"sql-string\">'$1'</span>"
    );
    html = html.replace(
      /\b([a-z_]+\.[a-z_]+)\b/g,
      '<span class="sql-table">$1</span>'
    );
    html = html.replace(
      /\b(\d+)\b/g,
      '<span class="sql-number">$1</span>'
    );
    html = html.replace(
      /(--.*$)/gm,
      '<span class="sql-comment">$1</span>'
    );

    return (
      <div key={li} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />
    );
  });
}

interface SqlPanelProps {
  queries: SqlQuery[];
}

export function SqlEvidencePanel({ queries }: SqlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const totalDuration = queries.reduce((s, q) => s + q.durationMs, 0);
  const totalRows = queries.reduce((s, q) => s + q.rowCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="btn-ghost"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderRadius: isOpen ? "14px 14px 0 0" : 14,
          border: "none",
          background: "transparent",
        }}
        aria-expanded={isOpen}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Code2 size={15} color="var(--color-text-2)" />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-1)",
            }}
          >
            SQL Evidence
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 7px",
              borderRadius: 4,
              background: "var(--color-surface-3)",
              color: "var(--color-text-3)",
              fontWeight: 500,
            }}
          >
            {queries.length} queries
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: 0.6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--color-text-3)",
              }}
            >
              <Terminal size={11} />
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {totalRows} rows
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--color-text-3)",
              }}
            >
              <Clock size={11} />
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {(totalDuration / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} color="var(--color-text-3)" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                padding: "16px 20px 20px",
              }}
            >
              {/* Source tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 14,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {queries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className="btn"
                    style={{
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 6,
                      background:
                        activeTab === i
                          ? "var(--color-surface-3)"
                          : "transparent",
                      color:
                        activeTab === i
                          ? "var(--color-text-1)"
                          : "var(--color-text-3)",
                      border:
                        activeTab === i
                          ? "1px solid var(--color-border-2)"
                          : "1px solid transparent",
                      whiteSpace: "nowrap",
                      gap: 5,
                    }}
                  >
                    <span>{SOURCE_ICONS[q.source] ?? "◆"}</span>
                    <span>{q.source}</span>
                  </button>
                ))}
              </div>

              {/* Active query */}
              {queries[activeTab] && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Query meta */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-3)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      → {queries[activeTab].rowCount} row
                      {queries[activeTab].rowCount !== 1 ? "s" : ""} ·{" "}
                      {queries[activeTab].durationMs}ms
                    </span>
                    {queries[activeTab].rowCount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: "var(--color-green-dim)",
                          color: "var(--color-green)",
                          fontWeight: 500,
                          border: "1px solid var(--color-green-border)",
                        }}
                      >
                        OK
                      </span>
                    )}
                  </div>

                  {/* SQL display */}
                  <div className="code-block">
                    {highlightSQL(queries[activeTab].sql)}
                  </div>
                </motion.div>
              )}

              {/* Footer note */}
              <p
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "var(--color-text-3)",
                }}
              >
                All queries executed via{" "}
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-accent)",
                  }}
                >
                  coral sql
                </code>{" "}
                · Data resolved locally · No ETL · No warehouse
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
