// ── MREA TRACKER — MAIN APP ──
// This is the root component. It manages state and renders pages.
// To add a new page: import it here, add a nav button, and add a case in renderPage()

import React, { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from './utils/store';

// Pages
import OverviewPage   from './pages/Overview';
import DailyLogPage   from './pages/DailyLog';
import ClosingsPage   from './pages/Closings';
import SettingsPage   from './pages/Settings';
import { PLPage, FunnelPage, ActionPlanPage, ScalePage, CalculatorPage } from './pages/OtherPages';

// Styles
import './styles/global.css';
import './styles/components.css';

// ── NAV CONFIG ──
// Add, remove, or reorder tabs here to change the navigation
const NAV = [
  { id: 'overview',  label: 'Overview' },
  { id: 'daily',     label: '📅 Daily Log' },
  { id: 'closings',  label: 'Log Closings' },
  { id: 'funnel',    label: 'Lead Funnel' },
  { id: 'pl',        label: 'P&L Model' },
  { id: 'plan',      label: 'Action Plan' },
  { id: 'scale',     label: 'Scale Model' },
  { id: 'calc',      label: 'Calculator' },
  { id: 'settings',  label: '⚙ Settings' },
];

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [state, setState] = useState(() => loadState());

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Update handler passed to all pages
  const handleUpdate = useCallback((newState) => {
    setState(newState);
  }, []);

  function renderPage() {
    const props = { state, onUpdate: handleUpdate };
    switch (activePage) {
      case 'overview':  return <OverviewPage   {...props} />;
      case 'daily':     return <DailyLogPage   {...props} />;
      case 'closings':  return <ClosingsPage   {...props} />;
      case 'funnel':    return <FunnelPage     {...props} />;
      case 'pl':        return <PLPage         {...props} />;
      case 'plan':      return <ActionPlanPage {...props} />;
      case 'scale':     return <ScalePage      {...props} />;
      case 'calc':      return <CalculatorPage {...props} />;
      case 'settings':  return <SettingsPage   {...props} />;
      default:          return <OverviewPage   {...props} />;
    }
  }

  const cfg = state.settings || {};

  return (
    <div>
      {/* ── HEADER ── */}
      <header className="app-header">
        <div>
          <div className="header-logo">Millionaire Real Estate Agent</div>
          <div className="header-sub">Economic Model Tracker</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {cfg.name && (
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>{cfg.name}</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* ── NAV ── */}
      <nav className="app-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-btn${activePage === item.id ? ' active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
