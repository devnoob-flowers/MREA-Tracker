// ── MREA TRACKER — SHARED UI COMPONENTS ──
// Reusable building blocks used across all pages.
// Edit these to change how cards, stats, tables, etc. look everywhere.

import React from 'react';
import { fmt, pct } from '../utils/store';

// ── STAT BOX ──
// The metric card used across all pages
// Props: value, label, target, color ('gold'|'teal'|'green'|'blue'|'red'), progress (0-100)
export function StatBox({ value, label, target, color = 'gold', progress }) {
  const colors = {
    gold:   { val: 'var(--gold2)',  bar: 'var(--gold)' },
    teal:   { val: '#2dd4bf',       bar: '#2dd4bf' },
    green:  { val: '#4ade80',       bar: '#4ade80' },
    blue:   { val: '#93c5fd',       bar: '#93c5fd' },
    red:    { val: '#f87171',       bar: '#f87171' },
    purple: { val: '#c4b5fd',       bar: '#c4b5fd' },
  };
  const c = colors[color] || colors.gold;
  return (
    <div className={`stat-box ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{ color: c.val }}>{value}</div>
      {target && <div className="stat-target">{target}</div>}
      {progress !== undefined && (
        <div className="prog-bg">
          <div className="prog-fill" style={{ background: c.bar, width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

// ── SECTION TITLE ──
export function SectionTitle({ children, style }) {
  return <div className="section-title" style={style}>{children}</div>;
}

// ── PAGE HEADER ──
export function PageHeader({ title, desc }) {
  return (
    <>
      <p className="page-title">{title}</p>
      {desc && <p className="page-desc">{desc}</p>}
    </>
  );
}

// ── ALERT BOX ──
// type: 'gold' | 'info' | 'success' | 'warn'
export function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

// ── KELLER QUOTE ──
export function KellerQuote({ quote }) {
  return (
    <Alert type="gold">
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontStyle: 'italic', color: 'var(--gold2)', lineHeight: 1.6 }}>
        "{quote}"
      </span>
      <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 6, fontWeight: 600 }}>— Gary Keller, MREA</div>
    </Alert>
  );
}

// ── P&L TABLE ──
// rows: array of { label, value, type: 'section'|'pos'|'neg'|'neutral'|'total'|'' }
export function PLTable({ rows }) {
  return (
    <table className="pl-table">
      <tbody>
        {rows.map((row, i) => {
          if (row.type === 'section') {
            return (
              <tr key={i} className="sec">
                <td colSpan={2}>{row.label}</td>
              </tr>
            );
          }
          if (row.type === 'total') {
            return (
              <tr key={i} className="total">
                <td className="lbl">{row.label}</td>
                <td className={`amt pos`}>{row.value}</td>
              </tr>
            );
          }
          return (
            <tr key={i}>
              <td className="lbl">{row.label}</td>
              <td className={`amt ${row.type || ''}`}>{row.value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── MILESTONE CHECKLIST ITEM ──
export function Milestone({ text, done, onToggle, onDelete }) {
  return (
    <div className={`milestone${done ? ' done' : ''}`} onClick={onToggle}>
      <div className="ms-dot">{done ? '✓' : ''}</div>
      <div className="ms-text">{text}</div>
      {onDelete && (
        <button
          className="btn btn-danger btn-sm"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ padding: '3px 8px', fontSize: 11 }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── PROGRESS ROW ──
// For showing a metric vs target in a clean row
export function ProgressRow({ label, value, target, color = 'var(--gold)' }) {
  const p = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
          {value} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>/ {target}</span>
        </span>
      </div>
      <div className="prog-bg">
        <div className="prog-fill" style={{ background: color, width: `${p}%` }} />
      </div>
    </div>
  );
}

// ── FUNNEL ROW ──
export function FunnelRow({ num, name, sub, color = 'var(--text)', input, rate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, minWidth: 72, color }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {input}
      {rate && <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 56, textAlign: 'right' }}>{rate}</div>}
    </div>
  );
}

// ── COMPARE CARD ──
// For the 3-stage Keller model comparison
export function CompareCard({ year, label, gci, rows, highlight }) {
  return (
    <div className={`card${highlight ? '' : ''}`} style={highlight ? { borderColor: 'var(--gold)', background: 'var(--gold-bg)' } : {}}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: highlight ? 'var(--gold)' : 'var(--text3)', marginBottom: 6 }}>
        {year}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text)', marginBottom: 14 }}>{gci}</div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 12 }}>
          <span style={{ color: 'var(--text3)' }}>{row.key}</span>
          <span style={{ fontWeight: 600, color: row.color || 'var(--text)' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ──
export function EmptyState({ icon = '📋', message }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div>{message}</div>
    </div>
  );
}

// ── DELETE BUTTON ──
export function DeleteBtn({ onClick }) {
  return (
    <button className="btn btn-danger btn-sm" onClick={onClick} style={{ padding: '4px 8px' }}>
      ×
    </button>
  );
}

// ── PILL BADGE ──
export function Pill({ label, type = 'seller', extra }) {
  const classes = {
    seller:  'pill-seller',
    buyer:   'pill-buyer',
    both:    'pill-both',
    rental:  'pill-rental',
    flat:    'pill-flat',
  };
  return (
    <>
      <span className={`pill ${classes[type] || 'pill-seller'}`}>{label}</span>
      {extra && <span className={`pill pill-flat`} style={{ marginLeft: 4 }}>{extra}</span>}
    </>
  );
}
