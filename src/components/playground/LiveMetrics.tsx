import type { StreamMetrics } from "@/lib/streamInference";
import type { InferenceStatus } from "@/hooks/useStreamingInference";

interface LiveMetricsProps {
  metrics: StreamMetrics;
  status: InferenceStatus;
}

function statusLabel(status: InferenceStatus): string {
  switch (status) {
    case "streaming":
      return "Streaming";
    case "done":
      return "Done";
    case "error":
      return "Error";
    default:
      return "Idle";
  }
}

export default function LiveMetrics({ metrics, status }: LiveMetricsProps) {
  const isStreaming = status === "streaming";

  return (
    <section
      className="metrics-panel"
      aria-label="Live streaming metrics"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="metric">
        <span className="metric-label">Tokens</span>
        <span className="metric-value" data-testid="token-count">
          {metrics.tokenCount}
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">Tokens / sec</span>
        <span className="metric-value" data-testid="tokens-per-sec">
          {metrics.tokensPerSecond.toFixed(1)}
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">Status</span>
        <span className={`metric-pill ${isStreaming ? "live" : ""} ${status === "error" ? "error" : ""}`}>
          {statusLabel(status)}
        </span>
      </div>
    </section>
  );
}
