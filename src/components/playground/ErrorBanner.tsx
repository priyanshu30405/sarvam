import { forwardRef } from "react";
import type { StreamErrorKind } from "@/lib/streamInference";

interface ErrorBannerProps {
  message: string;
  kind: StreamErrorKind | null;
  hasPartialOutput: boolean;
}

const KIND_LABELS: Record<StreamErrorKind, string> = {
  network: "Network",
  timeout: "Timeout",
  aborted: "Cancelled",
  parse: "Parse",
  server: "Server",
};

const ErrorBanner = forwardRef<HTMLDivElement, ErrorBannerProps>(function ErrorBanner(
  { message, kind, hasPartialOutput },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="error-banner"
      role="alert"
      aria-live="assertive"
    >
      <strong>
        {kind ? `${KIND_LABELS[kind]} error` : "Error"}: {message}
      </strong>
      {hasPartialOutput && (
        <p className="error-hint">
          Partial output is preserved below. You can retry or copy what was generated.
        </p>
      )}
    </div>
  );
});

export default ErrorBanner;
