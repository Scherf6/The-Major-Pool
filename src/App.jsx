import { useState, useEffect, useCallback } from "react";

/*─────────────────────────────────────────────
  CONFIG
─────────────────────────────────────────────*/
const MODE = "masters"; // "masters" or "valero"
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGzrcdc-V90CmcOHVejftmFmTAb9TEUL3iSzePe6bZjkQJZQjaYP_B2HZlUqRzk7as_g/exec";

const TOURNAMENTS = {
  masters: {
    name: "The Masters", year: 2026,
    tagline: "A Tradition Unlike Any Other",
    espnId: "401703504",
    lockTime: "2026-04-09T07:59:00-04:00",
    par: 72,
  },
  valero: {
    name: "Valero Texas Open", year: 2026,
    tagline: "Test Pool — Validating Scoring Before Masters Week",
    espnId: "401811940",
    lockTime: "2026-04-03T07:29:00-05:00",
    par: 72,
  },
};
const T = TOURNAMENTS[MODE];

const C = {
  green: "#006747", dark: "#004d35", yellow: "#f2c94c",
  cream: "#fdf8f0", sand: "#e8dcc8", pink: "#e84393",
  magenta: "#c2185b", dogwood: "#fff5ee",
};

/*─────────────────────────────────────────────
  TIERS — 4 tiers (pick 1 each) + Field (pick 2)
  92 players, ~10 per tier, ~52 in field
─────────────────────────────────────────────*/
const MASTERS_TIERS = {
  "Tier 1 — Favorites": {
    pick: 1, color: "#E8F5E9",
    golfers: [
      { name: "Scottie Scheffler", odds: "+500", note: "2x Masters winner, World #1" },
      { name: "Jon Rahm", odds: "+1000", note: "2023 Masters winner" },
      { name: "Bryson DeChambeau", odds: "+1000", note: "2020 US Open winner, LIV" },
      { name: "Rory McIlroy", odds: "+1100", note: "Defending Champion 🏆" },
      { name: "Xander Schauffele", odds: "+1500", note: "2024 PGA & Open winner" },
      { name: "Ludvig Åberg", odds: "+1600" },
      { name: "Tommy Fleetwood", odds: "+1800", note: "2025 FedEx Cup winner" },
      { name: "Matt Fitzpatrick", odds: "+2000", note: "2022 US Open winner" },
      { name: "Cameron Young", odds: "+2000", note: "OWGR #3" },
      { name: "Collin Morikawa", odds: "+2200", note: "4 straight top-14 at Masters" },
    ]
  },
  "Tier 2 — Contenders": {
    pick: 1, color: "#C8E6C9",
    golfers: [
      { name: "Patrick Reed", odds: "+2700", note: "2018 Masters winner" },
      { name: "Viktor Hovland", odds: "+3500", note: "T4+ in 3 of 4 majors" },
      { name: "Chris Gotterup", odds: "+3500", note: "3 PGA wins, Masters debut" },
      { name: "Brooks Koepka", odds: "+3800", note: "5-time major winner" },
      { name: "Justin Thomas", odds: "+4000", note: "Back from surgery" },
      { name: "Robert MacIntyre", odds: "+4000" },
      { name: "Tyrrell Hatton", odds: "+4000", note: "LIV" },
      { name: "Shane Lowry", odds: "+4000", note: "2019 Open winner" },
      { name: "Russell Henley", odds: "+4500" },
      { name: "Hideki Matsuyama", odds: "+4500", note: "2021 Masters winner" },
    ]
  },
  "Tier 3 — Dark Horses": {
    pick: 1, color: "#A5D6A7",
    golfers: [
      { name: "Patrick Cantlay", odds: "+4500" },
      { name: "Sungjae Im", odds: "+5000", note: "2024 Masters runner-up" },
      { name: "Akshay Bhatia", odds: "+5000" },
      { name: "Sam Burns", odds: "+5000", note: "4x PGA Tour winner" },
      { name: "Tony Finau", odds: "+5000" },
      { name: "Justin Rose", odds: "+5500", note: "5x Masters R1 leader" },
      { name: "Wyndham Clark", odds: "+5500", note: "2023 US Open winner" },
      { name: "Jordan Spieth", odds: "+6000", note: "2015 Masters winner ⭐" },
      { name: "Sahith Theegala", odds: "+6000" },
      { name: "Jason Day", odds: "+6500", note: "Former World #1" },
    ]
  },
  "Tier 4 — Long Shots": {
    pick: 1, color: "#81C784",
    golfers: [
      { name: "Cameron Smith", odds: "+6600", note: "4 top-10s at Masters, LIV" },
      { name: "Keegan Bradley", odds: "+7000", note: "Ryder Cup captain" },
      { name: "Min Woo Lee", odds: "+7000" },
      { name: "Sepp Straka", odds: "+7500" },
      { name: "Aaron Rai", odds: "+7500" },
      { name: "Corey Conners", odds: "+8000", note: "Elite ball-striker" },
      { name: "Adam Scott", odds: "+8000", note: "2013 Masters winner" },
      { name: "Will Zalatoris", odds: "+8000" },
      { name: "Davis Riley", odds: "+8500" },
      { name: "Si Woo Kim", odds: "+9000" },
    ]
  },
  "The Field — Pick 2": {
    pick: 2, color: "#FFF3E0",
    golfers: [
      { name: "Harris English", odds: "+9000", note: "2x major runner-up 2025" },
      { name: "Dustin Johnson", odds: "+9000", note: "2020 Masters winner, LIV" },
      { name: "Max Homa", odds: "+9000" },
      { name: "Sergio García", odds: "+10000", note: "2017 Masters winner" },
      { name: "Nick Taylor", odds: "+10000" },
      { name: "Alex Noren", odds: "+10000" },
      { name: "Maverick McNealy", odds: "+10000" },
      { name: "Harry Hall", odds: "+12000" },
      { name: "Max Greyserman", odds: "+12000" },
      { name: "Ben Griffin", odds: "+12000" },
      { name: "Nico Echavarría", odds: "+12000" },
      { name: "Kurt Kitayama", odds: "+12000" },
      { name: "Jake Knapp", odds: "+12000" },
      { name: "Nicolai Højgaard", odds: "+12000" },
      { name: "Daniel Berger", odds: "+12000" },
      { name: "Matt McCarty", odds: "+12000" },
      { name: "J.J. Spaun", odds: "+15000" },
      { name: "Ryan Fox", odds: "+15000" },
      { name: "Brian Harman", odds: "+15000", note: "2023 Open winner" },
      { name: "Carlos Ortiz", odds: "+15000" },
      { name: "Sam Stevens", odds: "+15000" },
      { name: "Andrew Novak", odds: "+15000" },
      { name: "Tom McKibbin", odds: "+15000" },
      { name: "Johnny Keefer", odds: "+15000" },
      { name: "Ryan Gerard", odds: "+15000" },
      { name: "Jacob Bridgeman", odds: "+15000" },
      { name: "Michael Brennan", odds: "+15000" },
      { name: "Gary Woodland", odds: "+15000", note: "Houston Open winner, comeback story" },
      { name: "Rasmus Højgaard", odds: "+15000" },
      { name: "Aldrich Potgieter", odds: "+15000" },
      { name: "Marco Penge", odds: "+20000" },
      { name: "Haotong Li", odds: "+20000" },
      { name: "Tiger Woods", odds: "+15000", wd: true, note: "🐅 5x champ — WD, legend pick" },
      { name: "Phil Mickelson", odds: "+20000", wd: true, note: "🫡 3x champ — WD, legend pick" },
      { name: "Bubba Watson", odds: "+25000", note: "2x Masters winner" },
      { name: "Casey Jarvis", odds: "+25000" },
      { name: "Naoyuki Kataoka", odds: "+25000" },
      { name: "Rasmus Neergaard-Petersen", odds: "+25000" },
      { name: "Sami Välimäki", odds: "+25000" },
      { name: "Kristoffer Reitan", odds: "+25000" },
      { name: "Charl Schwartzel", odds: "+35000", note: "2011 Masters winner" },
      { name: "Danny Willett", odds: "+35000", note: "2016 Masters winner" },
      { name: "Fred Couples", odds: "+50000", note: "1992 champ, Freddie forever 😎" },
      { name: "Vijay Singh", odds: "+50000", note: "2000 Masters winner" },
      { name: "José María Olazábal", odds: "+50000", note: "2x Masters winner" },
      { name: "Mike Weir", odds: "+50000", note: "2003 Masters winner" },
      { name: "Zach Johnson", odds: "+50000", note: "2007 Masters winner" },
      { name: "Ángel Cabrera", odds: "+50000", note: "2009 Masters winner" },
    ]
  },
};

// Simpler tiers for Valero test
const VALERO_TIERS = {
  "Tier 1": { pick: 1, color: "#E8F5E9", golfers: [
    { name: "Hideki Matsuyama", odds: "+1400" }, { name: "Tony Finau", odds: "+1800" },
    { name: "Tommy Fleetwood", odds: "+2000" }, { name: "Max Homa", odds: "+2200" },
    { name: "Jordan Spieth", odds: "+2500" },
  ]},
  "Tier 2": { pick: 1, color: "#C8E6C9", golfers: [
    { name: "Sahith Theegala", odds: "+2800" }, { name: "Keegan Bradley", odds: "+3000" },
    { name: "Corey Conners", odds: "+3000" }, { name: "Davis Thompson", odds: "+3300" },
    { name: "Rickie Fowler", odds: "+3500" }, { name: "Russell Henley", odds: "+3500" },
  ]},
  "Tier 3": { pick: 1, color: "#A5D6A7", golfers: [
    { name: "Brian Harman", odds: "+4000" }, { name: "Jason Day", odds: "+4000" },
    { name: "Sepp Straka", odds: "+4500" }, { name: "Will Zalatoris", odds: "+4500" },
    { name: "Si Woo Kim", odds: "+5000" }, { name: "Maverick McNealy", odds: "+5000" },
  ]},
  "Tier 4": { pick: 1, color: "#81C784", golfers: [
    { name: "Kevin Streelman", odds: "+6000" }, { name: "Sam Ryder", odds: "+6000" },
    { name: "Bud Cauley", odds: "+6600" }, { name: "Mac Meissner", odds: "+6600" },
    { name: "Adam Svensson", odds: "+8000" }, { name: "Thorbjørn Olesen", odds: "+8000" },
  ]},
  "The Field — Pick 2": { pick: 2, color: "#FFF3E0", golfers: [
    { name: "Austin Smotherman", odds: "+10000" }, { name: "Andrew Novak", odds: "+10000" },
    { name: "Peter Malnati", odds: "+12500" }, { name: "Rafael Campos", odds: "+15000" },
    { name: "Adam Schenk", odds: "+15000" }, { name: "Ryo Hisatsune", odds: "+15000" },
    { name: "Joe Highsmith", odds: "+20000" }, { name: "David Ford", odds: "+20000" },
    { name: "Zach Bauchou", odds: "+25000" }, { name: "Marco Penge", odds: "+25000" },
    { name: "Sudarshan Yellamaraju", odds: "+30000" }, { name: "Christo Lamprecht", odds: "+30000" },
  ]},
};

const TIERS = MODE === "masters" ? MASTERS_TIERS : VALERO_TIERS;

const DEMO_ENTRIES = [];

/*─────────────────────────────────────────────
  HOOKS
─────────────────────────────────────────────*/
function useCountdown(lockTimeISO) {
  const [remaining, setRemaining] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(lockTimeISO).getTime() - Date.now();
      if (diff <= 0) { setIsLocked(true); setRemaining("LOCKED"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockTimeISO]);
  return { remaining, isLocked };
}

/*─────────────────────────────────────────────
  COMPONENTS
─────────────────────────────────────────────*/
function Nav({ view, setView, isLocked, remaining }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: `linear-gradient(180deg, ${C.green}, ${C.dark})`,
      padding: "10px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      borderBottom: `3px solid ${C.yellow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>⛳</span>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700, color: C.yellow }}>
          {MODE === "valero" ? "🧪 Test Pool" : "Masters Pool '26"}
        </span>
      </div>
      <div style={{
        background: isLocked ? "#c62828" : "rgba(255,255,255,0.15)",
        padding: "4px 12px", borderRadius: 20, fontSize: 12,
        fontFamily: "Georgia,serif", color: isLocked ? "#fff" : C.yellow, fontWeight: 600,
      }}>
        {isLocked ? "🔒 LOCKED" : `⏱ ${remaining}`}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {["home","picks","leaderboard"].map(id => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "6px 12px", border: "none", borderRadius: 6,
            background: view === id ? C.yellow : "transparent",
            color: view === id ? C.dark : "#fff",
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 13, fontWeight: view === id ? 700 : 400,
            cursor: "pointer", textTransform: "capitalize",
          }}>{id === "picks" ? "My Picks" : id}</button>
        ))}
      </div>
    </nav>
  );
}

function Hero({ onStart, setView }) {
  return (
    <div style={{
      background: `linear-gradient(170deg, ${C.green} 0%, ${C.dark} 40%, #002a1c 100%)`,
      minHeight: 460, position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "50px 20px", textAlign: "center",
    }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", width: 6 + Math.random() * 12, height: 6 + Math.random() * 12,
          borderRadius: "50%", background: [C.pink, C.magenta, C.yellow, "#e91e63"][i % 4],
          opacity: 0.08 + Math.random() * 0.08,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        }} />
      ))}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
        {MODE === "valero" && (
          <div style={{
            background: "#ff9800", color: "#fff", display: "inline-block",
            padding: "5px 16px", borderRadius: 20, fontSize: 12,
            fontFamily: "Georgia,serif", fontWeight: 700, marginBottom: 14,
          }}>🧪 TEST MODE — VALERO TEXAS OPEN</div>
        )}
        <div style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase",
          color: C.yellow, marginBottom: 12, opacity: 0.9,
        }}>{T.tagline}</div>
        <h1 style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: 48, fontWeight: 700, color: "#fff",
          lineHeight: 1.1, margin: "0 0 16px",
        }}>{T.year} {MODE === "masters" ? "Masters" : "Valero"}<br />Golf Pool</h1>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: 19, color: "#c4d9c4", lineHeight: 1.5, margin: "0 0 20px",
        }}>Pick 6 golfers — 1 from each of 4 tiers + 2 from the field.
        Best 4 scores count. Lowest total wins.</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 24 }}>
          {[
            "4 tiers of ~10 golfers — pick 1 from each",
            "The Field (~52 players) — pick 2 more",
            "Tiger & Phil available as legend picks 🐅🫡",
            "Edit picks anytime before the first tee",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "#a8d5a8" }}>
              <span style={{ color: C.yellow }}>✓</span>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 14 }}>{t}</span>
            </div>
          ))}
        </div>
        <button onClick={onStart} style={{
          padding: "15px 40px", border: "none", borderRadius: 8,
          background: `linear-gradient(135deg, ${C.yellow}, #e6b800)`,
          color: C.dark, fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: 20, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(242,201,76,0.4)",
        }}>Enter the Pool ⛳</button>
        <div style={{ display: "flex", gap: 16, marginTop: 18, justifyContent: "center" }}>
          <button onClick={() => setView("leaderboard")} style={{
            background: "none", border: "none", color: C.yellow,
            fontFamily: "Georgia,serif", fontSize: 15, cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}>📊 Leaderboard</button>
          <button onClick={() => setView("picks")} style={{
            background: "none", border: "none", color: C.yellow,
            fontFamily: "Georgia,serif", fontSize: 15, cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}>🏌️ My Picks</button>
        </div>
      </div>
    </div>
  );
}

function PicksFlow({ onComplete, isLocked, existingEntry, allEntries }) {
  const [step, setStep] = useState(existingEntry ? 2 : 1);
  const [email, setEmail] = useState(existingEntry?.email || "");
  const [firstName, setFirstName] = useState(existingEntry?.firstName || "");
  const [lastName, setLastName] = useState(existingEntry?.lastName || "");
  const [teamName, setTeamName] = useState(existingEntry?.teamName || "");
  const [winScore, setWinScore] = useState(existingEntry?.winScore ?? -12);
  const [picks, setPicks] = useState({});
  const [genNames, setGenNames] = useState([]);
  const [nameIdeas, setNameIdeas] = useState("");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [nameError, setNameError] = useState("");

  const tierKeys = Object.keys(TIERS);
  const totalNeeded = tierKeys.reduce((s, k) => s + TIERS[k].pick, 0);
  const totalPicked = tierKeys.reduce((s, k) => {
    const p = picks[k];
    if (!p) return s;
    return s + (Array.isArray(p) ? p.length : 1);
  }, 0);
  const allPicked = tierKeys.every(k => {
    const need = TIERS[k].pick;
    const p = picks[k];
    if (need === 1) return !!p;
    return Array.isArray(p) && p.length === need;
  });

  const togglePick = (tier, golfer) => {
    const need = TIERS[tier].pick;
    setPicks(prev => {
      if (need === 1) {
        if (prev[tier]?.name === golfer.name) { const n = {...prev}; delete n[tier]; return n; }
        return { ...prev, [tier]: golfer };
      }
      // Multi-pick (field)
      const current = prev[tier] || [];
      const idx = current.findIndex(g => g.name === golfer.name);
      if (idx >= 0) {
        const next = current.filter((_, i) => i !== idx);
        return { ...prev, [tier]: next.length ? next : undefined };
      }
      if (current.length >= need) return prev;
      return { ...prev, [tier]: [...current, golfer] };
    });
  };

  const isSelected = (tier, golfer) => {
    const p = picks[tier];
    if (!p) return false;
    if (Array.isArray(p)) return p.some(g => g.name === golfer.name);
    return p.name === golfer.name;
  };

  const getPickNames = () => {
    return tierKeys.flatMap(k => {
      const p = picks[k];
      if (!p) return [];
      if (Array.isArray(p)) return p.map(g => g.name);
      return [p.name];
    });
  };

  const generateNames = async () => {
    setGenerating(true);
    try {
      const theme = MODE === "masters"
        ? "Masters golf, Augusta National, azaleas, pimento cheese, green jackets, Amen Corner"
        : "Valero Texas Open, TPC San Antonio, Texas BBQ, the Alamo, cowboys";
      const ideasPart = nameIdeas.trim()
        ? ` The user wants names inspired by these ideas: "${nameIdeas.trim()}".`
        : "";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Generate 6 funny golf team names themed around: ${theme}.${ideasPart} Short (2-4 words), witty. Return ONLY a JSON array of strings.` }],
        }),
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      setGenNames(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setGenNames(MODE === "masters"
        ? ["Amen Corner Aces","Pimento Pushers","Azalea Assassins","Green Jacket Envy","Rae's Creek Monsters","Magnolia Legends"]
        : ["Alamo Aces","BBQ Birdies","Texas Tee Party","Longhorn Loopers","River Walk Rollers","San Antonio Swingers"]);
    }
    setGenerating(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitMsg("");
    const pickNames = getPickNames();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      await fetch(SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "submit", email, teamName, firstName: firstName.trim(),
          lastName: lastName.trim(), fullName,
          picks: pickNames, winningScore: winScore,
        }),
      });
      setSubmitMsg("✅ Saved to Google Sheet!");
    } catch (e) {
      setSubmitMsg("⚠️ Sheet POST may have failed — entry saved locally");
    }
    try {
      const raw = localStorage.getItem("pool-entries");
      const entries = raw ? JSON.parse(raw) : [];
      const idx = entries.findIndex(e => e.email === email);
      const newE = { email, teamName, firstName: firstName.trim(), lastName: lastName.trim(), fullName, picks: pickNames, winScore, ts: Date.now() };
      if (idx >= 0) entries[idx] = newE; else entries.push(newE);
      localStorage.setItem("pool-entries", JSON.stringify(entries));
    } catch {}
    setSubmitting(false);
    onComplete({ email, teamName, firstName: firstName.trim(), lastName: lastName.trim(), fullName, winScore, picks: pickNames });
  };

  if (isLocked) {
    return (
      <div style={{ padding: 48, textAlign: "center", background: C.cream, minHeight: "50vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 56 }}>🔒</div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: C.green, margin: "12px 0 8px" }}>
          Entries Are Locked</h2>
        <p style={{ fontFamily: "Georgia,serif", fontSize: 16, color: "#8b7355", maxWidth: 380 }}>
          The first tee has been hit. Head to the leaderboard!</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "32px 16px",
      display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: C.green, margin: "0 0 4px" }}>
            {existingEntry ? "Edit Your Entry" : "Create Your Entry"}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                width: s === step ? 26 : 8, height: 8, borderRadius: 4,
                background: s <= step ? C.green : C.sand, transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>

        {/* Step 1: Email & Name */}
        {step === 1 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.sand}` }}>
            <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>Your Name</label>
            <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="First" style={{ flex: 1, padding: "12px", borderRadius: 8,
                  border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                  outline: "none", boxSizing: "border-box" }} />
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Last" style={{ flex: 1, padding: "12px", borderRadius: 8,
                  border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                  outline: "none", boxSizing: "border-box" }} />
            </div>
            <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355", display: "block", marginTop: 14 }}>Email</label>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#999", margin: "3px 0 7px" }}>
              Used to log back in and edit picks</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: "100%", padding: "12px", borderRadius: 8,
                border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => email.includes("@") && firstName.trim() && lastName.trim() && setStep(2)}
              disabled={!email.includes("@") || !firstName.trim() || !lastName.trim()}
              style={{ width: "100%", padding: 12, border: "none", borderRadius: 8,
                background: (email.includes("@") && firstName.trim() && lastName.trim()) ? C.green : "#ccc",
                color: "#fff", fontFamily: "'Playfair Display',Georgia,serif",
                fontSize: 16, fontWeight: 600, cursor: (email.includes("@") && firstName.trim() && lastName.trim()) ? "pointer" : "default",
                marginTop: 16 }}>Continue</button>
          </div>
        )}

        {/* Step 2: Team name + score */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.sand}` }}>
            <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>Team Name</label>
            <input type="text" value={teamName} onChange={e => { setTeamName(e.target.value); setNameError(""); }}
              placeholder="Name your squad" maxLength={40}
              style={{ width: "100%", padding: "12px", borderRadius: 8, marginTop: 5,
                border: `2px solid ${nameError ? "#c62828" : C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                outline: "none", boxSizing: "border-box" }} />
            {nameError && (
              <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#c62828", margin: "5px 0 0" }}>{nameError}</p>
            )}

            {/* AI Name Generator with ideas field */}
            <div style={{ marginTop: 12, padding: "12px", borderRadius: 8,
              border: `1px solid ${C.sand}`, background: "#fafaf7" }}>
              <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>
                🤖 AI Name Generator</label>
              <input type="text" value={nameIdeas} onChange={e => setNameIdeas(e.target.value)}
                placeholder="Any ideas? e.g. 'my dog Ralph', 'beer puns', 'dad jokes'..."
                style={{ width: "100%", padding: "10px", borderRadius: 8, marginTop: 6,
                  border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "Georgia,serif",
                  outline: "none", boxSizing: "border-box" }} />
              <button onClick={generateNames} disabled={generating}
                style={{ width: "100%", padding: 10, border: "none", borderRadius: 8,
                  background: C.green, color: "#fff", fontFamily: "Georgia,serif",
                  fontSize: 13, cursor: "pointer", marginTop: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {generating ? "⏳ Generating..." : "✨ Generate Names"}
              </button>
            </div>
            {genNames.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: "#8b7355", margin: "0 0 6px" }}>Tap to use:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {genNames.map((n, i) => (
                    <button key={i} onClick={() => { setTeamName(n); setNameError(""); }} style={{
                      padding: "5px 11px", borderRadius: 16,
                      border: teamName === n ? `2px solid ${C.green}` : `1px solid ${C.sand}`,
                      background: teamName === n ? `${C.green}10` : "#fff",
                      color: C.dark, fontFamily: "Georgia,serif", fontSize: 12, cursor: "pointer",
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 11,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>
                Winning Score Prediction (Tiebreaker)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                <input type="range" min={-25} max={0} value={winScore}
                  onChange={e => setWinScore(Number(e.target.value))}
                  style={{ flex: 1, accentColor: C.green }} />
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24,
                  fontWeight: 700, color: C.green, minWidth: 45, textAlign: "center" }}>{winScore}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{
                padding: "12px 18px", border: `1px solid ${C.sand}`, borderRadius: 8,
                background: "#fff", color: "#8b7355", fontFamily: "Georgia,serif", fontSize: 14, cursor: "pointer"
              }}>Back</button>
              <button onClick={() => {
                if (!teamName) return;
                const taken = allEntries.some(e => e.name.toLowerCase() === teamName.toLowerCase() && e.email !== email);
                if (taken) { setNameError("That team name is already taken — pick another!"); return; }
                setStep(3);
              }} disabled={!teamName}
                style={{ flex: 1, padding: 12, border: "none", borderRadius: 8,
                  background: teamName ? C.green : "#ccc", color: "#fff",
                  fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 600,
                  cursor: teamName ? "pointer" : "default" }}>Pick Golfers →</button>
            </div>
          </div>
        )}

        {/* Step 3: Golfer picker */}
        {step === 3 && (
          <div>
            <div style={{ background: `${C.green}10`, borderRadius: 10, padding: "12px 16px",
              marginBottom: 14, border: `1px solid ${C.green}30` }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.dark, margin: 0, lineHeight: 1.5 }}>
                <strong>Pick 6, Use Best 4:</strong> 1 from each tier + 2 from The Field. Cut/WD golfers get 80 per unplayed round.</p>
            </div>

            {/* Progress */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: C.green }}>
                {totalPicked}</span>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355" }}> / {totalNeeded} picked</span>
            </div>

            {tierKeys.map(tier => {
              const td = TIERS[tier];
              const need = td.pick;
              const pickedCount = picks[tier] ? (Array.isArray(picks[tier]) ? picks[tier].length : 1) : 0;
              const tierDone = need === 1 ? !!picks[tier] : pickedCount >= need;

              return (
                <div key={tier} style={{
                  background: "#fff", borderRadius: 10, marginBottom: 10,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  border: tierDone ? `2px solid ${C.green}` : `1px solid ${C.sand}`,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "9px 14px", background: td.color + "40",
                    borderBottom: `1px solid ${C.sand}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 14,
                      fontWeight: 700, color: C.green }}>{tier}</span>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color: tierDone ? C.green : "#999" }}>
                      {tierDone ? "✓" : `${pickedCount}/${need}`}
                    </span>
                  </div>
                  <div style={{ padding: "3px 8px", maxHeight: tier.includes("Field") ? 300 : "none",
                    overflowY: tier.includes("Field") ? "auto" : "visible" }}>
                    {td.golfers.map(g => {
                      const sel = isSelected(tier, g);
                      return (
                        <button key={g.name} onClick={() => togglePick(tier, g)} style={{
                          width: "100%", padding: "8px 10px", border: "none", borderRadius: 6,
                          cursor: "pointer", textAlign: "left",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: sel ? `${C.green}10` : "transparent",
                          marginBottom: 1, gap: 6,
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontFamily: "Georgia,serif", fontSize: 13,
                              color: g.wd ? "#999" : (sel ? C.green : "#333"),
                              fontWeight: sel ? 700 : 400,
                              textDecoration: g.wd ? "line-through" : "none",
                            }}>{g.name}</span>
                            {g.note && <span style={{
                              fontFamily: "Georgia,serif", fontSize: 10,
                              color: g.wd ? "#c62828" : "#8b7355", marginLeft: 6,
                            }}>{g.note}</span>}
                          </div>
                          <span style={{
                            fontFamily: "Georgia,serif", fontSize: 11, color: "#8b7355",
                            background: C.cream, padding: "2px 7px", borderRadius: 8,
                            whiteSpace: "nowrap", flexShrink: 0,
                          }}>{g.odds}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {submitMsg && (
              <div style={{ textAlign: "center", padding: 10, fontFamily: "Georgia,serif",
                fontSize: 13, color: submitMsg.includes("✅") ? C.green : "#e65100" }}>{submitMsg}</div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16, position: "sticky", bottom: 12 }}>
              <button onClick={() => setStep(2)} style={{
                padding: "12px 18px", border: `1px solid ${C.sand}`, borderRadius: 8,
                background: "#fff", color: "#8b7355", fontFamily: "Georgia,serif", fontSize: 14, cursor: "pointer"
              }}>Back</button>
              <button onClick={handleSubmit} disabled={!allPicked || submitting}
                style={{
                  flex: 1, padding: 14, border: "none", borderRadius: 8,
                  background: allPicked ? `linear-gradient(135deg, ${C.yellow}, #e6b800)` : "#ccc",
                  color: allPicked ? C.dark : "#fff",
                  fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700,
                  cursor: allPicked ? "pointer" : "default",
                  boxShadow: allPicked ? "0 4px 16px rgba(242,201,76,0.4)" : "none",
                }}>
                {submitting ? "Submitting..." : allPicked ? "🏌️ Submit Picks" : `${totalNeeded - totalPicked} more needed`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Confirmation({ entry, onLeaderboard, onEdit }) {
  return (
    <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "36px 16px", background: C.cream }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center",
        background: "#fff", borderRadius: 16, padding: "36px 28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: `2px solid ${C.green}` }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏌️</div>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: C.green, margin: "0 0 4px" }}>
          You're In!</h2>
        <div style={{ background: C.cream, borderRadius: 10, padding: 16, textAlign: "left", margin: "16px 0" }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10,
              letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase" }}>Team</span>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, color: C.green, fontWeight: 700 }}>
              {entry.teamName}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10,
              letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase" }}>Winning Score</span>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, color: C.green, fontWeight: 700 }}>
              {entry.winScore}</div>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 10,
              letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase" }}>Golfers</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {entry.picks.map((p, i) => (
                <span key={i} style={{ fontFamily: "Georgia,serif", fontSize: 12,
                  padding: "3px 9px", borderRadius: 12, background: C.green, color: "#fff" }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{
            flex: 1, padding: 12, border: `2px solid ${C.green}`, borderRadius: 8,
            background: "transparent", color: C.green,
            fontFamily: "Georgia,serif", fontSize: 14, cursor: "pointer"
          }}>✏️ Edit</button>
          <button onClick={onLeaderboard} style={{
            flex: 1, padding: 12, border: "none", borderRadius: 8,
            background: `linear-gradient(135deg, ${C.yellow}, #e6b800)`,
            color: C.dark, fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 15, fontWeight: 700, cursor: "pointer"
          }}>Leaderboard →</button>
        </div>

        {/* Venmo Payment */}
        <div style={{
          marginTop: 20, padding: "20px 16px", borderRadius: 12,
          background: `linear-gradient(135deg, #3d95ce, #008CFF)`,
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700,
            color: "#fff", margin: "0 0 6px" }}>💰 Pay Your Entry Fee</p>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#d4e9ff", margin: "0 0 12px", lineHeight: 1.5 }}>
            <strong>$15</strong> for your 1st entry · <strong>$10</strong> for a 2nd entry</p>
          <a href="https://venmo.com/ande-scherf" target="_blank" rel="noopener"
            style={{
              display: "inline-block", padding: "10px 28px", borderRadius: 8,
              background: "#fff", color: "#008CFF",
              fontFamily: "'Playfair Display',Georgia,serif",
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>Pay on Venmo — @ande-scherf</a>
          <div style={{ marginTop: 14 }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent("https://venmo.com/ande-scherf")}`}
              alt="Venmo QR" width={140} height={140}
              style={{ borderRadius: 10, border: "3px solid #fff" }} />
          </div>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: "#a8d4ff", marginTop: 8, margin: "8px 0 0" }}>
            Scan to pay · Include your team name in the note</p>
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ entries, isLocked, loading }) {
  const [expanded, setExpanded] = useState(null);

  // Board colors matching the Augusta scoreboard
  const B = {
    board: "#1a5632",
    boardDark: "#143f26",
    border: "#0d2e1a",
    text: "#f5f0e0",
    yellow: "#f2c94c",
    red: "#e74c3c",
    green: "#2ecc71",
    white: "#fff",
    rowEven: "rgba(255,255,255,0.04)",
    rowOdd: "transparent",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.boardDark, padding: "24px 12px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Classic "LEADERS" header */}
        <div style={{
          textAlign: "center", marginBottom: 4,
          padding: "18px 20px 14px",
          background: B.board,
          border: `3px solid ${B.border}`,
          borderBottom: "none",
          borderRadius: "8px 8px 0 0",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 36, fontWeight: 900, color: B.yellow,
            letterSpacing: "0.15em", textTransform: "uppercase",
            margin: 0, textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}>LEADERS</h2>
          <p style={{
            fontFamily: "Georgia,serif", fontSize: 12, color: "#a8d5a8",
            letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4,
          }}>{T.year} {T.name} · {entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
          {!isLocked && (
            <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: B.yellow, marginTop: 8 }}>
              ⏳ Scores go live when the tournament starts</p>
          )}
        </div>

        {/* Scoreboard */}
        <div style={{
          background: B.board,
          border: `3px solid ${B.border}`,
          borderTop: `2px solid rgba(255,255,255,0.1)`,
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 60px repeat(6, 1fr)",
            borderBottom: `2px solid ${B.border}`,
            background: "rgba(0,0,0,0.15)",
          }}>
            {["POS", "TEAM", "TOTAL", "PICK 1", "PICK 2", "PICK 3", "PICK 4", "PICK 5", "PICK 6"].map((h, i) => (
              <div key={h} style={{
                padding: "8px 4px", textAlign: "center",
                fontFamily: "Georgia,serif", fontSize: 9,
                fontWeight: 700, letterSpacing: "0.1em",
                color: B.yellow, textTransform: "uppercase",
                borderRight: i < 8 ? `1px solid ${B.border}` : "none",
              }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {entries.map((e, i) => {
            const isExpanded = expanded === i;
            return (
              <div key={i}>
                <div onClick={() => setExpanded(isExpanded ? null : i)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr 60px repeat(6, 1fr)",
                    borderBottom: `1px solid ${B.border}`,
                    background: i % 2 === 0 ? B.rowEven : B.rowOdd,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={ev => ev.currentTarget.style.background = i % 2 === 0 ? B.rowEven : B.rowOdd}
                >
                  {/* Position */}
                  <div style={{
                    padding: "10px 4px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 16, fontWeight: 700,
                    color: i === 0 ? B.yellow : i < 3 ? B.green : B.text,
                    borderRight: `1px solid ${B.border}`,
                  }}>{i + 1}</div>

                  {/* Team name */}
                  <div style={{
                    padding: "8px 10px",
                    borderRight: `1px solid ${B.border}`,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700,
                      color: B.white, textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{e.name}</div>
                    <div style={{
                      fontFamily: "Georgia,serif", fontSize: 10,
                      color: "rgba(255,255,255,0.5)", marginTop: 1,
                    }}>{e.fullName || ""}</div>
                  </div>

                  {/* Total score */}
                  <div style={{
                    padding: "10px 4px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 18, fontWeight: 900,
                    color: isLocked
                      ? (e.totalScore < 0 ? B.red : e.totalScore > 0 ? B.green : B.white)
                      : "rgba(255,255,255,0.3)",
                    borderRight: `1px solid ${B.border}`,
                  }}>
                    {isLocked ? (e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—") : "—"}
                  </div>

                  {/* 6 golfer picks */}
                  {(e.picks || []).concat(Array(6).fill("")).slice(0, 6).map((p, j) => {
                    const lastName = p ? p.split(" ").pop() : "";
                    return (
                      <div key={j} style={{
                        padding: "8px 3px", textAlign: "center",
                        borderRight: j < 5 ? `1px solid ${B.border}` : "none",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{
                          fontFamily: "Georgia,serif", fontSize: 10,
                          color: B.text, textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}>{lastName}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded detail row */}
                {isExpanded && (
                  <div style={{
                    padding: "10px 16px",
                    background: "rgba(0,0,0,0.2)",
                    borderBottom: `1px solid ${B.border}`,
                  }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(e.picks || []).map((p, j) => (
                        <span key={j} style={{
                          fontFamily: "Georgia,serif", fontSize: 11,
                          padding: "3px 8px", borderRadius: 4,
                          background: "rgba(255,255,255,0.1)",
                          color: B.text, border: `1px solid rgba(255,255,255,0.15)`,
                        }}>{p}</span>
                      ))}
                    </div>
                    <p style={{
                      fontFamily: "Georgia,serif", fontSize: 11, color: "rgba(255,255,255,0.4)",
                      marginTop: 6,
                    }}>Predicted winner: {e.winScore} · Best 4 of 6 scores count</p>
                  </div>
                )}
              </div>
            );
          })}

          {entries.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                {loading ? "⏳ Loading entries..." : "No entries yet — be the first!"}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: "#5a8a5a" }}>
            📡 <a href={`https://www.espn.com/golf/leaderboard/_/tournamentId/${T.espnId}`}
              target="_blank" rel="noopener" style={{ color: "#7ab87a" }}>ESPN Leaderboard</a>
            {" · "}Tap a row to see full picks
          </p>
        </div>
      </div>
    </div>
  );
}

function MastersExperience() {
  const sandwiches = [
    ["Egg Salad", "1.50"], ["Pimento Cheese", "1.50"], ["Bar-B-Que", "2.50"],
    ["Masters Club", "2.50"], ["Chicken Breast", "2.50"], ["Ham & Cheese on Rye", "1.50"],
    ["Tuna Salad", "1.50"], ["Turkey", "1.50"],
  ];
  const beverages = [
    ["Soft Drinks", "1.00"], ["Bottled Water", "1.50"], ["Iced Tea", "1.50"],
    ["Domestic Beer", "2.75"], ["Import Beer", "3.50"],
  ];
  const snacks = [
    ["Candy", "1.00"], ["Chips / Crackers", "1.00"], ["Peanuts", "1.00"],
    ["Cookie", "1.00"], ["Ice Cream Bar", "2.00"],
  ];

  const MenuSection = ({ title, items }) => (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{
        fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16,
        fontStyle: "italic", color: C.dark, textAlign: "center",
        borderBottom: "1px solid #999", paddingBottom: 5, marginBottom: 6,
      }}>{title}</h4>
      {items.map(([name, price], i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", padding: "2px 0",
          fontFamily: "Georgia,serif", fontSize: 13, color: "#333",
        }}>
          <span>{name}</span><span>{price}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderTop: `4px solid ${C.yellow}`,
      background: `linear-gradient(135deg, ${C.dark} 0%, ${C.green} 50%, #004d35 100%)`,
      padding: "56px 24px",
    }}>
      {/* Decorative azalea/nature pattern overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.06, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle at 15% 25%, #e84393 1px, transparent 1px),
          radial-gradient(circle at 85% 15%, #e84393 1.5px, transparent 1.5px),
          radial-gradient(circle at 45% 75%, #c2185b 1px, transparent 1px),
          radial-gradient(circle at 75% 85%, #e84393 2px, transparent 2px),
          radial-gradient(circle at 25% 60%, #c2185b 1.5px, transparent 1.5px),
          radial-gradient(circle at 60% 30%, #e91e63 1px, transparent 1px),
          radial-gradient(circle at 90% 55%, #e84393 1px, transparent 1px),
          radial-gradient(circle at 10% 90%, #c2185b 2px, transparent 2px),
          radial-gradient(circle at 50% 10%, #e91e63 1.5px, transparent 1.5px),
          radial-gradient(circle at 35% 45%, #e84393 1px, transparent 1px)
        `,
        backgroundSize: "200px 200px",
      }} />
      {/* Pine needle texture */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.03, pointerEvents: "none",
        background: `repeating-linear-gradient(
          45deg, transparent, transparent 10px,
          rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px
        )`,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
        <h3 style={{
          fontFamily: "'Playfair Display',Georgia,serif", fontSize: 32,
          color: C.yellow, textAlign: "center", margin: "0 0 4px",
        }}>The Masters at Home</h3>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 15,
          color: "#a8d5a8", textAlign: "center", margin: "0 0 32px",
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>Your watch party essentials</p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
        }}>
          {/* LEFT: Concessions Menu */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              background: C.dark, padding: "10px 20px", textAlign: "center",
            }}>
              <h4 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
                color: C.yellow, margin: 0, letterSpacing: "0.05em",
              }}>🥪 Concessions</h4>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <MenuSection title="Sandwiches" items={sandwiches} />
              <MenuSection title="Beverages" items={beverages} />
              <MenuSection title="Snacks" items={snacks} />
            </div>
            <div style={{
              padding: "10px 20px", background: "#fafaf7",
              borderTop: `1px solid ${C.sand}`,
            }}>
              <p style={{
                fontFamily: "Georgia,serif", fontSize: 11, color: "#999",
                textAlign: "center", fontStyle: "italic", margin: 0,
              }}>Yes, these are the real Augusta National prices.</p>
            </div>
          </div>

          {/* RIGHT: Azalea Cocktail */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              background: C.dark, padding: "10px 20px", textAlign: "center",
            }}>
              <h4 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
                color: C.yellow, margin: 0, letterSpacing: "0.05em",
              }}>🌺 The Azalea</h4>
            </div>
            <div style={{ padding: "24px 24px", flex: 1 }}>
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 17,
                color: C.dark, fontStyle: "italic", lineHeight: 1.5,
                margin: "0 0 20px", textAlign: "center",
              }}>
                The signature cocktail of Augusta National
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["🥃", "1¼ oz Vodka"],
                  ["🍋", "5 oz Lemonade"],
                  ["🍒", "½ oz Grenadine"],
                  ["🧊", "Plenty of ice"],
                  ["🍊", "Cherry & orange slice"],
                ].map(([icon, text], i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 12px", borderRadius: 6,
                    background: i % 2 === 0 ? `${C.green}08` : "transparent",
                  }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#333" }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 18, padding: "12px 14px", borderRadius: 8,
                background: `${C.green}08`, border: `1px solid ${C.green}20`,
              }}>
                <p style={{
                  fontFamily: "Georgia,serif", fontSize: 12, color: C.dark,
                  margin: 0, lineHeight: 1.5,
                }}>
                  <strong>Mix it:</strong> Pour vodka, lemonade & grenadine over ice.
                  Stir gently. Garnish. Sip while watching Amen Corner. 🌸
                </p>
              </div>
            </div>
            <div style={{
              padding: "10px 20px", background: "#fafaf7",
              borderTop: `1px solid ${C.sand}`,
            }}>
              <p style={{
                fontFamily: "Georgia,serif", fontSize: 11, color: "#999",
                textAlign: "center", fontStyle: "italic", margin: 0,
              }}>It's not the Masters until you've made one.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*─────────────────────────────────────────────
  APP
─────────────────────────────────────────────*/
export default function App() {
  const [view, setView] = useState("home");
  const [entry, setEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const { remaining, isLocked } = useCountdown(T.lockTime);

  // Fetch entries from Google Sheet on load and every 60 seconds
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(SCRIPT_URL);
        const data = await res.json();
        if (data.success && data.entries) {
          setEntries(data.entries.map(e => ({
            name: e.teamName,
            email: e.email,
            picks: e.picks,
            winScore: e.winningScore,
            fullName: e.fullName || "",
          })));
        }
      } catch (err) {
        console.warn("Sheet fetch failed, falling back to localStorage:", err);
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem("pool-entries");
          if (raw) {
            const parsed = JSON.parse(raw);
            setEntries(parsed.map(e => ({
              name: e.teamName, email: e.email, picks: e.picks, winScore: e.winScore,
            })));
          }
        } catch {}
      }
      setLoadingEntries(false);
    };
    fetchEntries();
    const interval = setInterval(fetchEntries, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = (data) => {
    setEntry(data);
    setEntries(prev => {
      const idx = prev.findIndex(e => e.name === data.teamName || e.email === data.email);
      const ne = { name: data.teamName, email: data.email, picks: data.picks, winScore: data.winScore, fullName: data.fullName };
      if (idx >= 0) { const u = [...prev]; u[idx] = ne; return u; }
      return [...prev, ne];
    });
    setTimeout(async () => {
      try {
        const res = await fetch(SCRIPT_URL);
        const d = await res.json();
        if (d.success && d.entries) {
          setEntries(d.entries.map(e => ({
            name: e.teamName, email: e.email, picks: e.picks, winScore: e.winningScore, fullName: e.fullName || "",
          })));
        }
      } catch {}
    }, 3000);
    setView("confirmed");
  };

  const [showGreeting, setShowGreeting] = useState(true);

  // Synthesize a gentle E major piano arpeggio
  const playMastersChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // E major arpeggio: E4, G#4, B4, E5, B4, G#4
      const notes = [329.63, 415.30, 493.88, 659.25, 493.88, 415.30, 329.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        // Soft piano-like tone
        osc.type = "sine";
        osc.frequency.value = freq;
        filter.type = "lowpass";
        filter.frequency.value = 2000;
        // Gentle envelope
        const t = ctx.currentTime + i * 0.45;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.4);
      });
      // Add a warm pad underneath
      const pad = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      pad.type = "sine";
      pad.frequency.value = 164.81; // E3
      padFilter.type = "lowpass";
      padFilter.frequency.value = 800;
      padGain.gain.setValueAtTime(0, ctx.currentTime);
      padGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      pad.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(ctx.destination);
      pad.start(ctx.currentTime);
      pad.stop(ctx.currentTime + 4.5);
    } catch {}
  }, []);

  // Jim Nantz TTS greeting
  const speakHelloFriends = useCallback(() => {
    try {
      const utterance = new SpeechSynthesisUtterance("Hello, friends.");
      utterance.rate = 0.75;
      utterance.pitch = 0.85;
      utterance.volume = 1;
      // Try to pick a deep male voice
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Daniel") || v.name.includes("James") ||
        v.name.includes("Google UK English Male") || v.name.includes("Male")
      ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      if (preferred) utterance.voice = preferred;
      speechSynthesis.speak(utterance);
    } catch {}
  }, []);

  // Play audio when greeting shows
  useEffect(() => {
    if (showGreeting) {
      // Voices may load async
      const trySpeak = () => {
        speakHelloFriends();
        playMastersChime();
      };
      if (speechSynthesis.getVoices().length > 0) {
        setTimeout(trySpeak, 600);
      } else {
        speechSynthesis.onvoiceschanged = () => setTimeout(trySpeak, 600);
      }
      const t = setTimeout(() => setShowGreeting(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showGreeting]);

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { opacity: 0.93; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 4px; }
        @keyframes greetFade { 0% { opacity: 0; transform: scale(0.9); } 15% { opacity: 1; transform: scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: scale(1.02); } }
      `}</style>

      {/* Jim Nantz Greeting Overlay */}
      {showGreeting && (
        <div onClick={() => setShowGreeting(false)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,40,20,0.93)", backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", animation: "greetFade 5s ease-in-out forwards",
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⛳</div>
          <p style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 48, fontWeight: 700, color: C.yellow,
            textAlign: "center", lineHeight: 1.2,
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}>Hello, Friends.</p>
          <p style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 20, color: "#a8d5a8", marginTop: 12,
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>Welcome to the Masters Pool</p>
          <div style={{
            marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <a href="https://www.youtube.com/watch?v=G97AdMLbfr4" target="_blank" rel="noopener"
              onClick={e => e.stopPropagation()}
              style={{
                padding: "8px 20px", borderRadius: 20,
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                color: C.yellow, fontFamily: "Georgia,serif", fontSize: 13,
                textDecoration: "none", transition: "all 0.2s",
              }}>🎵 Play the Masters Theme</a>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: "#5a8a5a" }}>
              tap anywhere to continue</p>
          </div>
        </div>
      )}

      {view !== "home" && <Nav view={view} setView={setView} isLocked={isLocked} remaining={remaining} />}
      {view === "home" && (
        <>
          <Hero onStart={() => setView("picks")} setView={setView} />
          <MastersExperience />
        </>
      )}
      {view === "picks" && <PicksFlow onComplete={handleComplete} isLocked={isLocked}
        existingEntry={entry ? { email: entry.email, teamName: entry.teamName, winScore: entry.winScore, firstName: entry.firstName, lastName: entry.lastName } : null}
        allEntries={entries} />}
      {view === "confirmed" && entry && <Confirmation entry={entry}
        onLeaderboard={() => setView("leaderboard")} onEdit={() => setView("picks")} />}
      {view === "leaderboard" && <Leaderboard entries={entries} isLocked={isLocked} loading={loadingEntries} />}
      <footer style={{
        background: C.dark, padding: "18px 16px", textAlign: "center",
        borderTop: `3px solid ${C.green}`,
      }}>
        <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12, color: "#5a8a5a" }}>
          ⛳ {MODE === "valero" ? "🧪 Test Pool" : "Masters Pool"} {T.year}
          {MODE === "masters" && " · Made with 🧀 pimento cheese energy"}
        </p>
      </footer>
    </div>
  );
}
