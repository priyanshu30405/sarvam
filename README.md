# Company X Developer Portal

Frontend intern assignment: **Inference Playground** (Part A) and **Model Output Diff** (Part B).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

### Part A — Inference Playground
- Text / audio input mode toggle
- Streaming via `fetch` + `ReadableStream` (`src/lib/streamInference.ts`)
- Live token count and tokens/sec
- Mid-stream error simulation; partial output preserved
- Keyboard: Tab navigation, `Ctrl+Enter` to run, visible focus rings, ARIA live regions

### Part B — Model Diff
- Side-by-side token-level diff (`src/lib/tokenDiff.ts`)
- Custom Wagner–Fischer edit-distance backtracking (no diff library)

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import in [Vercel](https://vercel.com) — framework preset: **Vite**.
3. Deploy. API route: `api/infer.ts`.

## Submission PDF

Copy sections from `docs/SUBMISSION.md` and `docs/BUG_REPORT.md` into your PDF, or export **`docs/CONSOLIDATED_FOR_PDF.md`** as a single file (see `docs/PDF_EXPORT.md`). Add your **GitHub URL**, **Vercel/Netlify URL**, and **3-minute** Loom/YouTube walkthrough link. Confirm your cohort deadline (brief: **19 May, 5pm IST**).

## Simulate errors

In the playground, expand **Simulate errors (demo)** to trigger mid-stream drop or model timeout.
