// ── PAGE: P&L MODEL ──
import React from 'react';
import { PageHeader, SectionTitle, PLTable, Alert } from '../components/UI';
import { fmt, calcPL, totalNetGCI, totalGrossGCI, totalTakeHome } from '../utils/store';

export function PLPage({ state }) {
  const { settings: cfg, closings } = state;

  function buildRows(closings, price, comm, split, expPct, taxPct, tcCost = 0) {
    const pl = calcPL(closings, price, comm, split, expPct, taxPct, tcCost);
    const expBreakdown = pl.net * expPct / 100;
    return [
      { label: 'Income',                                    type: 'section' },
      { label: 'Closings',                                  value: `${closings} transactions` },
      { label: 'Average sale price',                        value: `$${price.toLocaleString()}` },
      { label: 'Commission rate',                           value: `${comm}%` },
      { label: 'Gross GCI',                                 value: fmt(pl.gross),    type: 'pos' },
      { label: `Brokerage split (${split}%)`,               value: `−${fmt(pl.gross - pl.net)}`, type: 'neg' },
      { label: 'Net GCI after split',                       value: fmt(pl.net),      type: 'neu' },
      { label: 'Business expenses',                         type: 'section' },
      { label: 'Lead gen & marketing (10%)',                value: `−${fmt(pl.net * 0.10)}`, type: 'neg' },
      { label: 'Farm mailers',                              value: `−${fmt(pl.net * 0.10)}`, type: 'neg' },
      { label: 'CRM, tech, MLS, misc',                     value: `−${fmt(pl.net * 0.13)}`, type: 'neg' },
      ...(tcCost ? [{ label: 'Transaction coordinator',    value: `−${fmt(tcCost)}`, type: 'neg' }] : []),
      { label: 'Total expenses',                            value: `−${fmt(pl.expenses)}`, type: 'neg' },
      { label: 'Net',                                       type: 'section' },
      { label: 'Net before tax',                            value: fmt(pl.afterExp), type: 'neu' },
      { label: `Self-employment tax (${taxPct}%)`,          value: `−${fmt(pl.tax)}`, type: 'neg' },
      { label: 'Est. take-home',                            value: fmt(pl.takeHome), type: 'total' },
    ];
  }

  // Actual YTD
  const grossA = totalGrossGCI(closings);
  const netA   = totalNetGCI(closings);
  const expA   = netA * (cfg.exp || 33) / 100;
  const afterExpA = netA - expA;
  const taxA   = Math.max(0, afterExpA * (cfg.tax || 25) / 100);
  const takeA  = Math.max(0, afterExpA - taxA);

  const actualRows = [
    { label: 'Actual YTD',                              type: 'section' },
    { label: 'Closings logged',                         value: `${closings.length} transactions` },
    { label: 'Gross GCI',                               value: fmt(grossA),  type: 'pos' },
    { label: 'Net GCI (after splits)',                  value: fmt(netA),    type: 'neu' },
    { label: `Est. expenses (${cfg.exp || 33}%)`,       value: `−${fmt(expA)}`, type: 'neg' },
    { label: 'Net before tax',                          value: fmt(afterExpA), type: 'neu' },
    { label: `Est. tax (${cfg.tax || 25}%)`,            value: `−${fmt(taxA)}`, type: 'neg' },
    { label: 'Est. take-home',                          value: fmt(takeA),   type: 'total' },
    { label: `Remaining to ${fmt(cfg.gci1 || 75000)} GCI`, value: fmt(Math.max(0, (cfg.gci1 || 75000) - netA)), type: netA >= (cfg.gci1 || 75000) ? 'pos' : 'neg' },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="P&L Model" desc="Your full economic model — gross to take-home. Based on your actual logged closings." />

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div>
          <SectionTitle>Year 1 — {fmt(cfg.gci1 || 75000)} target</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <PLTable rows={buildRows(cfg.close1 || 12, cfg.price || 300000, cfg.comm || 3, cfg.split || 20, cfg.exp || 33, cfg.tax || 25)} />
          </div>
        </div>
        <div>
          <SectionTitle>Year 3 — {fmt(cfg.gci3 || 150000)} target</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <PLTable rows={buildRows(cfg.close3 || 28, cfg.price3 || 320000, cfg.comm || 3, cfg.split || 20, cfg.exp || 33, cfg.tax || 25, cfg.tc || 18000)} />
          </div>
        </div>
      </div>

      <SectionTitle>Your actual numbers — year to date</SectionTitle>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <PLTable rows={actualRows} />
      </div>

      <Alert type="warn">Set aside {cfg.tax || 25}% of every commission check into a separate tax savings account the day it hits. Don't wait. Don't negotiate with yourself. It's not your money.</Alert>
    </div>
  );
}

// ── PAGE: LEAD FUNNEL ──
export function FunnelPage({ state, onUpdate }) {
  const { settings: cfg, closings, daily = [], funnel } = state;
  const dt = { leads: daily.reduce((s,d)=>s+(d.leads||0),0), appts: daily.reduce((s,d)=>s+(d.appts||0),0) };
  const leads    = funnel?.leads    || dt.leads;
  const appts    = funnel?.appts    || dt.appts;
  const contracts= funnel?.contracts|| 0;
  const closed   = closings.length;
  const touches  = ((cfg.db||100) * 33) + ((cfg.farm||200) * 12);
  const gci      = totalNetGCI(closings);

  function setFunnel(field, val) {
    onUpdate({ ...state, funnel: { ...(funnel||{}), [field]: parseInt(val)||0 } });
  }

  function rate(a, b) { return b ? `${Math.round((a/b)*100)}% conv.` : '—'; }

  const rows = [
    { num: touches.toLocaleString(), name: 'Annual touches sent',  sub: `${cfg.db||100} database × 33 + ${cfg.farm||200} farm × 12`, color: 'var(--gold2)' },
    { num: leads,    name: 'Leads generated',   sub: 'Inbound — calls, emails, referrals, open houses', rate: null,             editable: 'leads' },
    { num: appts,    name: 'Appointments set',  sub: 'Listing and buyer consultations',                  rate: rate(appts,leads), editable: 'appts' },
    { num: contracts,name: 'Contracts signed',  sub: 'Listing agreements + buyer rep agreements',        rate: rate(contracts,appts), editable: 'contracts' },
    { num: closed,   name: 'Closings',          sub: 'Completed transactions',                           rate: rate(closed,contracts) },
    { num: fmt(gci), name: 'GCI generated',     sub: 'Based on logged closings',                        color: '#4ade80' },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="Lead Funnel" desc="Track every stage. Leads and appointments pull automatically from your Daily Log." />
      <Alert type="info">The number that matters most is <strong>leads in</strong>. Until you have more leads than you can handle, nothing else matters.</Alert>
      <Alert type="success" style={{ fontSize: 12 }}>✓ Leads and appointments are pulled automatically from your Daily Log. You can override any number manually below. Contracts must be entered manually.</Alert>

      <div className="sidebar-layout">
        <div>
          <SectionTitle>Your funnel — enter actual numbers</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, minWidth: 80, color: row.color || 'var(--text)' }}>{row.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{row.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{row.sub}</div>
                  </div>
                  {row.editable && (
                    <input
                      type="number"
                      min="0"
                      defaultValue={row.num || 0}
                      onChange={e => setFunnel(row.editable, e.target.value)}
                      style={{ width: 80, background: 'var(--input-bg)', border: '1px solid var(--border2)', borderRadius: 8, padding: '7px 10px', fontSize: 14, color: 'var(--text)', textAlign: 'right', outline: 'none', fontFamily: 'var(--font-sans)' }}
                    />
                  )}
                  {row.rate && <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 56, textAlign: 'right' }}>{row.rate}</div>}
                </div>
                {i < rows.length - 1 && <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', padding: '2px 0' }}>↓</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Keller's targets</SectionTitle>
          <div className="card" style={{ marginBottom: 14 }}>
            {[['Touches sent', touches.toLocaleString()], ['Leads generated','~50'], ['Appointments','~25'], ['Contracts','~15'], ['Closings','12']].map(([k,v],i,a) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom: i<a.length-1?'1px solid rgba(255,255,255,0.04)':'none', fontSize:12 }}>
                <span style={{color:'var(--text2)'}}>{k}</span>
                <span style={{color:'var(--gold2)',fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          <SectionTitle>Conversion rates</SectionTitle>
          <div className="card">
            {leads > 0 ? [
              ['Leads → Appts',     rate(appts,leads)],
              ['Appts → Contracts', rate(contracts,appts)],
              ['Contracts → Close', rate(closed,contracts)],
              ['Overall',           rate(closed,leads)],
            ].map(([k,v],i,a) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom: i<a.length-1?'1px solid rgba(255,255,255,0.04)':'none', fontSize:12 }}>
                <span style={{color:'var(--text2)'}}>{k}</span>
                <span style={{color:'var(--gold2)',fontWeight:600}}>{v}</span>
              </div>
            )) : <div style={{color:'var(--text3)',textAlign:'center',padding:'10px 0',fontSize:12}}>Enter numbers to see rates</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE: ACTION PLAN ──
export function ActionPlanPage({ state, onUpdate }) {
  const { goals = {} } = state;
  const { GOAL_DEFAULTS } = require('../utils/store');

  function getGoals(horizon) {
    return goals[horizon] || GOAL_DEFAULTS[horizon] || [];
  }

  function toggle(horizon, id) {
    const list = getGoals(horizon);
    const updated = list.map(g => g.id === id ? { ...g, done: !g.done } : g);
    onUpdate({ ...state, goals: { ...goals, [horizon]: updated } });
  }

  const horizons = [
    { key: 'week',    label: 'This week — non-negotiables' },
    { key: 'month',   label: 'This month' },
    { key: 'quarter', label: '90 days — first quarter' },
    { key: 'year',    label: 'Full year targets' },
  ];

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="Year 1 Action Plan" desc="The specific actions that get you from $0 to $75K GCI. Check them off as you go." />
      <Alert type="gold">
        <span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', color:'var(--gold2)' }}>
          "Until you have enough leads to exceed your goals, there is no other issue."
        </span>
      </Alert>
      <div className="grid-2">
        {horizons.map(h => (
          <div key={h.key}>
            <SectionTitle>{h.label}</SectionTitle>
            <div className="card" style={{ padding: 14 }}>
              {getGoals(h.key).map(g => (
                <div key={g.id} className={`milestone${g.done?' done':''}`} onClick={() => toggle(h.key, g.id)}>
                  <div className="ms-dot">{g.done ? '✓' : ''}</div>
                  <div className="ms-text">{g.text}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SectionTitle>Your daily power hour</SectionTitle>
      <div className="card-gold">
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, fontSize: 13, lineHeight: 2.2 }}>
          {[
            ['6:00–7:30am', 'Power hour — 5 database calls before anything else. No email. No admin.'],
            ['7:30–9:00am', 'Follow up all open leads from previous day'],
            ['9:00am+',     'Appointments, showings, transactions, admin'],
            ['Every Friday','Review week — log all numbers, plan next week, add contacts to CRM'],
          ].map(([time, task]) => (
            <React.Fragment key={time}>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{time}</span>
              <span style={{ color: 'var(--text2)' }}>{task}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE: SCALE MODEL ──
export function ScalePage() {
  const { SCALE_MODEL } = require('../utils/store');
  const { fmt } = require('../utils/store');

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="Scale Model" desc="How your business grows from year 1 through year 5. Every number tied to Keller's model." />
      <SectionTitle>Year-by-year projection</SectionTitle>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <table className="log-table">
          <thead><tr><th>Year</th><th>Closings</th><th>Avg price</th><th>Gross GCI</th><th>After split</th><th>Expenses</th><th>Take-home</th><th>Team</th><th>Key unlock</th></tr></thead>
          <tbody>
            {SCALE_MODEL.map((row, i) => (
              <tr key={i} style={i === 0 ? { background: 'rgba(201,168,76,0.06)' } : {}}>
                <td style={{ color: i === 0 ? 'var(--gold)' : 'var(--text2)', fontWeight: i === 0 ? 600 : 400 }}>
                  {row.year} {i === 0 ? '← now' : ''}
                </td>
                <td style={{ color: 'var(--text)' }}>{row.closings}</td>
                <td>${(row.price / 1000).toFixed(0)}K</td>
                <td style={{ color: '#93c5fd' }}>{fmt(row.gross)}</td>
                <td>{fmt(row.net)}</td>
                <td style={{ color: '#f87171' }}>−{fmt(row.exp)}</td>
                <td style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(row.take)}</td>
                <td style={{ color: 'var(--text2)' }}>{row.team}</td>
                <td style={{ color: 'var(--text3)', fontSize: 11 }}>{row.unlock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SectionTitle>Leverage hire timeline — Keller's model</SectionTitle>
      <div className="grid-3">
        {[
          { trigger: 'At $75K GCI',   title: 'Part-time TC',    body: 'Transaction coordinator handles paperwork and scheduling. You focus only on lead gen and listing appointments. Cost: ~$18K/yr.' },
          { trigger: 'At $150K GCI',  title: 'Buyer Specialist', body: 'Dedicated buyer agent handles all buyer clients. You become 100% listing-focused. Income can double without doubling your hours.' },
          { trigger: 'At $300K GCI',  title: 'Full Team',        body: 'Full-time TC, listing coordinator, 2+ buyer agents. You generate leads and set culture. Net a Million stage begins.' },
        ].map(item => (
          <div key={item.title} className="card">
            <div style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{item.trigger}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{item.body}</div>
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
    c: cfg.close1 || 12, p: cfg.price || 300000,
    m: cfg.comm || 3, s: cfg.split || 20, e: cfg.exp || 33
  });

  const gci      = vals.c * vals.p * (vals.m / 100);
  const net      = gci * (1 - vals.s / 100);
  const afterExp = net * (1 - vals.e / 100);
  const tax      = afterExp * 0.25;
  const take     = afterExp - tax;
  const perDeal  = vals.c ? Math.round(take / vals.c) : 0;
  const pctGoal  = Math.min(100, Math.round((take / (cfg.gci3 || 150000)) * 100));

  const goals = [34000, 50000, 75000, 100000, 150000];

  return (
    <div className="page-wrap fade-up">
      <PageHeader title="GCI Calculator" desc="Model any scenario. See exactly what different volumes and price points mean for your take-home." />
      <div className="sidebar-layout">
        <div>
          <SectionTitle>Adjust your model</SectionTitle>
          <div className="card">
            {[
              { label: 'Closings per year',        key: 'c', min: 4,      max: 60,     step: 1,    fmt: v => v },
              { label: 'Avg sale price',            key: 'p', min: 150000, max: 800000, step: 10000,fmt: v => '$'+Math.round(v/1000)+'K' },
              { label: 'Commission rate',           key: 'm', min: 2,      max: 4,      step: 0.25, fmt: v => v.toFixed(2)+'%' },
              { label: 'Brokerage split',           key: 's', min: 10,     max: 40,     step: 1,    fmt: v => v+'%' },
              { label: 'Expenses (% of net GCI)',   key: 'e', min: 10,     max: 55,     step: 1,    fmt: v => v+'%' },
            ].map(row => (
              <div key={row.key} className="slider-row">
                <span className="slider-lbl">{row.label}</span>
                <input type="range" min={row.min} max={row.max} step={row.step} value={vals[row.key]}
                  onChange={e => setVals(v => ({ ...v, [row.key]: parseFloat(e.target.value) }))} />
                <span className="slider-val">{row.fmt(vals[row.key])}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Your results</SectionTitle>
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <div className="stat-label">Gross GCI</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold2)' }}>{fmt(gci)}</div>
            </div>
            <hr className="divider" />
            {[
              { label: 'After split',   val: fmt(net),      color: 'var(--text)' },
              { label: 'After expenses',val: fmt(afterExp), color: 'var(--text)' },
              { label: 'Est. tax (25%)',val: `−${fmt(tax)}`,color: '#f87171' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, lineHeight:2.2 }}>
                <span style={{color:'var(--text2)'}}>{row.label}</span>
                <span style={{fontWeight:600,color:row.color}}>{row.val}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, borderTop:'1px solid var(--border)', paddingTop:8, marginTop:4 }}>
              <span style={{fontWeight:600,color:'var(--text)'}}>Take-home</span>
              <span style={{fontWeight:700,color:'#4ade80',fontSize:18}}>{fmt(take)}</span>
            </div>
            <div className="prog-bg" style={{marginTop:12}}>
              <div className="prog-fill" style={{background:'var(--gold)',width:`${pctGoal}%`}} />
            </div>
            <div style={{fontSize:11,color:'var(--text3)',marginTop:5}}>{pctGoal}% of {fmt(cfg.gci3||150000)} take-home goal</div>
          </div>
          <Alert type="info" style={{ marginTop: 14, fontSize: 12 }}>
            {take < 35000
              ? `At ${vals.c} closings take-home is lean. Every extra closing adds ~${fmt(perDeal)}.`
              : take < 80000
              ? `Good momentum. ${Math.round((cfg.gci3||150000)/take*vals.c)} closings at this price hits your $150K take-home goal.`
              : `Strong numbers at ${vals.c} closings — this is when hiring a TC makes sense.`}
          </Alert>
        </div>
      </div>
      <SectionTitle style={{marginTop:8}}>What it takes to hit each milestone</SectionTitle>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table className="log-table">
          <thead><tr><th>Take-home goal</th><th>Closings needed</th><th>Gross GCI</th><th>After split</th><th>After expenses</th><th>Take-home</th></tr></thead>
          <tbody>
            {goals.map(g => {
              const needed = Math.ceil(g / (take/vals.c||1));
              const rGCI   = needed * vals.p * (vals.m/100);
              const rNet   = rGCI * (1-vals.s/100);
              const rExp   = rNet * (1-vals.e/100);
              return (
                <tr key={g}>
                  <td style={{color:'var(--gold2)',fontWeight:600}}>{fmt(g)}/yr</td>
                  <td style={{color:'var(--text)',fontWeight:600}}>{needed}</td>
                  <td style={{color:'#93c5fd'}}>{fmt(rGCI)}</td>
                  <td>{fmt(rNet)}</td>
                  <td>{fmt(rExp)}</td>
                  <td style={{color:'#4ade80',fontWeight:600}}>{fmt(g)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
