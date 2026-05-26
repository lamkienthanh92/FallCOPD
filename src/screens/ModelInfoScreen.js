// screens/ModelInfoScreen.js
import React, { useState } from "react";
import { MODELS, PRED_META } from "../modelData.js";
import { getRawFormula, getScaledFormula, fmtP, fmtPct } from "../calculate.js";
import { ChevronIcon } from "../images.js";

const css = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 8px rgba(0,0,0,.05)",
    marginBottom: 12,
  },
  title: {
    fontFamily: "'DM Serif Display',Georgia,serif",
    fontSize: 20,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-.02em",
  },
  sub: { fontSize: 12, color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 },
  mono: { fontFamily: "monospace", fontSize: 11 },
};

function StatPill({ label, value, color }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 9,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
        {label}
      </div>
    </div>
  );
}

function ModelPanel({ mkey }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("coefs");
  const m = MODELS[mkey];

  return (
    <div style={css.card}>
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          background: open ? m.color + "0a" : "#fff",
          border: "none",
          cursor: "pointer",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 16, color: m.color }}>
              {m.label}
            </span>
            {m.badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: 99,
                  background: m.color + "20",
                  color: m.color,
                }}
              >
                {m.badge}
              </span>
            )}
            {m.sep && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 9px",
                  borderRadius: 99,
                  background: "#fee2e2",
                  color: "#dc2626",
                }}
              >
                separation ⚠
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
            {m.desc}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 99,
              background: m.color + "18",
              color: m.color,
            }}
          >
            CV {m.cv.toFixed(3)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 99,
              background: m.color + "18",
              color: m.color,
            }}
          >
            Test {m.test.auc}
          </span>
          <ChevronIcon down={!open} color={m.color} size={18} />
        </div>
      </button>

      {open && (
        <div
          style={{
            borderTop: `1px solid ${m.color}30`,
            padding: "0 20px 20px",
          }}
        >
          {/* Performance grid */}
          <div style={{ margin: "16px 0" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Performance summary
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
                gap: 8,
              }}
            >
              {[
                ["CV AUC", `${m.cv.toFixed(3)} ±${m.cv_sd}`],
                ["CV range", `${m.cv_min}–${m.cv_max}`],
                ["Corrected", m.corr.toFixed(3)],
                ["Cal. slope", m.cal.toFixed(3)],
                ["Test AUC", m.test.auc],
                ["Test 95% CI", `${m.test.lo}–${m.test.hi}`],
                ["Full AUC", m.full.auc],
                ["Full 95% CI", `${m.full.lo}–${m.full.hi}`],
              ].map(([l, v]) => (
                <StatPill key={l} label={l} value={v} color={m.color} />
              ))}
            </div>
          </div>

          {/* Test-set diagnostic accuracy */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Diagnostic accuracy at Youden threshold (test set, n=33)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              {[
                ["Sensitivity", fmtPct(m.test.sens)],
                ["Specificity", fmtPct(m.test.spec)],
                ["PPV", fmtPct(m.test.ppv)],
                ["NPV", fmtPct(m.test.npv)],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    background: m.color + "10",
                    border: `1px solid ${m.color}30`,
                    borderRadius: 9,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 22, fontWeight: 800, color: m.color }}
                  >
                    {v}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
              Threshold (Youden, train set):{" "}
              <b style={{ color: m.color }}>{(m.thr_tr * 100).toFixed(1)}%</b> ·
              Threshold (full dataset):{" "}
              <b style={{ color: m.color }}>{(m.thr_fu * 100).toFixed(1)}%</b>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              ["coefs", "Coefficients"],
              ["formula", "Formula"],
              ["fit", "Model fit"],
            ].map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: tab === id ? 700 : 500,
                  cursor: "pointer",
                  border: `1.5px solid ${tab === id ? m.color : "#e2e8f0"}`,
                  background: tab === id ? m.color + "14" : "#f8fafc",
                  color: tab === id ? m.color : "#64748b",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {tab === "coefs" && (
            <div>
              <div style={{ overflowX: "auto" }}>
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
                        "Predictor",
                        "β (raw)",
                        "β (scaled)",
                        "SE (raw)",
                        "OR (raw)",
                        "95% CI",
                        "p-value",
                        "Sig.",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
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
                    <tr
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        background: "#f8fafc",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 10px",
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Intercept
                      </td>
                      <td style={{ padding: "8px 10px", ...css.mono }}>
                        {m.intercept_r.toFixed(4)}
                      </td>
                      <td style={{ padding: "8px 10px", ...css.mono }}>
                        {m.intercept_s.toFixed(4)}
                      </td>
                      <td colSpan={5} />
                    </tr>
                    {m.preds.map((feat, i) => {
                      const c = m.coefs[feat];
                      const pm = PRED_META[feat];
                      return (
                        <tr
                          key={feat}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: i % 2 === 0 ? "#fff" : "#f8fafc",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px 10px",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {pm.label}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              ...css.mono,
                              color: c.br > 0 ? "#dc2626" : "#16a34a",
                              fontWeight: 700,
                            }}
                          >
                            {c.br.toFixed(4)}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              ...css.mono,
                              color: c.bs > 0 ? "#dc2626" : "#16a34a",
                            }}
                          >
                            {c.bs.toFixed(4)}
                          </td>
                          <td style={{ padding: "8px 10px", ...css.mono }}>
                            {c.SE != null ? (
                              c.SE.toFixed(4)
                            ) : (
                              <span style={{ color: "#94a3b8" }}>N/A†</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 10px", ...css.mono }}>
                            {c.OR.toFixed(4)}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              ...css.mono,
                              fontSize: 10,
                              color: "#64748b",
                            }}
                          >
                            —
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {c.p != null ? (
                              <span
                                style={{
                                  color: c.sig ? m.color : "#94a3b8",
                                  fontWeight: c.sig ? 700 : 400,
                                }}
                              >
                                {fmtP(c.p)}
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                                N/A†
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            {c.sig === true && (
                              <span style={{ color: m.color, fontWeight: 800 }}>
                                * p&lt;0.05
                              </span>
                            )}
                            {c.sig === false && (
                              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                                ns
                              </span>
                            )}
                            {c.sig === null && (
                              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                                N/A†
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {m.sep && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "#fef9c3",
                    borderRadius: 7,
                    fontSize: 11,
                    color: "#92400e",
                  }}
                >
                  † Complete separation detected in CDC-STEADI — statsmodels MLE
                  unreliable for this model. SE and p-values unavailable.
                  Coefficients from sklearn L2-regularised logistic regression.
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
                β (raw) = unstandardized coefficient. β (scaled) = standardized
                (z-score input). OR (raw) = exp(β_raw), interpretation per raw
                unit change.
              </div>
            </div>
          )}

          {tab === "formula" && (
            <div>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 9,
                  padding: "14px 16px",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#166534",
                  marginBottom: 12,
                  wordBreak: "break-all",
                  lineHeight: 1.8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    marginBottom: 6,
                    fontFamily: "sans-serif",
                    fontWeight: 700,
                  }}
                >
                  RAW FORMULA (unstandardised — for reporting)
                </div>
                {getRawFormula(mkey)}
                <br />
                P(fall) = 1 / (1 + exp(−log_odds))
              </div>
              <div
                style={{
                  background: "#f5f3ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: 9,
                  padding: "14px 16px",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#5b21b6",
                  marginBottom: 12,
                  wordBreak: "break-all",
                  lineHeight: 1.8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#64748b",
                    marginBottom: 6,
                    fontFamily: "sans-serif",
                    fontWeight: 700,
                  }}
                >
                  SCALED FORMULA (standardised — for deployment)
                </div>
                {getScaledFormula(mkey)}
                <br />
                <span style={{ color: "#8b5cf6" }}>
                  where z_x = (x − mean) / std
                </span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  Scaler parameters (StandardScaler, fitted on training set)
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid #e2e8f0" }}>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        Predictor
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        Mean
                      </th>
                      <th
                        style={{
                          padding: "6px 10px",
                          textAlign: "right",
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        SD (scale)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.preds.map((feat, i) => {
                      const c = m.coefs[feat];
                      return (
                        <tr
                          key={feat}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: i % 2 === 0 ? "#f8fafc" : "#fff",
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 10px",
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {feat.replace("_", " ")}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              fontFamily: "monospace",
                              fontSize: 11,
                              textAlign: "right",
                            }}
                          >
                            {c.m}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              fontFamily: "monospace",
                              fontSize: 11,
                              textAlign: "right",
                            }}
                          >
                            {c.s}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  background: "#f8fafc",
                  borderRadius: 7,
                  fontSize: 11,
                  color: "#64748b",
                }}
              >
                Threshold (Youden, train→test):{" "}
                <b style={{ color: m.color }}>{(m.thr_tr * 100).toFixed(1)}%</b>{" "}
                · Threshold (full dataset):{" "}
                <b style={{ color: m.color }}>{(m.thr_fu * 100).toFixed(1)}%</b>
              </div>
            </div>
          )}

          {tab === "fit" && (
            <div>
              {m.fit ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(150px,1fr))",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      ["Pseudo-R² (McFadden)", m.fit.r2],
                      ["LLR p-value", m.fit.llr],
                      ["AIC", m.fit.aic],
                      ["BIC", m.fit.bic],
                      ["EPV", m.epv],
                      ["Cal. slope", m.cal],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: m.color,
                          }}
                        >
                          {v}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {l}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}
                  >
                    <b>EPV interpretation:</b> Events-per-variable = {m.epv}{" "}
                    (target ≥10). All models below threshold — calibration
                    overfitted; rank-ordering preserved.
                    <br />
                    <b>Calibration slope:</b> {m.cal.toFixed(3)} (target = 1.0).
                    Values &lt;1 indicate predicted probabilities too extreme;
                    values &gt;1 indicate under-dispersion.
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#fef9c3",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  Model fit statistics unavailable for CDC-STEADI — complete
                  separation detected; statsmodels MLE did not converge.
                  Coefficients from sklearn L2-regularised regression.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModelInfoScreen() {
  return (
    <div>
      <div
        style={{
          ...css.card,
          padding: "16px 20px",
          marginBottom: 16,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 14,
        }}
      >
        <div style={css.title}>Model reference guide</div>
        <p style={{ ...css.sub, margin: 0 }}>
          All models use L2-regularised logistic regression (sklearn,
          class_weight=balanced, max_iter=1000). Coefficients are from sklearn;
          p-values and SE from statsmodels MLE where convergent. Click any model
          to expand details.
        </p>
      </div>
      {Object.keys(MODELS).map((k) => (
        <ModelPanel key={k} mkey={k} />
      ))}
    </div>
  );
}
