// ── MREA TRACKER — MAIN APP (with Supabase cloud sync) ──

import React, { useState, useEffect, useCallback, useRef } from "react";
import { loadState, saveState } from "./utils/store";
import { loadFromCloud, saveToCloud, isConfigured } from "./utils/supabase";

import OverviewPage from "./pages/Overview";
import DailyLogPage from "./pages/DailyLog";
import ClosingsPage from "./pages/Closings";
import SettingsPage from "./pages/Settings";
import {
  PLPage,
  FunnelPage,
  ActionPlanPage,
  ScalePage,
  CalculatorPage,
} from "./pages/OtherPages";

import "./styles/global.css";
import "./styles/components.css";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "checklist", label: "✅ Daily Checklist" },
  { id: "daily", label: "📅 Daily Log" },
  { id: "funnel", label: "Lead Funnel" },
  { id: "closings", label: "Log Closings" },
  { id: "pl", label: "P&L Model" },
  { id: "plan", label: "Action Plan" },
  { id: "scale", label: "Scale Model" },
  { id: "calc", label: "Calculator" },
  { id: "settings", label: "⚙ Settings" },
];

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [state, setState] = useState(() => loadState());
  const [syncStatus, setSyncStatus] = useState("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      if (!isConfigured()) {
        setLoaded(true);
        setSyncStatus("offline");
        return;
      }
      setSyncStatus("saving");
      const cloudData = await loadFromCloud();
      if (cloudData) setState((prev) => ({ ...prev, ...cloudData }));
      setLoaded(true);
      setSyncStatus("saved");
    }
    init();
  }, []);

  const saveCloud = useCallback(async (newState) => {
    if (!isConfigured()) return;
    setSyncStatus("saving");
    await saveToCloud(newState);
    setSyncStatus("saved");
    setTimeout(() => setSyncStatus("idle"), 3000);
  }, []);

  const debouncedSave = useDebounce(saveCloud, 1500);

  const handleUpdate = useCallback(
    (newState) => {
      setState(newState);
      saveState(newState);
      debouncedSave(newState);
    },
    [debouncedSave],
  );

  function SyncBadge() {
    const dot = (color) => (
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
    );
    if (syncStatus === "offline")
      return (
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {dot("var(--amber)")} Local only
        </span>
      );
    if (syncStatus === "saving")
      return (
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {dot("var(--gold)")} Saving...
        </span>
      );
    if (syncStatus === "saved")
      return (
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {dot("var(--green)")} Synced
        </span>
      );
    return null;
  }

  if (!loaded)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
          background: "var(--navy)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid var(--gold)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          Loading your data...
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const cfg = state.settings || {};
  const props = { state, onUpdate: handleUpdate };

  function renderPage() {
    switch (activePage) {
      case "overview":
        return <OverviewPage {...props} />;
      case "checklist":
        return <ChecklistPage {...props} />;
      case "daily":
        return <DailyLogPage {...props} />;
      case "funnel":
        return <FunnelPage {...props} />;
      case "closings":
        return <ClosingsPage {...props} />;
      case "pl":
        return <PLPage {...props} />;
      case "plan":
        return <ActionPlanPage {...props} />;
      case "scale":
        return <ScalePage {...props} />;
      case "calc":
        return <CalculatorPage {...props} />;
      case "settings":
        return <SettingsPage {...props} />;
      default:
        return <OverviewPage {...props} />;
    }
  }

  return (
    <div>
      <header className="app-header">
        <div>
          <div className="header-logo">Millionaire Real Estate Agent</div>
          <div className="header-sub">Economic Model Tracker</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <SyncBadge />
          {cfg.name && (
            <span style={{ fontSize: 13, color: "var(--text3)" }}>
              {cfg.name}
            </span>
          )}
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      <nav className="app-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-btn${activePage === item.id ? " active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {!isConfigured() && (
        <div
          style={{
            background: "rgba(217,119,6,.1)",
            borderBottom: "1px solid rgba(217,119,6,.2)",
            padding: "10px 32px",
            fontSize: 12,
            color: "#fcd34d",
          }}
        >
          ⚠ Running in local-only mode. Add your Supabase credentials to
          src/utils/supabase.js to enable cross-device sync.
        </div>
      )}

      <main>{renderPage()}</main>
    </div>
  );
}

function ChecklistPage({ state, onUpdate }) {
  const cfg = state.settings || {};
  const closes = cfg.close1 || 12;
  const gci = cfg.gci1 || 75000;
  const TODAY = new Date().toISOString().split("T")[0];
  const CL_KEY = "mrea_cl_" + TODAY;

  const [done, setDone] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CL_KEY) || "{}");
    } catch (e) {
      return {};
    }
  });

  function toggle(id) {
    const u = { ...done, [id]: !done[id] };
    setDone(u);
    try {
      localStorage.setItem(CL_KEY, JSON.stringify(u));
    } catch (e) {}
  }
  function reset() {
    setDone({});
    try {
      localStorage.removeItem(CL_KEY);
    } catch (e) {}
  }

  const GROUPS = [
    {
      id: "power",
      title: "Power hour — do this first",
      color: "#2563eb",
      tasks: [
        {
          id: "p1",
          text: "Read your why statement out loud — remember why you're doing this",
          tag: "daily",
        },
        {
          id: "p2",
          text: "Make 5 database calls before opening email or social media",
          tag: "daily",
        },
        {
          id: "p3",
          text: "Send 3 personal texts to your top 20 contacts",
          tag: "lead",
        },
        {
          id: "p4",
          text: "Open KW Command — check for new leads and messages",
          tag: "daily",
        },
        {
          id: "p5",
          text: "Follow up every lead from yesterday — no lead goes cold overnight",
          tag: "lead",
        },
      ],
    },
    {
      id: "leads",
      title: `Lead generation — 125 leads needed for ${closes} closings`,
      color: "#c9a84c",
      tasks: [
        {
          id: "l1",
          text: `Log all new leads in KW Command — need 125 this year for ${closes} closings`,
          tag: "lead",
        },
        {
          id: "l2",
          text: "Post 1 piece of content — market update, local stat, or client win",
          tag: "daily",
        },
        {
          id: "l3",
          text: "Add any new contacts from today to your CRM database",
          tag: "daily",
        },
        {
          id: "l4",
          text: 'Ask 1 person for a referral — "Do you know anyone thinking of moving?"',
          tag: "lead",
        },
        {
          id: "l5",
          text: "Update every active lead status in your pipeline",
          tag: "daily",
        },
      ],
    },
    {
      id: "farm",
      title: "Farm system — Panorama Village (12 Direct)",
      color: "#0d9488",
      tasks: [
        {
          id: "f1",
          text: "Check HAR.com for new listings or sales in Panorama Village",
          tag: "farm",
        },
        {
          id: "f2",
          text: `Confirm this month's farm mailer is scheduled (${cfg.farm || 200} homes)`,
          tag: "farm",
        },
        {
          id: "f3",
          text: "If hosting open house today — collect every visitor contact",
          tag: "farm",
        },
      ],
    },
    {
      id: "biz",
      title: "Business & money tracking",
      color: "#7c3aed",
      tasks: [
        {
          id: "b1",
          text: "Log today's calls, leads, and appointments in the Daily Log tab",
          tag: "daily",
        },
        {
          id: "b2",
          text: `Check closing pace — need ${closes} closings for $${Math.round(gci / 1000)}K target`,
          tag: "goal",
        },
        {
          id: "b3",
          text: "Move 25% of any commission received today to your tax savings account",
          tag: "money",
        },
        {
          id: "b4",
          text: "Review: is there anything that needs follow-up before tomorrow?",
          tag: "daily",
        },
      ],
    },
  ];

  const allTasks = GROUPS.flatMap((g) => g.tasks);
  const totalDone = allTasks.filter((t) => done[t.id]).length;
  const totalAll = allTasks.length;
  const pct = Math.round((totalDone / totalAll) * 100);
  const ytdCalls = (state.daily || [])
    .filter((d) => d.date?.startsWith(new Date().getFullYear() + ""))
    .reduce((s, d) => s + (d.calls || 0), 0);

  const TAG = {
    daily: { bg: "rgba(37,99,235,.15)", color: "#93c5fd" },
    lead: { bg: "rgba(201,168,76,.15)", color: "#e8c97a" },
    farm: { bg: "rgba(13,148,136,.15)", color: "#2dd4bf" },
    goal: { bg: "rgba(22,163,74,.15)", color: "#4ade80" },
    money: { bg: "rgba(124,58,237,.15)", color: "#c4b5fd" },
  };

  return (
    <div className="page-wrap fade-up">
      <p className="page-title">Daily Checklist</p>
      <p className="page-desc">
        Everything you need to do today to hit your ${Math.round(gci / 1000)}K
        GCI goal.
      </p>

      <div
        style={{
          background: "var(--gold-bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 22px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            color: "var(--gold)",
            marginBottom: 6,
          }}
        >
          Your why — read this first
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            fontStyle: "italic",
            color: "var(--gold2)",
            lineHeight: 1.6,
          }}
        >
          "
          {cfg.why ||
            "I build this business so my family never has to wonder if I'll be there."}
          "
        </div>
      </div>

      {totalDone === totalAll && totalAll > 0 && (
        <div
          style={{
            background: "rgba(22,163,74,.12)",
            border: "1px solid rgba(22,163,74,.25)",
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
            fontSize: 14,
            color: "#4ade80",
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          All done for today. Outstanding work — this is exactly how $
          {Math.round(gci / 1000)}K gets built.
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          {
            val: `${totalDone}/${totalAll}`,
            lbl: "Tasks done today",
            color: "var(--gold2)",
            cls: "gold",
            prog: pct,
          },
          {
            val: `${pct}%`,
            lbl: "Day complete",
            color: "#2dd4bf",
            cls: "teal",
            prog: pct,
          },
          {
            val: `${(state.closings || []).length}/${closes}`,
            lbl: "Closings this year",
            color: "#4ade80",
            cls: "green",
            prog: Math.min(
              100,
              Math.round(((state.closings || []).length / closes) * 100),
            ),
          },
          {
            val: ytdCalls,
            lbl: "Calls YTD",
            color: "#93c5fd",
            cls: "blue",
            prog: Math.min(100, Math.round((ytdCalls / 1300) * 100)),
          },
        ].map((s, i) => (
          <div key={i} className={`stat-box ${s.cls}`}>
            <div className="stat-label">{s.lbl}</div>
            <div className="stat-val" style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="prog-bg">
              <div
                className="prog-fill"
                style={{ background: s.color, width: s.prog + "%" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <button
          onClick={reset}
          style={{
            fontSize: 12,
            padding: "6px 14px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text3)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Reset today
        </button>
      </div>

      {GROUPS.map((group) => {
        const gDone = group.tasks.filter((t) => done[t.id]).length;
        const gPct = Math.round((gDone / group.tasks.length) * 100);
        return (
          <div key={group.id} style={{ marginBottom: 20 }}>
            <div className="section-title">{group.title}</div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 18px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  {gDone} / {group.tasks.length} done
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>
                  {gPct}%
                </div>
              </div>
              <div style={{ padding: "6px 18px 10px" }}>
                <div className="prog-bg">
                  <div
                    className="prog-fill"
                    style={{ background: group.color, width: gPct + "%" }}
                  />
                </div>
              </div>
              {group.tasks.map((task) => {
                const isDone = !!done[task.id];
                const t = TAG[task.tag] || TAG.daily;
                return (
                  <div
                    key={task.id}
                    onClick={() => toggle(task.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 18px",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      opacity: isDone ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--card2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: isDone ? "none" : "1.5px solid var(--border)",
                        background: isDone ? "var(--teal)" : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                      }}
                    >
                      {isDone ? "✓" : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text2)",
                        flex: 1,
                        lineHeight: 1.4,
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {task.text}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        background: t.bg,
                        color: t.color,
                      }}
                    >
                      {task.tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="section-title" style={{ marginTop: 28 }}>
        How today connects to your yearly goal
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {[
          {
            period: "Yearly",
            num: `$${Math.round(gci / 1000)}K GCI`,
            desc: `${closes} closings × $${Math.round((cfg.price || 300000) / 1000)}K avg × ${cfg.comm || 3}% = $${Math.round(gci / 1000)}K gross.`,
            active: false,
          },
          {
            period: "Monthly",
            num: `${Math.ceil(closes / 12)} closing/mo`,
            desc: `Close at least 1 transaction per month to stay on pace for ${closes} closings.`,
            active: false,
          },
          {
            period: "Weekly",
            num: "25 calls",
            desc: "5 calls/day × 5 days = 1,300/yr. Plus 1 referral ask and 1 social post daily.",
            active: false,
          },
          {
            period: "Daily",
            num: "5 calls",
            desc: "Power hour every morning before email or admin. Your most important 60 minutes.",
            active: true,
          },
          {
            period: "Per call",
            num: "1 conversation",
            desc: "125 leads → 32 appts → 16 contracts → 12 closings. Every call moves the needle.",
            active: false,
          },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: "14px 20px",
              borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: row.active ? "var(--gold-bg)" : "transparent",
              borderLeft: row.active
                ? "3px solid var(--gold)"
                : "3px solid transparent",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: row.active ? "var(--gold)" : "var(--text3)",
                minWidth: 64,
                paddingTop: 3,
              }}
            >
              {row.period}
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 2,
                }}
              >
                {row.num}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}
              >
                {row.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
