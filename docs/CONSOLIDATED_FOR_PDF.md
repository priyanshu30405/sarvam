# Frontend Intern Assignment — Priyanshu Raj

**Date:** 19 May 2026

---

## Links

| | |
|---|---|
| **GitHub** | https://github.com/priyanshu30405/sarvam |
| **Live app** | https://sarvam-xi.vercel.app/ |
| **Walkthrough video** | https://drive.google.com/file/d/1kE-QTliEmvTk67erQBv2lDMNPgtQWIPT/view?usp=drive_link *(Due to technical issues on my side, the walkthrough was recorded at lower quality than I would have preferred; all features are demonstrated on the live deployment.)* |

---

## 1. Architecture

I built this with **React 18, TypeScript, and Vite**. React Router handles two pages: the inference playground (`/`) and the model diff view (`/diff`). I skipped a UI library and wrote custom CSS so I could control contrast and focus styles for accessibility.

**Folder layout**
- `src/components/playground/` — Part A UI
- `src/components/diff/` — Part B UI
- `src/hooks/useStreamingInference.ts` — streaming state
- `src/lib/streamInference.ts` — fetch + ReadableStream client
- `src/lib/tokenDiff.ts` — token diff algorithm
- `api/infer.ts` — mock streaming API on Vercel
- `server/inferHandler.ts` — same API for local dev via Vite middleware

**How streaming works**

When the user runs inference, the client sends a POST to `/api/infer`. The server responds with a chunked `text/plain` body. On the client I use `fetch`, then `response.body.getReader()` with a `TextDecoder` in stream mode. Each chunk updates the UI immediately — I never wait for the full response. Token count and tokens/sec are calculated on the client from the accumulated text and elapsed time.

**State**

Everything lives in `useStreamingInference`: status, output, metrics, and errors. If the stream fails, partial output is kept. The session only clears when the user clicks **Clear session**.

---

## 2. Diff algorithm (Part B)

**Approach:** Wagner–Fischer edit distance at the **token** level.

1. Split both strings into tokens (words + whitespace) using `/\S+|\s+/g`.
2. Build an `(n+1) × (m+1)` DP table — `dp[i][j]` is the minimum edits to align the first i tokens of the left string with the first j of the right.
3. Cost: delete, insert, and replace each cost 1; matching tokens cost 0.
4. Backtrack from `(n, m)` to `(0, 0)` to get equal / insert / delete / replace operations.
5. Render side-by-side with highlights on changed tokens.

**Time complexity:** O(n·m) time and space, where n and m are token counts. For short model outputs this is fine. Space could be reduced to O(min(n, m)) with two rows if needed.

**Why not LCS?**  
LCS finds the longest common subsequence but doesn't give you clean **replace** operations. You'd need extra logic to turn insert+delete pairs into "this word changed to that word."

**Why not Myers?**  
Myers diff is built for line-level text in large files (like git). Our inputs are short word sequences — a small DP table is simpler and maps directly to per-token highlighting.

**Why no diff library?**  
The assignment asked for a custom core diff at token level. Libraries like diff-match-patch usually work at character or line level.

---

## 3. Accessibility

- Skip link to main content; proper heading order; header / main / footer landmarks.
- Full keyboard navigation; **Ctrl+Enter** runs inference.
- `aria-live` on metrics and streaming output; `aria-busy` while streaming.
- Errors use `role="alert"` and focus moves to the error banner so keyboard users see it right away.
- Diff highlights use color **and** strikethrough/weight — not color alone.
- Blinking cursor respects `prefers-reduced-motion`.

---

## 4. Error handling

| Scenario | What happens |
|----------|----------------|
| Network drop mid-stream | Error shown; partial output stays on screen |
| Model timeout (504) | Timeout message; output not wiped |
| User clicks Stop | Stream aborted; partial text kept |
| Bad response body | Parse error with a clear message |
| Clear session | Only way to reset output — never automatic on error |

The playground has **Simulate errors (demo)** buttons to trigger a mid-stream drop or timeout for testing.

---

## 5. Walkthrough video

**Link:** https://drive.google.com/file/d/1kE-QTliEmvTk67erQBv2lDMNPgtQWIPT/view?usp=drive_link

*(Due to technical issues on my side, the walkthrough was recorded at lower quality than I would have preferred; all features are demonstrated on the live deployment.)*

The video covers: deployed site, text streaming, audio mode, one error case, and the token diff view.

---

## 6. Part B — Q1 Bug report

**Title:** Audio duration in the simulated transcript uses blob size, not real recording time

**Environment:** Inference Playground, Audio mode — Chrome on Windows 11

**Steps to reproduce**
1. Switch to Audio input mode.
2. Record a short clip and stop.
3. Check the transcript line: `[Audio recorded ~Ns — simulated transcript for demo]`.
4. Try again with a quiet vs loud clip of similar length — the `N` value can differ.

**Expected:** `~Ns` should roughly match how long you actually recorded.

**Actual:** Duration is estimated as `Math.round(blob.size / 4000)`. WebM file size doesn't map cleanly to seconds, so the number can be off.

**Severity:** Low — audio is a demo mock, not real ASR.

**Suggested fix:** Track wall-clock time between record start and stop instead of blob size.

**Workaround:** Treat the duration as a placeholder only.

---

_Priyanshu Raj_
