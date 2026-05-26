// screens/CompareScreen.js
import React, { useState } from "react";
import { MODELS, PRED_META } from "../modelData.js";
import { calcAllModels } from "../calculate.js";
import { MiniGauge } from "../images.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { ChartTooltip } from "../charts.js";

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

const ALL_PREDS = [...new Set(Object.values(MODELS).flatMap((m) => m.preds))];

export default function CompareScreen() {
  const [inputs, setInputs] = useState({});
  const setInp = (k, v) => setInputs((p) => ({ ...p, [k]: v }));
  const results = calcAllModels(inputs);
  const hasAny = Object.keys(results).length > 0;

  // Build bar chart data for probability comparison
  const barData = Object.entries(results).map(([k, r]) => ({
    model: MODELS[k].shortLabel,
    pct: r.pct,
    thr: r.thrPct,
    color: MODELS[k].color,
    above: r.above,
  }));

  // Consensus
  const pos = Object.values(results).filter((r) => r.above).length;
  const total = Object.keys(results).length;

  return (
    <div>
      {/* Input section */}
      <div style={css.card}>
        <div style={css.title}>Patient data entry — all predictors</div>
        <p style={css.sub}>
          Enter all available data. Each model calculates as soon as its
          required fields are complete. Models requiring TUG will not appear if
          TUG is not entered.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 14,
          }}
        >
          {ALL_PREDS.map((pred) => {
            const pm = PRED_META[pred];
            const val = inputs[pred] ?? "";
            const filled = val !== "" && !isNaN(parseFloat(val));
            const usedBy = Object.values(MODELS)
              .filter((m) => m.preds.includes(pred))
              .map((m) => m.shortLabel);
            return (
              <div key={pred}>
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
                      const a = String(val) === String(i);
                      return (
                        <button
                          key={opt}
                          onClick={() => setInp(pred, i)}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 12,
                            border: `2px solid ${a ? "#0f766e" : "#e2e8f0"}`,
                            background: a ? "#0f766e14" : "#f8fafc",
                            color: a ? "#0f766e" : "#64748b",
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
                    value={val}
                    placeholder={pm.ph}
                    min={pm.min}
                    max={pm.max}
                    step={pm.step}
                    onChange={(e) => setInp(pred, e.target.value)}
                    style={{
                      ...css.inp,
                      borderColor: filled ? "#0f766e" : "#e2e8f0",
                    }}
                  />
                )}
                <div style={css.hint}>Used by: {usedBy.join(", ")}</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setInputs({})}
          style={{
            marginTop: 12,
            background: "none",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "7px 14px",
            cursor: "pointer",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          ↺ Clear all
        </button>
      </div>

      {hasAny ? (
        <>
          {/* Probability bar chart */}
          <div style={css.card}>
            <div style={css.title}>Predicted fall probability — all models</div>
            <p style={css.sub}>
              Bars show predicted probability. Each model has its own Youden
              threshold (dotted line per model). Shaded red = above threshold.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={barData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => v + "%"}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip
                  content={
                    <ChartTooltip formatter={(v) => v.toFixed(1) + "%"} />
                  }
                />
                <ReferenceLine
                  y={barData[0]?.thr}
                  stroke="#dc262680"
                  strokeDasharray="5 3"
                  label={{
                    value: "threshold",
                    fontSize: 10,
                    fill: "#dc2626",
                    position: "right",
                  }}
                />
                <Bar
                  dataKey="pct"
                  name="P(fall)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                  label={{
                    position: "top",
                    fontSize: 11,
                    fill: "#475569",
                    formatter: (v) => v + "%",
                  }}
                >
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.above ? d.color : d.color + "80"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {Object.entries(results).map(([k, r]) => {
              const mv = MODELS[k];
              return (
                <div
                  key={k}
                  style={{
                    background: r.bg,
                    border: `1.5px solid ${r.color}40`,
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: mv.color,
                        }}
                      >
                        {mv.label}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                      >
                        {mv.desc}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 9px",
                        borderRadius: 99,
                        background: r.color + "20",
                        color: r.color,
                      }}
                    >
                      {r.icon} {r.label}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    <MiniGauge pct={r.pct} thr={r.thrPct} color={r.color} />
                    <div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: r.color,
                          lineHeight: 1,
                        }}
                      >
                        {r.pct}%
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                      >
                        cutoff {r.thrPct}%
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {r.above ? (
                          <span style={{ color: r.color, fontWeight: 600 }}>
                            Screen positive — consider intervention
                          </span>
                        ) : (
                          <span style={{ color: "#16a34a", fontWeight: 600 }}>
                            Screen negative — routine follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Breakdown summary */}
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#64748b",
                      borderTop: "1px dashed #e2e8f0",
                      paddingTop: 8,
                    }}
                  >
                    {r.breakdown.map((b) => (
                      <span key={b.feat} style={{ marginRight: 8 }}>
                        <b
                          style={{ color: b.positive ? "#dc2626" : "#16a34a" }}
                        >
                          {b.term > 0 ? "+" : ""}
                          {b.term}
                        </b>{" "}
                        {b.feat.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consensus */}
          <div
            style={{
              ...css.card,
              background:
                pos === 0 ? "#f0fdf4" : pos === total ? "#fef2f2" : "#fefce8",
              border: `1px solid ${
                pos === 0 ? "#bbf7d0" : pos === total ? "#fecaca" : "#fef08a"
              }`,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 14,
                color:
                  pos === 0 ? "#166534" : pos === total ? "#991b1b" : "#92400e",
                marginBottom: 6,
              }}
            >
              Consensus: {pos}/{total} calculable models screen positive
            </div>
            <div
              style={{
                fontSize: 13,
                color:
                  pos === 0 ? "#15803d" : pos === total ? "#b91c1c" : "#b45309",
                lineHeight: 1.6,
              }}
            >
              {pos === 0 &&
                `All ${total} models screen negative. Low 6-month fall risk — routine COPD follow-up recommended.`}
              {pos === total &&
                `All ${total} models screen positive. Consistently elevated fall risk — consider structured fall-prevention intervention, pulmonary rehabilitation, and Beers criteria review.`}
              {pos > 0 &&
                pos < total &&
                `Mixed result (${pos} of ${total} positive). Prioritise CFRS-Simple and CFRS-Compact results (highest test-set AUC). Use clinical judgment.`}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            ...css.card,
            textAlign: "center",
            padding: 52,
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Enter patient data above
          </div>
          <div style={{ fontSize: 13 }}>
            Models will calculate automatically as you fill in each field
          </div>
        </div>
      )}
    </div>
  );
}
