import { useState, useEffect, useCallback, useRef } from "react";

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
      { name: "Ludvig Aberg", odds: "+1600" },
      { name: "Tommy Fleetwood", odds: "+1800" },
      { name: "Matt Fitzpatrick", odds: "+2000", note: "2022 US Open winner" },
      { name: "Cameron Young", odds: "+2000" },
      { name: "Collin Morikawa", odds: "+2200" },
    ]
  },
  "Tier 2 — Contenders": {
    pick: 1, color: "#C8E6C9",
    golfers: [
      { name: "Patrick Reed", odds: "+2700", note: "2018 Masters winner" },
      { name: "Viktor Hovland", odds: "+3500" },
      { name: "Chris Gotterup", odds: "+3500" },
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
      { name: "Sungjae Im", odds: "+5000" },
      { name: "Akshay Bhatia", odds: "+5000" },
      { name: "Sam Burns", odds: "+5000" },
      { name: "Justin Rose", odds: "+5500" },
      { name: "Wyndham Clark", odds: "+5500", note: "2023 US Open winner" },
      { name: "Jordan Spieth", odds: "+6000", note: "2015 Masters winner ⭐" },
      { name: "Jason Day", odds: "+6500", note: "Former World #1" },
    ]
  },
  "Tier 4 — Long Shots": {
    pick: 1, color: "#81C784",
    golfers: [
      { name: "Cameron Smith", odds: "+6600", note: "2022 Open winner, LIV" },
      { name: "Keegan Bradley", odds: "+7000", note: "Ryder Cup captain" },
      { name: "Min Woo Lee", odds: "+7000" },
      { name: "Sepp Straka", odds: "+7500" },
      { name: "Aaron Rai", odds: "+7500" },
      { name: "Corey Conners", odds: "+8000", note: "Elite ball-striker" },
      { name: "Adam Scott", odds: "+8000", note: "2013 Masters winner" },
      { name: "Davis Riley", odds: "+8500" },
      { name: "Si Woo Kim", odds: "+9000" },
    ]
  },
  "The Field — Pick 2": {
    pick: 2, color: "#FFF3E0",
    golfers: [
      { name: "Harris English", odds: "+9000" },
      { name: "Dustin Johnson", odds: "+9000", note: "2020 Masters winner, LIV" },
      { name: "Max Homa", odds: "+9000" },
      { name: "Sergio Garcia", odds: "+10000", note: "2017 Masters winner" },
      { name: "Nick Taylor", odds: "+10000" },
      { name: "Alex Noren", odds: "+10000" },
      { name: "Maverick McNealy", odds: "+10000" },
      { name: "Harry Hall", odds: "+12000" },
      { name: "Max Greyserman", odds: "+12000" },
      { name: "Ben Griffin", odds: "+12000" },
      { name: "Nico Echavarria", odds: "+12000" },
      { name: "Kurt Kitayama", odds: "+12000" },
      { name: "Jake Knapp", odds: "+12000" },
      { name: "Nicolai Hojgaard", odds: "+12000" },
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
      { name: "Gary Woodland", odds: "+15000", note: "Comeback story" },
      { name: "Rasmus Hojgaard", odds: "+15000" },
      { name: "Aldrich Potgieter", odds: "+15000" },
      { name: "Marco Penge", odds: "+20000" },
      { name: "Haotong Li", odds: "+20000" },
      { name: "Michael Kim", odds: "+25000" },
      { name: "Sami Valimaki", odds: "+25000" },
      { name: "Rasmus Neergaard-Petersen", odds: "+25000" },
      { name: "Casey Jarvis", odds: "+25000" },
      { name: "Kristoffer Reitan", odds: "+25000" },
      { name: "Naoyuki Kataoka", odds: "+25000" },
      { name: "Ethan Fang", odds: "+30000" },
      { name: "Brandon Holtz", odds: "+30000" },
      { name: "Jackson Herrington", odds: "+30000" },
      { name: "Mateo Pulcini", odds: "+30000" },
      { name: "Mason Howell", odds: "+30000" },
      { name: "Fifa Laopakdee", odds: "+30000" },
      { name: "Brian Campbell", odds: "+50000" },
      { name: "Tiger Woods", odds: "+15000", wd: true, note: "🐅 5x champ — WD, legend pick" },
      { name: "Phil Mickelson", odds: "+20000", wd: true, note: "🫡 3x champ — WD, legend pick" },
      { name: "Bubba Watson", odds: "+25000", note: "2x Masters winner" },
      { name: "Charl Schwartzel", odds: "+35000", note: "2011 Masters winner" },
      { name: "Danny Willett", odds: "+35000", note: "2016 Masters winner" },
      { name: "Fred Couples", odds: "+50000", note: "1992 champ, Freddie forever 😎" },
      { name: "Vijay Singh", odds: "+50000", note: "2000 Masters winner" },
      { name: "Jose Maria Olazabal", odds: "+50000", note: "2x Masters winner" },
      { name: "Mike Weir", odds: "+50000", note: "2003 Masters winner" },
      { name: "Zach Johnson", odds: "+50000", note: "2007 Masters winner" },
      { name: "Angel Cabrera", odds: "+50000", note: "2009 Masters winner" },
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
        padding: "4px 12px", borderRadius: 20, fontSize: 13,
        fontFamily: "Georgia,serif", color: isLocked ? "#fff" : C.yellow, fontWeight: 600,
      }}>
        {isLocked ? "🔒 LOCKED" : `⏱ ${remaining}`}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {["home","picks","leaderboard","tournament"].map(id => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "6px 10px", border: "none", borderRadius: 6,
            background: view === id ? C.yellow : "transparent",
            color: view === id ? C.dark : "#fff",
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 14, fontWeight: view === id ? 700 : 400,
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
      <div style={{ position: "relative", zIndex: 1, maxWidth: 650, display: "flex", flexDirection: "column", alignItems: "center" }}>
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
              <span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>{t}</span>
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

        {/* Share button */}
        <button onClick={() => {
          const url = window.location.href;
          const text = `Join my Masters Pool! Pick 6 golfers, best 4 scores win. ${url}`;
          if (navigator.share) {
            navigator.share({ title: "Masters Pool 2026", text, url }).catch(() => {});
          } else {
            navigator.clipboard.writeText(text).then(() => alert("Link copied! Paste it in a text."));
          }
        }} style={{
          marginTop: 14, padding: "10px 24px", borderRadius: 20,
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff", fontFamily: "Georgia,serif", fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>📤 Invite Your Friends</button>
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

  const loadPicksFromNames = (pickNames) => {
    if (!pickNames || pickNames.length === 0) return;
    const newPicks = {};
    const tierKeys = Object.keys(TIERS);
    pickNames.forEach(name => {
      if (!name) return;
      const nameLower = name.toString().toLowerCase().trim();
      for (const tier of tierKeys) {
        const found = TIERS[tier].golfers.find(g => g.name.toLowerCase() === nameLower);
        if (found) {
          if (TIERS[tier].pick === 1) {
            newPicks[tier] = found;
          } else {
            if (!newPicks[tier]) newPicks[tier] = [];
            if (newPicks[tier].length < TIERS[tier].pick) {
              newPicks[tier].push(found);
            }
          }
          break;
        }
      }
    });
    setPicks(newPicks);
  };

  // Pre-load picks from existing entry
  useEffect(() => {
    if (existingEntry?.picks && Object.keys(picks).length === 0) {
      loadPicksFromNames(existingEntry.picks);
    }
  }, [existingEntry]);
  const [genNames, setGenNames] = useState([]);
  const [nameIdeas, setNameIdeas] = useState("");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [lookupMode, setLookupMode] = useState(false);
  const [lookupMsg, setLookupMsg] = useState("");
  const [originalTeamName, setOriginalTeamName] = useState(existingEntry?.teamName || "");
  const [foundEntries, setFoundEntries] = useState([]);

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

  const generateNames = () => {
    setGenerating(true);
    const ideas = nameIdeas.trim().toLowerCase();
    
    // Masters-themed word banks
    const prefixes = ["Amen Corner","Augusta","Azalea","Butler Cabin","Magnolia Lane","Rae's Creek",
      "Green Jacket","Pimento","Dogwood","Golden Bell","Hogan's","Sunday","Amen","Birdie","Eagle",
      "Bogey","Masters","Pine","Fairway","Clubhouse","Back Nine","Front Nine","Iron","Wedge"];
    const suffixes = ["Aces","Assassins","Bandits","Crushers","Legends","Maniacs","Monsters",
      "Pounders","Pushers","Swingers","Warriors","Wizards","Chasers","Hunters","Squad","Crew",
      "Gang","Posse","Mafia","Mob","Club","Society"];
    const food = ["Pimento Cheese","Egg Salad","Azalea Cocktail","Turkey Sandwich","BBQ"];
    const golfers = ["Tiger's","Arnie's","Jack's","Rory's","Scottie's","Freddie's","Phil's","Bubba's"];
    
    const results = [];
    const used = new Set();
    
    const addUnique = (name) => {
      const key = name.toLowerCase();
      if (!used.has(key) && results.length < 6) { used.add(key); results.push(name); }
    };
    
    // If user gave ideas, weave them in
    if (ideas) {
      const words = ideas.split(/[\s,]+/).filter(w => w.length > 1);
      const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
      words.forEach(w => {
        const W = cap(w);
        addUnique(`${W} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
        addUnique(`Augusta ${W}s`);
        addUnique(`The ${W} Masters`);
        addUnique(`${W} at Amen Corner`);
        addUnique(`Green Jacket ${W}s`);
        addUnique(`${W} & Pimento`);
        addUnique(`Magnolia ${W}s`);
        addUnique(`${golfers[Math.floor(Math.random() * golfers.length)]} ${W}s`);
      });
    }
    
    // Fill remaining slots with random combos
    while (results.length < 6) {
      const r = Math.random();
      if (r < 0.3) {
        addUnique(`${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
      } else if (r < 0.5) {
        addUnique(`The ${food[Math.floor(Math.random() * food.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
      } else if (r < 0.7) {
        addUnique(`${golfers[Math.floor(Math.random() * golfers.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
      } else {
        addUnique(`${prefixes[Math.floor(Math.random() * prefixes.length)]} ${["Vibes","Energy","Szn","Mode","Dreams","Party"][Math.floor(Math.random() * 6)]}`);
      }
    }
    
    setGenNames(results.slice(0, 6));
    setGenerating(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitMsg("");
    const pickNames = getPickNames();
    if (pickNames.length < 6) {
      setSubmitMsg("⚠️ Please pick all 6 golfers before submitting");
      setSubmitting(false);
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    try {
      // Try GET-based submit first (new script)
      const params = new URLSearchParams({
        mode: "submit",
        email,
        teamName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        winningScore: String(winScore),
        pick1: pickNames[0] || "",
        pick2: pickNames[1] || "",
        pick3: pickNames[2] || "",
        pick4: pickNames[3] || "",
        pick5: pickNames[4] || "",
        pick6: pickNames[5] || "",
      });
      const res = await fetch(`${SCRIPT_URL}?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmitMsg("✅ Entry saved!");
      } else if (data.error && data.error.includes("locked")) {
        setSubmitMsg("🔒 Entries are locked!");
        setSubmitting(false);
        return;
      } else {
        // GET didn't work (old script) — fall back to POST
        await fetch(SCRIPT_URL, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            action: "submit", email, teamName, firstName: firstName.trim(),
            lastName: lastName.trim(), fullName,
            picks: pickNames, winningScore: winScore,
          }),
        });
        setSubmitMsg("✅ Submitting...");
      }
    } catch (e) {
      // Network error on GET — fall back to POST
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
        setSubmitMsg("✅ Submitting...");
      } catch {
        setSubmitMsg("⚠️ Connection issue — try again");
        setSubmitting(false);
        return;
      }
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
                <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>Your Name</label>
                <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="First" style={{ flex: 1, minWidth: 0, padding: "12px", borderRadius: 8,
                      border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                      outline: "none", boxSizing: "border-box" }} />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Last" style={{ flex: 1, minWidth: 0, padding: "12px", borderRadius: 8,
                      border: `2px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                      outline: "none", boxSizing: "border-box" }} />
                </div>
                <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355", display: "block", marginTop: 14 }}>Email</label>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#999", margin: "3px 0 7px" }}>
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
                <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355", margin: "0 0 12px" }}>
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
                  setFoundEntries([]);
                  try {
                    const res = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
                    const data = await res.json();
                    const allUserEntries = data.userEntries || (data.userEntry ? [data.userEntry] : []);
                    if (allUserEntries.length === 1) {
                      // Single entry — load directly
                      const ue = allUserEntries[0];
                      setFirstName(ue.firstName || "");
                      setLastName(ue.lastName || "");
                      setTeamName(ue.teamName || "");
                      setOriginalTeamName(ue.teamName || "");
                      setWinScore(ue.winningScore || -12);
                      if (ue.picks) loadPicksFromNames(ue.picks);
                      setLookupMsg("✅ Found your entry! Edit it or create a 2nd with a new team name.");
                      setTimeout(() => setStep(2), 800);
                    } else if (allUserEntries.length > 1) {
                      // Multiple entries — let them choose
                      setFoundEntries(allUserEntries);
                      setFirstName(allUserEntries[0].firstName || "");
                      setLastName(allUserEntries[0].lastName || "");
                      setLookupMsg("✅ Found " + allUserEntries.length + " entries! Pick which one to edit:");
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

                {/* Entry picker for multiple entries */}
                {foundEntries.length > 1 && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {foundEntries.map((ue, idx) => (
                      <button key={idx} onClick={() => {
                        setTeamName(ue.teamName || "");
                        setOriginalTeamName(ue.teamName || "");
                        setWinScore(ue.winningScore || -12);
                        if (ue.picks) loadPicksFromNames(ue.picks);
                        setFoundEntries([]);
                        setLookupMsg(`✅ Editing "${ue.teamName}"`);
                        setTimeout(() => setStep(2), 500);
                      }} style={{
                        padding: "14px 16px", borderRadius: 10,
                        background: "#fff", border: `2px solid ${C.green}`,
                        cursor: "pointer", textAlign: "left",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16,
                            fontWeight: 700, color: C.green }}>{ue.teamName}</div>
                          <div style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#8b7355", marginTop: 2 }}>
                            {(ue.picks || []).filter(p => p).join(", ")}
                          </div>
                        </div>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.green }}>Edit →</span>
                      </button>
                    ))}
                    <button onClick={() => {
                      setFoundEntries([]);
                      setTeamName("");
                      setOriginalTeamName("");
                      setPicks({});
                      setLookupMsg("Create a new team name for your 2nd entry.");
                      setTimeout(() => setStep(2), 500);
                    }} style={{
                      padding: "10px 16px", borderRadius: 10,
                      background: "transparent", border: `1px solid ${C.sand}`,
                      cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 14,
                      color: "#8b7355",
                    }}>+ Create a new entry instead</button>
                  </div>
                )}

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
            <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>Team Name</label>
            <input type="text" value={teamName} onChange={e => { setTeamName(e.target.value); setNameError(""); }}
              placeholder="Name your squad" maxLength={40}
              style={{ width: "100%", padding: "12px", borderRadius: 8, marginTop: 5,
                border: `2px solid ${nameError ? "#c62828" : C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                outline: "none", boxSizing: "border-box" }} />
            {nameError && (
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#c62828", margin: "5px 0 0" }}>{nameError}</p>
            )}

            {/* AI Name Generator with ideas field */}
            <div style={{ marginTop: 12, padding: "12px", borderRadius: 8,
              border: `1px solid ${C.sand}`, background: "#fafaf7" }}>
              <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "#8b7355" }}>
                🤖 AI Name Generator</label>
              <input type="text" value={nameIdeas} onChange={e => setNameIdeas(e.target.value)}
                placeholder="Any ideas? e.g. 'my dog Ralph', 'beer puns', 'dad jokes'..."
                style={{ width: "100%", padding: "10px", borderRadius: 8, marginTop: 6,
                  border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "Georgia,serif",
                  outline: "none", boxSizing: "border-box" }} />
              <button onClick={generateNames} disabled={generating}
                style={{ width: "100%", padding: 10, border: "none", borderRadius: 8,
                  background: C.green, color: "#fff", fontFamily: "Georgia,serif",
                  fontSize: 13, cursor: "pointer", marginTop: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {generating ? "⏳ Generating..." : genNames.length > 0 ? "🔄 Generate More" : "✨ Generate Names"}
              </button>
            </div>
            {genNames.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355", margin: "0 0 6px" }}>Tap to use:</p>
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
              <label style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 13,
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
                const taken = allEntries.some(e => {
                  if (e.name.toLowerCase() !== teamName.toLowerCase()) return false;
                  // Allow if it's the user's own entry
                  if (e.email === email) return false;
                  if (existingEntry && e.name.toLowerCase() === existingEntry.teamName?.toLowerCase()) return false;
                  if (originalTeamName && teamName.toLowerCase() === originalTeamName.toLowerCase()) return false;
                  // Check masked email pattern: first char + "***@" + domain
                  if (email && e.email === email.charAt(0) + "***@" + email.split("@")[1]) return false;
                  return true;
                });
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
              <p style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.dark, margin: 0, lineHeight: 1.5 }}>
                <strong>Pick 6, Use Best 4:</strong> 1 from each tier + 2 from The Field. Cut/WD golfers get 80 per unplayed round.</p>
            </div>

            {/* Progress */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 700, color: C.green }}>
                {totalPicked}</span>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 16, color: "#8b7355" }}> / {totalNeeded} picked</span>
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
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: tierDone ? C.green : "#999" }}>
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
                              fontFamily: "Georgia,serif", fontSize: 12,
                              color: g.wd ? "#c62828" : "#8b7355", marginLeft: 6,
                            }}>{g.note}</span>}
                          </div>
                          <span style={{
                            fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355",
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
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12,
              letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase" }}>Team</span>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, color: C.green, fontWeight: 700 }}>
              {entry.teamName}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12,
              letterSpacing: "0.12em", color: "#8b7355", textTransform: "uppercase" }}>Winning Score</span>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, color: C.green, fontWeight: 700 }}>
              {entry.winScore}</div>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12,
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
          <p style={{ fontFamily: "Georgia,serif", fontSize: 15, color: "#d4e9ff", margin: "0 0 12px", lineHeight: 1.5 }}>
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
          <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#a8d4ff", marginTop: 8, margin: "8px 0 0" }}>
            Scan to pay · Include your team name in the note</p>
        </div>

        {/* Share with friends */}
        <button onClick={() => {
          const url = window.location.href;
          const text = `I just joined the Masters Pool 2026! Join before Thursday and pick your team: ${url}`;
          if (navigator.share) {
            navigator.share({ title: "Masters Pool 2026", text, url }).catch(() => {});
          } else {
            navigator.clipboard.writeText(text).then(() => alert("Link copied! Paste it in a text."));
          }
        }} style={{
          marginTop: 16, width: "100%", padding: "12px", borderRadius: 8,
          background: C.green, border: "none", color: "#fff",
          fontFamily: "Georgia,serif", fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>📤 Invite Friends to Join</button>
      </div>
    </div>
  );
}

function Leaderboard({ entries, isLocked, loading, potInfo }) {
  const [expanded, setExpanded] = useState(null);
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pool-starred") || "[]"); } catch { return []; }
  });
  const toggleStar = (name, evt) => {
    evt.stopPropagation();
    setStarred(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      localStorage.setItem("pool-starred", JSON.stringify(next));
      return next;
    });
  };
  const [testMode, setTestMode] = useState(false);
  const [testEntries, setTestEntries] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testLog, setTestLog] = useState([]);

  const runTest = async () => {
    setTestLoading(true);
    const log = [];
    try {
      // Test against whatever tournament the Live tab is using (currently works)
      log.push("📡 Fetching live tournament data (same as ⛳ Live tab)...");
      const res = await fetch(`${SCRIPT_URL}?mode=scores`);
      const data = await res.json();
      if (!data.success) { log.push("❌ ESPN fetch failed: " + (data.error || "unknown")); setTestLog(log); setTestLoading(false); return; }
      
      log.push(`✅ Got ${data.golfers.length} golfers from ${data.tournament}`);
      log.push(`📊 Status: ${data.status} · Round: ${data.round}`);
      
      // Show sample golfer data format
      const sample = data.golfers[0];
      if (sample) {
        log.push(`🏌️ #1: ${sample.name} · Score: ${sample.score} (${sample.scoreValue}) · Rounds: ${sample.rounds.map(r => r.score).join(", ")}`);
        log.push(`   Cut: ${sample.isCut} · State: ${sample.state} · Thru: ${sample.thru}`);
      }
      const sample2 = data.golfers.find(g => g.isCut);
      if (sample2) {
        log.push(`✂️ Cut example: ${sample2.name} · Rounds: ${sample2.rounds.map(r => r.score).join(", ")} · isCut: ${sample2.isCut}`);
      }
      
      // Test name matching against current entries
      if (entries.length > 0) {
        log.push(`\n📋 Scoring ${entries.length} pool entries...`);
        log.push(`ℹ️ Testing against live tournament data — some picks may not match if it's not the Masters.`);
        log.push(`   Validates name matching, scoring, and ranking.\n`);
        const scored = calculatePoolScores(entries, data.golfers, T.par);
        setTestEntries(scored);
        
        scored.forEach((entry, i) => {
          const gs = entry.golferScores || [];
          const matched = gs.filter(g => g.found).length;
          const missed = gs.filter(g => !g.found).map(g => g.name);
          log.push(`\n${i+1}. ${entry.name} — Total: ${entry.totalScore != null ? entry.totalScore : "N/A"} (${entry.totalStrokes || "—"} strokes)`);
          log.push(`   Matched: ${matched}/6 golfers`);
          if (missed.length > 0) log.push(`   ⚠️ NOT FOUND: ${missed.join(", ")}`);
          gs.forEach(g => {
            if (g.found) {
              log.push(`   ${g.found ? "✅" : "❌"} ${g.name} → ${g.totalStrokes} strokes ${g.isCut ? "(CUT)" : ""}`);
            }
          });
        });
      } else {
        log.push("⚠️ No pool entries to score — submit some picks first");
      }
      
      log.push("\n✅ Test complete");
    } catch (err) {
      log.push("❌ Error: " + err.toString());
    }
    setTestLog(log);
    setTestLoading(false);
  };

  const B = {
    bg: "#f5f1e8", board: "#ffffff", headerBg: C.green,
    border: "#d4cdb8", text: "#1a1a1a", yellow: C.yellow,
    red: "#c62828", green: C.green, white: "#fff",
    muted: "#8b7355", rowEven: "#fafaf5", rowOdd: "#ffffff",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, padding: "24px 12px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* LEADERS header */}
        <div style={{
          textAlign: "center", padding: "20px 20px 16px",
          background: B.headerBg, borderRadius: "8px 8px 0 0",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 36, fontWeight: 900, color: B.yellow,
            letterSpacing: "0.15em", textTransform: "uppercase",
            margin: 0, textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            cursor: "default", userSelect: "none",
          }}>LEADERS</h2>
          <p style={{
            fontFamily: "Georgia,serif", fontSize: 14, color: "#c4d9c4",
            letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4,
          }}>{T.year} {T.name} · {entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
          {!isLocked && (
            <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: B.yellow, marginTop: 8 }}>
              ⏳ Scores go live when the tournament starts</p>
          )}
        </div>

        {/* Prize Pool */}
        {potInfo && potInfo.totalPot > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", gap: 12,
            padding: "12px 16px", background: "#fff",
            borderLeft: `1px solid ${B.border}`, borderRight: `1px solid ${B.border}`,
            flexWrap: "wrap",
          }}>
            <div style={{ textAlign: "center", padding: "4px 12px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pot</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, fontWeight: 900, color: B.green }}>${potInfo.totalPot}</div>
            </div>
            <div style={{ width: 1, background: B.border }} />
            <div style={{ textAlign: "center", padding: "4px 12px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted }}>🥇 1st</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: B.green }}>${potInfo.payouts.first}</div>
            </div>
            <div style={{ textAlign: "center", padding: "4px 12px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted }}>🥈 2nd</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: B.green }}>${potInfo.payouts.second}</div>
            </div>
            <div style={{ textAlign: "center", padding: "4px 12px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted }}>🥉 3rd</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: B.green }}>${potInfo.payouts.third}</div>
            </div>
          </div>
        )}

        {/* Starred entries quick view */}
        {starred.length > 0 && (() => {
          // Compute tied positions
          const tiedPositions = [];
          for (let idx = 0; idx < entries.length; idx++) {
            if (idx === 0) { tiedPositions.push(1); }
            else if (entries[idx].totalScore != null && entries[idx].totalScore === entries[idx - 1].totalScore) { tiedPositions.push(tiedPositions[idx - 1]); }
            else { tiedPositions.push(idx + 1); }
          }
          const posCounts = {};
          tiedPositions.forEach(p => { posCounts[p] = (posCounts[p] || 0) + 1; });
          const starredEntries = entries
            .map((e, i) => ({ ...e, pos: tiedPositions[i], posDisplay: (posCounts[tiedPositions[i]] > 1 ? "T" : "") + tiedPositions[i] }))
            .filter(e => starred.includes(e.name));
          if (starredEntries.length === 0) return null;
          return (
            <div style={{
              background: "#fdf6e3", borderRadius: 8, padding: "10px 12px",
              marginBottom: 8, border: `1px solid ${C.yellow}40`,
            }}>
              <div style={{
                fontFamily: "Georgia,serif", fontSize: 11, color: B.muted,
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
              }}>⭐ Watching</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {starredEntries.map((e, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 6,
                    background: "#fff", border: `1px solid ${C.yellow}50`,
                    cursor: "pointer",
                  }} onClick={() => {
                    const idx = entries.findIndex(en => en.name === e.name);
                    if (idx >= 0) setExpanded(expanded === idx ? null : idx);
                  }}>
                    <span style={{
                      fontFamily: "'Playfair Display',Georgia,serif",
                      fontSize: 14, fontWeight: 900, color: B.green,
                    }}>{e.posDisplay}</span>
                    <span style={{
                      fontFamily: "Georgia,serif", fontSize: 13,
                      fontWeight: 600, color: B.text,
                    }}>{e.name}</span>
                    <span style={{
                      fontFamily: "'Playfair Display',Georgia,serif",
                      fontSize: 15, fontWeight: 900,
                      color: isLocked
                        ? (e.totalScore < 0 ? B.red : e.totalScore > 0 ? B.green : B.text)
                        : B.muted,
                    }}>
                      {isLocked ? (e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—") : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Scoreboard — simple 3-column layout */}
        <div style={{
          background: B.board, borderRadius: "0 0 8px 8px",
          overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: `1px solid ${B.border}`,
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "50px 1fr 70px",
            borderBottom: `2px solid ${B.green}`, background: "#f0ebe0",
          }}>
            {["POS", "TEAM", "TOTAL"].map((h, i) => (
              <div key={h} style={{
                padding: "10px 6px", textAlign: i === 1 ? "left" : "center",
                fontFamily: "Georgia,serif", fontSize: 13,
                fontWeight: 700, letterSpacing: "0.1em",
                color: B.green, textTransform: "uppercase",
                borderRight: i < 2 ? `1px solid ${B.border}` : "none",
              }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {(() => {
            // Compute tied positions
            const positions = [];
            for (let idx = 0; idx < entries.length; idx++) {
              if (idx === 0) {
                positions.push(1);
              } else if (entries[idx].totalScore != null && entries[idx].totalScore === entries[idx - 1].totalScore) {
                positions.push(positions[idx - 1]);
              } else {
                positions.push(idx + 1);
              }
            }
            // Determine which positions are tied
            const posCounts = {};
            positions.forEach(p => { posCounts[p] = (posCounts[p] || 0) + 1; });

            return entries.map((e, i) => {
            const isExp = expanded === i;
            const isStarred = starred.includes(e.name);
            const tiedPos = positions[i];
            const isTied = posCounts[tiedPos] > 1;
            const posDisplay = isTied ? "T" + tiedPos : String(tiedPos);
            return (
              <div key={i}>
                <div onClick={() => setExpanded(isExp ? null : i)}
                  style={{
                    display: "grid", gridTemplateColumns: "50px 1fr 70px",
                    borderBottom: `1px solid ${B.border}`,
                    background: isStarred ? "#fdf6e3" : (isExp ? "#f0ebe0" : (i % 2 === 0 ? B.rowEven : B.rowOdd)),
                    cursor: "pointer", transition: "background 0.15s",
                    borderLeft: isStarred ? `3px solid ${B.yellow}` : "3px solid transparent",
                  }}>
                  {/* Position */}
                  <div style={{
                    padding: "12px 6px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: isTied ? 14 : 18, fontWeight: 700,
                    color: tiedPos <= 3 ? B.green : B.muted,
                    borderRight: `1px solid ${B.border}`,
                  }}>
                    {tiedPos === 1 && !isTied ? (
                      <span title="Green Jacket" style={{
                        display: "inline-block", width: 28, height: 28, lineHeight: "28px",
                        borderRadius: "50%", background: B.green, color: B.yellow,
                        fontSize: 14, fontWeight: 900, textAlign: "center",
                      }}>1</span>
                    ) : tiedPos === 1 && isTied ? "T1"
                      : tiedPos === 2 && !isTied ? "🥈"
                      : tiedPos === 3 && !isTied ? "🥉"
                      : posDisplay}
                  </div>

                  {/* Team name + person */}
                  <div style={{
                    padding: "10px 12px",
                    borderRight: `1px solid ${B.border}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span onClick={(evt) => toggleStar(e.name, evt)} style={{
                        fontSize: 14, cursor: "pointer", flexShrink: 0,
                        opacity: isStarred ? 1 : 0.3,
                      }}>{isStarred ? "⭐" : "☆"}</span>
                      <span style={{
                        fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700,
                        color: B.text, textTransform: "uppercase",
                        letterSpacing: "0.02em", lineHeight: 1.2,
                      }}>{e.name}</span>
                    </div>
                    <div style={{
                      fontFamily: "Georgia,serif", fontSize: 13,
                      color: B.muted, marginTop: 2,
                    }}>
                      {e.fullName || ""}
                      {(() => {
                        const onSite = ["alan collins","patty collins","griffin collins","cason collins","stuart collins","ross gray","blake desmarteau","jenna lawrence","bill lawrence","cindy lawrence","dave lawrence","megan mahoney","jae mccaskill"];
                        const name = (e.fullName || "").toLowerCase();
                        return onSite.some(n => name.includes(n))
                          ? <span style={{ marginLeft: 6, fontSize: 11, color: C.green, fontWeight: 600 }}>📍 At Augusta</span>
                          : null;
                      })()}
                      {!isLocked && " · 🔒"}
                      {isLocked && !isExp && " · tap for picks"}
                    </div>
                  </div>

                  {/* Total score */}
                  <div style={{
                    padding: "12px 6px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif",
                    fontSize: 22, fontWeight: 900,
                    color: isLocked
                      ? (e.totalScore < 0 ? B.red : e.totalScore > 0 ? B.green : B.text)
                      : B.muted,
                  }}>
                    {isLocked ? (e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—") : "—"}
                  </div>
                </div>

                {/* Expanded picks row */}
                {isExp && (
                  <div style={{
                    padding: "12px 16px",
                    background: "#f0ebe0",
                    borderBottom: `1px solid ${B.border}`,
                  }}>
                    {isLocked ? (
                      <>
                        <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: B.muted,
                          margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Golfers</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {(e.golferScores || e.picks.map(p => ({ name: p })))
                            .slice()
                            .sort((a, b) => {
                              const aScore = a.scoreToPar != null ? a.scoreToPar : 999;
                              const bScore = b.scoreToPar != null ? b.scoreToPar : 999;
                              return aScore - bScore;
                            })
                            .map((gs, j) => {
                            const hasScore = gs.scoreToPar != null;
                            // Determine if this golfer is in the best 4
                            const allScores = (e.golferScores || [])
                              .map(g => g.scoreToPar).filter(s => s != null).sort((a,b) => a - b);
                            const best4Threshold = allScores.length >= 4 ? allScores[3] : Infinity;
                            const isInBest4 = hasScore && gs.scoreToPar <= best4Threshold;
                            const scoreToPar = gs.scoreToPar;
                            
                            return (
                              <div key={j} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "5px 10px", borderRadius: 6,
                                background: isInBest4 ? `${B.green}10` : (gs.isCut ? "#fff5f5" : B.white),
                                border: `1px solid ${isInBest4 ? B.green + "30" : B.border}`,
                                opacity: !isInBest4 && hasScore ? 0.6 : 1,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  {isInBest4 && <span style={{ color: B.green, fontSize: 10 }}>✓</span>}
                                  <span style={{ fontFamily: "Georgia,serif", fontSize: 13,
                                    color: B.text, fontWeight: isInBest4 ? 600 : 400 }}>
                                    {gs.name || (e.picks && e.picks[j]) || ""}
                                  </span>
                                  {gs.isCut && <span style={{ fontSize: 10, color: B.red, marginLeft: 4 }}>CUT</span>}
                                  {gs.thru > 0 && gs.thru < 18 && <span style={{ fontSize: 10, color: B.muted, marginLeft: 4 }}>thru {gs.thru}</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {hasScore && (
                                    <span style={{
                                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
                                      color: scoreToPar < 0 ? B.red : scoreToPar > 0 ? B.green : B.text,
                                    }}>{scoreToPar < 0 ? scoreToPar : scoreToPar > 0 ? `+${scoreToPar}` : "E"}</span>
                                  )}
                                  {gs.today && (
                                    <span style={{ fontFamily: "Georgia,serif", fontSize: 11, color: B.muted }}>
                                      ({gs.today})
                                    </span>
                                  )}
                                  {!hasScore && <span style={{ fontFamily: "Georgia,serif", fontSize: 12, color: B.muted }}>—</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10,
                          padding: "6px 10px", borderRadius: 6, background: `${B.green}08` }}>
                          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: B.muted }}>
                            Best 4 of 6 · Predicted: {e.winScore}</span>
                          {e.totalScore != null && (
                            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
                              color: e.totalScore < 0 ? B.red : e.totalScore > 0 ? B.green : B.text }}>
                              Total: {e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E"}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p style={{
                        fontFamily: "Georgia,serif", fontSize: 13, color: B.green,
                        margin: 0, textAlign: "center", fontWeight: 600,
                      }}>🔒 Picks are hidden until the tournament starts</p>
                    )}
                  </div>
                )}
              </div>
            );
          });
          })()}

          {entries.length === 0 && (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: B.muted }}>
                {loading ? "⏳ Loading entries..." : "No entries yet — be the first!"}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: B.muted }}>
            📡 <a href={`https://www.espn.com/golf/leaderboard/_/tournamentId/${T.espnId}`}
              target="_blank" rel="noopener" style={{ color: B.green }}>ESPN Leaderboard</a>
            {" · "}{isLocked ? "Tap a row to see picks" : "🔒 Picks hidden until first tee"}
          </p>
        </div>

        {/* Test results panel */}
        {testMode && (
          <div style={{
            marginTop: 16, background: "#1a1a2e", borderRadius: 12, padding: 20,
            border: "1px solid #333", maxHeight: 500, overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: "#ff9800" }}>
                🧪 Scoring Engine Test — Live Data</span>
              <button onClick={runTest} disabled={testLoading} style={{
                padding: "4px 12px", borderRadius: 12, border: "1px solid #555",
                background: "#333", color: "#fff", fontSize: 11, cursor: "pointer",
                fontFamily: "Georgia,serif",
              }}>{testLoading ? "Running..." : "🔄 Re-run"}</button>
            </div>
            
            {testLoading && (
              <p style={{ fontFamily: "monospace", fontSize: 12, color: "#aaa" }}>⏳ Fetching ESPN data...</p>
            )}
            
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
              {testLog.map((line, i) => (
                <div key={i} style={{
                  color: line.startsWith("❌") ? "#ef5350"
                    : line.startsWith("✅") ? "#66bb6a"
                    : line.startsWith("⚠️") ? "#ffa726"
                    : line.startsWith("🏌️") || line.startsWith("✂️") ? "#42a5f5"
                    : line.includes("Total:") ? "#fff"
                    : "#aaa",
                  borderBottom: line.startsWith("\n") ? "1px solid #333" : "none",
                  paddingTop: line.startsWith("\n") ? 6 : 0,
                  whiteSpace: "pre-wrap",
                }}>{line}</div>
              ))}
            </div>

            {testEntries.length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid #333", paddingTop: 12 }}>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: "#ff9800", marginBottom: 8 }}>
                  Test Rankings (live tournament scores applied to your entries)</p>
                {testEntries.map((e, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 8px", borderRadius: 6,
                    background: i === 0 ? "rgba(102,187,106,0.15)" : "transparent",
                    marginBottom: 2,
                  }}>
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#fff" }}>
                      {i === 0 ? "🏆 " : `${i+1}. `}{e.name}
                      <span style={{ color: "#888", marginLeft: 6, fontSize: 10 }}>
                        ({(e.golferScores || []).filter(g => g.found).length}/6 matched)
                      </span>
                    </span>
                    <span style={{
                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
                      color: e.totalScore != null
                        ? (e.totalScore < 0 ? "#ef5350" : e.totalScore > 0 ? "#66bb6a" : "#fff")
                        : "#555",
                    }}>
                      {e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—"}
                      <span style={{ fontSize: 10, color: "#888", marginLeft: 4 }}>({e.totalStrokes || "—"})</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MastersExperience() {
  const sandwiches = [
    ["Egg Salad", "1.50", "https://pizzazzerie.com/recipes/masters-egg-salad/"],
    ["Pimento Cheese", "1.50", "https://golf.com/lifestyle/food/how-make-augusta-nationals-famous-pimento-cheese-sandwich/"],
    ["Bar-B-Que", "2.50"], ["Masters Club", "2.50"], ["Chicken Breast", "2.50"],
    ["Ham & Cheese on Rye", "1.50"], ["Tuna Salad", "1.50"], ["Turkey", "1.50"],
  ];
  const beverages = [
    ["Soft Drinks", "1.00"], ["Bottled Water", "1.50"], ["Iced Tea", "1.50"],
    ["Domestic Beer", "2.75"], ["Import Beer", "3.50"],
  ];
  const snacks = [
    ["Candy", "1.00"], ["Chips / Crackers", "1.00"], ["Peanuts", "1.00"],
    ["Cookie", "1.00"], ["Ice Cream Bar", "2.00"],
  ];

  const channelUrls = {
    "Masters.com": "https://www.masters.com/en_US/live/index.html",
    "ESPN": "https://www.espn.com/watch/",
    "ESPN App": "https://www.espn.com/watch/",
    "Prime Video": "https://www.amazon.com/gp/video/offers",
    "Paramount+": "https://www.paramountplus.com",
    "CBS": "https://www.cbs.com",
  };

  const schedule = [
    { day: "WED 4/8", link: "https://www.masters.com/en_US/live/index.html", events: [
      ["Par 3 Contest", "12–4 PM", "ESPN"],
      ["Par 3 Contest", "12–4 PM", "Masters.com"],
    ]},
    { day: "THU 4/9 — Round 1", link: "https://www.masters.com/coverage/day1/index.html", events: [
      ["Honorary Starters", "7:30 AM", "Masters.com"],
      ["Holes 4, 5 & 6", "8:45 AM", "Masters.com"],
      ["Featured Groups", "9:15 AM", "Masters.com"],
      ["Amen Corner", "10:45 AM", "Masters.com"],
      ["Holes 15 & 16", "11:45 AM", "Masters.com"],
      ["Round 1", "1–3 PM", "Prime Video"],
      ["Round 1", "3–7:30 PM", "ESPN"],
    ]},
    { day: "FRI 4/10 — Round 2", link: "https://www.masters.com/coverage/day2/index.html", events: [
      ["Holes 4, 5 & 6", "8:45 AM", "Masters.com"],
      ["Featured Groups", "9:15 AM", "Masters.com"],
      ["Amen Corner", "10:45 AM", "Masters.com"],
      ["Holes 15 & 16", "11:45 AM", "Masters.com"],
      ["Round 2", "1–3 PM", "Prime Video"],
      ["Round 2", "3–7:30 PM", "ESPN"],
    ]},
    { day: "SAT 4/11 — Round 3", link: "https://www.masters.com/coverage/day3/index.html", events: [
      ["Featured Groups", "10:15 AM", "Masters.com"],
      ["Amen Corner", "11:45 AM", "Masters.com"],
      ["Holes 15 & 16", "11:45 AM", "Masters.com"],
      ["Round 3", "12–2 PM", "Paramount+"],
      ["Round 3", "2–7 PM", "CBS"],
    ]},
    { day: "SUN 4/12 — Final Round", link: "https://www.masters.com/coverage/day4/index.html", events: [
      ["Featured Groups", "10:15 AM", "Masters.com"],
      ["Amen Corner", "11:45 AM", "Masters.com"],
      ["Holes 15 & 16", "11:45 AM", "Masters.com"],
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
      {items.map(([name, price, url], i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", padding: "2px 0",
          fontFamily: "Georgia,serif", fontSize: 14, color: "#333",
        }}>
          {url ? (
            <a href={url} target="_blank" rel="noopener" style={{
              color: C.green, textDecoration: "underline", textUnderlineOffset: 2,
            }}>{name} 📖</a>
          ) : <span>{name}</span>}
          <span>{price}</span>
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
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
        }} className="masters-panels">
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
                  {day.link ? (
                    <a href={day.link} target="_blank" rel="noopener" style={{
                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 13,
                      fontWeight: 700, color: C.green, marginBottom: 4,
                      borderBottom: `1px solid ${C.sand}`, paddingBottom: 3,
                      display: "block", textDecoration: "none",
                    }}>{day.day} ↗</a>
                  ) : (
                    <div style={{
                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 13,
                      fontWeight: 700, color: C.green, marginBottom: 4,
                      borderBottom: `1px solid ${C.sand}`, paddingBottom: 3,
                    }}>{day.day}</div>
                  )}
                  {day.events.map(([name, time, channel], ei) => (
                    <div key={ei} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "3px 0", gap: 4,
                    }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: "#333", flex: 1 }}>{name}</span>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#8b7355", whiteSpace: "nowrap" }}>{time}</span>
                      <a href={channelUrls[channel] || "#"} target="_blank" rel="noopener" style={{
                        fontFamily: "Georgia,serif", fontSize: 11, color: C.green,
                        background: `${C.green}10`, padding: "1px 5px", borderRadius: 4,
                        fontWeight: 600, whiteSpace: "nowrap", textDecoration: "none",
                      }}>{channel} ↗</a>
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
              {/* Cocktail illustration */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <svg width="80" height="100" viewBox="0 0 80 100" style={{ display: "inline-block" }}>
                  {/* Glass */}
                  <polygon points="15,15 65,15 50,60 30,60" fill="none" stroke="#006747" strokeWidth="2"/>
                  {/* Liquid */}
                  <polygon points="18,20 62,20 50,58 30,58" fill="url(#azaleaGrad)" opacity="0.8"/>
                  {/* Gradient */}
                  <defs>
                    <linearGradient id="azaleaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b9d"/>
                      <stop offset="100%" stopColor="#ff1744"/>
                    </linearGradient>
                  </defs>
                  {/* Stem */}
                  <line x1="40" y1="60" x2="40" y2="85" stroke="#006747" strokeWidth="2"/>
                  {/* Base */}
                  <ellipse cx="40" cy="87" rx="16" ry="4" fill="none" stroke="#006747" strokeWidth="2"/>
                  {/* Garnish - cherry */}
                  <circle cx="52" cy="18" r="5" fill="#c62828"/>
                  <line x1="52" y1="13" x2="56" y2="6" stroke="#2e7d32" strokeWidth="1.5"/>
                  {/* Orange slice */}
                  <path d="M58,22 A8,8 0 0 1 66,14" fill="none" stroke="#ff9800" strokeWidth="2.5" strokeLinecap="round"/>
                  {/* Tiny bubbles */}
                  <circle cx="35" cy="40" r="1.5" fill="rgba(255,255,255,0.5)"/>
                  <circle cx="42" cy="35" r="1" fill="rgba(255,255,255,0.4)"/>
                  <circle cx="38" cy="48" r="1" fill="rgba(255,255,255,0.3)"/>
                </svg>
              </div>
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
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: "#333" }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 14, padding: "10px 12px", borderRadius: 6,
                background: `${C.green}08`, border: `1px solid ${C.green}20`,
              }}>
                <p style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.dark,
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

          {/* PANEL 4: Patron Rules */}
          <div style={{
            background: "rgba(255,255,255,0.97)", borderRadius: 4, overflow: "hidden",
            border: `2px solid ${C.dark}`, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{ background: C.dark, padding: "8px 16px", textAlign: "center" }}>
              <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15,
                color: C.yellow, margin: 0 }}>🤫 Patron Rules</h4>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 15,
                color: C.dark, fontStyle: "italic", lineHeight: 1.5,
                margin: "0 0 12px", textAlign: "center",
              }}>A tradition unlike any other</p>
              {[
                ["🤫", "Silence during all shots"],
                ["📵", "No cell phones on the course"],
                ["📷", "No cameras or recording"],
                ["🏃", "No running — ever"],
                ["🪑", "No lawn chairs (use theirs)"],
                ["👔", "No shorts above the knee"],
                ["🚫", "No flags, banners, or signs"],
                ["🗣️", "They're \"patrons\" not \"fans\""],
                ["🛌", "No lying down on the grounds"],
                ["👏", "Polite applause only"],
              ].map(([icon, rule], i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 8px", borderRadius: 6,
                  background: i % 2 === 0 ? `${C.green}06` : "transparent",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#333" }}>{rule}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "6px 16px", background: "#fafaf7", borderTop: `1px solid ${C.sand}` }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#999",
                textAlign: "center", fontStyle: "italic", margin: 0 }}>Violators will be escorted off the premises.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentLive() {
  const [golfers, setGolfers] = useState([]);
  const [tourneyStatus, setTourneyStatus] = useState("");
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState("");

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?mode=scores`);
      const data = await res.json();
      if (data.success) {
        setGolfers(data.golfers || []);
        setTourneyStatus(data.status || "");
        setRound(data.round || 0);
        setLastUpdated(new Date().toLocaleTimeString());
        setError("");
      } else {
        setError(data.error || "Failed to load scores");
      }
    } catch (e) {
      setError("Couldn't reach scoring server");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScores();
    const id = setInterval(fetchScores, 60000);
    return () => clearInterval(id);
  }, [fetchScores]);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "24px 12px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: C.green, margin: "0 0 4px" }}>
            ⛳ Live Tournament</h2>
          <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 16, color: "#8b7355",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>{T.year} {T.name} — Augusta National</p>
          {tourneyStatus && (
            <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: C.green, marginTop: 4 }}>
              {tourneyStatus}{round > 0 ? ` · Round ${round}` : ""}</p>
          )}
        </div>

        {/* Watch Live Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.dark})`,
          borderRadius: 12, padding: "18px 20px", marginBottom: 16, textAlign: "center",
        }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
            color: C.yellow, margin: "0 0 10px" }}>📺 Watch Live</h3>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.masters.com/en_US/live/index.html" target="_blank" rel="noopener" style={{
              padding: "8px 18px", borderRadius: 8, background: C.yellow, color: C.dark,
              fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
              textDecoration: "none",
            }}>▶ Masters.com</a>
            <a href="https://www.youtube.com/@themasters/streams" target="_blank" rel="noopener" style={{
              padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
              fontFamily: "Georgia,serif", fontSize: 13, textDecoration: "none",
            }}>📹 YouTube</a>
            <a href="https://www.espn.com/watch/" target="_blank" rel="noopener" style={{
              padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
              fontFamily: "Georgia,serif", fontSize: 13, textDecoration: "none",
            }}>ESPN+</a>
          </div>
        </div>

        {/* YouTube Live Embed */}
        <div style={{
          background: "#000", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          marginBottom: 16, position: "relative", paddingTop: "56.25%",
        }}>
          <iframe
            src="https://www.youtube.com/embed/OApSh_daggc?autoplay=0&rel=0"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Masters Live Stream"
          />
        </div>

        {/* Live Leaderboard */}
        <div style={{
          background: "#fff", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", border: `1px solid ${C.sand}`,
          marginBottom: 16,
        }}>
          <div style={{
            background: C.green, padding: "10px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16,
              fontWeight: 700, color: C.yellow }}>Masters Leaderboard</span>
            <span style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#c4d9c4" }}>
              {lastUpdated ? `Updated ${lastUpdated}` : "Loading..."}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#999" }}>⏳ Loading scores...</p>
            </div>
          ) : error ? (
            <div style={{ padding: 30, textAlign: "center" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#999" }}>{error}</p>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#bbb", marginTop: 6 }}>
                Scores will appear once the tournament starts Thursday.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {/* Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "50px 1fr 60px 60px 60px",
                background: "#f0ebe0", borderBottom: `2px solid ${C.green}`,
                minWidth: 500,
              }}>
                {["POS", "PLAYER", "SCORE", "TODAY", "THRU"].map(h => (
                  <div key={h} style={{
                    padding: "8px 6px", textAlign: "center",
                    fontFamily: "Georgia,serif", fontSize: 10, fontWeight: 700,
                    color: C.green, letterSpacing: "0.08em",
                  }}>{h}</div>
                ))}
              </div>
              {/* Rows */}
              {golfers.slice(0, 40).map((g, i) => (
                <div key={g.id || i} style={{
                  display: "grid", gridTemplateColumns: "50px 1fr 60px 60px 60px",
                  borderBottom: `1px solid ${C.sand}`,
                  background: i % 2 === 0 ? "#fafaf5" : "#fff",
                  minWidth: 500,
                  opacity: g.isCut ? 0.5 : 1,
                }}>
                  <div style={{ padding: "8px 6px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700,
                    color: i < 3 ? C.green : "#8b7355",
                  }}>{g.position || i + 1}</div>
                  <div style={{ padding: "8px 6px",
                    fontFamily: "Georgia,serif", fontSize: 15, color: "#333",
                    fontWeight: i < 5 ? 600 : 400,
                  }}>
                    {g.name}
                    {g.isCut && <span style={{ fontSize: 10, color: "#c62828", marginLeft: 6 }}>CUT</span>}
                  </div>
                  <div style={{ padding: "8px 6px", textAlign: "center",
                    fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, fontWeight: 700,
                    color: g.scoreValue < 0 ? "#c62828" : g.scoreValue > 0 ? C.green : "#333",
                  }}>{g.score}</div>
                  <div style={{ padding: "8px 6px", textAlign: "center",
                    fontFamily: "Georgia,serif", fontSize: 13,
                    color: g.today && g.today.startsWith("-") ? "#c62828" : "#8b7355",
                  }}>{g.today || "—"}</div>
                  <div style={{ padding: "8px 6px", textAlign: "center",
                    fontFamily: "Georgia,serif", fontSize: 12, color: "#8b7355",
                  }}>{g.thru || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            ["🏌️", "Masters.com", "Official Site", "https://www.masters.com"],
            ["📊", "ESPN", "Coverage", "https://www.espn.com/golf/leaderboard/_/tournamentId/" + T.espnId],
            ["🗺️", "Course Map", "Augusta", "https://www.masters.com/en_US/course/index.html"],
          ].map(([icon, title, sub, url], i) => (
            <a key={i} href={url} target="_blank" rel="noopener" style={{
              background: "#fff", borderRadius: 10, padding: "12px",
              textAlign: "center", textDecoration: "none",
              border: `1px solid ${C.sand}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{icon}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 14, color: C.green, fontWeight: 600 }}>{title}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#8b7355" }}>{sub}</div>
            </a>
          ))}
        </div>

        {/* Refresh button */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={() => { setLoading(true); fetchScores(); }} style={{
            background: "none", border: `1px solid ${C.sand}`, borderRadius: 20,
            padding: "6px 16px", fontFamily: "Georgia,serif", fontSize: 12,
            color: C.green, cursor: "pointer",
          }}>🔄 Refresh Scores</button>
        </div>
      </div>
    </div>
  );
}

/*─────────────────────────────────────────────
  SCORING ENGINE
  Takes pool entries + ESPN golfer data, calculates
  best-4-of-6 totals and ranks entries.
─────────────────────────────────────────────*/
const PAR = 72;
const CUT_ROUND_SCORE = 80;

// Strip accents for name matching: Åberg→Aberg, García→Garcia, Højgaard→Hojgaard
function stripAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ø/g, "o").replace(/Ø/g, "O");
}

function matchGolfer(pickName, espnGolfers) {
  if (!pickName || !espnGolfers.length) return null;
  const pick = stripAccents(pickName.toLowerCase().trim());
  // Try exact match (with accent stripping)
  let match = espnGolfers.find(g => stripAccents(g.name.toLowerCase()) === pick);
  if (match) return match;
  // Try last name match
  const pickLast = pick.split(" ").pop();
  const lastMatches = espnGolfers.filter(g => stripAccents(g.lastName.toLowerCase()) === pickLast);
  if (lastMatches.length === 1) return lastMatches[0];
  // Try first+last contains
  match = espnGolfers.find(g => stripAccents(g.name.toLowerCase()).includes(pick) || pick.includes(stripAccents(g.name.toLowerCase())));
  if (match) return match;
  // Try last name contains
  match = espnGolfers.find(g => stripAccents(g.lastName.toLowerCase()).includes(pickLast) || pickLast.includes(stripAccents(g.lastName.toLowerCase())));
  return match || null;
}

function getGolferTotalStrokes(golfer) {
  if (!golfer) return CUT_ROUND_SCORE * 4; // Unknown golfer = worst case
  const rounds = golfer.rounds || [];
  let total = 0;
  const completedRounds = rounds.length;
  
  for (let i = 0; i < 4; i++) {
    if (i < completedRounds && rounds[i] && rounds[i].score != null) {
      total += rounds[i].score;
    } else if (golfer.isCut && i >= 2) {
      // Cut after R2: give 80 for R3 and R4
      total += CUT_ROUND_SCORE;
    } else if (golfer.state === "withdrawn" || golfer.state === "disqualified") {
      total += CUT_ROUND_SCORE;
    } else {
      // Round not yet played — don't count it yet
      // During tournament, only count completed rounds
      total += 0;
    }
  }
  
  // If golfer has 0 completed rounds, return null (tournament hasn't started for them)
  if (completedRounds === 0 && !golfer.isCut) return null;
  return total;
}

function calculatePoolScores(entries, espnGolfers, par) {
  if (!espnGolfers || espnGolfers.length === 0) return entries;
  
  // Find the winning score for tiebreaker
  const winner = espnGolfers[0];
  const winningScore = winner ? winner.scoreValue : 0;
  
  const scored = entries.map(entry => {
    const picks = entry.picks || [];
    const golferScores = picks.map(pickName => {
      const golfer = matchGolfer(pickName, espnGolfers);
      // Use ESPN's live scoreValue (score-to-par) — updates hole by hole
      const scoreToPar = golfer ? golfer.scoreValue : null;
      const totalStrokes = getGolferTotalStrokes(golfer);
      return {
        name: pickName,
        golfer: golfer,
        totalStrokes: totalStrokes,
        scoreToPar: scoreToPar,
        found: !!golfer,
        isCut: golfer ? golfer.isCut : false,
        score: golfer ? golfer.score : "—",
        thru: golfer ? golfer.thru : 0,
        today: golfer ? golfer.today : "",
      };
    });
    
    // Use live score-to-par for ranking (updates every hole)
    const validScoresToPar = golferScores
      .map(gs => gs.scoreToPar)
      .filter(s => s != null)
      .sort((a, b) => a - b);
    
    // Best 4 of 6
    const best4 = validScoresToPar.slice(0, 4);
    const totalScore = best4.length > 0 ? best4.reduce((a, b) => a + b, 0) : null;
    
    // Also compute total strokes for tiebreaker (scorecard playoff)
    const validStrokes = golferScores
      .map(gs => gs.totalStrokes)
      .filter(s => s != null)
      .sort((a, b) => a - b);
    const totalStrokes = validStrokes.length > 0 ? validStrokes.slice(0, 4).reduce((a, b) => a + b, 0) : null;
    
    // Tiebreaker: distance from predicted winning score to actual
    const tbDistance = entry.winScore != null ? Math.abs(entry.winScore - winningScore) : 999;
    
    // Sorted individual scores for scorecard playoff tiebreaker
    const sortedIndividual = golferScores
      .map(gs => gs.scoreToPar)
      .filter(s => s != null)
      .sort((a, b) => a - b);
    
    return {
      ...entry,
      golferScores,
      totalStrokes,
      totalScore,
      tbDistance,
      best4Count: best4.length,
      sortedIndividual,
    };
  });
  
  // Sort: lowest totalScore first, then tiebreakers
  scored.sort((a, b) => {
    if (a.totalScore == null && b.totalScore == null) return 0;
    if (a.totalScore == null) return 1;
    if (b.totalScore == null) return -1;
    // 1. Lowest total score
    if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
    // 2. Closest winning score prediction
    if (a.tbDistance !== b.tbDistance) return a.tbDistance - b.tbDistance;
    // 3. Scorecard playoff — compare best individual golfer, then 2nd best, etc.
    const aScores = a.sortedIndividual || [];
    const bScores = b.sortedIndividual || [];
    for (let i = 0; i < Math.max(aScores.length, bScores.length); i++) {
      const aVal = aScores[i] != null ? aScores[i] : 999;
      const bVal = bScores[i] != null ? bScores[i] : 999;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  });
  
  return scored;
}

/*─────────────────────────────────────────────
  APP
─────────────────────────────────────────────*/
function JpjmChat() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [chatName, setChatName] = useState(() => localStorage.getItem("jpjm-name") || "");
  const [sending, setSending] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?mode=chat`);
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 15000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !chatName.trim() || sending) return;
    setSending(true);
    try {
      const params = new URLSearchParams({
        mode: "chatpost",
        name: chatName.trim(),
        message: newMsg.trim(),
      });
      await fetch(`${SCRIPT_URL}?${params.toString()}`);
      setNewMsg("");
      localStorage.setItem("jpjm-name", chatName.trim());
      setTimeout(fetchMessages, 500);
    } catch {}
    setSending(false);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div style={{
      textAlign: "center",
    }}>
      <h3 style={{
        fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20,
        color: C.yellow, margin: "0 0 4px", textAlign: "center",
      }}>🗣️ Trash Talk</h3>
      <p style={{
        fontFamily: "Georgia,serif", fontSize: 12, color: "#5a8a5a",
        textAlign: "center", margin: "0 0 16px", fontStyle: "italic",
      }}>Family only. What happens at Augusta stays at Augusta.</p>

      {/* Messages */}
      <div style={{
        background: "rgba(0,0,0,0.2)", borderRadius: 12,
        padding: "12px", maxHeight: 350, overflowY: "auto",
        marginBottom: 12, border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {messages.length === 0 && (
          <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: "#5a8a5a",
            textAlign: "center", padding: 20 }}>No messages yet. Start the trash talk.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 10, padding: "8px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 13,
                fontWeight: 700, color: C.yellow,
              }}>{m.name}</span>
              <span style={{
                fontFamily: "Georgia,serif", fontSize: 10, color: "#5a8a5a",
              }}>{formatTime(m.timestamp)}</span>
            </div>
            <p style={{
              fontFamily: "Georgia,serif", fontSize: 14, color: "#d4e0d4",
              margin: 0, lineHeight: 1.4, wordBreak: "break-word",
            }}>{m.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Name input (first time) */}
      {!chatName && !showNameInput && (
        <button onClick={() => setShowNameInput(true)} style={{
          width: "100%", padding: 12, borderRadius: 8,
          background: C.green, border: "none", color: "#fff",
          fontFamily: "Georgia,serif", fontSize: 14, cursor: "pointer",
        }}>Join the Chat</button>
      )}
      {showNameInput && !chatName && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input type="text" placeholder="Your name" maxLength={20}
            onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { setChatName(e.target.value.trim()); localStorage.setItem("jpjm-name", e.target.value.trim()); }}}
            style={{
              flex: 1, padding: 10, borderRadius: 8, border: "none",
              fontSize: 14, fontFamily: "Georgia,serif", background: "rgba(255,255,255,0.1)",
              color: "#fff", outline: "none",
            }} />
          <button onClick={() => {
            const input = document.querySelector('input[placeholder="Your name"]');
            if (input?.value.trim()) { setChatName(input.value.trim()); localStorage.setItem("jpjm-name", input.value.trim()); }
          }} style={{
            padding: "10px 16px", borderRadius: 8, background: C.yellow,
            border: "none", color: C.dark, fontFamily: "Georgia,serif",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>Go</button>
        </div>
      )}

      {/* Message input */}
      {chatName && (
        <div>
          <div style={{
            fontFamily: "Georgia,serif", fontSize: 11, color: "#5a8a5a",
            marginBottom: 6, display: "flex", justifyContent: "space-between",
          }}>
            <span>Chatting as <strong style={{ color: C.yellow }}>{chatName}</strong></span>
            <span onClick={() => { setChatName(""); setShowNameInput(true); localStorage.removeItem("jpjm-name"); }}
              style={{ cursor: "pointer", textDecoration: "underline" }}>change</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Talk your trash..." maxLength={280}
              style={{
                flex: 1, padding: 10, borderRadius: 8, border: "none",
                fontSize: 14, fontFamily: "Georgia,serif",
                background: "rgba(255,255,255,0.1)", color: "#fff", outline: "none",
              }} />
            <button onClick={sendMessage} disabled={!newMsg.trim() || sending}
              style={{
                padding: "10px 18px", borderRadius: 8,
                background: newMsg.trim() ? C.yellow : "rgba(255,255,255,0.1)",
                border: "none", color: C.dark,
                fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700,
                cursor: newMsg.trim() ? "pointer" : "default",
              }}>{sending ? "..." : "Send"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const getInitialView = () => {
    const hash = window.location.hash.replace("#", "");
    return ["home","picks","leaderboard","tournament","confirmed","jpjm"].includes(hash) ? hash : "home";
  };
  const [view, _setView] = useState(getInitialView);
  const setView = (v) => {
    _setView(v);
    window.location.hash = v === "home" ? "" : v;
  };
  const [entry, setEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [espnGolfers, setEspnGolfers] = useState([]);
  const [scoredEntries, setScoredEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [potInfo, setPotInfo] = useState({ totalPot: 0, payouts: { first: 0, second: 0, third: 0 } });
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
            family: e.family || false,
          })));
          if (data.totalPot != null) {
            setPotInfo({
              totalPot: data.totalPot,
              payouts: data.payouts || { first: 0, second: 0, third: 0 },
            });
          }
        }
      } catch (err) {
        console.warn("Sheet fetch failed, falling back to localStorage:", err);
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

  // Fetch ESPN scores when locked (tournament in progress)
  useEffect(() => {
    if (!isLocked) return;
    const fetchScores = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?mode=scores`);
        const data = await res.json();
        if (data.success && data.golfers) {
          setEspnGolfers(data.golfers);
        }
      } catch (err) {
        console.warn("ESPN fetch failed:", err);
      }
    };
    fetchScores();
    const interval = setInterval(fetchScores, 120000); // every 2 min during tournament
    return () => clearInterval(interval);
  }, [isLocked]);

  // Recalculate scores whenever entries or ESPN data changes
  useEffect(() => {
    if (isLocked && espnGolfers.length > 0) {
      const scored = calculatePoolScores(entries, espnGolfers, T.par);
      setScoredEntries(scored);
    } else {
      setScoredEntries(entries);
    }
  }, [entries, espnGolfers, isLocked]);

  // Refetch entries when switching to leaderboard
  useEffect(() => {
    if (view === "leaderboard") {
      (async () => {
        try {
          const res = await fetch(SCRIPT_URL);
          const data = await res.json();
          if (data.success && data.entries) {
            setEntries(data.entries.map(e => ({
              name: e.teamName, email: e.email, picks: e.picks, winScore: e.winningScore, fullName: e.fullName || "", family: e.family || false,
            })));
            if (data.totalPot != null) {
              setPotInfo({ totalPot: data.totalPot, payouts: data.payouts || { first: 0, second: 0, third: 0 } });
            }
          }
        } catch {}
      })();
    }
  }, [view]);

  const handleComplete = (data) => {
    setEntry(data);
    // Match against masked email format from the sheet
    const maskedEmail = data.email ? data.email.charAt(0) + "***@" + data.email.split("@")[1] : "";
    setEntries(prev => {
      const idx = prev.findIndex(e =>
        e.name === data.teamName ||
        e.email === data.email ||
        e.email === maskedEmail
      );
      const ne = { name: data.teamName, email: data.email, picks: data.picks, winScore: data.winScore, fullName: data.fullName };
      if (idx >= 0) { const u = [...prev]; u[idx] = ne; return u; }
      return [...prev, ne];
    });
    // Refetch from sheet quickly to get ground truth
    setTimeout(async () => {
      try {
        const res = await fetch(SCRIPT_URL);
        const d = await res.json();
        if (d.success && d.entries) {
          setEntries(d.entries.map(e => ({
            name: e.teamName, email: e.email, picks: e.picks, winScore: e.winningScore, fullName: e.fullName || "", family: e.family || false,
          })));
        }
      } catch {}
    }, 4000);
    setView("confirmed");
  };

  const [showGreeting, setShowGreeting] = useState(() => {
    const seen = localStorage.getItem("greeting-seen");
    if (seen === new Date().toDateString()) return false;
    return true;
  });
  const [greetingTapped, setGreetingTapped] = useState(false);

  const handleGreetingTap = useCallback(() => {
    if (!greetingTapped) {
      setGreetingTapped(true);
      localStorage.setItem("greeting-seen", new Date().toDateString());
      try {
        const base = import.meta.env.BASE_URL || "/";
        const audio = new Audio(`${base}masters-greeting.mp3`);
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch {}
      setTimeout(() => setShowGreeting(false), 3500);
    } else {
      setShowGreeting(false);
    }
  }, [greetingTapped]);

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { opacity: 0.93; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 4px; }
        @keyframes greetFade { 0% { opacity: 1; } 60% { opacity: 1; } 100% { opacity: 0; transform: scale(1.02); } }
        @keyframes jacketGlow { 0%,100% { text-shadow: 0 0 8px rgba(0,103,71,0.3); } 50% { text-shadow: 0 0 20px rgba(0,103,71,0.6), 0 0 40px rgba(242,201,76,0.3); } }
        @media (max-width: 700px) {
          .pool-board { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pool-board > div { min-width: 700px; }
          .masters-panels { grid-template-columns: 1fr !important; flex-direction: column !important; }
        }
      `}</style>

      {/* Jim Nantz Greeting Overlay */}
      {showGreeting && (
        <div onClick={handleGreetingTap} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,40,20,0.93)", backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          ...(greetingTapped ? { animation: "greetFade 3.5s ease-in-out forwards" } : {}),
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⛳</div>
          <p style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 48, fontWeight: 700, color: C.yellow,
            textAlign: "center", lineHeight: 1.2, padding: "0 16px",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}>Hello, Friends.</p>
          <p style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 18, color: "#a8d5a8", marginTop: 12,
            letterSpacing: "0.1em",
            textAlign: "center", padding: "0 20px", lineHeight: 1.5,
          }}>{(() => {
            const day = new Date().getDay(); // 0=Sun,1=Mon,...4=Thu,5=Fri,6=Sat
            const date = new Date().getDate();
            if (date === 10 || day === 5) return "The cut line looms. Some dreams will end today, others will just be getting started.";
            if (date === 11 || day === 6) return "Moving day at Augusta National. The leaderboard is taking shape.";
            if (date === 12 || day === 0) return "The final round at Augusta. Somewhere out there, a green jacket is waiting.";
            return "The azaleas are in bloom, the pines stand tall, and the 2026 Masters Tournament begins.";
          })()}</p>
          <div style={{
            marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.yellow, marginTop: 6 }}>
              {greetingTapped ? "entering Augusta..." : "👆 tap anywhere to enter"}</p>
          </div>
        </div>
      )}

      {view !== "home" && <Nav view={view} setView={setView} isLocked={isLocked} remaining={remaining} />}
      {view === "home" && (
        <>
          <Hero onStart={() => setView("picks")} setView={setView} />
          
          {/* Rules & Prizes */}
          <div style={{
            background: C.cream, padding: "48px 20px",
            borderTop: `3px solid ${C.green}`,
          }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h3 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28,
                color: C.green, textAlign: "center", margin: "0 0 4px",
              }}>📋 Rules & Prizes</h3>
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14,
                color: "#8b7355", textAlign: "center", margin: "0 0 28px",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>How the pool works</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                className="masters-panels">
                {/* How to Play */}
                <div style={{
                  background: "#fff", borderRadius: 12, padding: "24px 20px",
                  border: `1px solid ${C.sand}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
                    color: C.green, margin: "0 0 14px" }}>🏌️ How to Play</h4>
                  {[
                    ["Pick 6 golfers", "1 from each of 4 tiers + 2 from The Field"],
                    ["Best 4 count", "Only your 4 lowest-scoring golfers matter"],
                    ["Cut golfers", "Get a score of 80 for rounds 3 & 4"],
                    ["Lowest total wins", "4-round combined score of your best 4"],
                    ["Tiebreaker #1", "Closest predicted winning score (over/under)"],
                    ["Tiebreaker #2", "Scorecard playoff — best individual golfer wins"],
                    ["Edit anytime", "Change picks until 1 min before first tee"],
                  ].map(([title, desc], i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700,
                        color: C.dark }}>{title}</span>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355",
                        marginLeft: 6 }}>— {desc}</span>
                    </div>
                  ))}
                </div>

                {/* Entry Fees & Prizes */}
                <div style={{
                  background: "#fff", borderRadius: 12, padding: "24px 20px",
                  border: `1px solid ${C.sand}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <h4 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18,
                    color: C.green, margin: "0 0 14px" }}>💰 Entry Fees</h4>
                  <div style={{
                    background: `${C.green}08`, borderRadius: 8, padding: "16px",
                    marginBottom: 14,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.dark }}>1st Entry</span>
                      <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20,
                        fontWeight: 700, color: C.green }}>$15</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.dark }}>2nd Entry</span>
                      <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20,
                        fontWeight: 700, color: C.green }}>$10</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#8b7355", lineHeight: 1.5 }}>
                    Pay via Venmo <strong>@ande-scherf</strong>. Include your team name in the note.
                    Payout structure announced before Thursday based on total entries.
                  </p>
                  <a href="https://venmo.com/ande-scherf" target="_blank" rel="noopener" style={{
                    display: "block", marginTop: 12, padding: "10px", borderRadius: 8,
                    background: "#008CFF", color: "#fff", textAlign: "center",
                    fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 600,
                    textDecoration: "none",
                  }}>💳 Pay on Venmo</a>
                </div>
              </div>
            </div>
          </div>

          <MastersExperience />

          {/* Past Champions & Champions Dinner — side by side */}
          <div style={{
            background: `linear-gradient(170deg, ${C.dark} 0%, #002a1c 50%, ${C.dark} 100%)`,
            padding: "48px 20px", borderTop: `4px solid ${C.yellow}`,
          }}>
            <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
              <h3 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28,
                color: C.yellow, margin: "0 0 4px",
              }}>Past Champions</h3>
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14,
                color: "#a8d5a8", margin: "0 0 32px",
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>Green Jacket Winners</p>

              <div style={{ display: "flex", gap: 32, alignItems: "flex-start", justifyContent: "center" }}
                className="masters-panels">
                {/* LEFT: Champions list + 2026 card */}
                <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
                  {[
                    { year: 2025, team: "Lizards All the Way", name: "Jacks Gray" },
                    { year: 2024, team: "Handsome Stranger", name: "Brandon Winkler" },
                    { year: 2023, team: "Hank the Tank", name: "Chris Frick" },
                    { year: 2022, team: "WillaJean76", name: "Carol Miller" },
                  ].map((champ, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "16px 20px", marginBottom: 12,
                      background: i === 0
                        ? "linear-gradient(135deg, rgba(242,201,76,0.15), rgba(242,201,76,0.05))"
                        : "rgba(255,255,255,0.04)",
                      borderRadius: 12,
                      border: i === 0 ? `2px solid ${C.yellow}40` : "1px solid rgba(255,255,255,0.08)",
                      textAlign: "left",
                    }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: "50%",
                        background: i === 0 ? C.green : "rgba(255,255,255,0.08)",
                        border: i === 0 ? `2px solid ${C.yellow}` : "1px solid rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{
                          fontFamily: "'Playfair Display',Georgia,serif",
                          fontSize: 15, fontWeight: 900, color: i === 0 ? C.yellow : "#a8d5a8",
                        }}>{champ.year}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "'Playfair Display',Georgia,serif",
                          fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2,
                        }}>{champ.team}</div>
                        <div style={{
                          fontFamily: "Georgia,serif", fontSize: 14, color: "#a8d5a8", marginTop: 3,
                        }}>{champ.name}</div>
                      </div>
                    </div>
                  ))}

                  {/* 2026 awaiting */}
                  <div style={{
                    marginTop: 8,
                    background: `linear-gradient(135deg, ${C.green}, #004d35)`,
                    borderRadius: 12, padding: "20px",
                    border: `2px solid ${C.yellow}`,
                    boxShadow: `0 0 30px rgba(242,201,76,0.15)`,
                    textAlign: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <span style={{
                        fontFamily: "'Playfair Display',Georgia,serif",
                        fontSize: 28, fontWeight: 900, color: C.yellow,
                      }}>2026</span>
                      <span style={{
                        fontFamily: "Georgia,serif", fontSize: 16,
                        color: C.yellow, opacity: 0.5,
                      }}>— ?</span>
                    </div>
                    <p style={{
                      fontFamily: "'Playfair Display',Georgia,serif", fontSize: 14,
                      color: C.yellow, marginTop: 8, fontWeight: 700,
                    }}>Will your name be next?</p>
                  </div>
                </div>

                {/* RIGHT: Champions Dinner menu */}
                <div style={{ flex: 1, minWidth: 280, maxWidth: 380 }}>
                  <div style={{
                    background: "#fff", borderRadius: 4, overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    border: "1px solid #d4cdb8",
                  }}>
                    <div style={{ textAlign: "center", padding: "28px 24px 16px" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>⛳</div>
                      <div style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: 11, color: C.green, letterSpacing: "0.25em",
                        textTransform: "uppercase", marginBottom: 4,
                      }}>The Masters Pool</div>
                      <h4 style={{
                        fontFamily: "'Playfair Display',Georgia,serif",
                        fontSize: 22, color: C.green, margin: "0 0 2px",
                        fontStyle: "italic",
                      }}>Champions Dinner</h4>
                      <p style={{
                        fontFamily: "Georgia,serif", fontSize: 13,
                        color: "#8b7355", margin: 0,
                      }}>April 7, 2026</p>
                    </div>

                    <div style={{ padding: "0 28px 24px" }}>
                      <div style={{ width: 50, height: 1, background: C.green, margin: "0 auto 18px", opacity: 0.4 }} />

                      {[
                        { course: "Appetizer", dish: "Pretzel Bites with Queso", desc: null },
                        { course: "First Course", dish: "Two Pronto Pups", desc: null },
                        { course: "Main Course", dish: "Steak with A1 Sauce", desc: "Jet's Ranch & Domino's Parmesan Knots" },
                        { course: "Dessert", dish: "Little Foot Nerd's Slushy", desc: "from Dairy Treat" },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center", marginBottom: 16 }}>
                          <div style={{
                            fontFamily: "'Playfair Display',Georgia,serif",
                            fontSize: 13, fontWeight: 700, color: C.green,
                            fontStyle: "italic", marginBottom: 3,
                          }}>{item.course}</div>
                          <div style={{
                            fontFamily: "Georgia,serif", fontSize: 15,
                            color: "#333", fontWeight: 600,
                          }}>{item.dish}</div>
                          {item.desc && (
                            <div style={{
                              fontFamily: "Georgia,serif", fontSize: 12,
                              color: "#8b7355", fontStyle: "italic", marginTop: 2,
                            }}>{item.desc}</div>
                          )}
                        </div>
                      ))}

                      <div style={{ width: 30, height: 1, background: "#d4cdb8", margin: "16px auto 12px" }} />
                      <p style={{
                        fontFamily: "Georgia,serif", fontSize: 11,
                        color: "#bbb", textAlign: "center", fontStyle: "italic", margin: 0,
                      }}>Beverages: Whatever's in the fridge</p>

                      <div style={{ textAlign: "center", marginTop: 14, fontSize: 14, color: C.green, opacity: 0.5 }}>❧</div>

                      <p style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: 13, color: C.green, textAlign: "center",
                        marginTop: 12, fontStyle: "italic",
                      }}>Served in Honor of Mr. Jacks Gray</p>
                      <p style={{
                        fontFamily: "Georgia,serif", fontSize: 10,
                        color: "#8b7355", textAlign: "center", margin: "3px 0 0",
                      }}>2025 Champion — "Lizards All the Way"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {view === "picks" && <PicksFlow onComplete={handleComplete} isLocked={isLocked}
        existingEntry={entry ? { email: entry.email, teamName: entry.teamName, winScore: entry.winScore, firstName: entry.firstName, lastName: entry.lastName, picks: entry.picks } : null}
        allEntries={scoredEntries.length > 0 ? scoredEntries : entries} />}
      {view === "confirmed" && entry && <Confirmation entry={entry}
        onLeaderboard={() => setView("leaderboard")} onEdit={() => setView("picks")} />}
      {view === "leaderboard" && <Leaderboard entries={scoredEntries} isLocked={isLocked} loading={loadingEntries} potInfo={potInfo} />}
      {view === "tournament" && <TournamentLive />}
      {view === "jpjm" && (() => {
        const familyEntries = (scoredEntries.length > 0 ? scoredEntries : entries).filter(e => e.family);
        // Re-rank family entries
        const ranked = [...familyEntries].sort((a, b) => {
          if (a.totalScore == null && b.totalScore == null) return 0;
          if (a.totalScore == null) return 1;
          if (b.totalScore == null) return -1;
          if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
          if ((a.tbDistance || 999) !== (b.tbDistance || 999)) return (a.tbDistance || 999) - (b.tbDistance || 999);
          const aS = a.sortedIndividual || [];
          const bS = b.sortedIndividual || [];
          for (let i = 0; i < Math.max(aS.length, bS.length); i++) {
            const aV = aS[i] != null ? aS[i] : 999;
            const bV = bS[i] != null ? bS[i] : 999;
            if (aV !== bV) return aV - bV;
          }
          return 0;
        });
        return (
          <div style={{ minHeight: "100vh", background: `linear-gradient(170deg, ${C.dark} 0%, #002a1c 50%, ${C.dark} 100%)`, padding: "32px 12px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🕊️</div>
              <h2 style={{
                fontFamily: "'Playfair Display',Georgia,serif", fontSize: 32,
                color: C.yellow, margin: "0 0 4px", fontStyle: "italic",
              }}>JPJM Memorial Masters</h2>
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 14,
                color: "#a8d5a8", margin: "0 0 8px",
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>Family Pool</p>
              <p style={{
                fontFamily: "Georgia,serif", fontSize: 13,
                color: "#5a8a5a", margin: "0 0 28px", fontStyle: "italic",
              }}>{ranked.length} family {ranked.length === 1 ? "entry" : "entries"}</p>

              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "center" }}
                className="masters-panels">
                {/* LEFT: Family Leaderboard */}
                <div style={{ flex: 1, minWidth: 280, maxWidth: 450 }}>
                  {ranked.map((e, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 20px", marginBottom: 10,
                      background: i === 0
                        ? "linear-gradient(135deg, rgba(242,201,76,0.15), rgba(242,201,76,0.05))"
                        : "rgba(255,255,255,0.04)",
                      borderRadius: 12,
                      border: i === 0 ? `2px solid ${C.yellow}40` : "1px solid rgba(255,255,255,0.08)",
                      textAlign: "left",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: i === 0 ? C.green : i < 3 ? "rgba(255,255,255,0.08)" : "transparent",
                        border: i === 0 ? `2px solid ${C.yellow}` : i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{
                          fontFamily: "'Playfair Display',Georgia,serif",
                          fontSize: 16, fontWeight: 900,
                          color: i === 0 ? C.yellow : "#a8d5a8",
                        }}>{i === 0 ? "🏆" : i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "'Playfair Display',Georgia,serif",
                          fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2,
                        }}>{e.name}</div>
                        <div style={{
                          fontFamily: "Georgia,serif", fontSize: 13, color: "#a8d5a8", marginTop: 2,
                        }}>{e.fullName || ""}</div>
                      </div>
                      <div style={{
                        fontFamily: "'Playfair Display',Georgia,serif",
                        fontSize: 22, fontWeight: 900,
                        color: isLocked
                          ? (e.totalScore != null ? (e.totalScore < 0 ? "#ef5350" : e.totalScore > 0 ? "#66bb6a" : "#fff") : "#555")
                          : "#555",
                      }}>
                        {isLocked ? (e.totalScore != null ? (e.totalScore < 0 ? e.totalScore : e.totalScore > 0 ? `+${e.totalScore}` : "E") : "—") : "—"}
                      </div>
                    </div>
                  ))}

                  {ranked.length === 0 && (
                    <p style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#5a8a5a", marginTop: 20 }}>
                      No family entries tagged yet. Add "Y" in column O of the spreadsheet.</p>
                  )}

                  <button onClick={() => setView("leaderboard")} style={{
                    marginTop: 16, padding: "10px 24px", borderRadius: 20,
                    background: "rgba(255,255,255,0.1)", border: `1px solid ${C.yellow}40`,
                    color: C.yellow, fontFamily: "Georgia,serif", fontSize: 14,
                    cursor: "pointer",
                  }}>← Back to Full Leaderboard</button>
                </div>

                {/* RIGHT: Trash Talk */}
                <div style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
                  <JpjmChat />
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      <footer style={{
        background: C.dark, padding: "18px 16px", textAlign: "center",
        borderTop: `3px solid ${C.green}`,
      }}>
        <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 12, color: "#5a8a5a" }}>
          ⛳ {MODE === "valero" ? "🧪 Test Pool" : "Masters Pool"} {T.year}
          {MODE === "masters" && <span> · Made with </span>}
          {MODE === "masters" && <span onClick={() => setView("jpjm")} style={{ cursor: "default", fontSize: 18, verticalAlign: "middle" }}>🧀</span>}
          {MODE === "masters" && <span> pimento cheese energy</span>}
        </p>
        <a href="mailto:andescherf@gmail.com?subject=Masters%20Pool%20Feedback&body=Bug%20or%20idea%3A%20" 
          style={{
            fontFamily: "Georgia,serif", fontSize: 12, color: C.yellow,
            textDecoration: "none", opacity: 0.7,
          }}>💡 Submit Feedback or Report a Bug</a>
      </footer>
    </div>
  );
}
