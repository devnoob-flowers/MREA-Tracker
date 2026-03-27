// ── PAGE: OVERVIEW ──
// Edit this file to change the dashboard/overview page layout

import React from 'react';
import { StatBox, SectionTitle, KellerQuote, CompareCard, Alert } from '../components/UI';
import { fmt, getDailyTotals, totalNetGCI, totalTakeHome } from '../utils/store';

export default function OverviewPage({ state }) {
  const { settings: cfg, closings, daily } = state;
  const dt = getDailyTotals(daily);
  const gci = totalNetGCI(closings);
  const take = totalTakeHome(closings, cfg);
  const gciTarget = cfg.gci1 || 75000;
  const gciPct = Math.min(100, Math.round((gci / gciTarget) * 100));
  const takePct = Math.min(100, Math.round((take / 33750) * 100));
  const callsPct = Math.min(100, Math.round((dt.calls / 1300) * 100));
  const leadsPct = Math.min(100, Math.round((dt.leads / (cfg.leads || 50)) * 100));
  const apptPct  = Math.min(100, Math.round((dt.appts / (cfg.appts || 25)) * 100));
  const ohPct    = Math.min(100, Math.round((dt.oh / 24) * 100));

  return (
    <div className="page-wrap fade-up">
      <p className="page-title">Economic Model</p>
      <p className="page-desc">
        {cfg.name ? `${cfg.name}'s` : 'Your'} business at a glance — {new Date().getFullYear()}
      </p>

      <KellerQuote quote="The difference between the Millionaire Real Estate Agent and the average agent is that the MREA never drops the ball on lead generation." />

      {/* Top stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatBox value={fmt(gci)}   label="GCI this year"     target={`Target: ${fmt(gciTarget)}`}        color="gold"  progress={gciPct} />
        <StatBox value={closings.length} label="Closings"     target={`Target: ${cfg.close1 || 12} this year`} color="teal"  progress={Math.min(100, Math.round(closings.length / (cfg.close1 || 12) * 100))} />
        <StatBox value={dt.leads}   label="Leads YTD"         target={`Target: ${cfg.leads || 50} this year`}  color="green" progress={leadsPct} />
        <StatBox value={dt.calls}   label="Calls YTD"         target="Target: 1,300 this year"              color="blue"  progress={callsPct} />
      </div>

      {/* GCI + Take-home progress */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div>
          <SectionTitle>GCI progress — {new Date().getFullYear()}</SectionTitle>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <div className="stat-label">Earned so far</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--gold2)' }}>{fmt(gci)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-label">Year 1 target</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text2)' }}>{fmt(gciTarget)}</div>
              </div>
            </div>
            <div className="prog-bg">
              <div className="prog-fill" style={{ background: 'var(--gold)', width: `${gciPct}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
              {gciPct}% of {fmt(gciTarget)} target
            </div>
          </div>
        </div>
        <div>
          <SectionTitle>Take-home progress</SectionTitle>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <div className="stat-label">Est. take-home</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: '#4ade80' }}>{fmt(take)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-label">Year 1 est.</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text2)' }}>$33,750</div>
              </div>
            </div>
            <div className="prog-bg">
              <div className="prog-fill" style={{ background: '#4ade80', width: `${takePct}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
              {takePct}% of $34K take-home target
            </div>
          </div>
        </div>
      </div>

      {/* Activity stats from daily log */}
      <SectionTitle>Activity this year — from daily log</SectionTitle>
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatBox value={dt.calls}    label="Database calls"   target="of 1,300 annual target" color="gold"   progress={callsPct} />
        <StatBox value={dt.appts}    label="Appointments set" target={`of ${cfg.appts || 25} annual target`} color="teal"   progress={apptPct} />
        <StatBox value={dt.oh}       label="Open houses"      target="of 24 annual target"     color="blue"   progress={ohPct} />
        <StatBox value={dt.contacts} label="Contacts added"   target={`building to ${cfg.db || 100}`}        color="green"  progress={Math.min(100, Math.round(dt.contacts / (cfg.db || 100) * 100))} />
      </div>

      {/* Keller's 3 stages */}
      <SectionTitle>Keller's 3 stages — where you are</SectionTitle>
      <div className="grid-3">
        <CompareCard
          year="Stage 1 — You are here"
          gci="Earn a Million"
          highlight
          rows={[
            { key: 'Target GCI',  value: '$75K → $150K',  color: '#93c5fd' },
            { key: 'Closings',    value: '12 → 28/yr' },
            { key: 'Focus',       value: 'Lead gen machine' },
            { key: 'Team',        value: 'Solo' },
            { key: 'Timeline',    value: 'Now – Year 3' },
          ]}
        />
        <CompareCard
          year="Stage 2"
          gci="Net a Million"
          rows={[
            { key: 'Target GCI',  value: '$300K+',         color: '#93c5fd' },
            { key: 'Closings',    value: '50+/yr' },
            { key: 'Focus',       value: 'Cut waste, optimize' },
            { key: 'Team',        value: 'TC + Buyer Specialist' },
            { key: 'Timeline',    value: 'Year 3 – 5' },
          ]}
        />
        <CompareCard
          year="Stage 3"
          gci="Receive a Million"
          rows={[
            { key: 'Target GCI',  value: '$1M+',           color: '#93c5fd' },
            { key: 'Closings',    value: 'Team produces' },
            { key: 'Focus',       value: 'Passive income' },
            { key: 'Team',        value: 'Full team' },
            { key: 'Timeline',    value: 'Year 5+' },
          ]}
        />
      </div>
    </div>
  );
}
