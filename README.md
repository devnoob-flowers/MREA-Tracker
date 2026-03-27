# MREA Tracker
### Millionaire Real Estate Agent Economic Model — Personal Business Tracker

Built on Gary Keller's MREA framework. Tracks your daily activity, lead funnel, closings, P&L, and progress toward your GCI goals.

---

## Setup in VS Code

### 1. Install prerequisites (if you haven't already)
- Download and install **Node.js**: https://nodejs.org (choose the LTS version)
- Download and install **VS Code**: https://code.visualstudio.com

### 2. Open the project
1. Open VS Code
2. Click **File → Open Folder**
3. Select the `mrea-tracker` folder

### 3. Open the terminal in VS Code
- Press `` Ctrl + ` `` (backtick) or go to **Terminal → New Terminal**

### 4. Install dependencies
```bash
npm install
```
This downloads all required packages. Takes about 1-2 minutes. Only needed once.

### 5. Start the app
```bash
npm start
```
This opens the app automatically at **http://localhost:3000** in your browser.

---

## How to modify the app

Everything is organized so you can find and change things without touching code you don't need to.

### Change your targets and settings
- Open the app → click **⚙ Settings** tab
- All your GCI targets, commission rates, splits, and expenses are editable there
- No code changes needed

### Change what shows on each page
Each page is its own file in `src/pages/`:
| File | What it controls |
|------|-----------------|
| `Overview.jsx` | Dashboard — stats, progress bars, 3 stages |
| `DailyLog.jsx` | Daily activity tracking form and history |
| `Closings.jsx` | Closing log form and table |
| `OtherPages.jsx` | P&L, Funnel, Action Plan, Scale Model, Calculator |
| `Settings.jsx` | All settings inputs |

### Change what you track in the daily log
Open `src/pages/DailyLog.jsx` and find the section labeled `Activity inputs`.
You'll see the fields: calls, leads, appts, contacts, oh, mailers.
Add, remove, or rename any field there.

### Change daily/weekly targets
Open `src/pages/DailyLog.jsx` and find the `TARGETS` object at the top:
```js
const TARGETS = {
  dailyCalls:  5,
  weeklyCalls: 25,
  annualCalls: 1300,
  annualOH:    24,
  annualLeads: 50,
  annualAppts: 25,
};
```
Edit any number here to change the targets across the whole page.

### Change the year-by-year scale model
Open `src/utils/store.js` and find the `SCALE_MODEL` array near the bottom.
Edit the numbers for any year — closings, price, take-home, team, etc.

### Change default goal/action plan items
Open `src/utils/store.js` and find the `GOAL_DEFAULTS` object.
Edit the text for any item, or add new ones.

### Change colors and styling
Open `src/styles/global.css` — edit the `:root` variables at the top to restyle the entire app:
```css
:root {
  --gold:  #c9a84c;  /* Change this to change the gold accent color */
  --navy:  #0a1628;  /* Change this to change the background color */
  /* etc. */
}
```

### Add a completely new page
1. Create a new file in `src/pages/` (e.g. `MyNewPage.jsx`)
2. Open `src/App.js`
3. Import your new page at the top
4. Add a nav entry to the `NAV` array
5. Add a `case` in the `renderPage()` switch statement

---

## File structure
```
mrea-tracker/
├── public/
│   └── index.html          — HTML shell (rarely needs editing)
├── src/
│   ├── pages/
│   │   ├── Overview.jsx     — Dashboard page
│   │   ├── DailyLog.jsx     — Daily activity log
│   │   ├── Closings.jsx     — Closing log
│   │   ├── Settings.jsx     — Settings page
│   │   └── OtherPages.jsx   — P&L, Funnel, Action Plan, Scale, Calculator
│   ├── components/
│   │   └── UI.jsx           — Reusable components (cards, stats, tables, etc.)
│   ├── utils/
│   │   └── store.js         — Data, defaults, calculations, helper functions
│   ├── styles/
│   │   ├── global.css       — Colors, layout, base styles
│   │   └── components.css   — Buttons, inputs, cards, nav
│   ├── App.js               — Root component and navigation
│   └── index.js             — Entry point
└── package.json             — Dependencies
```

---

## Data
All data saves automatically to your browser's localStorage. Nothing is sent anywhere.

To back up your data: go to **Settings → Export backup**.
To restore: go to **Settings → Import backup**.

---

## Building for production (optional)
To create a static file you can host anywhere:
```bash
npm run build
```
This creates a `build/` folder with a standalone version you can deploy to Netlify, GitHub Pages, or any web host.
