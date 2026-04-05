// ── DAILY CHECKLIST PAGE ──
import React, { useState } from "react";

const AFFIRMATIONS = [
  {
    emoji: "🏡",
    text: "I am building a real estate business that gives my family financial freedom and time together.",
  },
  {
    emoji: "🏡",
    text: "Every call I make moves me one step closer to full-time.",
  },
  {
    emoji: "🏡",
    text: "I attract clients who trust me, value me, and refer me to others.",
  },
  {
    emoji: "🏡",
    text: "My database is growing every day, and so is my income.",
  },
  {
    emoji: "🏡",
    text: "I follow my MREA plan with discipline — the results take care of themselves.",
  },
  {
    emoji: "💪",
    text: "Rejection is redirection. Every 'no' brings me closer to a 'yes.'",
  },
  {
    emoji: "💪",
    text: "I show up consistently, even when it's hard — that's what separates me.",
  },
  {
    emoji: "💪",
    text: "I am becoming the agent I've always known I could be.",
  },
  {
    emoji: "💪",
    text: "Progress, not perfection. I take one more step forward today.",
  },
  {
    emoji: "👨‍👩‍👧‍👦",
    text: "I am building this business so I never miss the moments that matter most.",
  },
  { emoji: "👨‍👩‍👧‍👦", text: "My work today is a gift to my family's future." },
  {
    emoji: "👨‍👩‍👧‍👦",
    text: "Being present for my family is my greatest motivation and my greatest reward.",
  },
  {
    emoji: "🌅",
    text: "Today I will lead generate, lead nurture, and lead convert — one conversation at a time.",
  },
  {
    emoji: "🌅",
    text: "I am a full-time agent in the making. My part-time effort today is my full-time life tomorrow.",
  },
];

export default function ChecklistPage({ state, onUpdate }) {
  const cfg = state.settings || {};
  const closes = cfg.close1 || 12;
  const gci = cfg.gci1 || 75000;
  const TODAY = new Date().toISOString().split("T")[0];

  const [affirmation] = useState(
    () => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)],
  );

  const allChecklist = state.checklist || {};
  const done = allChecklist[TODAY] || {};

  function toggle(id) {
    const updated = { ...done, [id]: !done[id] };
    const newChecklist = { ...allChecklist, [TODAY]: updated };
    onUpdate({ ...state, checklist: newChecklist });
  }

  function reset() {
    const newChecklist = { ...allChecklist, [TODAY]: {} };
    onUpdate({ ...state, checklist: newChecklist });
  }

  const GROUPS = [
    {
      id: "mindset",
      title: "Mind & motivation — do this before anything else",
      color: "#e879f9",
      tasks: [
        {
          id: "ms1",
          text: "Read your why statement out loud — remember why you're building this",
          tag: "mindset",
        },
        {
          id: "ms2",
          text: "Say your daily affirmations out loud — speak it before you seek it",
          tag: "mindset",
        },
        {
          id: "ms3",
          text: "Visualize your ideal day — what does a win look like today?",
          tag: "mindset",
        },
      ],
    },
    {
      id: "power",
      title: "Power hour — do this first",
      color: "#2563eb",
      tasks: [
        {
          id: "p1",
          text: "Call 5 people from your database — Prioritize warm leads, past clients, and sphere of influence. Goal: at least 1 meaningful conversation",
          tag: "daily",
        },
        {
          id: "p2",
          text: "Follow up on all active leads — Anyone who hasn't heard from you in 3+ days gets a call or text today. Check your MREA Tracker lead funnel",
          tag: "daily",
        },
        {
          id: "p3",
          text: "Send 3 personal outreach messages — Text, handwritten note, or video message. Not a mass blast — something personal. Referrals come from relationships",
          tag: "lead",
        },
        {
          id: "p4",
          text: "Add 2 new contacts to your database — Anyone you met, connected with, or thought of. Name, number, source. Growth fuels the funnel",
          tag: "daily",
        },
        {
          id: "p5",
          text: "Set or confirm 1 appointment — Buyer consult, listing presentation, coffee meeting, or phone call. An appointment on the calendar = momentum",
          tag: "lead",
        },
      ],
    },

    {
      id: "mrea_leadgen",
      title: "MREA lead gen — Keller's 5 daily disciplines",
      color: "#e55c3a",
      tasks: [
        {
          id: "mg1",
          text: "Make 10 proactive contacts — call, text, or personal note to your Met database first",
          tag: "lead",
        },
        {
          id: "mg2",
          text: "Add 1–3 new leads to your database — capture name + contact info for every new person you meet",
          tag: "lead",
        },
        {
          id: "mg3",
          text: "Send 1 personal follow-up to a hot lead — a real, individual touch from your 33 Touch system",
          tag: "lead",
        },
        {
          id: "mg4",
          text: "Post or engage on 1 social/community channel — stay top of mind in your geographic farm area",
          tag: "farm",
        },
        {
          id: "mg5",
          text: "Review and update your Lead Funnel — 5 min to move leads from suspect → prospect → appointment → contract",
          tag: "goal",
        },
      ],
    },
    {
      id: "social",
      title: "Social media — build your personal brand and farm your area",
      color: "#0d9488",
      tasks: [
        {
          id: "s1",
          text: "5/5/5 check — 5 likes, 5 comments, 5 shares/DMs to engage your audience",
          tag: "daily",
        },
        {
          id: "s2",
          text: "Post 1 piece of content — market update, local stat, or client win. Farms your area over time.",
          tag: "daily",
        },
        {
          id: "s3",
          text: "Plan social content for the week — batch creation is more efficient and consistent",
          tag: "daily",
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

  const TAG = {
    daily: { bg: "rgba(37,99,235,.15)", color: "#93c5fd" },
    lead: { bg: "rgba(201,168,76,.15)", color: "#e8c97a" },
    farm: { bg: "rgba(13,148,136,.15)", color: "#2dd4bf" },
    goal: { bg: "rgba(22,163,74,.15)", color: "#4ade80" },
    money: { bg: "rgba(124,58,237,.15)", color: "#c4b5fd" },
    mindset: { bg: "rgba(232,121,249,.15)", color: "#f0abfc" },
  };

  const allTasks = GROUPS.flatMap((g) => g.tasks);
  const totalDone = allTasks.filter((t) => done[t.id]).length;
  const totalAll = allTasks.length;
  const pct = Math.round((totalDone / totalAll) * 100);
  const ytdCalls = (state.daily || [])
    .filter((d) => d.date?.startsWith(new Date().getFullYear() + ""))
    .reduce((s, d) => s + (d.calls || 0), 0);

  return (
    <div className="page-wrap fade-up">
      <p className="page-title">Daily Checklist</p>
      <p className="page-desc">
        Everything you need to do today to hit your ${Math.round(gci / 1000)}K
        GCI goal.
      </p>

      {/* ── WHY STATEMENT ── */}
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

      {/* ── ALL DONE BANNER ── */}
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

      {/* ── STAT BOXES ── */}
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
            val: `${(state.closings || []).filter((c) => !c.side?.startsWith("Rental")).length}/${closes}`,
            lbl: "Closings this year",
            color: "#4ade80",
            cls: "green",
            prog: Math.min(
              100,
              Math.round(
                ((state.closings || []).filter(
                  (c) => !c.side?.startsWith("Rental"),
                ).length /
                  closes) *
                  100,
              ),
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

      {/* ── DATE + RESET ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
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

      {/* ── DAILY AFFIRMATION — sits just above the task groups ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(232,121,249,.08), rgba(139,92,246,.08))",
          border: "1px solid rgba(232,121,249,.2)",
          borderRadius: 14,
          padding: "14px 20px",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            color: "#e879f9",
            marginBottom: 6,
          }}
        >
          {affirmation.emoji} Daily Affirmation
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            fontStyle: "italic",
            color: "#f0abfc",
            lineHeight: 1.6,
          }}
        >
          "{affirmation.text}"
        </div>
      </div>

      {/* ── TASK GROUPS ── */}
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

      {/* ── GOAL BREAKDOWN ── */}
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
            num: "5 calls + 10 contacts",
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
