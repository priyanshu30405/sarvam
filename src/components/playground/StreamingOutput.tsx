interface StreamingOutputProps {
  text: string;
  isStreaming: boolean;
  labelId: string;
}

export default function StreamingOutput({ text, isStreaming, labelId }: StreamingOutputProps) {
  return (
    <section className="output-panel" aria-labelledby={labelId}>
      <div className="panel-header">
        <h3 id={labelId}>Model output</h3>
        {isStreaming && (
          <span className="sr-only" aria-live="polite">
            Streaming in progress
          </span>
        )}
      </div>
      <div
        className="output-body"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isStreaming}
        tabIndex={0}
      >
        {text ? (
          <p className="output-text">{text}</p>
        ) : (
          <p className="output-placeholder">
            Run inference to see tokens stream here in real time.
          </p>
        )}
        {isStreaming && <span className="cursor-blink" aria-hidden="true" />}
      </div>
    </section>
  );
}
