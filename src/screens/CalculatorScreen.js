// screens/CalculatorScreen.js
import React, { useState } from "react";
import { MODELS, PRED_META } from "../modelData.js";
import {
  calcRisk,
  isComplete,
  getClinicalMessage,
  getRawFormula,
  fmtP,
} from "../calculate.js";
import { RiskGauge } from "../images.js";

const css = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "20px 22px",
    boxShadow: "0 1px 8px rgba(0,0,0,.05)",
    marginBottom: 16,
  },
  title: {
    fontFamily: "'DM Serif Display',Georgia,serif",
    fontSize: 20,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-.02em",
  },
  sub: { fontSize: 12, color: "#64748b", margin: "0 0 16px" },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    display: "block",
    marginBottom: 5,
  },
  hint: { fontSize: 10, color: "#94a3b8", marginTop: 3 },
  inp: {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    fontSize: 13,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },
};

function ModelCard({ k, m, selected, onClick }) {
  const active = k === selected;
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? m.color + "14" : "#f8fafc",
        border: `2px solid ${active ? m.color : "#e2e8f0"}`,
        borderRadius: 11,
        padding: "11px 13px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all .15s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: active ? m.color : "#0f172a",
          }}
        >
          {m.label}
        </div>
        {m.badge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: 99,
              background: m.color + "20",
              color: m.color,
            }}
          >
            {m.badge}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          margin: "4px 0 8px",
          lineHeight: 1.4,
        }}
      >
        {m.desc}
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 7 }}
      >
        {m.preds.map((p) => (
          <span
            key={p}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "1px 7px",
              borderRadius: 99,
              background: m.color + "18",
              color: m.color,
            }}
          >
            {p.replace("_", " ")}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>
        {m.preds.length} predictors ·{" "}
        {m.preds.includes("TUG") ? "⏱ TUG required" : "✓ No stopwatch needed"}
      </div>
    </button>
  );
}

function InputField({ pred, value, modelColor, onChange }) {
  const pm = PRED_META[pred];
  const filled =
    value !== "" && value !== undefined && !isNaN(parseFloat(value));
  return (
    <div>
      <label style={css.label}>
        {pm.label}
        {pm.unit && (
          <span style={{ fontWeight: 400, color: "#94a3b8" }}>
            {" "}
            ({pm.unit})
          </span>
        )}
      </label>
      {pm.type === "bin" ? (
        <div style={{ display: "flex", gap: 8 }}>
          {["No", "Yes"].map((opt, i) => {
            const active = String(value) === String(i);
            return (
              <button
                key={opt}
                onClick={() => onChange(i)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  border: `2px solid ${active ? modelColor : "#e2e8f0"}`,
                  background: active ? modelColor + "14" : "#f8fafc",
                  color: active ? modelColor : "#64748b",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type="number"
          value={value ?? ""}
          min={pm.min}
          max={pm.max}
          step={pm.step}
          placeholder={pm.ph}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...css.inp, borderColor: filled ? modelColor : "#e2e8f0" }}
        />
      )}
      <div style={css.hint}>{pm.hint}</div>
    </div>
  );
}

function ResultPanel({ result, model }) {
  const m = MODELS[model];
  const msg = getClinicalMessage(result);
  const formula = getRawFormula(model);
  const [showBreakdown, setShowBreakdown] = useState(true);

  return (
    <div
      style={{
        ...css.card,
        border: `2px solid ${result.color}50`,
        background: result.bg,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: result.color,
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
          {result.icon} {result.label.toUpperCase()}
        </div>
        <div style={{ color: "rgba(255,255,255,.85)", fontSize: 12 }}>
          {m.label} · threshold {result.thrPct}%
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* Gauge + summary */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div style={{ flex: "0 0 auto", textAlign: "center" }}>
            <RiskGauge
              pct={result.pct}
              thr={result.thrPct}
              color={result.color}
              size={160}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            {/* Clinical message */}
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "#374151",
                padding: "12px 14px",
                background: "rgba(255,255,255,.7)",
                borderRadius: 8,
                borderLeft: `3.5px solid ${result.color}`,
                marginBottom: 12,
              }}
            >
              {msg}
            </div>
            {/* Predicted probability summary */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  background: "rgba(255,255,255,.7)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <span>Predicted probability: </span>
                <b style={{ color: result.color, fontSize: 15 }}>
                  {result.pct}%
                </b>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,.7)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <span>Screening cutoff: </span>
                <b style={{ color: "#475569", fontSize: 15 }}>
                  {result.thrPct}%
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Score breakdown (collapsible) */}
        <button
          onClick={() => setShowBreakdown((p) => !p)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#475569",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 8,
            padding: 0,
          }}
        >
          {showBreakdown ? "▼" : "▶"} Score breakdown
        </button>
        {showBreakdown && (
          <div
            style={{
              background: "rgba(255,255,255,.75)",
              borderRadius: 9,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid #e2e8f0" }}>
                  {[
                    "Predictor",
                    "Value",
                    "z-score",
                    "Contribution",
                    "OR (raw)",
                    "p",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign: "left",
                        color: "#94a3b8",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((b, i) => (
                  <tr
                    key={b.feat}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background:
                        i % 2 === 0 ? "rgba(255,255,255,.5)" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "7px 10px",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {b.label}
                      {b.sig === true && (
                        <sup style={{ color: m.color, marginLeft: 2 }}>*</sup>
                      )}
                      {b.sig === false && (
                        <sup
                          style={{
                            color: "#94a3b8",
                            marginLeft: 2,
                            fontSize: 9,
                          }}
                        >
                          ns
                        </sup>
                      )}
                    </td>
                    <td
                      style={{ padding: "7px 10px", fontFamily: "monospace" }}
                    >
                      {b.raw}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontFamily: "monospace",
                        color: "#475569",
                      }}
                    >
                      {b.z}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: b.positive ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {b.term > 0 ? "+" : ""}
                      {b.term}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontFamily: "monospace",
                        color: "#64748b",
                      }}
                    >
                      {b.OR.toFixed(3)}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: b.sig ? m.color : "#94a3b8",
                        fontWeight: b.sig ? 700 : 400,
                      }}
                    >
                      {fmtP(b.p)}
                      {b.sig ? "*" : ""}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    borderTop: "2px solid #e2e8f0",
                    background: "rgba(255,255,255,.9)",
                  }}
                >
                  <td
                    colSpan={3}
                    style={{
                      padding: "7px 10px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    log-odds = {result.logOdds}
                  </td>
                  <td
                    colSpan={3}
                    style={{
                      padding: "7px 10px",
                      fontWeight: 800,
                      color: result.color,
                      fontSize: 14,
                    }}
                  >
                    P(fall) = {result.pct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Formula */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#475569",
            background: "rgba(255,255,255,.5)",
            padding: "8px 12px",
            borderRadius: 7,
            marginBottom: 10,
            wordBreak: "break-all",
          }}
        >
          <span style={{ color: "#94a3b8" }}>Formula (raw): </span>
          {formula}
          <br />
          <span style={{ color: "#94a3b8" }}>
            P(fall) = 1 / (1 + exp(−log_odds)) · cutoff (train Youden):{" "}
            {result.thrPct}%
          </span>
        </div>

        <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
          ⚠ Research/educational use only · N=107 single-centre · External
          validation required before clinical deployment
        </div>
      </div>
    </div>
  );
}

export default function CalculatorScreen() {
  const [sel, setSel] = useState("CFRS-Simple");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const m = MODELS[sel];
  const complete = isComplete(sel, inputs);

  const setInp = (k, v) => {
    setInputs((p) => ({ ...p, [k]: v }));
    setResult(null);
  };

  return (
    <div>
      {/* Model selector */}
      <div style={css.card}>
        <div style={css.title}>Select screening model</div>
        <p style={css.sub}>
          Choose based on clinical data available. CFRS-Simple and CFRS-Compact
          require no stopwatch test.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: 10,
          }}
        >
          {Object.entries(MODELS).map(([k, mv]) => (
            <ModelCard
              key={k}
              k={k}
              m={mv}
              selected={sel}
              onClick={() => {
                setSel(k);
                setInputs({});
                setResult(null);
              }}
            />
          ))}
        </div>
      </div>

      {/* Input form */}
      <div style={css.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div style={css.title}>{m.label} — Patient inputs</div>
            <p style={{ ...css.sub, margin: 0 }}>{m.detail}</p>
          </div>
          <button
            onClick={() => {
              setInputs({});
              setResult(null);
            }}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "6px 13px",
              cursor: "pointer",
              fontSize: 12,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            ↺ Reset
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          {m.preds.map((pred) => (
            <InputField
              key={pred}
              pred={pred}
              value={inputs[pred] ?? ""}
              modelColor={m.color}
              onChange={(v) => setInp(pred, v)}
            />
          ))}
        </div>
        <button
          onClick={() => setResult(calcRisk(sel, inputs))}
          disabled={!complete}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 10,
            border: "none",
            background: complete ? m.color : "#e2e8f0",
            color: complete ? "#fff" : "#94a3b8",
            fontWeight: 800,
            fontSize: 15,
            cursor: complete ? "pointer" : "not-allowed",
          }}
        >
          {complete
            ? "Calculate 6-month Fall Risk →"
            : `Fill all ${m.preds.length} fields to calculate`}
        </button>
      </div>

      {result && <ResultPanel result={result} model={sel} />}
    </div>
  );
}
