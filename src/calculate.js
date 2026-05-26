// calculate.js — prediction logic for CFRS models
import { MODELS } from "./modelData.js";

export const sigmoid = (x) => 1 / (1 + Math.exp(-x));

export function calcRisk(modelKey, inputs) {
  const m = MODELS[modelKey];
  if (!m) return null;

  let logOdds = m.intercept_s;
  const breakdown = [];

  for (const feat of m.preds) {
    const c = m.coefs[feat];
    const raw = parseFloat(inputs[feat]);
    if (isNaN(raw)) return null; // incomplete

    const z = (raw - c.m) / c.s;
    const term = c.bs * z;
    logOdds += term;

    breakdown.push({
      feat,
      label: c.label,
      raw,
      z: +z.toFixed(3),
      term: +term.toFixed(4),
      bs: c.bs,
      OR: c.OR,
      p: c.p,
      sig: c.sig,
      positive: term > 0,
    });
  }

  const prob = sigmoid(logOdds);
  const pct = +(prob * 100).toFixed(1);
  const thrPct = +(m.thr_tr * 100).toFixed(1);
  const above = prob >= m.thr_tr;
  const riskInfo = getRiskInfo(prob, m.thr_tr);

  return {
    modelKey,
    modelLabel: m.label,
    pct,
    thrPct,
    above,
    logOdds: +logOdds.toFixed(4),
    prob,
    breakdown,
    ...riskInfo,
    // model performance for display
    testAUC: m.test.auc,
    testSens: m.full.sens,
    testSpec: m.full.spec,
    testPPV: m.full.ppv,
    testNPV: m.full.npv,
  };
}

export function getRiskInfo(prob, threshold) {
  const ratio = prob / threshold;
  if (prob >= threshold) {
    if (ratio >= 1.5)
      return {
        level: "HIGH",
        label: "High Risk",
        color: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
        icon: "⚠",
      };
    return {
      level: "ELEVATED",
      label: "Elevated Risk",
      color: "#ea580c",
      bg: "#fff7ed",
      border: "#fed7aa",
      icon: "⚠",
    };
  }
  if (ratio >= 0.7)
    return {
      level: "BORDERLINE",
      label: "Borderline",
      color: "#ca8a04",
      bg: "#fefce8",
      border: "#fef08a",
      icon: "⚡",
    };
  return {
    level: "LOW",
    label: "Low Risk",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: "✓",
  };
}

export function calcAllModels(inputs) {
  const out = {};
  for (const key of Object.keys(MODELS)) {
    const m = MODELS[key];
    const ok = m.preds.every(
      (p) =>
        inputs[p] !== undefined &&
        inputs[p] !== "" &&
        !isNaN(parseFloat(inputs[p]))
    );
    if (ok) out[key] = calcRisk(key, inputs);
  }
  return out;
}

export function isComplete(modelKey, inputs) {
  const m = MODELS[modelKey];
  if (!m) return false;
  return m.preds.every(
    (p) =>
      inputs[p] !== undefined &&
      inputs[p] !== "" &&
      !isNaN(parseFloat(inputs[p]))
  );
}

export function getRawFormula(modelKey) {
  const m = MODELS[modelKey];
  if (!m) return "";
  const terms = m.preds
    .map((p) => {
      const b = m.coefs[p].br;
      return `${b >= 0 ? " + " : " - "}${Math.abs(b).toFixed(4)}×${p.replace(
        "_",
        " "
      )}`;
    })
    .join("");
  return `log-odds = ${m.intercept_r.toFixed(4)}${terms}`;
}

export function getScaledFormula(modelKey) {
  const m = MODELS[modelKey];
  if (!m) return "";
  const terms = m.preds
    .map((p) => {
      const c = m.coefs[p];
      return `${c.bs >= 0 ? " + " : " - "}${Math.abs(c.bs).toFixed(
        4
      )}×z_${p.replace("_", " ")}`;
    })
    .join("");
  return `log-odds = ${m.intercept_s.toFixed(4)}${terms}`;
}

export function getClinicalMessage(result) {
  if (!result) return null;
  const { above, level, pct, thrPct } = result;
  const msgs = {
    HIGH: `Fall probability ${pct}% exceeds threshold ${thrPct}% by >50%. Urgent fall-prevention referral recommended: pulmonary rehabilitation, gait assessment, Beers criteria review.`,
    ELEVATED: `Fall probability ${pct}% exceeds screening threshold (${thrPct}%). Consider structured fall risk assessment and targeted intervention programme.`,
    BORDERLINE: `Fall probability ${pct}% approaches threshold (${thrPct}%). Monitor closely; reassess if clinical status changes.`,
    LOW: `Fall probability ${pct}% is below threshold (${thrPct}%). Routine COPD follow-up recommended.`,
  };
  return msgs[level];
}

// Format p-value for display
export function fmtP(p) {
  if (p === null || p === undefined) return "N/A";
  if (p < 0.001) return "<0.001";
  return p.toFixed(4);
}

export function fmtPct(v, decimals = 0) {
  return (v * 100).toFixed(decimals) + "%";
}
