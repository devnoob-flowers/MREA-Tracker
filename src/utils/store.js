// ── MREA TRACKER — DATA STORE ──
// All app data, defaults, and helper functions live here.
// To change default targets or settings, edit the DEFAULTS object below.

// ── STORAGE KEY ──
const STORAGE_KEY = "mrea_tracker_v2";

// ── DEFAULT SETTINGS ──
// Edit these to change the app's default targets and assumptions
export const DEFAULTS = {
  // Personal
  name: "",
  why: "I build this business so my family never has to wonder if I'll be there — for the school plays, the hard days, and the moments that only happen once.",
  market: "Houston suburbs",

  // Year 1 targets
  gci1: 75000,
  close1: 12,
  price: 300000,
  comm: 3,

  // Year 3 targets
  gci3: 150000,
  close3: 28,
  price3: 320000,
  tc: 18000,

  // Financial assumptions
  split: 20, // Brokerage split %
  exp: 33, // Business expenses as % of net GCI
  tax: 25, // Self-employment tax %

  // Database & farm
  db: 100, // Target database size
  farm: 200, // Target farm homes

  // Funnel targets
  leads: 50,
  appts: 25,
  contracts: 15,

  // Daily targets
  dailyCalls: 5,
  weeklyCalls: 25,
  annualCalls: 1300,
  monthlyOH: 2, // Open houses per month
};

// ── EMPTY STATE ──
export const EMPTY_STATE = {
  settings: { ...DEFAULTS },
  closings: [],
  leads: [],
  daily: [],
  goals: {},
  funnel: { leads: 0, appts: 0, contracts: 0 },
  checklist: {}, // ✅ FIX: keyed by date e.g. { "2026-03-27": { p1: true } }
};

// ── LOAD / SAVE ──
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...parsed,
      settings: { ...DEFAULTS, ...(parsed.settings || {}) },
      checklist: parsed.checklist || {}, // ✅ FIX: preserve checklist on load
    };
  } catch (e) {
    return { ...EMPTY_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export function exportBackup(state) {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mrea_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
}

export function importBackup(file, onSuccess) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      onSuccess(data);
    } catch (err) {
      alert("Invalid backup file. Please use a valid MREA backup JSON.");
    }
  };
  reader.readAsText(file);
}

// ── FINANCIAL HELPERS ──
// These calculate GCI, take-home, and P&L from your settings

export function calcGrossGCI(price, comm) {
  return price * (comm / 100);
}

export function calcNetGCI(grossGCI, split) {
  return grossGCI * (1 - split / 100);
}

export function calcTakeHome(netGCI, expPct, taxPct) {
  const afterExp = netGCI * (1 - expPct / 100);
  return afterExp * (1 - taxPct / 100);
}

export function calcPL(
  closings,
  price,
  comm,
  split,
  expPct,
  taxPct,
  tcCost = 0,
) {
  const gross = closings * price * (comm / 100);
  const net = gross * (1 - split / 100);
  const expenses = (net * expPct) / 100 + tcCost;
  const afterExp = net - expenses;
  const tax = Math.max(0, afterExp * (taxPct / 100));
  const takeHome = Math.max(0, afterExp - tax);
  return { gross, net, expenses, afterExp, tax, takeHome };
}

export function totalGrossGCI(closings) {
  return closings.reduce((s, c) => s + (c.grossGCI || 0), 0);
}

export function totalNetGCI(closings) {
  return closings.reduce((s, c) => s + (c.netGCI || 0), 0);
}

export function totalTakeHome(closings, settings) {
  const net = totalNetGCI(closings);
  return calcTakeHome(net, settings.exp, settings.tax);
}

// ── DAILY LOG HELPERS ──

export function getDailyTotals(daily) {
  const year = new Date().getFullYear() + "";
  const thisYear = (daily || []).filter((d) => d.date.startsWith(year));
  return {
    calls: thisYear.reduce((s, d) => s + (d.calls || 0), 0),
    leads: thisYear.reduce((s, d) => s + (d.leads || 0), 0),
    appts: thisYear.reduce((s, d) => s + (d.appts || 0), 0),
    contacts: thisYear.reduce((s, d) => s + (d.contacts || 0), 0),
    oh: thisYear.reduce((s, d) => s + (d.oh || 0), 0),
    mailers: thisYear.reduce((s, d) => s + (d.mailers || 0), 0),
    days: thisYear.length,
  };
}

export function getWeekTotals(daily) {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(new Date().setDate(diff));
  const weekStart = monday.toISOString().split("T")[0];
  const thisWeek = (daily || []).filter((d) => d.date >= weekStart);
  return {
    calls: thisWeek.reduce((s, d) => s + (d.calls || 0), 0),
    leads: thisWeek.reduce((s, d) => s + (d.leads || 0), 0),
    appts: thisWeek.reduce((s, d) => s + (d.appts || 0), 0),
    contacts: thisWeek.reduce((s, d) => s + (d.contacts || 0), 0),
    oh: thisWeek.reduce((s, d) => s + (d.oh || 0), 0),
    days: thisWeek.length,
  };
}

// ── FORMATTING HELPERS ──

export function fmt(n) {
  if (!n && n !== 0) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (abs >= 1000) return "$" + Math.round(n / 1000) + "K";
  return "$" + Math.round(n).toLocaleString();
}

export function fmtFull(n) {
  if (!n && n !== 0) return "$0";
  return "$" + Math.round(n).toLocaleString();
}

export function pct(a, b) {
  return b ? Math.round((a / b) * 100) + "%" : "—";
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function today() {
  return new Date().toISOString().split("T")[0];
}

// ── SIDE LABELS & STYLES ──
export const SIDE_PILL = {
  Seller: "pill-seller",
  Buyer: "pill-buyer",
  Both: "pill-both",
  "Rental (landlord)": "pill-rental",
  "Rental (tenant)": "pill-rental",
  "Rental (both)": "pill-rental",
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── GOAL DEFAULTS ──
// Edit these to change the default action plan items
export const GOAL_DEFAULTS = {
  week: [
    {
      id: "w1",
      text: "Write your why statement and put it somewhere visible",
      done: false,
    },
    {
      id: "w2",
      text: "List every person you know — target 150 names",
      done: false,
    },
    {
      id: "w3",
      text: "Set your full-time start date on the calendar",
      done: false,
    },
    { id: "w4", text: "Open a separate tax savings account", done: false },
    { id: "w5", text: "Set up KW Command or Follow Up Boss CRM", done: false },
  ],
  month: [
    {
      id: "m1",
      text: "Enter all contacts into CRM — tag top 20 past clients",
      done: false,
    },
    {
      id: "m2",
      text: "Send first market update email to full database",
      done: false,
    },
    { id: "m3", text: "Book 2 open houses for this month", done: false },
    {
      id: "m4",
      text: "Choose farm neighborhood (Panorama Village)",
      done: false,
    },
    { id: "m5", text: "Call title rep for free mailing list", done: false },
    { id: "m6", text: "Order first batch of farm mailers", done: false },
    {
      id: "m7",
      text: "Start daily power hour — 5 calls every morning",
      done: false,
    },
  ],
  quarter: [
    {
      id: "q1",
      text: "Complete first full month of 33 Touch system",
      done: false,
    },
    {
      id: "q2",
      text: "Send first 2 farm mailers to Panorama Village",
      done: false,
    },
    {
      id: "q3",
      text: "Host 2 open houses — add every visitor to CRM",
      done: false,
    },
    {
      id: "q4",
      text: "Track leads weekly: source, status, follow-up",
      done: false,
    },
    {
      id: "q5",
      text: "Review budget monthly — expenses on track?",
      done: false,
    },
    {
      id: "q6",
      text: "Move 25% of every commission to tax account immediately",
      done: false,
    },
  ],
  year: [
    { id: "y1", text: "Go full-time in real estate", done: false },
    { id: "y2", text: "Close 12 transactions", done: false },
    { id: "y3", text: "Hit $75K gross GCI", done: false },
    { id: "y4", text: "Build database to 100+ contacts", done: false },
    { id: "y5", text: "Farm 200 homes with 12 Direct system", done: false },
    { id: "y6", text: "Generate 50+ leads from all sources", done: false },
  ],
};

// ── SCALE MODEL DATA ──
// Edit this array to change the year-by-year projection table
export const SCALE_MODEL = [
  {
    year: "Year 1",
    label: "now",
    closings: 12,
    price: 300000,
    gross: 84000,
    net: 67000,
    exp: 22000,
    take: 34000,
    team: "Solo",
    unlock: "Go full-time. Build database & farm.",
  },
  {
    year: "Year 2",
    label: "",
    closings: 20,
    price: 310000,
    gross: 124000,
    net: 99000,
    exp: 33000,
    take: 50000,
    team: "Solo",
    unlock: "Referrals compound. Farm producing.",
  },
  {
    year: "Year 3",
    label: "",
    closings: 28,
    price: 320000,
    gross: 197000,
    net: 157000,
    exp: 62000,
    take: 72000,
    team: "+ Part-time TC",
    unlock: "Hire TC. Double database to 200.",
  },
  {
    year: "Year 4",
    label: "",
    closings: 38,
    price: 330000,
    gross: 252000,
    net: 201000,
    exp: 85000,
    take: 87000,
    team: "TC + Buyer Spec.",
    unlock: "Add buyer specialist. 3 farms.",
  },
  {
    year: "Year 5",
    label: "",
    closings: 50,
    price: 340000,
    gross: 340000,
    net: 272000,
    exp: 110000,
    take: 122000,
    team: "Full team",
    unlock: "Net a Million stage begins.",
  },
];
