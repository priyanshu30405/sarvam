# Developer Portal

A small React app for testing on-device inference in the browser — streaming responses, live metrics, and a token-level diff view to compare model outputs.

**Live demo:** https://sarvam-xi.vercel.app/

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## What's inside

**Inference playground**
- Switch between text and audio input
- Streams tokens with `fetch` + `ReadableStream`
- Shows token count and tokens/sec while generating
- Handles network drops and timeouts without wiping partial output
- Keyboard friendly (`Tab`, `Ctrl+Enter` to run)

**Model diff**
- Side-by-side comparison of two model outputs on the same prompt
- Highlights changed words/tokens (not line-level diff)
- Diff logic lives in `src/lib/tokenDiff.ts` — Wagner–Fischer edit distance with backtracking

## Project structure

```
src/components/playground/   inference UI
src/components/diff/         diff UI
src/lib/streamInference.ts   streaming client
src/lib/tokenDiff.ts         diff algorithm
api/infer.ts                 mock streaming API (Vercel)
server/inferHandler.ts       same API for local dev
```

## Tech

React 18, TypeScript, Vite, React Router. No UI library — plain CSS.

## Notes

The inference endpoint is mocked for demo purposes. Under **Simulate errors** in the playground you can trigger a mid-stream failure or a timeout to see how the UI behaves.
