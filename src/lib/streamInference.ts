export interface StreamMetrics {
  tokenCount: number;
  tokensPerSecond: number;
  elapsedMs: number;
}

export type StreamErrorKind = "network" | "timeout" | "aborted" | "parse" | "server";

export class StreamInferenceError extends Error {
  constructor(
    message: string,
    public readonly kind: StreamErrorKind,
    public readonly partialOutput: string,
  ) {
    super(message);
    this.name = "StreamInferenceError";
  }
}

export interface StreamOptions {
  prompt: string;
  mode: "text" | "audio";
  signal?: AbortSignal;
  simulateError?: "midstream" | "timeout";
  onToken: (chunk: string, fullText: string, metrics: StreamMetrics) => void;
}

const TOKEN_SPLIT = /(\s+)/;

export function countTokens(text: string): number {
  return text.split(TOKEN_SPLIT).filter((t) => t.length > 0 && !/^\s+$/.test(t)).length;
}

export async function streamInference(options: StreamOptions): Promise<string> {
  const { prompt, mode, signal, simulateError, onToken } = options;
  const start = performance.now();
  let fullText = "";
  let lastMetrics: StreamMetrics = { tokenCount: 0, tokensPerSecond: 0, elapsedMs: 0 };

  const emit = () => {
    const elapsedMs = performance.now() - start;
    const tokenCount = countTokens(fullText);
    const seconds = elapsedMs / 1000;
    lastMetrics = {
      tokenCount,
      tokensPerSecond: seconds > 0 ? tokenCount / seconds : 0,
      elapsedMs,
    };
    onToken("", fullText, lastMetrics);
  };

  let response: Response;
  try {
    response = await fetch("/api/infer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode, simulateError }),
      signal,
    });
  } catch (err) {
    const kind =
      signal?.aborted ? "aborted" : err instanceof TypeError ? "network" : "network";
    throw new StreamInferenceError(
      signal?.aborted ? "Request cancelled." : "Network error — check your connection.",
      kind,
      fullText,
    );
  }

  if (!response.ok) {
    let message = `Server error (${response.status})`;
    let kind: StreamErrorKind = response.status === 504 ? "timeout" : "server";
    try {
      const data = await response.json();
      if (data.error) message = data.error;
      if (data.code === "TIMEOUT") kind = "timeout";
    } catch {
      /* plain text body */
    }
    throw new StreamInferenceError(message, kind, fullText);
  }

  if (!response.body) {
    throw new StreamInferenceError("No response body.", "parse", fullText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        throw new StreamInferenceError("Stream aborted.", "aborted", fullText);
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      fullText += chunk;
      const elapsedMs = performance.now() - start;
      const tokenCount = countTokens(fullText);
      const seconds = elapsedMs / 1000;
      lastMetrics = {
        tokenCount,
        tokensPerSecond: seconds > 0 ? tokenCount / seconds : 0,
        elapsedMs,
      };
      onToken(chunk, fullText, lastMetrics);
    }
  } catch (err) {
    if (err instanceof StreamInferenceError) throw err;
    const message =
      err instanceof Error && err.message.includes("abort")
        ? "Stream interrupted."
        : "Connection lost during streaming.";
    throw new StreamInferenceError(message, "network", fullText);
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }

  emit();
  return fullText;
}
