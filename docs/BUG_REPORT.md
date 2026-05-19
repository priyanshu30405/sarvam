# Part B — Q1 Bug Report

## Title
Audio “duration” in the simulated transcript is derived from blob size, not real recording length

## Environment
- Page: Inference Playground (`/`), **Audio** input mode
- Browser: Chrome / Edge on Windows 11
- Build: Developer Portal v1.0.0

## Steps to reproduce
1. Switch **Input mode** to **Audio**.
2. Click **Start recording**, speak briefly, then **Stop**.
3. Read the injected transcript line, e.g. `[Audio recorded ~Ns — simulated transcript for demo]`.
4. Repeat with a very quiet clip vs a loud clip of similar wall-clock length and compare `N`.

## Expected behavior
For a demo, users often assume `~Ns` reflects **wall-clock recording time** (from `MediaRecorder` timestamps) or a rough estimate from sample rate × buffer length.

## Actual behavior
`AudioInputPanel` estimates seconds as `Math.round(blob.size / 4000)` (see `src/components/playground/AudioInputPanel.tsx`). WebM/Opus **bitrate varies** with content and device, so the displayed duration can drift from real recording time and from what the status line (`Recorded …s of audio`) implies.

## Severity
**Low** — audio path is explicitly a **simulation** for the assignment; the transcript text is not used for billing or SLA metrics.

## Suggested fix
Track `performance.now()` (or `Date.now()`) deltas at `start` / `onstop`, or use `audioContext` decode if moving beyond a mock.

## Workaround
Treat the `~Ns` figure as a **placeholder** only; rely on your own timing if validating UX against real ASR later.
