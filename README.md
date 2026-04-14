# GCSP Lead Advisor

An internal EY tool for preparing calibration reviews of Global Client Service Professionals (GCSPs).  
It uses a **fully deterministic, offline engine** — no external APIs, no LLMs — to score five leadership dimensions against a keyword-signal framework and produce structured talking points, goals, and an exportable summary.

---

## Quick start (two terminals)

**Terminal 1 — API server (port 3001)**
```bash
cd server
npm install       # first time only
node index.js
```

**Terminal 2 — React client (port 5173)**
```bash
cd client
npm install       # first time only
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).  
The Vite dev server automatically proxies `/api/*` requests to `localhost:3001`.

---

## Quick demo

1. Click **Load Sample Data** (Sarah Mitchell — Differentiating) on the Input screen.  
2. Click **Analyze**.  
3. Explore the three tabs:
   - **Calibration** — per-dimension strength badges, evidence, and gap highlights  
   - **Talking Points** — structured opener, strengths, developmental feedback, pushback handling  
   - **Goals** — 90-day / 6-month development goals aligned to gap dimensions  
4. Click **Continue to Export**, then **Export Summary (.md)** to download a ready-to-share Markdown file.

---

## Project layout

```
/
├── server/
│   ├── index.js                        # Express entry point
│   ├── engine/
│   │   └── analysisEngine.js           # Deterministic scoring engine
│   └── framework/
│       └── attributeFramework.json     # 5 dimensions × 6 tiers of keyword signals
└── client/
    ├── index.html                      # EY body styles + font
    └── src/
        ├── App.jsx                     # Router shell, shared state
        └── pages/
            ├── Input.jsx               # Screen 1 — form + sample data
            ├── Analysis.jsx            # Screen 2 — calibration tabs
            └── Export.jsx              # Screen 3 — markdown download
```

---

## How the engine works

The engine (**`server/engine/analysisEngine.js`**) works in three steps:

1. **Corpus assembly** — combines `narrative`, `accomplishments`, and `reviewerObservations` into a single lowercase text blob.  
2. **Signal scoring** — for each of the 5 dimensions it counts exact-phrase and keyword hits from the tier signals defined in `attributeFramework.json`.  
   - **Strong** = ≥3 hits _or_ ≥40 % of available signals matched  
   - **Thin** = 0 hits  
   - **Moderate** = everything in between  
3. **Verdict** — the engine counts Strong and Thin dimensions, then adjusts the suggested rating up or down by one tier.  
   - ≥3 Strong → Upgrade  
   - ≥2 Thin → Downgrade  
   - Otherwise → KeepSame

**Rating → tier mapping** (applied in `server/index.js` before calling the engine):

| UI label | Engine tier |
|---|---|
| Strategic Impact | Director |
| Differentiating | Senior Manager |
| Meets Expectation | Manager |
| Needs Improvement | Senior Associate |

Any unrecognised label defaults to **Manager**.

---

## Editing the framework

Open **`server/framework/attributeFramework.json`**.  
Structure:
```jsonc
[
  {
    "dimension": "Client Impact",
    "attributes": [ ... ],   // 3 attributes with id + name
    "tiers": {
      "Associate":       { "signals": ["keyword a", "phrase b", ...] },
      "Senior Associate": { ... },
      "Manager":         { ... },
      "Senior Manager":  { ... },
      "Director":        { ... },
      "Partner":         { ... }
    }
  },
  ...
]
```
Add, remove, or edit signals in any tier to tune the scoring for your real population.  
The engine re-reads the file on every server start (no hot reload needed — just restart `node index.js`).

---

## Production build

```bash
cd client
npm run build     # outputs to client/dist/
```

Serve `client/dist/` as static files from the Express server or any CDN of your choice.

---

## EY brand colours used

| Token | Hex |
|---|---|
| Charcoal (nav, headings) | `#2E2E38` |
| Yellow (CTA, active tab) | `#FFE600` |
| Deep dark (text on yellow) | `#1A1A24` |
| Off-white (page background) | `#F6F6FA` |
| Red (errors, gaps) | `#C4313A` |
| Green (success, Strong) | `#168736` |
| Gray (secondary text) | `#747480` |
| Border | `#D7D7DC` |

├── server/
│   ├── package.json
│   └── index.js          ← Express, POST /api/analyze
└── client/
    ├── package.json
    ├── vite.config.js     ← proxies /api → localhost:3001
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx        ← React Router shell + nav
        └── pages/
            ├── Input.jsx  ← textarea + Analyze button
            ├── Analysis.jsx
            └── Export.jsx
```

## Quick start (two terminals)

**Terminal 1 — server**
```bash
cd server
npm install
npm run dev        # node --watch, port 3001
```

**Terminal 2 — client**
```bash
cd client
npm install
npm run dev        # vite dev server, port 5173
```

Then open http://localhost:5173.  
Vite proxies every `/api/*` request to `http://localhost:3001`.

## API

| Method | Path          | Body              | Response                          |
|--------|---------------|-------------------|-----------------------------------|
| POST   | /api/analyze  | `{ "text": "…" }` | `{ status, message, data: {…} }` |

## Replit setup

1. Import this repo into Replit.
2. Replit will use the `.replit` file to start both processes.
3. If the client and server run in separate Repls, replace the `target`
   in `client/vite.config.js` with the full server Repl URL:
   ```js
   target: 'https://your-server-repl.replit.app',
   ```

## Dependencies

| Layer  | Runtime                  | Dev                        |
|--------|--------------------------|----------------------------|
| server | express, cors            | —                          |
| client | react, react-dom, react-router-dom | vite, @vitejs/plugin-react |
