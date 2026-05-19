import { useCallback, useRef, useState } from "react";
import {
  streamInference,
  StreamInferenceError,
  type StreamMetrics,
  type StreamErrorKind,
} from "@/lib/streamInference";

export type InferenceStatus = "idle" | "streaming" | "done" | "error";

export interface InferenceState {
  status: InferenceStatus;
  output: string;
  metrics: StreamMetrics;
  error: string | null;
  errorKind: StreamErrorKind | null;
}

const initialMetrics: StreamMetrics = {
  tokenCount: 0,
  tokensPerSecond: 0,
  elapsedMs: 0,
};

export function useStreamingInference() {
  const [state, setState] = useState<InferenceState>({
    status: "idle",
    output: "",
    metrics: initialMetrics,
    error: null,
    errorKind: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (params: {
      prompt: string;
      mode: "text" | "audio";
      simulateError?: "midstream" | "timeout";
    }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        status: "streaming",
        output: "",
        metrics: initialMetrics,
        error: null,
        errorKind: null,
      });

      try {
        const finalText = await streamInference({
          prompt: params.prompt,
          mode: params.mode,
          signal: controller.signal,
          simulateError: params.simulateError,
          onToken: (_chunk, fullText, metrics) => {
            setState((prev) => ({
              ...prev,
              output: fullText,
              metrics,
            }));
          },
        });

        setState((prev) => ({
          ...prev,
          status: "done",
          output: finalText,
        }));
      } catch (err) {
        if (err instanceof StreamInferenceError) {
          setState((prev) => ({
            ...prev,
            status: "error",
            output: err.partialOutput || prev.output,
            error: err.message,
            errorKind: err.kind,
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Unexpected error during inference.",
          errorKind: "server",
        }));
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      status: prev.output ? "error" : "idle",
      error: prev.output ? "Generation stopped. Partial output preserved below." : null,
      errorKind: prev.output ? "aborted" : null,
    }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({
      status: "idle",
      output: "",
      metrics: initialMetrics,
      error: null,
      errorKind: null,
    });
  }, []);

  return { state, run, cancel, reset };
}
