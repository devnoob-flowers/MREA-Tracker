// ── MREA TRACKER — MAIN APP (with Supabase cloud sync) ──

import React, { useState, useEffect, useCallback, useRef } from "react";
import { loadState, saveState } from "./utils/store";
import { loadFromCloud, saveToCloud, isConfigured } from "./utils/supabase";

import OverviewPage from "./pages/Overview";
import ChecklistPage from "./pages/DailyChecklist";
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
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem("mrea_active_page") || "overview",
  );
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
            onClick={() => {
              setActivePage(item.id);
              localStorage.setItem("mrea_active_page", item.id);
            }}
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
