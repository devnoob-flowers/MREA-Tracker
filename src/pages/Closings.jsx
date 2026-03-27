// ── PAGE: CLOSINGS LOG ──
import React, { useState } from 'react';
import { SectionTitle, PageHeader, Alert, StatBox, EmptyState, DeleteBtn, Pill } from '../components/UI';
import { fmt, calcGrossGCI, calcNetGCI, calcTakeHome, totalNetGCI, totalGrossGCI, totalTakeHome, MONTHS, SIDE_PILL, today } from '../utils/store';

export default function ClosingsPage({ state, onUpdate }) {
  const { closings = [], settings: cfg } = state;

  const [form, setForm] = useState({
    name: '', side: 'Seller', commType: 'pct',
    price: '', comm: cfg.comm || 3, flat: '',
    split: cfg.split || 20,
    month: new Date().getMonth(),
  });
  const [preview, setPreview] = useState(null);

  function set(field, val) {
    const updated = { ...form, [field]: val };
    setForm(updated);
    // Live preview
    const p = parseFloat(updated.price) || 0;
    const c = parseFloat(updated.comm)  || 3;
    const s = parseFloat(updated.split) || 20;
    const f = parseFloat(updated.flat)  || 0;
    const gross = updated.commType === 'flat' ? f : (p ? p * (c / 100) : 0);
    if (gross) {
      const net     = calcNetGCI(gross, s);
      const afterExp = net * 0.67;
      const take    = afterExp * 0.75;
      setPreview({ gross, net, take });
    } else {
      setPreview(null);
    }
  }

  function logClosing() {
    const price  = parseFloat(form.price) || 0;
    const split  = parseFloat(form.split) || 20;
    const month  = parseInt(form.month);
    let grossGCI = 0, comm = parseFloat(form.comm) || 3;

    if (form.commType === 'flat') {
      grossGCI = parseFloat(form.flat) || 0;
      if (!grossGCI) { alert('Please enter a flat fee amount'); return; }
      comm = price ? (grossGCI / price * 100) : 0;
    } else {
      if (!price) { alert('Please enter a sale price'); return; }
      grossGCI = price * (comm / 100);
    }

    const netGCI = calcNetGCI(grossGCI, split);
    const entry  = {
      id: Date.now().toString(),
      name:     form.name || 'Client',
      side:     form.side,
      commType: form.commType,
      price, comm, split, month,
      grossGCI, netGCI,
      date: new Date().toISOString(),
    };

    onUpdate({ ...state, closings: [...closings, entry] });
    setForm({ name: '', side: 'Seller', commType: 'pct', price: '', comm: cfg.comm || 3, flat: '', split: cfg.split || 20, month: new Date().getMonth() });
    setPreview(null);
  }

  function deleteClosing(id) {
    onUpdate({ ...state, closings: closings.filter(c => c.id !== id) });
  }

  const gross    = totalGrossGCI(closings);
  const net      = totalNetGCI(closings);
  const take     = totalTakeHome(closings, cfg);
  const rentals  = closings.filter(c => c.side?.startsWith('Rental'));
  const sales    = closings.filter(c => !c.side?.startsWith('Rental'));
  const avgNet   = closings.length ? net / closings.length : 0;
  const avgTake  = closings.length ? take / closings.length : 0;
  const remaining = Math.max(0, (cfg.close1 || 12) - sales.length);

  function sideType(side) {
    if (!side) return 'seller';
    if (side === 'Buyer') return 'buyer';
    if (side === 'Both') return 'both';
    if (side.startsWith('Rental')) return 'rental';
    return 'seller';
  }

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="Log Closings & Rentals" desc="Every closing you log updates your P&L, overview stats, and funnel automatically." />

      <Alert type="info">
        For <strong>flat fee rentals</strong>: select "Flat fee ($)" and enter your fee directly.
        For percentage rentals: enter annual rent as the price (e.g. $1,500/mo = $18,000/yr).
      </Alert>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* LOG FORM */}
        <div>
          <SectionTitle>Log a closing or rental</SectionTitle>
          <div className="card">
            <div className="two-input">
              <div className="input-group">
                <label>Client name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Johnson family" />
              </div>
              <div className="input-group">
                <label>Transaction type</label>
                <select value={form.side} onChange={e => set('side', e.target.value)}>
                  <option>Seller</option>
                  <option>Buyer</option>
                  <option>Both</option>
                  <option>Rental (landlord)</option>
                  <option>Rental (tenant)</option>
                  <option>Rental (both)</option>
                </select>
              </div>
            </div>

            <div className="two-input">
              <div className="input-group">
                <label>Commission type</label>
                <select value={form.commType} onChange={e => set('commType', e.target.value)}>
                  <option value="pct">Percentage (%)</option>
                  <option value="flat">Flat fee ($)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Brokerage split (%)</label>
                <input type="number" min="0" max="50" value={form.split} onChange={e => set('split', e.target.value)} />
              </div>
            </div>

            <div className="two-input">
              {form.commType === 'flat' ? (
                <div className="input-group">
                  <label>Flat fee ($)</label>
                  <input type="number" min="0" value={form.flat} onChange={e => set('flat', e.target.value)} placeholder="1500" />
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label>Sale price / annual rent ($)</label>
                    <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="300000" />
                  </div>
                  <div className="input-group">
                    <label>Commission rate (%)</label>
                    <input type="number" min="0" max="100" step="0.25" value={form.comm} onChange={e => set('comm', e.target.value)} />
                  </div>
                </>
              )}
              <div className="input-group">
                <label>Month closed</label>
                <select value={form.month} onChange={e => set('month', parseInt(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              {preview ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, textAlign: 'center' }}>
                  {[
                    { label: 'Gross GCI',  val: fmt(preview.gross), color: '#93c5fd' },
                    { label: 'After split', val: fmt(preview.net),  color: 'var(--gold2)' },
                    { label: 'Take-home',   val: fmt(preview.take), color: '#4ade80' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
                  Enter {form.commType === 'flat' ? 'a flat fee' : 'a sale price'} to preview your GCI
                </div>
              )}
            </div>

            <button className="btn btn-gold btn-full" onClick={logClosing}>Log closing</button>
          </div>
        </div>

        {/* YTD SUMMARY */}
        <div>
          <SectionTitle>YTD summary</SectionTitle>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <StatBox value={sales.length}   label="Sales closed"   target={`of ${cfg.close1 || 12} target`} color="gold"  progress={Math.min(100, Math.round(sales.length / (cfg.close1 || 12) * 100))} />
            <StatBox value={fmt(net)}        label="Net GCI"        target="after all splits"                 color="teal" />
            <StatBox value={fmt(take)}       label="Est. take-home" target="after exp & tax"                  color="green" />
            <StatBox value={rentals.length}  label="Rentals"        target={`GCI: ${fmt(rentals.reduce((s,c)=>s+(c.netGCI||0),0))}`} color="blue" />
          </div>

          <SectionTitle>Per-transaction benchmark</SectionTitle>
          <div className="card-gold">
            {[
              { label: 'Avg GCI per closing',     val: fmt(avgNet),  color: 'var(--gold2)' },
              { label: 'Avg take-home per closing',val: fmt(avgTake), color: '#4ade80' },
              { label: `Closings to hit ${fmt(cfg.gci1 || 75000)} GCI`, val: cfg.close1 || 12, color: '#93c5fd' },
              { label: 'Sales closings remaining', val: remaining,    color: remaining === 0 ? '#4ade80' : 'var(--gold2)' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.color }}>{row.val === 0 ? '✓ Done' : row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CLOSING LOG */}
      <SectionTitle>Closing log</SectionTitle>
      <Alert type="warn">Set aside 25% of every commission check into your tax savings account the day it hits. Don't wait.</Alert>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="log-table">
          <thead>
            <tr><th>Client</th><th>Type</th><th>Month</th><th>Price / Rent</th><th>Gross GCI</th><th>Net GCI</th><th>Take-home</th><th></th></tr>
          </thead>
          <tbody>
            {closings.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon="🏡" message="No closings logged yet — add your first one above" /></td></tr>
            ) : (
              [...closings].reverse().map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>{c.name}</td>
                  <td>
                    <Pill label={c.side} type={sideType(c.side)} extra={c.commType === 'flat' ? 'flat' : null} />
                  </td>
                  <td>{MONTHS[c.month]?.slice(0, 3) || '—'}</td>
                  <td>{c.commType === 'flat' ? `flat ${fmt(c.grossGCI)}` : `$${(c.price || 0).toLocaleString()}`}</td>
                  <td style={{ color: '#93c5fd' }}>{fmt(c.grossGCI)}</td>
                  <td style={{ color: 'var(--gold2)' }}>{fmt(c.netGCI)}</td>
                  <td style={{ color: '#4ade80' }}>{fmt(c.netGCI * 0.67 * 0.75)}</td>
                  <td><DeleteBtn onClick={() => deleteClosing(c.id)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
