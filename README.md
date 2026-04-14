# GCSP Lead Advisor

An internal EY tool for preparing calibration reviews of Global Client Service Professionals (GCSPs). It uses a **fully deterministic, offline engine** — no external APIs, no LLMs — to score five leadership dimensions against a keyword-signal framework and produce evidence-based assessments, structured talking points, development actions, and an exportable summary.

---

## Prerequisites

Make sure the following are installed before you begin:

| Requirement | Version | Download |
|---|---|---|
| Node.js | v18 or higher | https://nodejs.org |
| npm | Comes with Node.js | — |
| Git | Any recent version | https://git-scm.com |

Verify your installation:
```bash
node --version   # should print v18.x.x or higher
npm --version
```

---

## Getting started (clone → run)

### 1. Clone the repository

```bash
git clone https://github.com/samblumer/GCSP_LEAD_ADVISOR.git
cd GCSP_LEAD_ADVISOR
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Start both servers

You need **two separate terminal windows/tabs** open at the same time.

**Terminal 1 — API server (port 3001)**
```bash
cd server
node index.js
```
You should see: `GCSP Advisor API listening on port 3001`

**Terminal 2 — React client (port 5173)**
```bash
cd client
npm run dev
```
You should see: `VITE ready in ... ms ➜ Local: http://localhost:5173/`

### 5. Open the app

Go to **http://localhost:5173** in your browser.

> The Vite dev server automatically proxies all `/api/*` requests to `localhost:3001`, so both must be running.

---

## Quick demo

1. Click **Load Sample Data** on the Input screen (pre-fills Sarah Mitchell at Differentiating).
2. Click **Analyze**.
3. Explore the three tabs on the results screen:
   - **Calibration** — per-dimension evidence strength (Strong / Moderate / Thin), proof point gaps, and what would strengthen the case
   - **Talking Points** — structured opener, strengths, developmental feedback, and pushback responses
   - **Goals** — development actions focused on dimensions with insufficient evidence
4. Click **Continue to Export**, then **Export Summary (.md)** to download a ready-to-share Markdown file.

---

## Understanding the output

| Field | What it means |
|---|---|
| **Assessment** | Whether the documented evidence *Supports*, *Partially Supports*, or *Does Not Support* the suggested rating |
| **Evidence Supports** | The highest rating band where the majority of dimensions have sufficient proof points |
| **Evidence Aligns To** | The band whose signal language appears most frequently in the narrative |
| **Confidence** | Score derived from strong/moderate dimension counts — not artificially inflated |

---

## Project layout

```
GCSP_LEAD_ADVISOR/
├── server/
│   ├── index.js                    # Express API entry point (port 3001)
│   ├── package.json
│   ├── engine/
│   │   └── analysisEngine.js       # Deterministic scoring engine
│   └── framework/
│       └── attributeFramework.json # 5 dimensions × 4 performance bands × keyword signals
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              # Proxy config (/api → :3001)
│   └── src/
│       ├── App.jsx                 # Router + layout
│       ├── main.jsx
│       └── pages/
│           ├── Input.jsx           # Screen 1 — narrative input form
│           ├── Analysis.jsx        # Screen 2 — results, tabs, verdict card
│           └── Export.jsx          # Screen 3 — summary export
└── .gitignore
```

---

## How the engine works

The engine (`server/engine/analysisEngine.js`) works in three steps:

1. **Corpus assembly** — combines `narrative`, `accomplishments`, and `reviewerObservations` into a single text blob.
2. **Signal scoring** — for each of the 5 dimensions, counts exact-phrase hits from the `performanceBands` signals defined in `attributeFramework.json` for the suggested rating band.
   - **Strong** = ≥3 hits or ≥40% of available signals matched
   - **Thin** = 0 hits
   - **Moderate** = everything in between
3. **Assessment** — counts Strong and Thin dimensions across all 5:
   - ≥3 Thin → **Does Not Support**
   - ≥3 Strong and ≤1 Thin → **Supports**
   - Otherwise → **Partially Supports**

`supportedRating` is computed separately: the highest band where ≥3 dimensions reach Moderate or better — the rating the evidence actually demonstrates.

---

## Editing the framework

Open `server/framework/attributeFramework.json`. Structure per dimension:

```jsonc
{
  "name": "Client Impact",
  "attributes": [ { "id": "CI-1", "name": "..." }, ... ],
  "performanceBands": {
    "NeedsImprovement":  { "signals": ["missed deadline", ...] },
    "MeetsExpectations": { "signals": ["delivered on time", ...] },
    "Differentiating":   { "signals": ["exceeded client expectations", ...] },
    "StrategicImpact":   { "signals": ["transformative client outcome", ...] }
  }
}
```

Add, remove, or edit signals to tune scoring for your population. The engine re-reads the file on every server start — just restart `node index.js` to pick up changes.

---

## Troubleshooting

**"Cannot connect to API"** — make sure the server terminal is still running (`node index.js` in `server/`). Both terminals must stay open while using the app.

**Analysis returns all Thin** — the narrative is too short or uses language that doesn't match the signal keywords. Try using the **Load Sample Data** button to see what well-evidenced input looks like.

**Port already in use** — another process is on 3001 or 5173. Stop it, or change the port in `server/index.js` (update `vite.config.js` proxy target to match).

---

## Production build

```bash
cd client
npm run build    # outputs to client/dist/
```

The `dist/` folder can be served as static files from Express or any CDN.

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
