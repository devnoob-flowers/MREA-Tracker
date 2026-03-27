const SUPABASE_URL = "https://acuwwbhjrgvwjbcdiytw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXd3Ymhqcmd2d2piY2RpeXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTkzMTEsImV4cCI6MjA5MDE5NTMxMX0.ZjCrnXClGM-OdanaZWHZpvBaBuASQZHw6cFIYjW3Fr0";
const USER_ID = "my-mrea-tracker";
const TABLE_URL = SUPABASE_URL + "/rest/v1/mrea_data";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Prefer": "return=representation"
  };
}

export async function loadFromCloud() {
  try {
    const res = await fetch(TABLE_URL + "?user_id=eq." + USER_ID + "&select=*", { headers: getHeaders() });
    const rows = await res.json();
    if (rows && rows.length > 0) {
      const row = rows[0];
      return { closings: row.closings||[], daily: row.daily||[], goals: row.goals||{}, funnel: row.funnel||{}, settings: row.settings||{}, checklist: row.checklist||{} };
    }
    return null;
  } catch (e) { console.error("Load failed:", e); return null; }
}

export async function saveToCloud(state) {
  try {
    const headers = getHeaders();
    headers["Prefer"] = "resolution=merge-duplicates,return=representation";
    const res = await fetch(TABLE_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ user_id: USER_ID, closings: state.closings||[], daily: state.daily||[], goals: state.goals||{}, funnel: state.funnel||{}, settings: state.settings||{}, checklist: state.checklist||{}, updated_at: new Date().toISOString() })
    });
    const text = await res.text();
    console.log("Supabase save response:", res.status, text);
  } catch (e) { console.error("Save failed:", e); }
}

export function isConfigured() {
  return SUPABASE_URL !== "PASTE_YOUR_PROJECT_URL_HERE";
}
