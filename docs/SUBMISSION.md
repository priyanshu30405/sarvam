# Company X — Frontend Intern Assignment Submission

**Candidate:** _[Your name]_  
**Date:** _[Date]_

**Deadline (IST):** 19 May, 5:00 PM — confirm in your invite if this matches your cohort.

---

## 0. PDF checklist (before export)

- [ ] Replace placeholder links in the table below with **real, public** URLs (click each in the PDF export preview).
- [ ] Record a **≤ 3 minute** walkthrough covering playground (text + audio + one error path), model diff, and deployed site.
- [ ] Export this document (or `docs/CONSOLIDATED_FOR_PDF.md`) to **one PDF** with clear headings; paste **full text** of `docs/BUG_REPORT.md` into section 6 or attach as a subsection.
- [ ] Spell-check and export from Markdown (VS Code preview → Print to PDF, Google Docs, etc.).

---

## Links (replace before submitting)

| Item | URL |
|------|-----|
| GitHub repository | _https://github.com/YOUR_USERNAME/sarvam-developer-portal_ |
| Live deployment (Vercel) | _https://YOUR-APP.vercel.app_ |
| 3-minute walkthrough video | _https://loom.com/share/... or YouTube_ |

---

## 1. Architecture decisions

### Stack
- **React 18 + TypeScript + Vite** — fast dev loop, strict typing, easy Vercel deploy.
- **React Router** — two routes: Playground (`/`) and Diff (`/diff`).
- **No UI framework** — custom CSS with design tokens for a cohesive dark enterprise theme and full control over contrast (WCAG AA).

### Structure
```
src/
  components/playground/   # Part A UI
  components/diff/         # Part B UI
  hooks/useStreamingInference.ts
  lib/streamInference.ts   # Fetch + ReadableStream client
  lib/tokenDiff.ts         # Core diff algorithm
api/infer.ts               # Vercel streaming mock endpoint
server/inferHandler.ts     # Local dev middleware (same behavior)
```

### Streaming pipeline
1. User submits prompt → `POST /api/infer` with JSON body.
2. Server returns `text/plain` **chunked** body; words emitted every ~40ms.
3. Client `ReadableStream` reader decodes chunks incrementally; UI updates on every chunk (never waits for full response).
4. Metrics derived client-side: token count = non-whitespace chunks; TPS = tokens / elapsed seconds.

### State management
- `useStreamingInference` hook holds `status`, `output`, `metrics`, `error`.
- On failure, `partialOutput` from `StreamInferenceError` is written back — session is never wiped unless user clicks **Clear session**.

---

## 2. Diffing algorithm approach (Part B)

### Algorithm
**Token-level Wagner–Fischer edit distance with DP backtracking.**

1. **Tokenize** both strings with `/\S+|\s+/g` — words and whitespace kept as separate tokens.
2. Build `(n+1) × (m+1)` DP table where `dp[i][j]` = minimum edits to align `left[0..i)` with `right[0..j)`.
3. Costs: delete = insert = replace = 1; match = 0 when tokens equal.
4. **Backtrack** from `(n,m)` to `(0,0)` to emit operations: `equal`, `delete`, `insert`, `replace`.
5. Render side-by-side: deletions highlighted on left (red/strikethrough), insertions on right (green).

### Time complexity
- **Time:** O(n · m) where n, m = token counts.
- **Space:** O(n · m) for the DP table (could be reduced to O(min(n,m)) with two rows if needed).

### Why not LCS?
Longest Common Subsequence finds shared tokens but does not directly label **replacements** (e.g. `latency` → `throughput`). You need a second pass to infer substitutes from insert/delete pairs. Edit-distance backtracking yields explicit `replace` operations in one pass.

### Why not Myers diff?
Myers (used by `git diff`) optimizes for **line-level** text with relatively few changes in long files. Our unit is **words/tokens**; inputs are short model outputs (dozens of tokens). A compact DP table is fast, easier to implement correctly for highlighting, and maps naturally to per-token CSS classes.

### Why not external diff libraries?
Assignment requires building core diff logic ourselves. Libraries like `diff-match-patch` often operate at character or line granularity; we need guaranteed **token/word** alignment for model output comparison.

---

## 3. Accessibility considerations (WCAG AA)

- **Keyboard:** All controls reachable via Tab; `Ctrl+Enter` / `Cmd+Enter` runs inference; skip link to main content; focus visible on interactive elements and on the error banner when a stream fails (programmatic `focus()` + `tabIndex={-1}`).
- **Screen readers:** `aria-live="polite"` on metrics and streaming output; `role="alert"` on errors; labeled form fields; `aria-busy` while streaming; metrics **Status** reflects `Idle` / `Streaming` / `Done` / `Error`.
- **Color contrast:** Light text on dark surfaces (≥ 4.5:1 for body); error/add/remove states use both **color and** strikethrough/labels.
- **Motion:** `prefers-reduced-motion` disables blinking cursor animation.
- **Semantics:** Landmarks (`header`, `main`, `footer`), headings hierarchy, fieldset/legend for mode toggle.

---

## 4. Error handling strategy

| Scenario | Behavior |
|----------|----------|
| Network drop mid-stream | Catch reader error; show alert; **keep partial output** in output panel |
| Model timeout (504) | Parse JSON error; show timeout message; output unchanged |
| User Stop | `AbortController` cancels fetch; partial text preserved with cancelled message |
| Invalid server body | `StreamInferenceError` with kind `parse` |
| Clear session | Explicit user action only — never auto-reset on error |

Demo buttons send `simulateError: "midstream" | "timeout"` to the API for reviewers.

---

## 5. Test plan (for your walkthrough video)

1. **Playground — text:** Run inference; watch tokens stream and metrics update.
2. **Playground — audio:** Switch to audio, record, run inference.
3. **Errors:** Trigger mid-stream drop and timeout; confirm partial output remains.
4. **Keyboard:** Tab through controls; run with Ctrl+Enter.
5. **Diff:** Load presets; edit a word in v2; verify token-level highlights.
6. **Deployment:** Show live Vercel URL works without local server.

---

## 6. Part B — Q1 Bug report

See `docs/BUG_REPORT.md`.
