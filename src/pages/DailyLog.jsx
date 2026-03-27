// ── PAGE: DAILY LOG ──
// Edit this file to change the daily activity tracking page

import React, { useState } from 'react';
import { SectionTitle, PageHeader, Alert, StatBox, EmptyState, DeleteBtn } from '../components/UI';
import { getDailyTotals, getWeekTotals, formatDate, today } from '../utils/store';

// ── DAILY TARGETS ──
// Edit these numbers to change what counts as a good day/week/year
const TARGETS = {
  dailyCalls:  5,
  weeklyCalls: 25,
  annualCalls: 1300,
  annualOH:    24,   // open houses per year
  annualLeads: 50,
  annualAppts: 25,
};

const RATINGS = {
  5: { label: '⭐ Excellent', color: '#4ade80' },
  4: { label: '👍 Good',      color: '#93c5fd' },
  3: { label: '— Average',   color: 'var(--text2)' },
  2: { label: '👎 Slow',      color: '#fcd34d' },
  1: { label: '😢 Rough',     color: '#f87171' },
};

export default function DailyLogPage({ state, onUpdate }) {
  const { daily = [], settings: cfg } = state;

  const [form, setForm] = useState({
    date: today(), rating: 3, calls: 0, leads: 0,
    appts: 0, contacts: 0, oh: 0, mailers: 0, notes: ''
  });
  const [filter, setFilter] = useState('all');

  const dt = getDailyTotals(daily);
  const wk = getWeekTotals(daily);

  function handleChange(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function saveDay() {
    if (!form.date) { alert('Please select a date'); return; }
    const entry = {
      id: Date.now().toString(),
      ...form,
      calls:    parseInt(form.calls)    || 0,
      leads:    parseInt(form.leads)    || 0,
      appts:    parseInt(form.appts)    || 0,
      contacts: parseInt(form.contacts) || 0,
      oh:       parseInt(form.oh)       || 0,
      mailers:  parseInt(form.mailers)  || 0,
    };
    const existing = daily.findIndex(d => d.date === form.date);
    let newDaily;
    if (existing > -1) {
      if (!window.confirm('You already have an entry for this date. Replace it?')) return;
      newDaily = [...daily];
      newDaily[existing] = entry;
    } else {
      newDaily = [...daily, entry];
    }
    onUpdate({ ...state, daily: newDaily });
    setForm({ date: today(), rating: 3, calls: 0, leads: 0, appts: 0, contacts: 0, oh: 0, mailers: 0, notes: '' });
  }

  function deleteDay(id) {
    onUpdate({ ...state, daily: daily.filter(d => d.id !== id) });
  }

  // Filter entries for table
  const now = new Date();
  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  })();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const sorted = [...daily].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = sorted.filter(d => {
    if (filter === 'week')  return d.date >= weekStart;
    if (filter === 'month') return d.date >= monthStart;
    return true;
  });

  const callsPct = Math.min(100, Math.round((dt.calls / TARGETS.annualCalls) * 100));
  const leadsPct = Math.min(100, Math.round((dt.leads / TARGETS.annualLeads) * 100));
  const apptsPct = Math.min(100, Math.round((dt.appts / TARGETS.annualAppts) * 100));
  const ohPct    = Math.min(100, Math.round((dt.oh    / TARGETS.annualOH)    * 100));

  return (
    <div className="page-wrap fade-up">
      <PageHeader
        title="Daily Activity Log"
        desc="Log your work every day. This is how $75K gets built — one power hour at a time."
      />

      <Alert type="gold">
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--gold2)' }}>
          "Until you have enough leads to exceed your goals, there is no other issue."
        </span>
        <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4, fontWeight: 600 }}>
          Keller's rule: log every day. What gets measured gets done.
        </div>
      </Alert>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* LOG FORM */}
        <div>
          <SectionTitle>Log today's activity</SectionTitle>
          <div className="card">
            <div className="two-input">
              <div className="input-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Day rating</label>
                <select value={form.rating} onChange={e => handleChange('rating', parseInt(e.target.value))}>
                  <option value={5}>⭐ Excellent</option>
                  <option value={4}>👍 Good</option>
                  <option value={3}>— Average</option>
                  <option value={2}>👎 Slow</option>
                  <option value={1}>😢 Rough</option>
                </select>
              </div>
            </div>

            {/* Activity inputs — edit labels here to change what you track */}
            <div className="three-input">
              <div className="input-group">
                <label>Database calls</label>
                <input type="number" min="0" value={form.calls} onChange={e => handleChange('calls', e.target.value)} />
              </div>
              <div className="input-group">
                <label>New leads added</label>
                <input type="number" min="0" value={form.leads} onChange={e => handleChange('leads', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Appointments set</label>
                <input type="number" min="0" value={form.appts} onChange={e => handleChange('appts', e.target.value)} />
              </div>
            </div>

            <div className="three-input">
              <div className="input-group">
                <label>Contacts added to CRM</label>
                <input type="number" min="0" value={form.contacts} onChange={e => handleChange('contacts', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Open houses hosted</label>
                <input type="number" min="0" value={form.oh} onChange={e => handleChange('oh', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mailers sent</label>
                <input type="number" min="0" value={form.mailers} onChange={e => handleChange('mailers', e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <label>Notes — what happened today?</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="e.g. Called 5 database contacts, got a referral from Sarah, booked a listing appt Friday..."
              />
            </div>

            <button className="btn btn-gold btn-full" onClick={saveDay}>
              Save today's log
            </button>
          </div>
        </div>

        {/* TOTALS SIDEBAR */}
        <div>
          <SectionTitle>This week</SectionTitle>
          <div className="card" style={{ marginBottom: 16 }}>
            {[
              { label: 'Days logged',     value: `${wk.days}/5`,   target: '' },
              { label: 'Calls made',      value: wk.calls,         target: `/ ${TARGETS.weeklyCalls} target`, color: wk.calls >= TARGETS.weeklyCalls ? '#4ade80' : 'var(--gold2)' },
              { label: 'New leads',       value: wk.leads,         target: '',                                color: '#93c5fd' },
              { label: 'Appointments',    value: wk.appts,         target: '',                                color: '#2dd4bf' },
              { label: 'Contacts added',  value: wk.contacts,      target: '',                                color: '#4ade80' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                <span>
                  <span style={{ fontWeight: 600, color: row.color || 'var(--gold2)' }}>{row.value}</span>
                  {row.target && <span style={{ color: 'var(--text3)', marginLeft: 4 }}>{row.target}</span>}
                </span>
              </div>
            ))}
          </div>

          <SectionTitle>Year to date</SectionTitle>
          <div className="card">
            {[
              { label: 'Days logged',     value: dt.days,          target: '' },
              { label: 'Total calls',     value: dt.calls,         target: `/ ${TARGETS.annualCalls}`,  color: 'var(--gold2)' },
              { label: 'Total leads',     value: dt.leads,         target: `/ ${TARGETS.annualLeads}`,  color: '#93c5fd' },
              { label: 'Open houses',     value: dt.oh,            target: `/ ${TARGETS.annualOH}`,     color: '#2dd4bf' },
              { label: 'Contacts added',  value: dt.contacts,      target: '',                           color: '#4ade80' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                <span>
                  <span style={{ fontWeight: 600, color: row.color || 'var(--gold2)' }}>{row.value}</span>
                  {row.target && <span style={{ color: 'var(--text3)', marginLeft: 4 }}>{row.target}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YEAR PROGRESS STATS */}
      <SectionTitle>Progress vs annual targets</SectionTitle>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatBox value={dt.calls}    label="Calls YTD"       target={`of ${TARGETS.annualCalls} target`} color="gold"   progress={callsPct} />
        <StatBox value={dt.leads}    label="Leads YTD"       target={`of ${TARGETS.annualLeads} target`} color="teal"   progress={leadsPct} />
        <StatBox value={dt.appts}    label="Appointments YTD" target={`of ${TARGETS.annualAppts} target`} color="blue"   progress={apptsPct} />
        <StatBox value={dt.oh}       label="Open houses YTD" target={`of ${TARGETS.annualOH} target`}    color="green"  progress={ohPct} />
      </div>

      {/* HISTORY TABLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <SectionTitle style={{ marginBottom: 0 }}>Activity history</SectionTitle>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-sans)', outline: 'none' }}
        >
          <option value="all">All time</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <table className="log-table">
          <thead>
            <tr>
              <th>Date</th><th>Rating</th><th>Calls</th><th>Leads</th>
              <th>Appts</th><th>Contacts</th><th>Open houses</th><th>Notes</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState icon="📅" message="No activity logged yet — start today!" /></td></tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatDate(d.date)}</td>
                  <td style={{ color: RATINGS[d.rating]?.color || 'var(--text2)' }}>{RATINGS[d.rating]?.label || '—'}</td>
                  <td style={{ color: d.calls >= TARGETS.dailyCalls ? '#4ade80' : 'var(--text2)', fontWeight: d.calls >= TARGETS.dailyCalls ? 600 : 400 }}>{d.calls}</td>
                  <td style={{ color: d.leads > 0 ? '#93c5fd' : 'var(--text2)' }}>{d.leads}</td>
                  <td style={{ color: d.appts > 0 ? '#2dd4bf' : 'var(--text2)' }}>{d.appts}</td>
                  <td>{d.contacts}</td>
                  <td>{d.oh}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)', fontSize: 12 }}>{d.notes || '—'}</td>
                  <td><DeleteBtn onClick={() => deleteDay(d.id)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* KELLER'S IDEAL WEEK */}
      <SectionTitle>Keller's ideal week — your daily targets</SectionTitle>
      <div className="card-gold">
        {/* Edit this schedule to match your actual work hours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, textAlign: 'center' }}>
          {[
            { day: 'Mon', tasks: ['5 calls', 'Schedule posts', 'Power hour'] },
            { day: 'Tue', tasks: ['5 calls', 'Market email', 'Power hour'] },
            { day: 'Wed', tasks: ['5 calls', '2 handwritten notes', 'Power hour'] },
            { day: 'Thu', tasks: ['5 calls', 'Follow up leads', 'Power hour'] },
            { day: 'Fri', tasks: ['Review week', 'Add to CRM', 'Plan next week'] },
          ].map(({ day, tasks }) => (
            <div key={day}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gold)', marginBottom: 6 }}>{day}</div>
              {tasks.map(t => <div key={t} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>{t}</div>)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
          Daily call target: <strong style={{ color: 'var(--gold2)' }}>{TARGETS.dailyCalls} calls</strong>
          &nbsp;|&nbsp; Weekly: <strong style={{ color: 'var(--gold2)' }}>{TARGETS.weeklyCalls} calls</strong>
          &nbsp;|&nbsp; Annual: <strong style={{ color: 'var(--gold2)' }}>{TARGETS.annualCalls.toLocaleString()} calls</strong>
        </div>
      </div>
    </div>
  );
}
