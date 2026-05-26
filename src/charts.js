// charts.js — reusable chart data + shared chart components (recharts)
import React from "react";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ErrorBar,
} from "recharts";
import { MODELS, DISTRIBUTIONS, CATEGORICAL } from "./modelData.js";

// ── Colour palette ──────────────────────────────────────────────────────────
export const COLORS = {
  faller: "#dc2626",
  nfaller: "#0284c7",
  all: "#475569",
  green: "#059669",
  purple: "#7c3aed",
  amber: "#d97706",
};

// ── Custom tooltip shell ────────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,.1)",
        maxWidth: 220,
      }}
    >
      {label && (
        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            color: p.color || "#64748b",
            marginBottom: 2,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span>{p.name}</span>
          <b>
            {formatter
              ? formatter(p.value, p.name)
              : typeof p.value === "number"
              ? p.value.toFixed(3)
              : p.value}
          </b>
        </div>
      ))}
    </div>
  );
}

// ── AUC comparison data ─────────────────────────────────────────────────────
export const AUC_DATA = Object.entries(MODELS).map(([k, m]) => ({
  model: m.shortLabel,
  fullLabel: m.label,
  cv: m.cv,
  cv_lo: +(m.cv - m.cv_sd).toFixed(3),
  cv_hi: +(m.cv + m.cv_sd).toFixed(3),
  test: m.test.auc,
  test_lo: m.test.lo,
  test_hi: m.test.hi,
  full: m.full.auc,
  full_lo: m.full.lo,
  full_hi: m.full.hi,
  color: m.color,
}));

// ── Sens/spec/PPV/NPV data ──────────────────────────────────────────────────
export const PERF_DATA = Object.entries(MODELS).map(([k, m]) => ({
  model: m.shortLabel,
  fullLabel: m.label,
  color: m.color,
  // test set
  sens_t: +(m.test.sens * 100).toFixed(0),
  spec_t: +(m.test.spec * 100).toFixed(0),
  ppv_t: +(m.test.ppv * 100).toFixed(0),
  npv_t: +(m.test.npv * 100).toFixed(0),
  // full dataset
  sens_f: +(m.full.sens * 100).toFixed(0),
  spec_f: +(m.full.spec * 100).toFixed(0),
  ppv_f: +(m.full.ppv * 100).toFixed(0),
  npv_f: +(m.full.npv * 100).toFixed(0),
}));

// ── Bootstrap optimism data ─────────────────────────────────────────────────
export const OPTIMISM_DATA = Object.entries(MODELS).map(([k, m]) => ({
  model: m.shortLabel,
  fullLabel: m.label,
  apparent: m.cv,
  corrected: m.corr,
  cal_slope: m.cal,
  epv: m.epv,
  color: m.color,
}));

// ── RF importance data ───────────────────────────────────────────────────────
export const RF_DATA = [
  { f: "TUG", g: 0.3349, cumul: 33.5, c: "#059669", grp: "CFRS-Quick" },
  { f: "CAT score", g: 0.1656, cumul: 50.1, c: "#059669", grp: "CFRS-Quick" },
  { f: "BMI", g: 0.1142, cumul: 61.5, c: "#059669", grp: "CFRS-Quick" },
  { f: "Fall history", g: 0.1052, cumul: 72.0, c: "#7c3aed", grp: "CFRS-Full" },
  { f: "Age", g: 0.0645, cumul: 78.4, c: "#7c3aed", grp: "CFRS-Full" },
  { f: "Comorbidities", g: 0.051, cumul: 83.5, c: "#0284c7", grp: "Moderate" },
  { f: "ABE stage", g: 0.0428, cumul: 87.8, c: "#94a3b8", grp: "Lower" },
  { f: "GOLD stage", g: 0.0335, cumul: 91.2, c: "#94a3b8", grp: "Lower" },
  { f: "FRIDs", g: 0.0193, cumul: 93.1, c: "#94a3b8", grp: "Lower" },
  { f: "Exacerbations", g: 0.0159, cumul: 94.7, c: "#94a3b8", grp: "Lower" },
  { f: "Smoking", g: 0.0143, cumul: 96.1, c: "#94a3b8", grp: "Lower" },
  { f: "Exercise", g: 0.0107, cumul: 97.2, c: "#94a3b8", grp: "Lower" },
  { f: "Fear of fall", g: 0.0085, cumul: 99.0, c: "#94a3b8", grp: "Lower" },
  { f: "Unsteady", g: 0.0072, cumul: 99.8, c: "#94a3b8", grp: "Lower" },
  { f: "ICS use", g: 0.0025, cumul: 100, c: "#94a3b8", grp: "Lower" },
];

// ── Boxplot summary data (fallers vs non-fallers) ───────────────────────────
export function makeBoxData(varKey) {
  const d = DISTRIBUTIONS[varKey];
  if (!d) return [];
  return [
    { group: "All (n=107)", ...d.all, fill: "#64748b" },
    { group: "Non-fallers (n=97)", ...d.nfaller, fill: COLORS.nfaller },
    { group: "Fallers (n=10)", ...d.faller, fill: COLORS.faller },
  ];
}

// ── BoxPlot component using recharts ComposedChart + custom shape ────────────
export function BoxPlotChart({ varKey, height = 260 }) {
  const data = makeBoxData(varKey);
  const d = DISTRIBUTIONS[varKey];
  if (!d) return null;

  const allVals = data.flatMap((r) => [r.min, r.max]);
  const yMin = Math.floor(Math.min(...allVals) * 0.9);
  const yMax = Math.ceil(Math.max(...allVals) * 1.05);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis dataKey="group" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fontSize: 11, fill: "#475569" }}
          label={{
            value: d.unit,
            angle: -90,
            position: "insideLeft",
            fontSize: 11,
            fill: "#94a3b8",
          }}
        />
        <Tooltip content={<BoxTooltip />} />
        {d.normal_hi && (
          <ReferenceLine
            y={d.normal_hi}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            label={{
              value: `cutoff ${d.normal_hi}`,
              position: "right",
              fontSize: 10,
              fill: "#d97706",
            }}
          />
        )}
        {/* Render median as the visible bar value */}
        <Bar
          dataKey="median"
          name="Median"
          radius={[4, 4, 0, 0]}
          maxBarSize={55}
          label={{
            position: "top",
            fontSize: 10,
            fill: "#475569",
            formatter: (v) => v,
          }}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.fill + "cc"}
              stroke={d.fill}
              strokeWidth={1.5}
            />
          ))}
        </Bar>
        {/* Q1 whisker visual */}
        <Bar dataKey="q1" name="Q1" fill="transparent" stroke="none" />
        <Bar dataKey="q3" name="Q3" fill="transparent" stroke="none" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BoxTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload.find((p) => p.dataKey === "median")?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,.1)",
      }}
    >
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
        {label}
      </div>
      {[
        ["Min", d.min],
        ["Q1", d.q1],
        ["Median", d.median],
        ["Q3", d.q3],
        ["Max", d.max],
        ["Mean ± SD", `${d.mean} ± ${d.sd}`],
      ].map(([l, v]) => (
        <div
          key={l}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            color: "#475569",
            marginBottom: 1,
          }}
        >
          <span>{l}</span>
          <b style={{ color: "#0f172a" }}>{v}</b>
        </div>
      ))}
    </div>
  );
}

// ── Grouped bar — binary variable prevalence ─────────────────────────────────
export function BinaryPrevChart({ height = 280 }) {
  const data = CATEGORICAL.binary_vars.groups.map((g) => ({
    name: g.name,
    all: +g.all_pct.toFixed(1),
    faller: +g.faller_pct.toFixed(1),
    nfaller: +g.nfaller_pct.toFixed(1),
    sig: g.sig,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          angle={-30}
          textAnchor="end"
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => v + "%"}
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => v + "%"} />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
        <Bar
          dataKey="faller"
          name="Fallers (n=10)"
          fill={COLORS.faller}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="nfaller"
          name="Non-fallers (n=97)"
          fill={COLORS.nfaller}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="all"
          name="All patients (n=107)"
          fill={COLORS.all}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── ABE distribution chart ───────────────────────────────────────────────────
export function ABEChart({ height = 240 }) {
  const data = CATEGORICAL.ABE.groups.map((g) => ({
    name: g.name,
    nfaller: g.nfaller,
    faller: g.faller,
    fall_rate: g.fall_rate,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 60, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "#475569" }}
          label={{
            value: "Patients",
            angle: -90,
            position: "insideLeft",
            fontSize: 11,
            fill: "#94a3b8",
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 30]}
          tickFormatter={(v) => v + "%"}
          tick={{ fontSize: 11, fill: "#d97706" }}
          label={{
            value: "Fall rate %",
            angle: 90,
            position: "insideRight",
            fontSize: 11,
            fill: "#d97706",
          }}
        />
        <Tooltip
          content={
            <ChartTooltip
              formatter={(v, n) => (n === "Fall rate %" ? v + "%" : v)}
            />
          }
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar
          yAxisId="left"
          dataKey="nfaller"
          name="Non-fallers"
          stackId="a"
          fill={COLORS.nfaller}
        />
        <Bar
          yAxisId="left"
          dataKey="faller"
          name="Fallers"
          stackId="a"
          fill={COLORS.faller}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="fall_rate"
          name="Fall rate %"
          stroke="#d97706"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#d97706" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── GOLD distribution chart ──────────────────────────────────────────────────
export function GOLDChart({ height = 240 }) {
  const data = CATEGORICAL.GOLD.groups.map((g) => ({
    name: g.name,
    nfaller: g.nfaller,
    faller: g.faller,
    fall_rate: g.fall_rate,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 60, left: 0, bottom: 50 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          angle={-20}
          textAnchor="end"
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 20]}
          tickFormatter={(v) => v + "%"}
          tick={{ fontSize: 11, fill: "#d97706" }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar
          yAxisId="left"
          dataKey="nfaller"
          name="Non-fallers"
          stackId="a"
          fill={COLORS.nfaller}
        />
        <Bar
          yAxisId="left"
          dataKey="faller"
          name="Fallers"
          stackId="a"
          fill={COLORS.faller}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="fall_rate"
          name="Fall rate %"
          stroke="#d97706"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#d97706" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── BMI category chart ───────────────────────────────────────────────────────
export function BMICatChart({ height = 220 }) {
  const data = CATEGORICAL.bmi_cat.groups.map((g) => ({
    name: g.name,
    nfaller: g.nfaller,
    faller: g.faller,
    fall_rate: g.fall_rate,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 60, left: 0, bottom: 50 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          angle={-20}
          textAnchor="end"
          tick={{ fontSize: 11, fill: "#475569" }}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 20]}
          tickFormatter={(v) => v + "%"}
          tick={{ fontSize: 11, fill: "#d97706" }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar
          yAxisId="left"
          dataKey="nfaller"
          name="Non-fallers"
          stackId="a"
          fill={COLORS.nfaller}
        />
        <Bar
          yAxisId="left"
          dataKey="faller"
          name="Fallers"
          stackId="a"
          fill={COLORS.faller}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="fall_rate"
          name="Fall rate %"
          stroke="#d97706"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#d97706" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
