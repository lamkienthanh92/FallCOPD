// App.js — CFRS COPD Fall Risk Screener
// CodeSandbox: npm install recharts
// Structure: App.js | modelData.js | calculate.js | charts.js | images.js
//            screens/CalculatorScreen.js | CompareScreen.js | ChartsScreen.js | ModelInfoScreen.js

import React, { useState } from "react";
import CalculatorScreen from "./screens/CalculatorScreen.js";
import CompareScreen from "./screens/CompareScreen.js";
import ChartsScreen from "./screens/ChartsScreen.js";
import ModelInfoScreen from "./screens/ModelInfoScreen.js";
import { LungIcon, StudyBadge } from "./images.js";
import { STUDY } from "./modelData.js";

// ── Google Fonts (inject once) ───────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";

// ── Nav tabs ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "calc", label: "Calculator", emoji: "🧮" },
  { id: "compare", label: "Compare", emoji: "⚖️" },
  { id: "charts", label: "Charts", emoji: "📊" },
  { id: "models", label: "Model details", emoji: "📋" },
];

// ── About panel (footer modal-ish) ───────────────────────────────────────────
function AboutPanel({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 640,
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#0f766e,#134e4a)",
            padding: "20px 24px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: 22,
                  color: "#fff",
                }}
              >
                About this tool
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.7)",
                  marginTop: 3,
                }}
              >
                Development & Validation of CFRS — COPD Fall Risk Screening
                Tools
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,.2)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                padding: "6px 12px",
                fontSize: 13,
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div style={{ padding: "22px 24px" }}>
          {/* Study stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              ["N=107", "Enrolled", "100% completed"],
              ["9.3%", "Fall rate", "6-month"],
              ["74", "Train set", "7 falls"],
              ["33", "Test set", "3 falls"],
              ["66.7 yr", "Mean age", "98.1% male"],
              ["STROBE+TRIPOD", "Reporting", "standards"],
            ].map(([v, l, s]) => (
              <div
                key={l}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 9,
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 800, color: "#0f766e" }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{s}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Study info */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: 17,
                color: "#0f172a",
                marginBottom: 10,
              }}
            >
              Study design
            </div>
            {[
              ["Design", "Single-centre prospective cohort"],
              [
                "Setting",
                "Respiratory outpatient clinic, Lanh Binh Thang General Hospital, Ho Chi Minh City, Vietnam",
              ],
              ["Period", "January – August 2024"],
              [
                "Follow-up",
                "6 months (bimonthly telephone interview + hospital record review)",
              ],
              [
                "Eligibility",
                "Adults, stable COPD (GOLD 2024 criteria), written informed consent",
              ],
              [
                "Ethics",
                "Pham Ngoc Thach University No. 893/TĐHYKPNT-HĐĐĐ · Lanh Binh Thang General Hospital No. 52/QĐ-BV",
              ],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 6,
                  fontSize: 13,
                }}
              >
                <span
                  style={{ fontWeight: 700, color: "#475569", minWidth: 90 }}
                >
                  {l}
                </span>
                <span style={{ color: "#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: 17,
                color: "#0f172a",
                marginBottom: 10,
              }}
            >
              Analytical pipeline
            </div>
            {[
              [
                "1",
                "Stratified 70:30 split (seed=42)",
                "All development on training set only. Test set accessed once at end.",
              ],
              [
                "2",
                "Random Forest ranking (1,000 trees)",
                "Top-3 = CFRS-Quick predictors (TUG, CAT, BMI — 61.5% cumulative Gini).",
              ],
              [
                "3",
                "L2-regularised logistic regression",
                "StandardScaler fitted on training set. 6 models. class_weight=balanced.",
              ],
              [
                "4",
                "Repeated 5-fold CV (50 iterations)",
                "Mean AUC ± SD per model on training set.",
              ],
              [
                "5",
                "Bootstrap optimism (Harrell, B=200)",
                "Corrected AUC + calibration slope + CITL.",
              ],
              [
                "6",
                "Held-out test evaluation",
                "Youden threshold from train set. AUC CI from 1,000 bootstrap resamples.",
              ],
            ].map(([n, t, d]) => (
              <div
                key={n}
                style={{ display: "flex", gap: 12, marginBottom: 10 }}
              >
                <div
                  style={{
                    flex: "0 0 26px",
                    height: 26,
                    borderRadius: "50%",
                    background: "#e6f7f5",
                    color: "#0f766e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {n}
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}
                  >
                    {t}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
                    {d}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              background: "#fef9c3",
              border: "1px solid #fde68a",
              borderRadius: 9,
              padding: "12px 16px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#92400e",
                marginBottom: 5,
                fontSize: 13,
              }}
            >
              ⚠ Research / educational use only
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#78350f",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              All CFRS models were developed in a single-centre cohort (N=107,
              98.1% male, EPV &lt;2.3). Calibration is overfitted — probability
              magnitudes should not be taken literally; rank-ordering is
              preserved.
              <b>
                {" "}
                External validation is required before any clinical deployment.
              </b>{" "}
              This tool does not constitute medical advice.
            </p>
          </div>

          {/* Citation */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              lineHeight: 1.8,
              color: "#475569",
              background: "#f8fafc",
              padding: "12px 14px",
              borderRadius: 8,
            }}
          >
            Development and Validation of COPD-Specific Fall Risk Screening
            Tools: A Prospective Cohort Study.
            <br />
            Lanh Binh Thang General Hospital, Ho Chi Minh City, Vietnam ·
            January–August 2024 · DOI: pending
            <br />
            Reporting: STROBE (cohort) + TRIPOD (prediction model development +
            internal validation)
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <StudyBadge />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("calc");
  const [about, setAbout] = useState(false);

  return (
    <>
      {/* Fonts */}
      <link rel="stylesheet" href={FONT_URL} />

      <div
        style={{
          fontFamily: "'Outfit','Segoe UI',sans-serif",
          background: "#f1f5f9",
          minHeight: "100vh",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 20px rgba(15,118,110,.35)",
          }}
        >
          <div
            style={{
              maxWidth: 1060,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 62,
            }}
          >
            {/* Logo */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>🫁</span>
            </div>
            {/* Title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'DM Serif Display',Georgia,serif",
                  fontSize: 20,
                  color: "#fff",
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                CFRS · COPD Fall Risk Screener
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.6)",
                  marginTop: 1,
                }}
              >
                Lanh Binh Thang General Hospital · HCMC 2024 · N=107 · 6-month
                prospective
              </div>
            </div>
            {/* Badges */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {["STROBE", "TRIPOD", "N=107"].map((b) => (
                <span
                  key={b}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(255,255,255,.15)",
                    color: "rgba(255,255,255,.85)",
                    letterSpacing: ".04em",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
            {/* About button */}
            <button
              onClick={() => setAbout(true)}
              style={{
                background: "rgba(255,255,255,.15)",
                border: "1px solid rgba(255,255,255,.25)",
                borderRadius: 8,
                color: "rgba(255,255,255,.9)",
                cursor: "pointer",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              About ℹ
            </button>
          </div>

          {/* ── NAV TABS (inside header) ── */}
          <div
            style={{
              maxWidth: 1060,
              margin: "0 auto",
              display: "flex",
              borderTop: "1px solid rgba(255,255,255,.12)",
            }}
          >
            {TABS.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 20px",
                  color: tab === id ? "#fff" : "rgba(255,255,255,.6)",
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: tab === id ? 700 : 500,
                  fontSize: 13,
                  borderBottom: `2.5px solid ${
                    tab === id ? "#5eead4" : "transparent"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 15 }}>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "22px 16px 64px",
          }}
        >
          {tab === "calc" && <CalculatorScreen />}
          {tab === "compare" && <CompareScreen />}
          {tab === "charts" && <ChartsScreen />}
          {tab === "models" && <ModelInfoScreen />}
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "14px 24px",
            textAlign: "center",
            fontSize: 11,
            color: "#94a3b8",
            background: "#fff",
          }}
        >
          CFRS · Research use only · Not for clinical deployment without
          external validation · Lanh Binh Thang General Hospital · Ho Chi Minh
          City · 2024 ·{" "}
          <button
            onClick={() => setAbout(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#0f766e",
              fontSize: 11,
              textDecoration: "underline",
              padding: 0,
            }}
          >
            View study details
          </button>
        </div>
      </div>

      {about && <AboutPanel onClose={() => setAbout(false)} />}
    </>
  );
}
