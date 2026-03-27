// ── PAGE: SETTINGS ──
// All editable model inputs live here.
// Changes here update the entire app instantly.

import React, { useState } from 'react';
import { SectionTitle, PageHeader, Alert } from '../components/UI';
import { DEFAULTS, exportBackup, importBackup } from '../utils/store';

export default function SettingsPage({ state, onUpdate }) {
  const cfg = state.settings || { ...DEFAULTS };
  const [saved, setSaved] = useState(false);

  function update(field, val) {
    const isNum = typeof DEFAULTS[field] === 'number';
    const parsed = isNum ? (parseFloat(val) || DEFAULTS[field]) : val;
    onUpdate({ ...state, settings: { ...cfg, [field]: parsed } });
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetDefaults() {
    if (!window.confirm('Reset all settings to defaults? Your closings and logs will not be affected.')) return;
    onUpdate({ ...state, settings: { ...DEFAULTS } });
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    importBackup(file, (data) => {
      onUpdate(data);
      alert('Backup imported successfully!');
    });
  }

  function clearAll() {
    if (!window.confirm('This will permanently delete ALL your data including closings and daily logs. Are you absolutely sure?')) return;
    if (!window.confirm('Last chance — this cannot be undone. Delete everything?')) return;
    localStorage.clear();
    window.location.reload();
  }

  const Field = ({ label, field, type = 'number', placeholder, step }) => (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        step={step}
        value={cfg[field] !== undefined ? cfg[field] : DEFAULTS[field]}
        placeholder={placeholder || String(DEFAULTS[field])}
        onChange={e => update(field, e.target.value)}
      />
    </div>
  );

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="Settings"
        desc="Customize every number in your economic model. Changes update the entire app instantly."
      />

      <div className="grid-2">
        {/* YEAR 1 */}
        <div>
          <SectionTitle>Year 1 targets</SectionTitle>
          <div className="card">
            <Field label="Year 1 GCI target ($)"     field="gci1"   placeholder="75000" />
            <Field label="Year 1 closing target"     field="close1" placeholder="12" />
            <Field label="Average sale price ($)"    field="price"  placeholder="300000" />
            <Field label="Commission rate (%)"       field="comm"   placeholder="3" step="0.25" />
          </div>
        </div>

        {/* YEAR 3 */}
        <div>
          <SectionTitle>Year 3 targets</SectionTitle>
          <div className="card">
            <Field label="Year 3 GCI target ($)"      field="gci3"   placeholder="150000" />
            <Field label="Year 3 closing target"      field="close3" placeholder="28" />
            <Field label="Year 3 avg sale price ($)"  field="price3" placeholder="320000" />
            <Field label="Year 3 TC cost ($/yr)"      field="tc"     placeholder="18000" />
          </div>
        </div>

        {/* FINANCIAL ASSUMPTIONS */}
        <div>
          <SectionTitle>Financial assumptions</SectionTitle>
          <div className="card">
            <Field label="Brokerage split (%)"            field="split" placeholder="20" />
            <Field label="Business expenses (% of net GCI)" field="exp" placeholder="33" />
            <Field label="Self-employment tax (%)"         field="tax"  placeholder="25" />
          </div>
        </div>

        {/* DATABASE & FARM */}
        <div>
          <SectionTitle>Database & farm</SectionTitle>
          <div className="card">
            <Field label="Database size (contacts)"  field="db"     placeholder="100" />
            <Field label="Farm size (homes)"         field="farm"   placeholder="200" />
            <Field label="Lead target (per year)"    field="leads"  placeholder="50" />
            <Field label="Appointment target (per year)" field="appts" placeholder="25" />
            <Field label="Contract target (per year)"    field="contracts" placeholder="15" />
          </div>
        </div>

        {/* PERSONAL */}
        <div>
          <SectionTitle>Personal</SectionTitle>
          <div className="card">
            <Field label="Your name"       field="name"   type="text" placeholder="Your name" />
            <Field label="Market / area"   field="market" type="text" placeholder="e.g. Houston suburbs" />
            <div className="input-group">
              <label>Your why statement</label>
              <textarea
                rows={4}
                value={cfg.why || DEFAULTS.why}
                onChange={e => update('why', e.target.value)}
                placeholder="I do this because..."
              />
            </div>
          </div>
        </div>

        {/* DATA */}
        <div>
          <SectionTitle>Data management</SectionTitle>
          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Export backup</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Download all your data as a JSON file for safekeeping or transfer to another device.</div>
              <button className="btn btn-ghost" onClick={() => exportBackup(state)}>Export backup</button>
            </div>
            <hr className="divider" />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Import backup</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Restore a previously exported backup file.</div>
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                Import backup
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>
            <hr className="divider" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f87171', marginBottom: 4 }}>Danger zone</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Permanently delete all data. This cannot be undone.</div>
              <button className="btn btn-danger" onClick={clearAll}>Clear all data</button>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE INDICATOR */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={resetDefaults}>Reset to defaults</button>
        <span style={{ fontSize: 12, color: '#4ade80', opacity: saved ? 1 : 0, transition: 'opacity 0.3s' }}>
          ✓ Settings saved
        </span>
      </div>

      <Alert type="info" style={{ marginTop: 20 }}>
        Changes save automatically as you type. Every page in the app updates instantly based on your settings.
      </Alert>
    </div>
  );
}
