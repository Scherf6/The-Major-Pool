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
        {["home","picks","leaderboard","tournament"].map(id => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "6px 10px", border: "none", borderRadius: 6,
            background: view === id ? C.yellow : "transparent",
            color: view === id ? C.dark : "#fff",
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 12, fontWeight: view === id ? 700 : 400,
            cursor: "pointer",
          }}>{id === "picks" ? "My Picks" : id === "tournament" ? "⛳ Live" : id.charAt(0).toUpperCase() + id.slice(1)}</button>
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
        <div style={{ display: "flex", gap: 16, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
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
          <button onClick={() => setView("tournament")} style={{
            background: "none", border: "none", color: C.yellow,
            fontFamily: "Georgia,serif", fontSize: 15, cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}>⛳ Live Tournament</button>
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
  const [lookupMode, setLookupMode] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");

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

            {!lookupMode ? (
              <>
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

                <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.sand}` }}>
                  <button onClick={() => setLookupMode(true)} style={{
                    background: "none", border: "none", color: C.green,
                    fontFamily: "Georgia,serif", fontSize: 13, cursor: "pointer",
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}>Already signed up? Edit your picks →</button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
                  color: C.green, margin: "0 0 12px" }}>Welcome Back</h3>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#8b7355", margin: "0 0 12px" }}>
                  Enter the email you signed up with to view and edit your picks.</p>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setLookupMsg(""); }}
                  placeholder="your@email.com"
                  style={{ width: "100%", padding: "12px", borderRadius: 8,
                    border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                    outline: "none", boxSizing: "border-box" }} />
                {lookupMsg && (
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 12, marginTop: 6,
                    color: lookupMsg.includes("✅") ? C.green : "#c62828" }}>{lookupMsg}</p>
                )}
                <button onClick={async () => {
                  if (!email.includes("@")) return;
                  setLookupMsg("Looking up...");
                  try {
                    const res = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
                    const data = await res.json();
                    if (data.userEntry) {
                      const ue = data.userEntry;
                      setFirstName(ue.firstName || "");
                      setLastName(ue.lastName || "");
                      setTeamName(ue.teamName || "");
                      setWinScore(ue.winningScore || -12);
                      setLookupMsg("✅ Found your entry! Loading...");
                      setTimeout(() => setStep(2), 800);
                    } else {
                      setLookupMsg("No entry found for that email. Try signing up below.");
                    }
                  } catch {
                    setLookupMsg("Couldn't reach the server. Try again.");
                  }
                }} disabled={!email.includes("@")}
                  style={{ width: "100%", padding: 12, border: "none", borderRadius: 8,
                    background: email.includes("@") ? C.green : "#ccc",
                    color: "#fff", fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 16, fontWeight: 600, cursor: email.includes("@") ? "pointer" : "default",
                    marginTop: 12 }}>Look Up My Entry</button>

                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <button onClick={() => { setLookupMode(false); setLookupMsg(""); }} style={{
                    background: "none", border: "none", color: C.green,
                    fontFamily: "Georgia,serif", fontSize: 13, cursor: "pointer",
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}>← New entry instead</button>
                </div>
              </>
            )}
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

  // Board colors — clean white like masters.com
  const B = {
    bg: "#f5f1e8",
    board: "#ffffff",
    headerBg: C.green,
    border: "#d4cdb8",
    text: "#1a1a1a",
    yellow: C.yellow,
    red: "#c62828",
    green: C.green,
    white: "#fff",
    muted: "#8b7355",
    rowEven: "#fafaf5",
    rowOdd: "#ffffff",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, padding: "24px 12px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Classic "LEADERS" header */}
        <div style={{
          textAlign: "center", marginBottom: 0,
          padding: "20px 20px 16px",
          background: B.headerBg,
          borderRadius: "8px 8px 0 0",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 36, fontWeight: 900, color: B.yellow,
            letterSpacing: "0.15em", textTransform: "uppercase",
            margin: 0, textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}>LEADERS</h2>
          <p style={{
            fontFamily: "Georgia,serif", fontSize: 12, color: "#c4d9c4",
            letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4,
          }}>{T.year} {T.name} · {entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
          {!isLocked && (
            <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: B.yellow, marginTop: 8 }}>
              ⏳ Scores go live when the tournament starts</p>
          )}
        </div>

        {/* Scoreboard */}
        <div className="pool-board" style={{ background: B.board, borderRadius: "0 0 8px 8px",
          overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: `1px solid ${B.border}`,
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "44px minmax(160px, 2fr) 60px repeat(6, 1fr)",
            borderBottom: `2px solid ${B.green}`,
            background: "#f0ebe0",
          }}>
            {["POS", "TEAM", "TOTAL",
              ...(isLocked ? ["PICK 1", "PICK 2", "PICK 3", "PICK 4", "PICK 5", "PICK 6"]
                           : ["", "", "", "", "", ""])
            ].map((h, i) => (
              <div key={h+i} style={{
                padding: "8px 4px", textAlign: "center",
                fontFamily: "Georgia,serif", fontSize: 9,
                fontWeight: 700, letterSpacing: "0.1em",
                color: B.green, textTransform: "uppercase",
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
                    gridTemplateColumns: "44px minmax(160px, 2fr) 60px repeat(6, 1fr)",
                    borderBottom: `1px solid ${B.border}`,
                    background: i % 2 === 0 ? B.rowEven : B.rowOdd,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "#f0ebe0"}
                  onMouseLeave={ev => ev.currentTarget.style.background = i % 2 === 0 ? B.rowEven : B.rowOdd}
                >
                  {/* Position */}
                  <div style={{
                    padding: "10px 4px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 16, fontWeight: 700,
                    color: i === 0 ? B.green : i < 3 ? B.green : B.muted,
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
                      color: B.text, textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{e.name}</div>
                    <div style={{
                      fontFamily: "Georgia,serif", fontSize: 10,
                      color: B.muted, marginTop: 1,
                    }}>{e.fullName || ""}</div>
                  </div>

                  {/* Total score */}
                  <div style={{
                    padding: "10px 4px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 18, fontWeight: 900,
                    color: isLocked
                      ? (e.totalScore < 0 ? B.red : e.totalScore > 0 ? B.green : B.text)
                      : B.muted,
                    borderRight: `1px solid ${B.border}`,
                  }}>
                    {isLocked ? (e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—") : "—"}
                  </div>

                  {/* 6 golfer picks — hidden until locked */}
                  {(e.picks || []).concat(Array(6).fill("")).slice(0, 6).map((p, j) => {
                    const lastName = p ? p.split(" ").pop() : "";
                    return (
                      <div key={j} style={{
                        padding: "8px 3px", textAlign: "center",
                        borderRight: j < 5 ? `1px solid ${B.border}` : "none",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{
                          fontFamily: "Georgia,serif", fontSize: isLocked ? 10 : 14,
                          color: isLocked ? B.green : B.border,
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}>{isLocked ? lastName : "🔒"}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded detail row — only after lock */}
                {isExpanded && (
                  <div style={{
                    padding: "10px 16px",
                    background: "#f0ebe0",
                    borderBottom: `1px solid ${B.border}`,
                  }}>
                    {isLocked ? (
                      <>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {(e.picks || []).map((p, j) => (
                            <span key={j} style={{
                              fontFamily: "Georgia,serif", fontSize: 11,
                              padding: "3px 8px", borderRadius: 4,
                              background: B.white,
                              color: B.green, border: `1px solid ${B.border}`,
                              fontWeight: 600,
                            }}>{p}</span>
                          ))}
                        </div>
                        <p style={{
                          fontFamily: "Georgia,serif", fontSize: 11, color: B.muted,
                          marginTop: 6,
                        }}>Predicted winner: {e.winScore} · Best 4 of 6 scores count</p>
                      </>
                    ) : (
                      <p style={{
                        fontFamily: "Georgia,serif", fontSize: 12, color: B.green,
                        margin: 0, textAlign: "center", fontWeight: 600,
                      }}>🔒 Picks are hidden until the tournament starts</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {entries.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: B.muted }}>
                {loading ? "⏳ Loading entries..." : "No entries yet — be the first!"}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted }}>
            📡 <a href={`https://www.espn.com/golf/leaderboard/_/tournamentId/${T.espnId}`}
              target="_blank" rel="noopener" style={{ color: B.green }}>ESPN Leaderboard</a>
            {" · "}{isLocked ? "Tap a row to see full picks" : "🔒 Picks hidden until first tee"}
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

  const schedule = [
    { day: "MON 4/6", events: [["On the Range", "12–2 PM", "Masters.com"]] },
    { day: "TUE 4/7", events: [["On the Range", "9–11 AM", "Masters.com"], ["Practice Round", "12–2 PM", "ESPN App"]] },
    { day: "WED 4/8", events: [["Par 3 Contest", "12–4 PM", "ESPN"]] },
    { day: "THU 4/9", events: [
      ["Honorary Starters", "7:30 AM", "Masters.com"],
      ["Featured Groups", "9:15 AM", "Masters.com"],
      ["Amen Corner", "10:45 AM", "Masters.com"],
      ["Round 1", "1–3 PM", "Prime Video"],
      ["Round 1", "3–7:30 PM", "ESPN"],
    ]},
    { day: "FRI 4/10", events: [
      ["Featured Groups", "9:15 AM", "Masters.com"],
      ["Amen Corner", "10:45 AM", "Masters.com"],
      ["Round 2", "1–3 PM", "Prime Video"],
      ["Round 2", "3–7:30 PM", "ESPN"],
    ]},
    { day: "SAT 4/11", events: [
      ["Featured Groups", "10:15 AM", "Masters.com"],
      ["Round 3", "12–2 PM", "Paramount+"],
      ["Round 3", "2–7 PM", "CBS"],
    ]},
    { day: "SUN 4/12", events: [
      ["Featured Groups", "10:15 AM", "Masters.com"],
      ["Final Round", "12–2 PM", "Paramount+"],
      ["Final Round", "2–7 PM", "CBS"],
    ]},
  ];

  const MenuSection = ({ title, items }) => (
    <div style={{ marginBottom: 14 }}>
      <h4 style={{
        fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15,
        fontStyle: "italic", color: C.dark, textAlign: "center",
        borderBottom: "1px solid #999", paddingBottom: 4, marginBottom: 5,
      }}>{title}</h4>
      {items.map(([name, price], i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", padding: "2px 0",
          fontFamily: "Georgia,serif", fontSize: 12, color: "#333",
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
      padding: "48px 16px",
    }}>
      {/* Azalea pattern */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.06, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle at 15% 25%, #e84393 1px, transparent 1px),
          radial-gradient(circle at 85% 15%, #e84393 1.5px, transparent 1.5px),
          radial-gradient(circle at 45% 75%, #c2185b 1px, transparent 1px),
          radial-gradient(circle at 75% 85%, #e84393 2px, transparent 2px),
          radial-gradient(circle at 25% 60%, #c2185b 1.5px, transparent 1.5px)
        `,
        backgroundSize: "200px 200px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
        <h3 style={{
          fontFamily: "'Playfair Display',Georgia,serif", fontSize: 30,
          color: C.yellow, textAlign: "center", margin: "0 0 4px",
        }}>The Masters at Home</h3>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14,
          color: "#a8d5a8", textAlign: "center", margin: "0 0 28px",
          letterSpacing: "0.15em", textTransform: "uppercase",
        }}>Watch party essentials</p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16,
        }}>
          {/* LEFT: Menu */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{ background: C.dark, padding: "8px 16px", textAlign: "center" }}>
              <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15,
                color: C.yellow, margin: 0 }}>🥪 Concessions</h4>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <MenuSection title="Sandwiches" items={sandwiches} />
              <MenuSection title="Beverages" items={beverages} />
              <MenuSection title="Snacks" items={snacks} />
            </div>
            <div style={{ padding: "6px 16px", background: "#fafaf7", borderTop: `1px solid ${C.sand}` }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#999",
                textAlign: "center", fontStyle: "italic", margin: 0 }}>Real Augusta prices.</p>
            </div>
          </div>

          {/* CENTER: Schedule */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{ background: C.dark, padding: "8px 16px", textAlign: "center" }}>
              <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15,
                color: C.yellow, margin: 0 }}>📅 Tournament Schedule</h4>
            </div>
            <div style={{ padding: "12px 14px", maxHeight: 480, overflowY: "auto" }}>
              {schedule.map((day, di) => (
                <div key={di} style={{ marginBottom: 12 }}>
                  <div style={{
                    fontFamily: "'Playfair Display',Georgia,serif", fontSize: 13,
                    fontWeight: 700, color: C.green, marginBottom: 4,
                    borderBottom: `1px solid ${C.sand}`, paddingBottom: 3,
                  }}>{day.day}</div>
                  {day.events.map(([name, time, channel], ei) => (
                    <div key={ei} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "3px 0", gap: 4,
                    }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color: "#333", flex: 1 }}>{name}</span>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#8b7355", whiteSpace: "nowrap" }}>{time}</span>
                      <span style={{
                        fontFamily: "Georgia,serif", fontSize: 9, color: C.green,
                        background: `${C.green}10`, padding: "1px 5px", borderRadius: 4,
                        fontWeight: 600, whiteSpace: "nowrap",
                      }}>{channel}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Azalea */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ background: C.dark, padding: "8px 16px", textAlign: "center" }}>
              <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15,
                color: C.yellow, margin: 0 }}>🌺 The Azalea</h4>
            </div>
            <div style={{ padding: "18px 18px", flex: 1 }}>
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 15,
                color: C.dark, fontStyle: "italic", lineHeight: 1.5,
                margin: "0 0 14px", textAlign: "center",
              }}>The signature cocktail</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["🥃", "1¼ oz Vodka"],
                  ["🍋", "5 oz Lemonade"],
                  ["🍒", "½ oz Grenadine"],
                  ["🧊", "Plenty of ice"],
                  ["🍊", "Cherry & orange slice"],
                ].map(([icon, text], i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 10px", borderRadius: 6,
                    background: i % 2 === 0 ? `${C.green}08` : "transparent",
                  }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#333" }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 14, padding: "10px 12px", borderRadius: 6,
                background: `${C.green}08`, border: `1px solid ${C.green}20`,
              }}>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 11, color: C.dark,
                  margin: 0, lineHeight: 1.4 }}>
                  <strong>Mix:</strong> Pour over ice, stir, garnish. Sip while watching Amen Corner. 🌸
                </p>
              </div>
            </div>
            <div style={{ padding: "6px 16px", background: "#fafaf7", borderTop: `1px solid ${C.sand}` }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#999",
                textAlign: "center", fontStyle: "italic", margin: 0 }}>It's not the Masters without one.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentLive() {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "24px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: C.green, margin: "0 0 4px" }}>
            ⛳ Live Tournament</h2>
          <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14, color: "#8b7355",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>{T.year} {T.name} — Augusta National</p>
        </div>

        {/* Watch Live Section */}
        <div style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.dark})`,
          borderRadius: 12, padding: "24px 20px", marginBottom: 20, textAlign: "center",
        }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22,
            color: C.yellow, margin: "0 0 12px" }}>📺 Watch Live</h3>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#c4d9c4", margin: "0 0 16px" }}>
            Free streaming available on Masters.com (US only)</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.masters.com/en_US/live/index.html" target="_blank" rel="noopener" style={{
              padding: "10px 20px", borderRadius: 8, background: C.yellow, color: C.dark,
              fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>▶ Masters.com Live</a>
            <a href="https://www.youtube.com/@themasters/streams" target="_blank" rel="noopener" style={{
              padding: "10px 20px", borderRadius: 8, background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
              fontFamily: "Georgia,serif", fontSize: 14, textDecoration: "none",
            }}>📹 YouTube Streams</a>
          </div>
        </div>

        {/* Masters.com embed attempt */}
        <div style={{
          background: "#fff", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: `1px solid ${C.sand}`,
          marginBottom: 20,
        }}>
          <div style={{
            background: C.green, padding: "10px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16,
              fontWeight: 700, color: C.yellow }}>Masters Leaderboard</span>
            <a href="https://www.masters.com/en_US/scores/index.html"
              target="_blank" rel="noopener" style={{
                fontFamily: "Georgia,serif", fontSize: 12, color: "#c4d9c4",
                textDecoration: "none",
              }}>Open on Masters.com ↗</a>
          </div>
          <iframe
            src="https://www.masters.com/en_US/scores/index.html"
            style={{ width: "100%", height: 600, border: "none", background: "#fff" }}
            title="Masters Leaderboard"
          />
        </div>

        {/* Quick links grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            ["🏌️", "Masters.com", "Official Site", "https://www.masters.com"],
            ["📊", "ESPN", "Full Coverage", "https://www.espn.com/golf/leaderboard/_/tournamentId/" + T.espnId],
            ["📺", "Amen Corner", "Live Stream", "https://www.masters.com/en_US/live/index.html"],
            ["🗺️", "Course Map", "Augusta National", "https://www.masters.com/en_US/course/index.html"],
            ["📱", "Masters App", "Every Shot", "https://apps.apple.com/app/the-masters-tournament/id309025938"],
            ["📻", "SiriusXM", "Radio Coverage", "https://www.siriusxm.com/sports/golf"],
          ].map(([icon, title, sub, url], i) => (
            <a key={i} href={url} target="_blank" rel="noopener" style={{
              background: "#fff", borderRadius: 10, padding: "14px",
              textAlign: "center", textDecoration: "none",
              border: `1px solid ${C.sand}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.green, fontWeight: 600 }}>{title}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#8b7355" }}>{sub}</div>
            </a>
          ))}
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
  const [greetingTapped, setGreetingTapped] = useState(false);

  // Synthesize a gentle E major piano arpeggio
  const playMastersChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [329.63, 415.30, 493.88, 659.25, 493.88, 415.30, 329.63];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sine";
        osc.frequency.value = freq;
        filter.type = "lowpass";
        filter.frequency.value = 2000;
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
      const pad = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      pad.type = "sine";
      pad.frequency.value = 164.81;
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

  const speakHelloFriends = useCallback(() => {
    try {
      const audio = new Audio("data:audio/mp3;base64,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");
      audio.volume = 1;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const handleGreetingTap = useCallback(() => {
    if (!greetingTapped) {
      setGreetingTapped(true);
      speakHelloFriends();
      playMastersChime();
      setTimeout(() => setShowGreeting(false), 4000);
    } else {
      setShowGreeting(false);
    }
  }, [greetingTapped, speakHelloFriends, playMastersChime]);

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { opacity: 0.93; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 4px; }
        @keyframes greetFade { 0% { opacity: 0; transform: scale(0.9); } 15% { opacity: 1; transform: scale(1); } 80% { opacity: 1; } 100% { opacity: 0; transform: scale(1.02); } }
        @media (max-width: 700px) {
          .pool-board { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pool-board > div { min-width: 700px; }
        }
      `}</style>

      {/* Jim Nantz Greeting Overlay */}
      {showGreeting && (
        <div onClick={handleGreetingTap} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,40,20,0.93)", backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          ...(greetingTapped ? { animation: "greetFade 4s ease-in-out 0.5s forwards" } : {}),
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
                textDecoration: "none",
              }}>🎵 Play the Masters Theme</a>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.yellow, marginTop: 6 }}>
              {greetingTapped ? "entering Augusta..." : "👆 tap anywhere to enter"}</p>
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
      {view === "tournament" && <TournamentLive />}
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
