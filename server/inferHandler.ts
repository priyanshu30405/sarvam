import type { IncomingMessage, ServerResponse } from "http";

const SAMPLE_RESPONSES: Record<string, string> = {
  default:
    "On-device inference lets engineers validate model behavior before fleet rollout. " +
    "Streaming tokens in the browser mirrors production latency patterns and helps catch regressions early. " +
    "This playground simulates a Sarvam-class multimodal endpoint with live metrics.",
  audio:
    "Transcription complete. The audio described a deployment workflow: build, benchmark on-device, " +
    "compare outputs across model versions, then push configuration to the fleet with staged rollouts.",
  hello:
    "Hello! I am a simulated inference endpoint for the Company X developer portal assignment.",
};

function pickResponse(prompt: string, mode: string): string {
  const lower = prompt.toLowerCase();
  if (mode === "audio") return SAMPLE_RESPONSES.audio;
  if (lower.includes("hello") || lower.includes("hi")) return SAMPLE_RESPONSES.hello;
  return SAMPLE_RESPONSES.default;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createInferHandler() {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    let payload: { prompt?: string; mode?: string; simulateError?: string } = {};
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const prompt = payload.prompt ?? "";
    const mode = payload.mode ?? "text";

    if (payload.simulateError === "timeout") {
      await sleep(1200);
      res.writeHead(504, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Model timeout", code: "TIMEOUT" }));
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });

    const text = pickResponse(prompt, mode);
    const words = text.split(/(\s+)/);

    try {
      for (let i = 0; i < words.length; i++) {
        if (payload.simulateError === "midstream" && i === Math.floor(words.length * 0.55)) {
          res.destroy(new Error("Simulated network drop"));
          return;
        }
        res.write(words[i]);
        await sleep(35 + Math.random() * 45);
      }
      res.end();
    } catch {
      if (!res.writableEnded) {
        res.end();
      }
    }
  };
}
