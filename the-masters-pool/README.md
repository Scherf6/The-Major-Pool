# ⛳ Masters Golf Pool 2026

A golf tournament pool app with tier-based golfer selection, AI-powered team name generator, live ESPN scoring, and Google Sheets backend.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   React Frontend    │────▶│  Google Apps Script   │
│  (GitHub Pages or   │     │    (Webhook POST)     │
│   Vercel/Netlify)   │     └──────────┬───────────┘
│                     │                │
│  • Tier picker      │                ▼
│  • AI name gen      │     ┌──────────────────────┐
│  • Leaderboard      │     │    Google Sheet       │
│  • Countdown timer  │     │  (Entries database)   │
│                     │◀────│                       │
└────────┬────────────┘     └──────────────────────┘
         │
         │ fetch scores
         ▼
┌─────────────────────┐
│   ESPN Leaderboard   │
│   (Public JSON API)  │
│   site.api.espn.com  │
└─────────────────────┘
```

## Quick Start

### 1. Google Sheet Setup

1. Create a new Google Sheet
2. Rename the first tab to **"Entries"**
3. Add headers in Row 1:
   ```
   Timestamp | Email | TeamName | Pick1 | Pick2 | Pick3 | Pick4 | Pick5 | Pick6 | WinningScore | Locked
   ```
4. Create a second tab called **"Config"**:
   ```
   Row 1: LockTime    | 2026-04-09T07:59:00-04:00   (1 min before first tee)
   Row 2: Tournament  | Masters 2026
   ```

### 2. Google Apps Script

1. In your Sheet, go to **Extensions → Apps Script**
2. Paste the contents of `scripts/google-apps-script.js`
3. Click **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the deployment URL

### 3. Configure the App

In the React app, update these values:
```js
const T = {
  googleScriptUrl: "YOUR_APPS_SCRIPT_URL_HERE",
  espnId: "401811940",  // Valero for testing
};
```

### 4. Switch Modes

```js
// In the React app, change this line:
const MODE = "valero";   // For testing with Valero Texas Open
const MODE = "masters";  // For production Masters pool
```

## ESPN Integration

The app fetches live scores from ESPN's public API:
```
https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?event={TOURNAMENT_ID}
```

### Tournament IDs
- **2026 Valero Texas Open**: `401811940`
- **2026 Masters**: TBD (will be available ~1 week before tournament)

### Finding the Masters Tournament ID
1. Go to https://www.espn.com/golf/leaderboard
2. Click on "Masters Tournament" in the tournament selector
3. The URL will contain the tournament ID: `/tournamentId/XXXXXXX`

## Scoring Rules

- **Pick 6 golfers**, one from each tier
- **Best 4 of 6** scores count toward your team total
- **Cut golfers** receive a score of 80 for rounds 3 & 4
- **Lowest total score wins**
- **Tiebreaker**: closest winning score prediction

## Entry Rules

- Entries lock **1 minute before the first tee time**
- Users can **edit picks** unlimited times before lock
- Users log in with their email to view/edit their entry
- After lock, no changes are allowed

## Legend Picks (Masters only)

Tiger Woods and Phil Mickelson are listed as withdrawn but remain available as
"legend picks" — a fun option for those who want to ride with the GOATs even
when they're not competing. Picking them means you're getting 80 per round for
those slots, so they'd better hope their other 5 picks carry the weight.

## Testing with Valero Texas Open

The Valero Texas Open (April 2-5, 2026) runs the week before the Masters.
Use it to verify:
- [ ] ESPN score fetching works
- [ ] Google Sheets entries are saving correctly
- [ ] Leaderboard calculates best-4-of-6 properly
- [ ] Entry lockout triggers at the right time
- [ ] Pick editing works before lock
- [ ] Cut golfer scoring (80 per round) works after R2

## File Structure

```
the-masters-pool/
├── .github/workflows/
│   └── deploy.yml             # Auto-deploy to GitHub Pages on push
├── src/
│   ├── main.jsx               # React entry point
│   └── App.jsx                # Main app (tiers, picks, leaderboard)
├── scripts/
│   └── google-apps-script.js  # Google Apps Script for Sheets backend
├── public/                    # Static assets
├── index.html                 # HTML entry
├── vite.config.js             # Vite config (base path for GH Pages)
├── package.json
└── README.md
```

## Deployment

### Option A: GitHub Pages (free)
1. Build the React app
2. Push to a `gh-pages` branch
3. Enable GitHub Pages in repo settings

### Option B: Vercel (recommended)
1. Connect your GitHub repo to Vercel
2. Deploy — it auto-builds on push

## TODO for Masters Week

- [ ] Get the 2026 Masters ESPN tournament ID
- [ ] Update the golfer tiers with final field (check for WDs)
- [ ] Set the correct lock time (1 min before first tee)
- [ ] Deploy production site
- [ ] Send invite link to pool members
- [ ] Set up a cron/timer to auto-lock entries via Apps Script
- [ ] Test leaderboard scoring with live data from Valero

---

*Made with 🧀 pimento cheese energy. Not affiliated with Augusta National.*
