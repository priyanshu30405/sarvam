import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useStreamingInference } from "@/hooks/useStreamingInference";
import TextInputPanel from "./TextInputPanel";
import AudioInputPanel from "./AudioInputPanel";
import StreamingOutput from "./StreamingOutput";
import LiveMetrics from "./LiveMetrics";
import ErrorBanner from "./ErrorBanner";

type InputMode = "text" | "audio";

export default function InferencePlayground() {
  const [mode, setMode] = useState<InputMode>("text");
  const [prompt, setPrompt] = useState(
    "Explain how on-device inference helps fleet deployments.",
  );
  const { state, run, cancel, reset } = useStreamingInference();

  const promptId = useId();
  const outputLabelId = useId();
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const isBusy = state.status === "streaming";

  useEffect(() => {
    if (state.error && errorBannerRef.current) {
      errorBannerRef.current.focus();
    }
  }, [state.error]);

  const handleRun = useCallback(() => {
    if (!prompt.trim()) return;
    void run({ prompt: prompt.trim(), mode });
  }, [prompt, mode, run]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <article className="page playground-page" onKeyDown={handleKeyDown}>
      <header className="page-header">
        <h2>Inference Playground</h2>
        <p>
          Test multimodal on-device inference with live token streaming, metrics, and resilient
          error handling.
        </p>
      </header>

      <div className="playground-grid">
        <section className="card input-card" aria-label="Input configuration">
          <fieldset className="mode-toggle">
            <legend>Input mode</legend>
            <label className="radio-pill">
              <input
                type="radio"
                name="input-mode"
                value="text"
                checked={mode === "text"}
                onChange={() => setMode("text")}
                disabled={isBusy}
              />
              Text
            </label>
            <label className="radio-pill">
              <input
                type="radio"
                name="input-mode"
                value="audio"
                checked={mode === "audio"}
                onChange={() => setMode("audio")}
                disabled={isBusy}
              />
              Audio
            </label>
          </fieldset>

          {mode === "text" ? (
            <TextInputPanel
              id={promptId}
              value={prompt}
              onChange={setPrompt}
              disabled={isBusy}
            />
          ) : (
            <AudioInputPanel
              onTranscript={(t) => setPrompt((prev) => (prev ? `${prev}\n${t}` : t))}
              disabled={isBusy}
            />
          )}

          {mode === "audio" && (
            <div className="input-panel">
              <label htmlFor={`${promptId}-audio-text`}>Transcript / prompt</label>
              <textarea
                id={`${promptId}-audio-text`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isBusy}
                rows={4}
              />
            </div>
          )}

          <div className="action-row">
            <button
              type="button"
              className="btn primary"
              onClick={handleRun}
              disabled={isBusy || !prompt.trim()}
            >
              {isBusy ? "Streaming…" : "Run inference"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={cancel}
              disabled={!isBusy}
            >
              Stop
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={reset}
              disabled={isBusy}
            >
              Clear session
            </button>
          </div>

          <details className="dev-simulate">
            <summary>Simulate errors (demo)</summary>
            <div className="simulate-buttons">
              <button
                type="button"
                className="btn ghost"
                disabled={isBusy}
                onClick={() => void run({ prompt, mode, simulateError: "midstream" })}
              >
                Mid-stream drop
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={isBusy}
                onClick={() => void run({ prompt, mode, simulateError: "timeout" })}
              >
                Model timeout
              </button>
            </div>
          </details>
        </section>

        <section className="card output-card" aria-label="Inference results">
          <LiveMetrics metrics={state.metrics} status={state.status} />

          {state.error && (
            <ErrorBanner
              ref={errorBannerRef}
              message={state.error}
              kind={state.errorKind}
              hasPartialOutput={Boolean(state.output)}
            />
          )}

          <StreamingOutput
            text={state.output}
            isStreaming={isBusy}
            labelId={outputLabelId}
          />
        </section>
      </div>
    </article>
  );
}
