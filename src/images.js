// images.js — SVG gauge, icons, decorative components

import React from "react";

// ── Risk Gauge ──────────────────────────────────────────────────────────────
export function RiskGauge({
  pct = 0,
  thr = 50,
  color = "#10b981",
  size = 160,
}) {
  const toRad = (d) => (d * Math.PI) / 180;
  const cx = 80,
    cy = 80,
    r = 58,
    rInner = 42;
  const startAng = -210,
    endAng = 30; // 240 degree sweep

  function polarToXY(cx, cy, r, angleDeg) {
    const a = toRad(angleDeg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function arcPath(cx, cy, r, a1, a2) {
    const p1 = polarToXY(cx, cy, r, a1);
    const p2 = polarToXY(cx, cy, r, a2);
    const lg = a2 - a1 > 180 ? 1 : 0;
    return `M${p1.x.toFixed(2)} ${p1.y.toFixed(
      2
    )} A${r} ${r} 0 ${lg} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const fillAng = startAng + (pct / 100) * (endAng - startAng);
  const thrAng = startAng + (thr / 100) * (endAng - startAng);
  const needleEnd = polarToXY(cx, cy, r - 10, fillAng);

  // Threshold tick
  const thrO = polarToXY(cx, cy, r + 6, thrAng);
  const thrI = polarToXY(cx, cy, r - 2, thrAng);

  // Zone colours
  const zones = [
    { a1: startAng, a2: startAng + 80, c: "#dcfce7" },
    { a1: startAng + 80, a2: startAng + 160, c: "#fef9c3" },
    { a1: startAng + 160, a2: endAng, c: "#fee2e2" },
  ];

  return (
    <svg viewBox="0 0 160 120" style={{ width: size, height: size * 0.75 }}>
      {/* Zone arcs (thick) */}
      {zones.map((z, i) => (
        <path
          key={i}
          d={arcPath(cx, cy, r, z.a1, z.a2)}
          fill="none"
          stroke={z.c}
          strokeWidth="14"
          strokeLinecap="butt"
        />
      ))}
      {/* Background track */}
      <path
        d={arcPath(cx, cy, r, startAng, endAng)}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {pct > 0 && (
        <path
          d={arcPath(cx, cy, r, startAng, fillAng)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      {/* Threshold tick */}
      <line
        x1={thrI.x}
        y1={thrI.y}
        x2={thrO.x}
        y2={thrO.y}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleEnd.x.toFixed(1)}
        y2={needleEnd.y.toFixed(1)}
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Hub */}
      <circle cx={cx} cy={cy} r="6" fill="#1e293b" />
      <circle cx={cx} cy={cy} r="3" fill="#fff" />
      {/* Center label */}
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill={color}
        fontFamily="system-ui"
      >
        {pct}%
      </text>
      <text
        x={cx}
        y={cy + 35}
        textAnchor="middle"
        fontSize="9"
        fill="#94a3b8"
        fontFamily="system-ui"
      >
        threshold {thr}%
      </text>
    </svg>
  );
}

// ── Mini inline gauge (for compare cards) ──────────────────────────────────
export function MiniGauge({ pct = 0, thr = 50, color = "#10b981" }) {
  const toRad = (d) => (d * Math.PI) / 180;
  const cx = 50,
    cy = 50,
    r = 36;
  function arc(a1, a2) {
    const x1 = cx + r * Math.cos(toRad(a1)),
      y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2)),
      y2 = cy + r * Math.sin(toRad(a2));
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${
      a2 - a1 > 180 ? 1 : 0
    } 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  const sa = -135,
    ea = 135;
  const fa = sa + (pct / 100) * (ea - sa);
  const ta = sa + (thr / 100) * (ea - sa);
  const nx = cx + r * 0.7 * Math.cos(toRad(fa));
  const ny = cy + r * 0.7 * Math.sin(toRad(fa));
  const tx = cx + (r + 6) * Math.cos(toRad(ta));
  const ty = cy + (r + 6) * Math.sin(toRad(ta));
  return (
    <svg viewBox="0 0 100 70" style={{ width: 100, height: 70 }}>
      <path
        d={arc(sa, ea)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={arc(sa, fa)}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
      <circle cx={tx} cy={ty} r="3" fill="#64748b" />
      <line
        x1={cx}
        y1={cy}
        x2={nx.toFixed(1)}
        y2={ny.toFixed(1)}
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
      <text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill={color}
        fontFamily="system-ui"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Custom boxplot shape for recharts ──────────────────────────────────────
export function BoxPlotShape(props) {
  const { x, width, q1, median, q3, min: mn, max: mx, fill, stroke } = props;
  if (!q1) return null;
  const cx = x + width / 2;
  const w = Math.max(width * 0.5, 20);
  return (
    <g>
      <line
        x1={cx}
        y1={props.yScale(mn)}
        x2={cx}
        y2={props.yScale(q1)}
        stroke={stroke || fill}
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <line
        x1={cx}
        y1={props.yScale(q3)}
        x2={cx}
        y2={props.yScale(mx)}
        stroke={stroke || fill}
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <rect
        x={cx - w / 2}
        y={props.yScale(q3)}
        width={w}
        height={props.yScale(q1) - props.yScale(q3)}
        fill={fill + "40"}
        stroke={fill}
        strokeWidth={2}
        rx={3}
      />
      <line
        x1={cx - w / 2}
        y1={props.yScale(median)}
        x2={cx + w / 2}
        y2={props.yScale(median)}
        stroke={fill}
        strokeWidth={3}
      />
      <line
        x1={cx - w / 4}
        y1={props.yScale(mn)}
        x2={cx + w / 4}
        y2={props.yScale(mn)}
        stroke={fill}
        strokeWidth={1.5}
      />
      <line
        x1={cx - w / 4}
        y1={props.yScale(mx)}
        x2={cx + w / 4}
        y2={props.yScale(mx)}
        stroke={fill}
        strokeWidth={1.5}
      />
    </g>
  );
}

// ── Study / Hospital badge ─────────────────────────────────────────────────
export function StudyBadge({ style = {} }) {
  return (
    <svg viewBox="0 0 220 56" style={{ width: 220, opacity: 0.18, ...style }}>
      <rect
        width="220"
        height="56"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <text
        x="110"
        y="18"
        textAnchor="middle"
        fontSize="7.5"
        fill="currentColor"
        fontFamily="monospace"
        letterSpacing="1"
      >
        DISTRICT 11 HOSPITAL
      </text>
      <text
        x="110"
        y="30"
        textAnchor="middle"
        fontSize="6.5"
        fill="currentColor"
        fontFamily="monospace"
        letterSpacing=".5"
      >
        HO CHI MINH CITY · VIETNAM
      </text>
      <text
        x="110"
        y="42"
        textAnchor="middle"
        fontSize="6"
        fill="currentColor"
        fontFamily="monospace"
      >
        PROSPECTIVE COHORT · N=107 · 2024
      </text>
      <text
        x="110"
        y="52"
        textAnchor="middle"
        fontSize="5.5"
        fill="currentColor"
        fontFamily="monospace"
      >
        STROBE + TRIPOD COMPLIANT
      </text>
    </svg>
  );
}

// ── Lung SVG decoration ────────────────────────────────────────────────────
export function LungIcon({ size = 28, color = "#fff" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Khí quản giữa */}
      <path d="M12 2v6" />

      {/* Phổi trái */}
      <path d="M12 8c0 0-1 0-2 1C8 10 6 10 5 11c-1.5 1-2 2.5-2 4 0 2.5 1.5 5 4 5.5 0 0 1 .5 2-.5l1-2" />

      {/* Phổi phải */}
      <path d="M12 8c0 0 1 0 2 1 2 1 4 1 5 2 1.5 1 2 2.5 2 4 0 2.5-1.5 5-4 5.5 0 0-1 .5-2-.5l-1-2" />

      {/* Đáy phổi nối nhau */}
      <path d="M10 18c0 1.1.9 2 2 2s2-.9 2-2" />
    </svg>
  );
}

// ── Chevron ────────────────────────────────────────────────────────────────
export function ChevronIcon({ down = true, size = 16, color = "#94a3b8" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {down ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <polyline points="18 15 12 9 6 15" />
      )}
    </svg>
  );
}
