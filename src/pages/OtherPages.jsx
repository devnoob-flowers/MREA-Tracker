// ── PAGE: P&L MODEL ──
import React from "react";
import { PageHeader, SectionTitle, PLTable, Alert } from "../components/UI";
import {
  fmt,
  calcPL,
  totalNetGCI,
  totalGrossGCI,
  totalTakeHome,
} from "../utils/store";

export function PLPage({ state }) {
  const { settings: cfg, closings } = state;

  function buildRows(closings, price, comm, split, expPct, taxPct, tcCost = 0) {
    const pl = calcPL(closings, price, comm, split, expPct, taxPct, tcCost);
    return [
      { label: "Income", type: "section" },
      { label: "Closings", value: `${closings} transactions` },
      { label: "Average sale price", value: `$${price.toLocaleString()}` },
      { label: "Commission rate", value: `${comm}%` },
      { label: "Gross GCI", value: fmt(pl.gross), type: "pos" },
      {
        label: `Brokerage split (${split}%)`,
        value: `−${fmt(pl.gross - pl.net)}`,
        type: "neg",
      },
      { label: "Net GCI after split", value: fmt(pl.net), type: "neu" },
      { label: "Business expenses", type: "section" },
      {
        label: "Cost of sales (~29% of gross GCI)",
        value: `−${fmt(pl.gross * 0.29)}`,
        type: "neg",
      },
      {
        label: "Operating expenses",
        value: `−${fmt(pl.net * 0.2)}`,
        type: "neg",
      },
      ...(tcCost
        ? [
            {
              label: "Transaction coordinator",
              value: `−${fmt(tcCost)}`,
              type: "neg",
            },
          ]
        : []),
      { label: "Total expenses", value: `−${fmt(pl.expenses)}`, type: "neg" },
      { label: "Net", type: "section" },
      { label: "Net before tax", value: fmt(pl.afterExp), type: "neu" },
      {
        label: `Self-employment tax (${taxPct}%)`,
        value: `−${fmt(pl.tax)}`,
        type: "neg",
      },
      { label: "Est. take-home", value: fmt(pl.takeHome), type: "total" },
    ];
  }

  // Actual YTD
  const grossA = totalGrossGCI(closings);
  const netA = totalNetGCI(closings);
  const expA = (netA * (cfg.exp || 33)) / 100;
  const afterExpA = netA - expA;
  const taxA = Math.max(0, (afterExpA * (cfg.tax || 25)) / 100);
  const takeA = Math.max(0, afterExpA - taxA);

  const actualRows = [
    { label: "Actual YTD", type: "section" },
    { label: "Closings logged", value: `${closings.length} transactions` },
    { label: "Gross GCI", value: fmt(grossA), type: "pos" },
    { label: "Net GCI (after splits)", value: fmt(netA), type: "neu" },
    {
      label: `Est. expenses (${cfg.exp || 33}%)`,
      value: `−${fmt(expA)}`,
      type: "neg",
    },
    { label: "Net before tax", value: fmt(afterExpA), type: "neu" },
    {
      label: `Est. tax (${cfg.tax || 25}%)`,
      value: `−${fmt(taxA)}`,
      type: "neg",
    },
    { label: "Est. take-home", value: fmt(takeA), type: "total" },
    {
      label: `Remaining to ${fmt(cfg.gci1 || 75000)} GCI`,
      value: fmt(Math.max(0, (cfg.gci1 || 75000) - netA)),
      type: netA >= (cfg.gci1 || 75000) ? "pos" : "neg",
    },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="P&L Model"
        desc="Your full economic model — gross to take-home. Based on your actual logged closings."
      />

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div>
          <SectionTitle>Year 1 — {fmt(cfg.gci1 || 75000)} target</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Year 1: 8 closings, $300K avg, 3% = $9K/closing = $72K gross */}
            <PLTable
              rows={buildRows(
                cfg.close1 || 8,
                cfg.price || 300000,
                cfg.comm || 3,
                cfg.split || 26,
                cfg.exp || 33,
                cfg.tax || 25,
              )}
            />
          </div>
        </div>
        <div>
          <SectionTitle>Year 3 — {fmt(cfg.gci3 || 150000)} target</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Year 3: 17 closings, $300K avg, 3% = $9K/closing = $153K gross */}
            <PLTable
              rows={buildRows(
                cfg.close3 || 17,
                cfg.price3 || 300000,
                cfg.comm || 3,
                cfg.split || 26,
                cfg.exp || 33,
                cfg.tax || 25,
                cfg.tc || 0,
              )}
            />
          </div>
        </div>
      </div>

      <SectionTitle>Your actual numbers — year to date</SectionTitle>
      <div
        className="card"
        style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}
      >
        <PLTable rows={actualRows} />
      </div>

      <Alert type="warn">
        Set aside {cfg.tax || 25}% of every commission check into a separate tax
        savings account the day it hits. Don't wait. Don't negotiate with
        yourself. It's not your money.
      </Alert>
    </div>
  );
}

// ── PAGE: LEAD FUNNEL ──
// Conversion rates (MREA model):
//   Lead → Appointment: 20%
//   Appointment → Contract: 80%
//   Contract → Closing: 65%
//   Combined (lead → closing): ~10%

export function FunnelPage({ state, onUpdate }) {
  const { settings: cfg, closings, daily = [], funnel } = state;
  const dt = {
    leads: daily.reduce((s, d) => s + (d.leads || 0), 0),
    appts: daily.reduce((s, d) => s + (d.appts || 0), 0),
  };
  const leads = funnel?.leads || dt.leads;
  const appts = funnel?.appts || dt.appts;
  const contracts = funnel?.contracts || 0;
  const closed = closings.length;
  const touches = (cfg.db || 100) * 33 + (cfg.farm || 200) * 12;
  const gci = totalNetGCI(closings);

  function setFunnel(field, val) {
    onUpdate({
      ...state,
      funnel: { ...(funnel || {}), [field]: parseInt(val) || 0 },
    });
  }

  function rate(a, b) {
    return b ? `${Math.round((a / b) * 100)}% conv.` : "—";
  }

  const rows = [
    {
      num: touches.toLocaleString(),
      name: "Annual touches sent",
      sub: `${cfg.db || 100} database × 33 + ${cfg.farm || 200} farm × 12`,
      color: "var(--gold2)",
    },
    {
      num: leads,
      name: "Leads generated",
      sub: "Inbound — calls, emails, referrals, open houses",
      rate: null,
      editable: "leads",
    },
    {
      num: appts,
      name: "Appointments set",
      sub: "Listing and buyer consultations (20% of leads)",
      rate: rate(appts, leads),
      editable: "appts",
    },
    {
      num: contracts,
      name: "Contracts signed",
      sub: "Listing + buyer rep agreements (80% of appts)",
      rate: rate(contracts, appts),
      editable: "contracts",
    },
    {
      num: closed,
      name: "Closings",
      sub: "Completed transactions (65% of contracts)",
      rate: rate(closed, contracts),
    },
    {
      num: fmt(gci),
      name: "GCI generated",
      sub: "Based on logged closings",
      color: "#4ade80",
    },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="Lead Funnel"
        desc="Track every stage. Leads and appointments pull automatically from your Daily Log."
      />
      <Alert type="info">
        The number that matters most is <strong>leads in</strong>. Until you
        have more leads than you can handle, nothing else matters.
      </Alert>
      <Alert type="success" style={{ fontSize: 12 }}>
        ✓ Leads and appointments are pulled from your Daily Log. Contracts must
        be entered manually.
      </Alert>

      <div className="sidebar-layout">
        <div>
          <SectionTitle>Your funnel — enter actual numbers</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      minWidth: 80,
                      color: row.color || "var(--text)",
                    }}
                  >
                    {row.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {row.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        marginTop: 2,
                      }}
                    >
                      {row.sub}
                    </div>
                  </div>
                  {row.editable && (
                    <input
                      type="number"
                      min="0"
                      defaultValue={row.num || 0}
                      onChange={(e) => setFunnel(row.editable, e.target.value)}
                      style={{
                        width: 80,
                        background: "var(--input-bg)",
                        border: "1px solid var(--border2)",
                        borderRadius: 8,
                        padding: "7px 10px",
                        fontSize: 14,
                        color: "var(--text)",
                        textAlign: "right",
                        outline: "none",
                        fontFamily: "var(--font-sans)",
                      }}
                    />
                  )}
                  {row.rate && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        minWidth: 56,
                        textAlign: "right",
                      }}
                    >
                      {row.rate}
                    </div>
                  )}
                </div>
                {i < rows.length - 1 && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                      color: "var(--text3)",
                      padding: "2px 0",
                    }}
                  >
                    ↓
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>MREA conversion targets</SectionTitle>
          <div className="card" style={{ marginBottom: 14 }}>
            {[
              ["Lead → Appointment", "20%"],
              ["Appointment → Contract", "80%"],
              ["Contract → Closing", "65%"],
              ["Lead → Closing (overall)", "~10%"],
            ].map(([k, v], i, a) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom:
                    i < a.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{k}</span>
                <span style={{ color: "var(--gold2)", fontWeight: 600 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>

          <SectionTitle>Year targets</SectionTitle>
          <div className="card" style={{ marginBottom: 14 }}>
            {[
              ["Year 1 closings", "8"],
              ["Year 1 leads/mo", "~7/mo"],
              ["Year 3 closings", "17"],
              ["Year 3 leads/mo", "~14/mo"],
            ].map(([k, v], i, a) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom:
                    i < a.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{k}</span>
                <span style={{ color: "var(--gold2)", fontWeight: 600 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>

          <SectionTitle>Your conversion rates</SectionTitle>
          <div className="card">
            {leads > 0 ? (
              [
                ["Leads → Appts", rate(appts, leads)],
                ["Appts → Contracts", rate(contracts, appts)],
                ["Contracts → Close", rate(closed, contracts)],
                ["Overall", rate(closed, leads)],
              ].map(([k, v], i, a) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom:
                      i < a.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--text2)" }}>{k}</span>
                  <span style={{ color: "var(--gold2)", fontWeight: 600 }}>
                    {v}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  color: "var(--text3)",
                  textAlign: "center",
                  padding: "10px 0",
                  fontSize: 12,
                }}
              >
                Enter numbers to see rates
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE: ACTION PLAN ──
export function ActionPlanPage({ state, onUpdate }) {
  const { goals = {} } = state;
  const { GOAL_DEFAULTS } = require("../utils/store");

  function getGoals(horizon) {
    return goals[horizon] || GOAL_DEFAULTS[horizon] || [];
  }

  function toggle(horizon, id) {
    const list = getGoals(horizon);
    const updated = list.map((g) =>
      g.id === id ? { ...g, done: !g.done } : g,
    );
    onUpdate({ ...state, goals: { ...goals, [horizon]: updated } });
  }

  const horizons = [
    { key: "week", label: "This week — non-negotiables" },
    { key: "month", label: "This month" },
    { key: "quarter", label: "90 days — first quarter" },
    { key: "year", label: "Full year targets" },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="Year 1 Action Plan"
        desc="The specific actions that get you from $0 to $75K GCI. Check them off as you go."
      />
      <Alert type="gold">
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--gold2)",
          }}
        >
          "Until you have enough leads to exceed your goals, there is no other
          issue."
        </span>
      </Alert>
      <div className="grid-2">
        {horizons.map((h) => (
          <div key={h.key}>
            <SectionTitle>{h.label}</SectionTitle>
            <div className="card" style={{ padding: 14 }}>
              {getGoals(h.key).map((g) => (
                <div
                  key={g.id}
                  className={`milestone${g.done ? " done" : ""}`}
                  onClick={() => toggle(h.key, g.id)}
                >
                  <div className="ms-dot">{g.done ? "✓" : ""}</div>
                  <div className="ms-text">{g.text}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SectionTitle>Your daily power hour</SectionTitle>
      <div className="card-gold">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: 8,
            fontSize: 13,
            lineHeight: 2.2,
          }}
        >
          {[
            [
              "6:00–7:30am",
              "Power hour — 5 database calls before anything else. No email. No admin.",
            ],
            ["7:30–9:00am", "Follow up all open leads from previous day"],
            ["9:00am+", "Appointments, showings, transactions, admin"],
            [
              "Every Friday",
              "Review week — log all numbers, plan next week, add contacts to CRM",
            ],
          ].map(([time, task]) => (
            <React.Fragment key={time}>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                {time}
              </span>
              <span style={{ color: "var(--text2)" }}>{task}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE: SCALE MODEL ──
// MREA conversion rates: Lead→Appt 20%, Appt→Contract 80%, Contract→Close 65%, ~10% lead→close
// Year 1: 8 closings, ~7 leads/mo | Year 3: 17 closings, ~14 leads/mo | Year 5: 111 closings, ~89 leads/mo
const SCALE_MODEL = [
  {
    year: "Year 1",
    closings: 8,
    price: 300000,
    gross: 72000,
    net: 57600,
    exp: 34200,
    take: 38000,
    leads: "~7/mo",
    team: "Solo",
    unlock: "Consistent daily prospecting",
  },
  {
    year: "Year 2",
    closings: 12,
    price: 300000,
    gross: 108000,
    net: 86400,
    exp: 51300,
    take: 57000,
    leads: "~10/mo",
    team: "Solo",
    unlock: "SOI + open house system running",
  },
  {
    year: "Year 3",
    closings: 17,
    price: 300000,
    gross: 153000,
    net: 122400,
    exp: 68000,
    take: 82000,
    leads: "~14/mo",
    team: "Solo + PT TC",
    unlock: "Hire part-time TC, add buyer agent",
  },
  {
    year: "Year 4",
    closings: 40,
    price: 310000,
    gross: 372000,
    net: 297600,
    exp: 148000,
    take: 180000,
    leads: "~33/mo",
    team: "Small team",
    unlock: "Buyer agent + listing coordinator",
  },
  {
    year: "Year 5",
    closings: 111,
    price: 310000,
    gross: 1032300,
    net: 825840,
    exp: 590000,
    take: 410000,
    leads: "~89/mo",
    team: "Full team",
    unlock: "Paid lead gen + referral engine",
  },
];

export function ScalePage() {
  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="Scale Model"
        desc="How your business grows from Year 1 through Year 5. Every number tied to MREA conversion rates."
      />

      <Alert type="info" style={{ marginBottom: 20 }}>
        <strong>The key insight:</strong> Year 1–3 is a solo operation — 7 to 14
        leads/month is very manageable with consistent daily prospecting. The
        Year 5 jump to 89 leads/month is where you <em>must</em> have a team and
        a real lead gen system working for you around the clock. That's the
        leverage piece Gary Keller builds the whole book around.
      </Alert>

      <SectionTitle>Conversion rates baked into this model</SectionTitle>
      <div className="card" style={{ marginBottom: 20, padding: "12px 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {[
            ["Lead → Appt", "20%"],
            ["Appt → Contract", "80%"],
            ["Contract → Close", "65%"],
            ["Lead → Close", "~10%"],
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 22, fontWeight: 700, color: "var(--gold2)" }}
              >
                {val}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Year-by-year projection</SectionTitle>
      <div
        className="card"
        style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}
      >
        <table className="log-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Closings</th>
              <th>Leads/mo</th>
              <th>Gross GCI</th>
              <th>After split</th>
              <th>Expenses</th>
              <th>Est. Take-home</th>
              <th>Team</th>
              <th>Key unlock</th>
            </tr>
          </thead>
          <tbody>
            {SCALE_MODEL.map((row, i) => (
              <tr
                key={i}
                style={i === 0 ? { background: "rgba(201,168,76,0.06)" } : {}}
              >
                <td
                  style={{
                    color: i === 0 ? "var(--gold)" : "var(--text2)",
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {row.year} {i === 0 ? "← now" : ""}
                </td>
                <td style={{ color: "var(--text)" }}>{row.closings}</td>
                <td style={{ color: "var(--gold2)", fontWeight: 600 }}>
                  {row.leads}
                </td>
                <td style={{ color: "#93c5fd" }}>{fmt(row.gross)}</td>
                <td>{fmt(row.net)}</td>
                <td style={{ color: "#f87171" }}>−{fmt(row.exp)}</td>
                <td style={{ color: "#4ade80", fontWeight: 600 }}>
                  {fmt(row.take)}
                </td>
                <td style={{ color: "var(--text2)" }}>{row.team}</td>
                <td style={{ color: "var(--text3)", fontSize: 11 }}>
                  {row.unlock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Leverage hire timeline — Keller's model</SectionTitle>
      <div className="grid-3">
        {[
          {
            trigger: "At $75K GCI",
            title: "Part-time TC",
            body: "Transaction coordinator handles paperwork and scheduling. You focus only on lead gen and listing appointments. Cost: ~$18K/yr.",
          },
          {
            trigger: "At $150K GCI",
            title: "Buyer Specialist",
            body: "Dedicated buyer agent handles all buyer clients. You become 100% listing-focused. Income can double without doubling your hours.",
          },
          {
            trigger: "At $1M GCI",
            title: "Full Team",
            body: "Full-time TC, listing coordinator, 2+ buyer agents, paid lead gen running 24/7. You generate leads and set culture. Net a Million stage begins.",
          },
        ].map((item) => (
          <div key={item.title} className="card">
            <div
              style={{
                color: "var(--gold)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 8,
              }}
            >
              {item.trigger}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 8,
              }}
            >
              {item.title}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}
            >
              {item.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGE: CALCULATOR ──
export function CalculatorPage({ state }) {
  const { settings: cfg } = state;
  const [vals, setVals] = React.useState({
    c: cfg.close1 || 8,
    p: cfg.price || 300000,
    m: cfg.comm || 3,
    s: cfg.split || 20,
    e: cfg.exp || 33,
  });

  const gci = vals.c * vals.p * (vals.m / 100);
  const net = gci * (1 - vals.s / 100);
  const afterExp = net * (1 - vals.e / 100);
  const tax = afterExp * 0.25;
  const take = afterExp - tax;
  const perDeal = vals.c ? Math.round(take / vals.c) : 0;
  const pctGoal = Math.min(
    100,
    Math.round((take / (cfg.gci3 || 150000)) * 100),
  );

  // MREA funnel back-calculation from closings
  const contractsNeeded = vals.c > 0 ? Math.ceil(vals.c / 0.65) : 0;
  const apptsNeeded =
    contractsNeeded > 0 ? Math.ceil(contractsNeeded / 0.8) : 0;
  const leadsNeeded = apptsNeeded > 0 ? Math.ceil(apptsNeeded / 0.2) : 0;
  const leadsPerMonth = Math.ceil(leadsNeeded / 12);

  const goals = [38000, 57000, 82000, 180000, 410000];

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="GCI Calculator"
        desc="Model any scenario. See exactly what different volumes and price points mean for your take-home — and how many leads you need."
      />
      <div className="sidebar-layout">
        <div>
          <SectionTitle>Adjust your model</SectionTitle>
          <div className="card">
            {[
              {
                label: "Closings per year",
                key: "c",
                min: 1,
                max: 120,
                step: 1,
                fmt: (v) => v,
              },
              {
                label: "Avg sale price",
                key: "p",
                min: 150000,
                max: 800000,
                step: 10000,
                fmt: (v) => "$" + Math.round(v / 1000) + "K",
              },
              {
                label: "Commission rate",
                key: "m",
                min: 2,
                max: 4,
                step: 0.25,
                fmt: (v) => v.toFixed(2) + "%",
              },
              {
                label: "Brokerage split",
                key: "s",
                min: 10,
                max: 40,
                step: 1,
                fmt: (v) => v + "%",
              },
              {
                label: "Expenses (% of net GCI)",
                key: "e",
                min: 10,
                max: 55,
                step: 1,
                fmt: (v) => v + "%",
              },
            ].map((row) => (
              <div key={row.key} className="slider-row">
                <span className="slider-lbl">{row.label}</span>
                <input
                  type="range"
                  min={row.min}
                  max={row.max}
                  step={row.step}
                  value={vals[row.key]}
                  onChange={(e) =>
                    setVals((v) => ({
                      ...v,
                      [row.key]: parseFloat(e.target.value),
                    }))
                  }
                />
                <span className="slider-val">{row.fmt(vals[row.key])}</span>
              </div>
            ))}
          </div>

          <SectionTitle style={{ marginTop: 16 }}>
            Leads required (MREA funnel)
          </SectionTitle>
          <div className="card">
            {[
              ["Closings target", vals.c],
              ["Contracts needed (÷65%)", contractsNeeded],
              ["Appointments needed (÷80%)", apptsNeeded],
              ["Leads needed (÷20%)", leadsNeeded],
              ["Leads per month", `~${leadsPerMonth}/mo`],
            ].map(([label, val], i, a) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom:
                    i < a.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{label}</span>
                <span style={{ color: "var(--gold2)", fontWeight: 600 }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Your results</SectionTitle>
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <div className="stat-label">Gross GCI</div>
              <div
                style={{ fontSize: 30, fontWeight: 700, color: "var(--gold2)" }}
              >
                {fmt(gci)}
              </div>
            </div>
            <hr className="divider" />
            {[
              { label: "After split", val: fmt(net), color: "var(--text)" },
              {
                label: "After expenses",
                val: fmt(afterExp),
                color: "var(--text)",
              },
              {
                label: "Est. tax (25%)",
                val: `−${fmt(tax)}`,
                color: "#f87171",
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  lineHeight: 2.2,
                }}
              >
                <span style={{ color: "var(--text2)" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.color }}>
                  {row.val}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                borderTop: "1px solid var(--border)",
                paddingTop: 8,
                marginTop: 4,
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                Take-home
              </span>
              <span style={{ fontWeight: 700, color: "#4ade80", fontSize: 18 }}>
                {fmt(take)}
              </span>
            </div>
            <div className="prog-bg" style={{ marginTop: 12 }}>
              <div
                className="prog-fill"
                style={{ background: "var(--gold)", width: `${pctGoal}%` }}
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 5 }}>
              {pctGoal}% of {fmt(cfg.gci3 || 150000)} take-home goal
            </div>
          </div>

          <Alert type="info" style={{ marginTop: 14, fontSize: 12 }}>
            {take < 40000
              ? `At ${vals.c} closings you need ~${leadsPerMonth} leads/month. Every extra closing adds ~${fmt(perDeal)} take-home.`
              : take < 85000
                ? `Good momentum at ${vals.c} closings (~${leadsPerMonth} leads/mo). Year 3 target needs 17 closings and ~14 leads/month.`
                : `Strong numbers at ${vals.c} closings — ${leadsPerMonth} leads/month required. This is when hiring a TC and buyer agent makes sense.`}
          </Alert>

          <SectionTitle style={{ marginTop: 16 }}>
            MREA milestone take-homes
          </SectionTitle>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Closings</th>
                  <th>Leads/mo</th>
                  <th>Est. take-home</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Year 1", closings: 8, leads: 7, take: 38000 },
                  { label: "Year 3", closings: 17, leads: 14, take: 82000 },
                  { label: "Year 5", closings: 111, leads: 89, take: 410000 },
                ].map((row) => (
                  <tr key={row.label}>
                    <td style={{ color: "var(--gold2)", fontWeight: 600 }}>
                      {row.label}
                    </td>
                    <td style={{ color: "var(--text)" }}>{row.closings}</td>
                    <td style={{ color: "var(--text2)" }}>~{row.leads}/mo</td>
                    <td style={{ color: "#4ade80", fontWeight: 600 }}>
                      {fmt(row.take)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
