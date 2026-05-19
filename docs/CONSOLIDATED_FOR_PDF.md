# Company X — Frontend Intern Assignment (consolidated for PDF)

> **Instructions:** Fill in the link table, then export this file to a single PDF with your PDF tool. Remove this callout box in the final PDF if you prefer.

**Candidate:** _[Your name]_  
**Date:** _[Date]_  
**Deadline:** 19 May, 5:00 PM IST (per assignment brief — verify with your recruiter).

---

## Links (must be clickable in PDF)

| Item | URL |
|------|-----|
| GitHub repository | _https://github.com/YOUR_USERNAME/YOUR_REPO_ |
| Live deployment (Vercel or Netlify) | _https://your-app.example.com_ |
| 3-minute video walkthrough | _https://loom.com/share/... or YouTube link_ |

---

## 1. Architecture decisions

### Stack

- **React 18 + TypeScript + Vite** — fast dev loop, strict typing, straightforward static + serverless deploy.
- **React Router** — routes: Inference Playground (`/`), Model Output Diff (`/diff`).
- **No component library** — custom CSS with design tokens; full control over contrast and focus styles (WCAG AA targets).

### Layout

- **Part A:** `src/components/playground/*`, streaming hook `src/hooks/useStreamingInference.ts`, client stream `src/lib/streamInference.ts`.
- **Part B:** `src/components/diff/*`, tokenizer `src/lib/tokenize.ts`, core diff `src/lib/tokenDiff.ts`.
- **API:** `api/infer.ts` (Vercel serverless) streams `text/plain`; local dev mirrors behavior via `server/inferHandler.ts` + Vite middleware in `vite.config.ts`.

### Streaming pipeline

1. Client `POST /api/infer` with JSON (`prompt`, `mode`, optional `simulateError`).
2. Response body is a **chunked** `ReadableStream`; client uses `fetch` + `getReader()` + `TextDecoder` with `{ stream: true }`.
3. UI updates on **each** chunk — never waits for the full body before rendering tokens.
4. Token count and tokens/sec are computed client-side from accumulated text and elapsed time.

### State

- `useStreamingInference` owns `status`, `output`, `metrics`, `error`, `errorKind`.
- Errors carry `partialOutput` when applicable; the UI does not clear output on failure unless the user chooses **Clear session**.

---

## 2. Diffing algorithm (Part B)

### Algorithm

**Wagner–Fischer edit distance** at the **token** level (from `tokenize`: words and whitespace runs as separate tokens), with **DP backtracking** to emit `equal`, `insert`, `delete`, and `replace` segments. Substitution is chosen only when the DP recurrence shows `dp[i][j] === dp[i - 1][j - 1] + 1` (not by comparing `dp[i][j]` to unrelated transitions — this keeps backtracking correct).

### Time complexity

- **Time:** O(n·m) for token counts n, m.
- **Space:** O(n·m) for the DP table (optimizable to O(min(n, m)) with two rows if needed).

### Why not LCS?

LCS emphasizes longest shared subsequence; **replacements** (e.g. one word swapped for another) are awkward and often require post-processing insert/delete pairs into a human “replace” story.

### Why not Myers?

Myers is tuned for **line-oriented** diffs in large files. Model outputs here are **short token sequences**; a small DP matrix is simple, deterministic, and maps cleanly to per-token highlights.

### Why not a library for the core diff?

The brief requires an **original** core diff implementation at token granularity without outsourcing the alignment logic.

---

## 3. Accessibility (WCAG AA)

- Skip link to `#main-content`, logical heading order, landmarks (`header`, `main`, `footer`).
- Keyboard: Tab order through all controls; **Ctrl+Enter** / **Cmd+Enter** runs inference from the playground page.
- Live regions: metrics and streaming output use `aria-live` appropriately; streaming panel uses `aria-busy` while active.
- Errors: `role="alert"` on the banner; on failure the banner is focused programmatically (`tabIndex={-1}`) so keyboard users land on the explanation.
- Visual design: error / diff highlights pair **color** with **strikethrough** or weight so meaning is not color-only.
- **Reduced motion:** cursor blink respects `prefers-reduced-motion`.

---

## 4. Error handling

| Scenario | Behavior |
|----------|----------|
| Network drop mid-stream | `StreamInferenceError` with `kind: network`; **partial text kept**; clear error copy. |
| Model timeout | HTTP 504 + JSON body; timeout message; no silent reset. |
| User Stop | Abort; cancelled message; partial output retained. |
| Malformed stream | `parse` / `server` kinds with user-visible message. |
| Clear session | Only explicit reset clears output and errors. |

Simulated **mid-stream** and **timeout** paths are available under **Simulate errors (demo)** for reviewers.

---

## 5. Walkthrough script (≈3 minutes)

1. Open **deployed** site; show both nav routes.
2. **Playground — text:** run streaming; point at live tokens and metrics (**Status** transitions).
3. **Playground — audio:** record a clip, show transcript merge, run again.
4. **Errors:** trigger timeout and mid-stream drop; show partial output + error state + metrics **Error**.
5. **Model Diff:** load a preset, edit one token, show highlights.
6. Close with repo link and where to read this write-up.

---

## 6. Part B — Q1 Bug report (full text)

### Title

Audio “duration” in the simulated transcript is derived from blob size, not real recording length

### Environment

- Page: Inference Playground (`/`), **Audio** input mode  
- Browser: Chromium on Windows 11  
- Build: Developer Portal v1.0.0  

### Steps to reproduce

1. Switch **Input mode** to **Audio**.  
2. Click **Start recording**, speak briefly, then **Stop**.  
3. Read the injected transcript line, e.g. `[Audio recorded ~Ns — simulated transcript for demo]`.  
4. Repeat with clips that differ in loudness but similar real duration; compare `N`.

### Expected behavior

Reviewers may assume `~Ns` reflects **wall-clock** recording time.

### Actual behavior

`AudioInputPanel` estimates seconds as `Math.round(blob.size / 4000)`. WebM/Opus size does not map linearly to seconds, so the figure can diverge from real elapsed time.

### Severity

**Low** — the audio pipeline is explicitly a **demo simulation**, not production ASR.

### Suggested fix

Measure wall time between `start` and `onstop`, or decode with `AudioContext` if the product moves beyond a mock.

### Workaround

Treat `~Ns` as a placeholder only.

---

_End of consolidated document._
