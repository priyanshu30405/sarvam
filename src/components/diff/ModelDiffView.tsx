import { useState } from "react";
import DiffPanel from "./DiffPanel";

const PRESETS = {
  deployment: {
    prompt: "How should we roll out v2 to the fleet?",
    v1:
      "Roll out gradually using staged canary releases. Monitor latency and error rates per device cohort before expanding.",
    v2:
      "Roll out gradually using staged canary releases. Monitor latency, crash-free sessions, and token throughput per device cohort before expanding.",
  },
  safety: {
    prompt: "Summarize the safety checklist.",
    v1: "Verify model checksum, test offline fallback, and confirm rollback path.",
    v2: "Verify model checksum, test offline fallback, confirm rollback path, and audit PII filters.",
  },
};

export default function ModelDiffView() {
  const [prompt, setPrompt] = useState(PRESETS.deployment.prompt);
  const [v1, setV1] = useState(PRESETS.deployment.v1);
  const [v2, setV2] = useState(PRESETS.deployment.v2);

  const loadPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setPrompt(p.prompt);
    setV1(p.v1);
    setV2(p.v2);
  };

  return (
    <article className="page diff-page">
      <header className="page-header">
        <h2>Model Output Diff</h2>
        <p>
          Side-by-side token-level comparison between two model versions on the same prompt. Changed
          words are highlighted — not line-level diffs.
        </p>
      </header>

      <section className="card diff-controls" aria-label="Comparison inputs">
        <label htmlFor="diff-prompt">Shared prompt</label>
        <input
          id="diff-prompt"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="text-input"
        />

        <div className="preset-row">
          <span className="preset-label">Presets:</span>
          <button type="button" className="btn ghost" onClick={() => loadPreset("deployment")}>
            Deployment
          </button>
          <button type="button" className="btn ghost" onClick={() => loadPreset("safety")}>
            Safety
          </button>
        </div>

        <div className="diff-input-grid">
          <div>
            <label htmlFor="diff-v1">Model v1.0 output</label>
            <textarea
              id="diff-v1"
              value={v1}
              onChange={(e) => setV1(e.target.value)}
              rows={5}
            />
          </div>
          <div>
            <label htmlFor="diff-v2">Model v2.0 output</label>
            <textarea
              id="diff-v2"
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              rows={5}
            />
          </div>
        </div>
      </section>

      <section className="card" aria-label="Token diff result">
        <p className="diff-prompt-display">
          <strong>Prompt:</strong> {prompt}
        </p>
        <DiffPanel
          leftText={v1}
          rightText={v2}
          leftLabel="Model v1.0"
          rightLabel="Model v2.0"
        />
      </section>

      <section className="card algorithm-notes" aria-label="Algorithm explanation">
        <h3>Algorithm (Part B)</h3>
        <ul>
          <li>
            <strong>Approach:</strong> Wagner–Fischer edit distance on word tokens, with DP
            backtracking to produce equal / insert / delete / replace segments.
          </li>
          <li>
            <strong>Time complexity:</strong> O(n·m) for n and m token counts; space O(n·m).
          </li>
          <li>
            <strong>Why not LCS?</strong> LCS only finds common subsequence; mapping that to
            per-token highlights needs an extra alignment pass and handles replacements poorly.
          </li>
          <li>
            <strong>Why not Myers?</strong> Myers excels at line-level text with few edits; at token
            granularity our matrices are small and edit-distance backtracking is simpler and
            explicit about replacements.
          </li>
        </ul>
      </section>
    </article>
  );
}
