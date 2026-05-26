// screens/ChartsScreen.js
import React, { useState } from "react";
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
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  AUC_DATA,
  PERF_DATA,
  OPTIMISM_DATA,
  RF_DATA,
  BinaryPrevChart,
  ABEChart,
  GOLDChart,
  BMICatChart,
  BoxPlotChart,
  ChartTooltip,
  COLORS,
} from "../charts.js";
import { DISTRIBUTIONS, MODELS } from "../modelData.js";

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
  sub: { fontSize: 12, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 },
};

const SECTIONS = [
  { id: "model", label: "Model performance" },
  { id: "rf", label: "Feature importance" },
  { id: "sample", label: "Sample characteristics" },
  { id: "dist", label: "Distributions" },
  { id: "categ", label: "Categorical vars" },
];

function TabBar({ active, onChange }) {
  return (
    <div
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          style={{
            padding: "7px 18px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: active === s.id ? 700 : 500,
            cursor: "pointer",
            border: `1.5px solid ${active === s.id ? "#0f766e" : "#e2e8f0"}`,
            background: active === s.id ? "#0f766e" : "#fff",
            color: active === s.id ? "#fff" : "#64748b",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Model performance section ────────────────────────────────────────────────
function ModelPerformanceCharts() {
  const [sub, setSub] = useState("auc");
  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        {[
          ["auc", "AUC comparison"],
          ["ss", "Sens / Spec / PPV / NPV"],
          ["opt", "Optimism correction"],
        ].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: sub === id ? 700 : 500,
              cursor: "pointer",
              border: `1.5px solid ${sub === id ? "#0f766e" : "#e2e8f0"}`,
              background: sub === id ? "#f0fdf4" : "#f8fafc",
              color: sub === id ? "#0f766e" : "#64748b",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {sub === "auc" && (
        <div style={css.card}>
          <div style={css.title}>AUC across validation methods</div>
          <p style={css.sub}>
            CV = repeated 5-fold cross-validation (50 iterations, training set
            n=74). Test = held-out set (n=33, 3 events — directional only). Full
            = full dataset N=107 (reference, not independent validation). Green
            line = AUC 0.90.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={AUC_DATA}
              margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="model"
                angle={-35}
                textAnchor="end"
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <YAxis
                domain={[0.4, 1.0]}
                tick={{ fontSize: 11, fill: "#475569" }}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                content={<ChartTooltip formatter={(v) => v.toFixed(3)} />}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <ReferenceLine
                y={0.9}
                stroke="#10b981"
                strokeDasharray="4 2"
                label={{
                  value: "0.90",
                  position: "right",
                  fontSize: 10,
                  fill: "#10b981",
                }}
              />
              <Bar
                dataKey="cv"
                name="CV AUC (train)"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="test"
                name="Test set AUC"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="full"
                name="Full dataset AUC"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Note: With only 3 held-out fall events, a single misclassification
            shifts test AUC by ~0.17. Test set results are directional, not
            definitive.
          </p>
        </div>
      )}

      {sub === "ss" && (
        <div>
          <div style={css.card}>
            <div style={css.title}>
              Sensitivity, specificity, PPV, NPV — held-out test set
            </div>
            <p style={css.sub}>
              Youden-optimal threshold from training set applied to held-out
              test data (n=33).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={PERF_DATA}
                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => v + "%"}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => v + "%"} />}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 2" />
                <Bar
                  dataKey="sens_t"
                  name="Sensitivity"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="spec_t"
                  name="Specificity"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="ppv_t"
                  name="PPV"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="npv_t"
                  name="NPV"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={css.card}>
            <div style={css.title}>
              Full dataset performance (N=107, reference only)
            </div>
            <p style={css.sub}>
              Models refitted on all 107 patients for CI estimation — not
              independent validation.
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={PERF_DATA}
                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => v + "%"}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => v + "%"} />}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar
                  dataKey="sens_f"
                  name="Sensitivity"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="spec_f"
                  name="Specificity"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="ppv_f"
                  name="PPV"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="npv_f"
                  name="NPV"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {sub === "opt" && (
        <div style={css.card}>
          <div style={css.title}>
            Bootstrap optimism correction (Harrell's method, B=200)
          </div>
          <p style={css.sub}>
            Apparent AUC on training set vs bootstrap-corrected estimate. Low
            EPV (&lt;2.3) across all models — calibration slopes (0.75–1.08)
            indicate overfitting of probability magnitudes; rank-ordering
            preserved.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={OPTIMISM_DATA}
              margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="model"
                angle={-35}
                textAnchor="end"
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <YAxis
                domain={[0.6, 1.0]}
                tick={{ fontSize: 11, fill: "#475569" }}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                content={<ChartTooltip formatter={(v) => v.toFixed(3)} />}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar
                dataKey="apparent"
                name="Apparent AUC"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="corrected"
                name="Corrected AUC"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {OPTIMISM_DATA.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Cal slope table */}
          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {[
                    "Model",
                    "EPV",
                    "CV AUC ± SD",
                    "Corrected AUC",
                    "Cal. slope",
                    "CITL",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign: "left",
                        color: "#64748b",
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPTIMISM_DATA.map((d, i) => {
                  const m =
                    Object.values(MODELS).find(
                      (mv) => mv.shortLabel === d.model
                    ) ||
                    Object.values(MODELS).find(
                      (mv) => mv.label === d.fullLabel
                    );
                  if (!m) return null;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: i % 2 === 0 ? "#f8fafc" : "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "7px 10px",
                          fontWeight: 700,
                          color: d.color,
                        }}
                      >
                        {d.fullLabel}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          color: d.epv < 2 ? "#dc2626" : "#64748b",
                          fontWeight: d.epv < 2 ? 700 : 400,
                        }}
                      >
                        {d.epv}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {m.cv.toFixed(3)} ± {m.cv_sd}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: d.color,
                        }}
                      >
                        {d.corrected.toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          fontFamily: "monospace",
                          fontSize: 11,
                          color:
                            d.cal_slope > 1.1 || d.cal_slope < 0.6
                              ? "#dc2626"
                              : "#64748b",
                        }}
                      >
                        {d.cal_slope.toFixed(3)}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {m.citl.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Feature importance section ───────────────────────────────────────────────
function RFChart() {
  return (
    <div style={css.card}>
      <div style={css.title}>Random Forest feature importance</div>
      <p style={css.sub}>
        Training set only (n=74, 7 fall events). 1,000 trees,
        class_weight=balanced. Top 3 (TUG, CAT, BMI) = CFRS-Quick predictors —
        61.5% cumulative Gini importance. Top 5 add fall history + age =
        CFRS-Full.
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10,
          fontSize: 11,
        }}
      >
        {[
          ["#059669", "CFRS-Quick (top 3)"],
          ["#7c3aed", "CFRS-Full add-ons"],
          ["#0284c7", "Moderate"],
          ["#94a3b8", "Lower importance"],
        ].map(([c, l]) => (
          <span
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: c,
                display: "inline-block",
              }}
            />
            <span style={{ color: "#64748b" }}>{l}</span>
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={RF_DATA}
          layout="vertical"
          margin={{ left: 10, right: 60, top: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 0.36]}
            tick={{ fontSize: 10, fill: "#475569" }}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="f"
            tick={{ fontSize: 12, fill: "#0f172a" }}
            width={100}
          />
          <Tooltip content={<ChartTooltip formatter={(v) => v.toFixed(4)} />} />
          <Bar
            dataKey="g"
            name="Gini importance"
            radius={[0, 5, 5, 0]}
            label={{
              position: "right",
              fontSize: 10,
              fill: "#64748b",
              formatter: (v) => v.toFixed(4),
            }}
          >
            {RF_DATA.map((d, i) => (
              <Cell key={i} fill={d.c} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Cumulative importance line */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#475569",
            marginBottom: 8,
          }}
        >
          Cumulative importance
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart
            data={RF_DATA}
            margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="f"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => v + "%"}
              tick={{ fontSize: 10, fill: "#475569" }}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => v.toFixed(1) + "%"} />}
            />
            <ReferenceLine
              y={61.5}
              stroke="#059669"
              strokeDasharray="4 2"
              label={{
                value: "61.5% (top 3)",
                fontSize: 9,
                fill: "#059669",
                position: "right",
              }}
            />
            <Line
              type="monotone"
              dataKey="cumul"
              name="Cumul. %"
              stroke="#0f766e"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#0f766e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Sample characteristics section ──────────────────────────────────────────
function SampleSection() {
  const rows = [
    { v: "Age (years)", f: 67.0, nf: 66.7, u: "median", sig: false },
    { v: "CAT score", f: 15.5, nf: 7.0, u: "median", sig: true },
    { v: "TUG time (sec)", f: 12.5, nf: 10.2, u: "median", sig: true },
    { v: "BMI (kg/m²)", f: 20.15, nf: 21.69, u: "mean", sig: false },
    { v: "FEV₁ % predicted", f: 50.5, nf: 54.0, u: "median", sig: false },
    { v: "Comorbidities", f: 3.0, nf: 2.0, u: "median", sig: false },
    { v: "Fall history, %", f: 80.0, nf: 13.4, u: "%", sig: true },
    { v: "Fear of falling, %", f: 20.0, nf: 7.2, u: "%", sig: false },
  ];
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 11,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 20, color: "#dc2626" }}>
            n=10 (9.3%)
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Fallers — ≥1 fall in 6 months
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#7f1d1d",
              lineHeight: 1.7,
            }}
          >
            80% had fall history · 60% ABE-B · Male 100% · Median TUG 12.5s ·
            Median CAT 15.5 · Mean BMI 20.2
          </div>
        </div>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 11,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 20, color: "#16a34a" }}>
            n=97 (90.7%)
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Non-fallers
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#14532d",
              lineHeight: 1.7,
            }}
          >
            13.4% had fall history · 54.6% ABE-A · Male 97.9% · Median TUG 10.2s
            · Median CAT 7.0 · Mean BMI 21.7
          </div>
        </div>
      </div>
      <div style={css.card}>
        <div style={css.title}>Table 1 — Baseline characteristics</div>
        <p style={css.sub}>
          * p &lt; 0.05 (Mann–Whitney U or Fisher's exact). Continuous: median
          [IQR] or mean ± SD.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {[
                  "Variable",
                  "All (N=107)",
                  "Fallers (n=10)",
                  "Non-fallers (n=97)",
                  "p",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      textAlign: "left",
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#f8fafc" : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "9px 12px",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {r.v}
                  </td>
                  <td style={{ padding: "9px 12px", color: "#475569" }}>—</td>
                  <td
                    style={{
                      padding: "9px 12px",
                      color: r.sig ? "#dc2626" : "#0f172a",
                      fontWeight: r.sig ? 700 : 400,
                    }}
                  >
                    {r.f}
                    {r.u === "%" ? "%" : ""}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {r.nf}
                    {r.u === "%" ? "%" : ""}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {r.sig ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "1px 8px",
                          borderRadius: 99,
                          background: "#fef2f2",
                          color: "#dc2626",
                        }}
                      >
                        * &lt;0.05
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>ns</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Continuous distributions section ────────────────────────────────────────
function DistributionSection() {
  const [selVar, setSelVar] = useState("CAT");
  const vars = Object.entries(DISTRIBUTIONS).map(([k, d]) => ({
    k,
    label: d.label,
  }));

  const d = DISTRIBUTIONS[selVar];
  const boxData = [
    { group: "All (n=107)", ...d.all, fill: "#64748b" },
    { group: "Non-fallers (n=97)", ...d.nfaller, fill: COLORS.nfaller },
    { group: "Fallers (n=10)", ...d.faller, fill: COLORS.faller },
  ];

  // Build summary bar data using median
  const summaryData = [
    {
      name: "Non-fallers (n=97)",
      value: d.nfaller.median,
      q1: d.nfaller.q1,
      q3: d.nfaller.q3,
      fill: COLORS.nfaller,
    },
    {
      name: "Fallers (n=10)",
      value: d.faller.median,
      q1: d.faller.q1,
      q3: d.faller.q3,
      fill: COLORS.faller,
    },
  ];

  return (
    <div>
      {/* Variable tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        {vars.map(({ k, label }) => (
          <button
            key={k}
            onClick={() => setSelVar(k)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: selVar === k ? 700 : 500,
              cursor: "pointer",
              border: `1.5px solid ${selVar === k ? "#0f766e" : "#e2e8f0"}`,
              background: selVar === k ? "#0f766e" : "#f8fafc",
              color: selVar === k ? "#fff" : "#64748b",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={css.card}>
        <div style={css.title}>
          {d.label} — Summary statistics by fall status
        </div>
        {d.normal_hi && (
          <div
            style={{
              marginBottom: 10,
              fontSize: 12,
              color: "#d97706",
              padding: "6px 12px",
              background: "#fffbeb",
              borderRadius: 7,
              display: "inline-block",
            }}
          >
            Reference threshold:{" "}
            {d.normal_lo !== null
              ? `${d.normal_lo}–${d.normal_hi}`
              : `≤${d.normal_hi}`}{" "}
            {d.unit}
          </div>
        )}

        {/* Median comparison bars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {summaryData.map((row) => (
            <div
              key={row.name}
              style={{
                background: row.fill + "12",
                border: `1px solid ${row.fill}40`,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: row.fill,
                  marginBottom: 6,
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: row.fill,
                  lineHeight: 1,
                }}
              >
                {row.value}{" "}
                <span
                  style={{ fontSize: 13, fontWeight: 400, color: "#64748b" }}
                >
                  {d.unit}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Median · IQR: {row.q1}–{row.q3}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart showing median comparison */}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={boxData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis dataKey="group" tick={{ fontSize: 11, fill: "#475569" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#475569" }}
              label={{
                value: d.unit,
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#94a3b8",
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = boxData.find((r) => r.group === label);
                return (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 9,
                      padding: "10px 14px",
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </div>
                    {[
                      ["Min", row?.min],
                      ["Q1", row?.q1],
                      ["Median", row?.median],
                      ["Q3", row?.q3],
                      ["Max", row?.max],
                      ["Mean ± SD", `${row?.mean} ± ${row?.sd}`],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 14,
                          color: "#475569",
                        }}
                      >
                        <span>{l}</span>
                        <b>{v}</b>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            {d.normal_hi && (
              <ReferenceLine
                y={d.normal_hi}
                stroke="#f59e0b"
                strokeDasharray="4 2"
                label={{
                  value: `threshold ${d.normal_hi}`,
                  position: "right",
                  fontSize: 10,
                  fill: "#d97706",
                }}
              />
            )}
            <Bar
              dataKey="median"
              name="Median"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
              label={{
                position: "top",
                fontSize: 11,
                fill: "#475569",
                formatter: (v) => `${v} ${d.unit}`,
              }}
            >
              {boxData.map((r, i) => (
                <Cell
                  key={i}
                  fill={r.fill + "cc"}
                  stroke={r.fill}
                  strokeWidth={1.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Full summary table */}
        <div style={{ overflowX: "auto", marginTop: 14 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {[
                  "Group",
                  "n",
                  "Min",
                  "Q1",
                  "Median",
                  "Q3",
                  "Max",
                  "Mean",
                  "SD",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: 11,
                      textAlign: "center",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boxData.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#f8fafc" : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 10px",
                      fontWeight: 700,
                      color: row.fill,
                    }}
                  >
                    {row.group}
                  </td>
                  {[
                    row.group.includes("97")
                      ? "97"
                      : row.group.includes("10")
                      ? "10"
                      : "107",
                    row.min,
                    row.q1,
                    row.median,
                    row.q3,
                    row.max,
                    row.mean,
                    row.sd,
                  ].map((v, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "7px 10px",
                        textAlign: "center",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Categorical variables section ────────────────────────────────────────────
function CategoricalSection() {
  const [sub, setSub] = useState("abe");
  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        {[
          ["abe", "ABE Classification"],
          ["gold", "GOLD Severity"],
          ["binary", "Binary predictors"],
          ["bmicat", "BMI categories"],
        ].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: sub === id ? 700 : 500,
              cursor: "pointer",
              border: `1.5px solid ${sub === id ? "#0f766e" : "#e2e8f0"}`,
              background: sub === id ? "#0f766e" : "#f8fafc",
              color: sub === id ? "#fff" : "#64748b",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {sub === "abe" && (
        <div style={css.card}>
          <div style={css.title}>GOLD ABE classification & fall incidence</div>
          <p style={css.sub}>
            ABE-B had the highest fall rate (24%; 6/25 patients). CFRS-Quick
            AUC: 0.978 in ABE-A+E vs 0.754 in ABE-B — likely reflecting
            compressed predictive range at high baseline incidence.
          </p>
          <ABEChart height={260} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
              marginTop: 14,
            }}
          >
            {[
              { s: "A", n: 54, f: 1, pct: 1.9 },
              { s: "B", n: 25, f: 6, pct: 24.0 },
              { s: "E", n: 28, f: 3, pct: 10.7 },
            ].map((d) => (
              <div
                key={d.s}
                style={{
                  background:
                    d.pct > 15 ? "#fef2f2" : d.pct > 5 ? "#fefce8" : "#f0fdf4",
                  border: `1px solid ${
                    d.pct > 15 ? "#fecaca" : d.pct > 5 ? "#fef08a" : "#bbf7d0"
                  }`,
                  borderRadius: 10,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: 28,
                    color:
                      d.pct > 15
                        ? "#dc2626"
                        : d.pct > 5
                        ? "#ca8a04"
                        : "#16a34a",
                  }}
                >
                  {d.s}
                </div>
                <div
                  style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}
                >
                  {d.n}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  patients ({((d.n / 107) * 100).toFixed(1)}%)
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 6,
                    color:
                      d.pct > 15
                        ? "#dc2626"
                        : d.pct > 5
                        ? "#ca8a04"
                        : "#16a34a",
                  }}
                >
                  {d.f} fall{d.f !== 1 ? "s" : ""} ({d.pct}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "gold" && (
        <div style={css.card}>
          <div style={css.title}>GOLD spirometric severity & fall rate</div>
          <p style={css.sub}>
            FEV₁ % predicted classified per GOLD 2024 criteria. Fall rate does
            not increase linearly with GOLD severity — underscoring why
            disease-specific models outperform spirometry-based stratification.
          </p>
          <GOLDChart height={260} />
        </div>
      )}

      {sub === "binary" && (
        <div style={css.card}>
          <div style={css.title}>
            Binary predictor prevalence — fallers vs non-fallers
          </div>
          <p style={css.sub}>
            Fall history shows the most discriminating prevalence difference
            (80% in fallers vs 13.4% in non-fallers, p&lt;0.001). Fear of
            falling and feeling unsteady were not statistically significant in
            this cohort.
          </p>
          <BinaryPrevChart height={300} />
        </div>
      )}

      {sub === "bmicat" && (
        <div style={css.card}>
          <div style={css.title}>
            BMI categories (WHO Asian cut-offs) & fall rate
          </div>
          <p style={css.sub}>
            Underweight patients had the highest fall rate (13.6%), consistent
            with sarcopenia as a fall risk mediator. BMI was ranked 3rd in RF
            importance but did not reach statistical significance in
            multivariable models.
          </p>
          <BMICatChart height={240} />
        </div>
      )}
    </div>
  );
}

export default function ChartsScreen() {
  const [section, setSection] = useState("model");
  return (
    <div>
      <TabBar active={section} onChange={setSection} />
      {section === "model" && <ModelPerformanceCharts />}
      {section === "rf" && <RFChart />}
      {section === "sample" && <SampleSection />}
      {section === "dist" && <DistributionSection />}
      {section === "categ" && <CategoricalSection />}
    </div>
  );
}
